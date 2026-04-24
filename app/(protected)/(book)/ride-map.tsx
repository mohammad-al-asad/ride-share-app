import { MarkerCircle } from "@/components/AnimatedMarker";
import DriverCard from "@/components/DriverCard";
import { MarkerTriangle } from "@/components/Markers";
import RoadPolyline from "@/components/RoadPolyline";
import TripDetails from "@/components/TripDetails";
import { connectRealtimeSocket } from "@/config/realtime-socket";
import {
  useCancelRideRequestMutation,
  useCancelRiderTripMutation,
  useGetActiveRideQuery,
} from "@/redux/api/rideBookApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  clearActiveRide,
  setRideDriverProgress,
  setRideMatchedData,
} from "@/redux/slices/rideBookSlice";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const routeCoordinates = [
  { latitude: 32.783, longitude: -96.804 },
  { latitude: 32.783, longitude: -96.8 },
  { latitude: 32.785, longitude: -96.8 },
  { latitude: 32.785, longitude: -96.797 },
];
const MILES_PER_KILOMETER = 0.621371;
const METERS_PER_MILE = 1609.344;
const FALLBACK_SPEED_MPH = 25;

const toCoordinate = (
  coordinates?: [number, number] | null,
): { latitude: number; longitude: number } | null => {
  if (
    !coordinates ||
    coordinates.length < 2 ||
    typeof coordinates[0] !== "number" ||
    typeof coordinates[1] !== "number"
  ) {
    return null;
  }

  return {
    latitude: coordinates[1],
    longitude: coordinates[0],
  };
};

const getDistanceInMeters = (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
) => {
  const earthRadius = 6371e3;
  const phi1 = (origin.latitude * Math.PI) / 180;
  const phi2 = (destination.latitude * Math.PI) / 180;
  const deltaPhi = ((destination.latitude - origin.latitude) * Math.PI) / 180;
  const deltaLambda =
    ((destination.longitude - origin.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

export default function TripProgressScreen() {
  const dispatch = useAppDispatch();
  const { height } = Dimensions.get("window");
  const bottomSheetRef = useRef<BottomSheet | null>(null);

  const hasUser = useAppSelector((state) => Boolean(state.auth.user));
  const authToken = useAppSelector((state) => state.auth.token);
  useGetActiveRideQuery(undefined, {
    skip: !hasUser || !authToken,
    refetchOnMountOrArgChange: true,
  });
  const [cancelRiderTrip, { isLoading: isCancelingTrip }] =
    useCancelRiderTripMutation();
  const [cancelRideRequest, { isLoading: isCancelingRideRequest }] =
    useCancelRideRequestMutation();
  const rideStatus = useAppSelector(
    (state) => state.rideBook.latestRideRequest?.status,
  );
  const latestRideRequest = useAppSelector(
    (state) => state.rideBook.latestRideRequest,
  );
  const activeTrip = useAppSelector((state) => state.rideBook.activeTrip);
  const driverProgress = useAppSelector(
    (state) => state.rideBook.driverProgress,
  );
  const isCanceling = isCancelingTrip || isCancelingRideRequest;
  const isSearching = rideStatus === "searching" && !activeTrip;

  useEffect(() => {
    if (!authToken) {
      return;
    }

    const socket = connectRealtimeSocket(authToken);
    if (!socket) {
      return;
    }

    const handleRideMatched = (payload: any) => {
      dispatch(setRideMatchedData(payload ?? null));
    };

    const handleDriverLocation = (payload: any) => {
      dispatch(setRideDriverProgress(payload?.progress ?? null));
    };

    const handleTripCancelled = (payload: any) => {
      const cancelledBy = payload?.cancelledBy ?? payload?.cancellation?.canceledBy;
      // Only handle if the driver was the one who cancelled (rider's own cancel is
      // handled locally by the REST mutation's Redux extraReducer).
      if (cancelledBy === "driver") {
        dispatch(clearActiveRide());
        Alert.alert(
          "Ride cancelled",
          "Your driver has cancelled the trip. Please book a new ride.",
          [{ text: "OK", onPress: () => router.replace("/(protected)/(tab)" as any) }],
        );
      }
    };

    const handleTripCompleted = (payload: any) => {
      const tripId = payload?.tripId ?? payload?.trip?._id;
      dispatch(clearActiveRide());
      router.replace(
        tripId
          ? (`/(protected)/ride-details/ride-status?tripId=${tripId}` as any)
          : ("/(protected)/ride-details/ride-status" as any),
      );
    };

    socket.on("ride-request:matched", handleRideMatched);
    socket.on("trip:driver-location", handleDriverLocation);
    socket.on("trip:cancelled", handleTripCancelled);
    socket.on("trip:completed", handleTripCompleted);

    return () => {
      socket.off("ride-request:matched", handleRideMatched);
      socket.off("trip:driver-location", handleDriverLocation);
      socket.off("trip:cancelled", handleTripCancelled);
      socket.off("trip:completed", handleTripCompleted);
    };
  }, [authToken, dispatch]);

  const driverCoordinate = useMemo(() => {
    const liveCoordinate = toCoordinate(
      driverProgress?.currentLocation?.point?.coordinates,
    );
    const pickupCoordinate = toCoordinate(
      activeTrip?.pickup?.point?.coordinates,
    );

    return liveCoordinate ?? pickupCoordinate ?? routeCoordinates[0];
  }, [
    activeTrip?.pickup?.point?.coordinates,
    driverProgress?.currentLocation?.point?.coordinates,
  ]);

  const destinationCoordinate = useMemo(() => {
    return (
      toCoordinate(activeTrip?.dropoff?.point?.coordinates) ??
      routeCoordinates[3]
    );
  }, [activeTrip?.dropoff?.point?.coordinates]);

  const mapPolylineCoordinates = useMemo(() => {
    const pickupCoordinate = toCoordinate(
      activeTrip?.pickup?.point?.coordinates,
    );
    const dropoffCoordinate = toCoordinate(
      activeTrip?.dropoff?.point?.coordinates,
    );

    if (pickupCoordinate && dropoffCoordinate) {
      return [driverCoordinate, pickupCoordinate, dropoffCoordinate];
    }

    return routeCoordinates;
  }, [
    activeTrip?.dropoff?.point?.coordinates,
    activeTrip?.pickup?.point?.coordinates,
    driverCoordinate,
  ]);

  const getApiErrorMessage = useCallback(
    (error: any, fallbackMessage: string) =>
      error?.data?.error?.message ?? error?.data?.message ?? fallbackMessage,
    [],
  );

  const toPayloadNumber = useCallback((value: unknown) => {
    const next = Number(value);
    if (!Number.isFinite(next) || next < 0) {
      return 0;
    }
    return next;
  }, []);

  const cancelTripPayloadMetrics = useMemo(() => {
    const liveCoordinate = toCoordinate(
      driverProgress?.currentLocation?.point?.coordinates,
    );
    const pickupCoordinate = toCoordinate(activeTrip?.pickup?.point?.coordinates);
    const dropoffCoordinate = toCoordinate(
      activeTrip?.dropoff?.point?.coordinates,
    );
    const originCoordinate = liveCoordinate ?? pickupCoordinate;

    const distanceFromProgressMiles = Number.isFinite(
      Number(driverProgress?.distanceMeters),
    )
      ? Number(driverProgress?.distanceMeters) / METERS_PER_MILE
      : Number.isFinite(Number(driverProgress?.distanceKm))
        ? Number(driverProgress?.distanceKm) * MILES_PER_KILOMETER
        : null;

    const distanceFromCoordinatesMiles =
      originCoordinate && dropoffCoordinate
        ? getDistanceInMeters(originCoordinate, dropoffCoordinate) / METERS_PER_MILE
        : null;

    const distanceMiles = toPayloadNumber(
      distanceFromProgressMiles ??
        distanceFromCoordinatesMiles ??
        latestRideRequest?.quote?.estimatedMiles,
    );

    const durationFromSpeedMinutes =
      distanceMiles > 0 ? (distanceMiles / FALLBACK_SPEED_MPH) * 60 : 0;
    const durationMinutes = toPayloadNumber(
      driverProgress?.etaMinutes ??
        latestRideRequest?.quote?.estimatedMinutes ??
        durationFromSpeedMinutes,
    );

    const finalFare = toPayloadNumber(
      activeTrip?.pricing?.finalFare ??
        activeTrip?.pricing?.estimatedFare ??
        latestRideRequest?.quote?.estimatedFare,
    );

    return {
      distanceMiles,
      durationMinutes,
      finalFare,
    };
  }, [
    activeTrip?.dropoff?.point?.coordinates,
    activeTrip?.pickup?.point?.coordinates,
    activeTrip?.pricing?.estimatedFare,
    activeTrip?.pricing?.finalFare,
    driverProgress?.currentLocation?.point?.coordinates,
    driverProgress?.distanceKm,
    driverProgress?.distanceMeters,
    driverProgress?.etaMinutes,
    latestRideRequest?.quote?.estimatedFare,
    latestRideRequest?.quote?.estimatedMiles,
    latestRideRequest?.quote?.estimatedMinutes,
    toPayloadNumber,
  ]);

  const handleCancelRide = useCallback(async () => {
    try {
      if (activeTrip?._id) {
        const response = await cancelRiderTrip({
          tripId: activeTrip._id,
          body: {
            distanceMiles: cancelTripPayloadMetrics.distanceMiles,
            durationMinutes: cancelTripPayloadMetrics.durationMinutes,
            finalFare: cancelTripPayloadMetrics.finalFare,
          },
        }).unwrap();
        const fee = Number(response?.data?.cancellationFee);
        const feeText =
          Number.isFinite(fee) && fee > 0
            ? `Cancellation fee: ${fee.toFixed(2)}`
            : "Trip cancelled successfully.";
        Alert.alert("Trip cancelled", feeText);
        router.replace("/(protected)/(tab)" as any);
        return;
      }

      if (latestRideRequest?._id) {
        await cancelRideRequest({ requestId: latestRideRequest._id }).unwrap();
        Alert.alert(
          "Ride request cancelled",
          "Request cancelled successfully.",
        );
        router.replace("/(protected)/(tab)" as any);
        return;
      }

      Alert.alert(
        "No active ride",
        "There is no active request or trip to cancel.",
      );
    } catch (error: any) {
      Alert.alert(
        "Cancel failed",
        getApiErrorMessage(error, "Could not cancel your ride right now."),
      );
    }
  }, [
    activeTrip?._id,
    cancelRideRequest,
    cancelRiderTrip,
    cancelTripPayloadMetrics.distanceMiles,
    cancelTripPayloadMetrics.durationMinutes,
    cancelTripPayloadMetrics.finalFare,
    getApiErrorMessage,
    latestRideRequest?._id,
  ]);

  const handleBackPress = useCallback(() => {
    router.replace("/(protected)/(tab)" as any);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onHardwareBackPress = () => {
        handleBackPress();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onHardwareBackPress,
      );

      return () => subscription.remove();
    }, [handleBackPress]),
  );

  const onCancelPress = useCallback(() => {
    if (isCanceling) {
      return;
    }

    Alert.alert("Cancel ride", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      { text: "Yes", style: "destructive", onPress: handleCancelRide },
    ]);
  }, [handleCancelRide, isCanceling]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        userInterfaceStyle="light"
        initialRegion={{
          latitude: destinationCoordinate.latitude,
          longitude: destinationCoordinate.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <MarkerCircle
          tracksViewChanges
          coordinate={driverCoordinate}
          anchor={{ x: 0.5, y: 0.5 }}
          flat
          rotation={0}
        />

        <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={destinationCoordinate}>
          <MarkerTriangle />
        </Marker>

        <RoadPolyline
          coordinates={mapPolylineCoordinates}
          strokeColor="#7B61FF"
          strokeWidth={4}
        />
      </MapView>

      <TouchableOpacity
        style={styles.topCircleButton}
        onPress={handleBackPress}
      >
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={[height * 0.06]}
        enableDynamicSizing
        maxDynamicContentSize={height * 0.85}
        enablePanDownToClose={false}
        handleIndicatorStyle={{
          backgroundColor: "#ccc",
          width: scale(50),
          height: 8,
          marginTop: verticalScale(4),
        }}
        style={styles.bottomSheet}
      >
        <BottomSheetView style={{ paddingBottom: 16 }}>
          {isSearching ? (
            <>
              <View style={styles.searchingHeader}>
                <Text style={styles.searchingTitle}>Ride requested</Text>
                <Text style={styles.searchingSubtitle}>
                  Finding nearby drivers
                </Text>
                <View style={styles.progressTrack}>
                  <View style={styles.progressFill} />
                </View>
              </View>
              <TripDetails />
            </>
          ) : (
            <>
              <Text style={styles.statusTitle}>Ride started</Text>
              <DriverCard />
              <TripDetails />
            </>
          )}
          <TouchableOpacity
            style={[
              styles.cancelButton,
              isCanceling ? styles.cancelButtonDisabled : null,
            ]}
            onPress={onCancelPress}
            disabled={isCanceling}
          >
            <Text style={styles.cancelButtonText}>
              {isCanceling ? "Cancelling..." : "Cancel ride"}
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  map: { ...StyleSheet.absoluteFillObject },
  topCircleButton: {
    position: "absolute",
    top: verticalScale(50),
    left: scale(20),
    backgroundColor: "white",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  bottomSheet: {
    paddingHorizontal: scale(15),
  },
  statusTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
    paddingTop: verticalScale(20),
  },
  searchingHeader: {
    paddingTop: verticalScale(8),
    marginBottom: verticalScale(14),
  },
  searchingTitle: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    textAlign: "center",
    color: "#1F2937",
  },
  searchingSubtitle: {
    marginTop: verticalScale(4),
    marginBottom: verticalScale(10),
    fontSize: moderateScale(16),
    textAlign: "center",
    color: "#4B5563",
  },
  progressTrack: {
    width: "100%",
    height: verticalScale(6),
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: {
    width: "42%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#6366F1",
  },
  cancelButton: {
    backgroundColor: "#FFEBEE",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonDisabled: {
    opacity: 0.65,
  },
  cancelButtonText: { color: "#D32F2F", fontSize: 16, fontWeight: "600" },
});
