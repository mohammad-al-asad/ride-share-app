import { MarkerCircle } from "@/components/AnimatedMarker";
import DriverAvailabilityButton from "@/components/DriverAvailabilityButton";
import { MarkerTriangle, MarkerUser } from "@/components/Markers";
import RoadPolyline from "@/components/RoadPolyline";
import RequestCard from "@/components/RequestCard";
import RiderPickupCard from "@/components/RidePickupCard";
import TopMapControlls from "@/components/TopMapControlls";
import { connectRealtimeSocket } from "@/config/realtime-socket";
import {
  useAcceptRideRequestMutation,
  useGetDriverHomeQuery,
  useUpdateLocationMutation,
} from "@/redux/api/driverRIdeStart";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setDriverRideStatus } from "@/redux/slices/driverRideStartSlice";
import { RootState } from "@/redux/store";
import BottomSheet from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

type Coordinate = {
  latitude: number;
  longitude: number;
};

const DEFAULT_COORDINATE: Coordinate = {
  latitude: 23.7806,
  longitude: 90.4071,
};

const { height } = Dimensions.get("window");

const pointToCoordinate = ([longitude, latitude]: [
  number,
  number,
]): Coordinate => ({
  latitude,
  longitude,
});

const formatRideLabel = (vehicleType?: string, tier?: string, size?: string) =>
  [tier, vehicleType]
    .filter(Boolean)
    .map((value) => value!.toUpperCase())
    .join(" ") + (size ? ` (${size.toUpperCase()})` : "");

const isCoordinate = (
  coordinate: Coordinate | null,
): coordinate is Coordinate => Boolean(coordinate);

const getApiErrorMessage = (error: any, fallbackMessage: string) =>
  error?.data?.error?.message ?? error?.data?.message ?? fallbackMessage;

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const mapRef = useRef<MapView | null>(null);
  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const hasFittedTripRef = useRef(false);
  const lastLocationSyncRef = useRef(0);
  const hasUser = useAppSelector((state: RootState) =>
    Boolean(state.auth.user),
  );
  const authToken = useAppSelector((state: RootState) => state.auth.token);
  useGetDriverHomeQuery(undefined, {
    skip: !hasUser,
  });
  const [acceptRideRequest, { isLoading: isAcceptingRideRequest }] =
    useAcceptRideRequestMutation();
  const [updateLocation] = useUpdateLocationMutation();

  const {
    isOnline,
    location: storedDriverLocation,
    activeTrip,
    activeRideRequest,
  } = useAppSelector((state: RootState) => state.driverRideStart);

  const initialDriverLocation = storedDriverLocation
    ? pointToCoordinate(storedDriverLocation.point.coordinates)
    : DEFAULT_COORDINATE;

  const [driverLocation, setDriverLocation] = useState<Coordinate>(
    initialDriverLocation,
  );
  const [heading, setHeading] = useState(0);
  const [, setArrived] = useState(false);
  const [routePolyline, setRoutePolyline] = useState<Coordinate[]>([]);
  const pendingRequestId = activeRideRequest?._id ?? "";
  const requestPreview = activeRideRequest
    ? {
        rideLabel: formatRideLabel(
          activeRideRequest.preference.vehicleType,
          activeRideRequest.preference.tier,
          activeRideRequest.preference.size,
        ),
        fare: activeRideRequest.quote.estimatedFare,
        pickupAddress: activeRideRequest.pickup.address,
        dropoffAddress: activeRideRequest.dropoff.address,
        driverSharePercent: activeRideRequest.quote.driverSharePercent,
      }
    : null;

  const pickupCoordinate = activeTrip
    ? pointToCoordinate(activeTrip.pickup.point.coordinates)
    : null;
  const dropoffCoordinate = activeTrip
    ? pointToCoordinate(activeTrip.dropoff.point.coordinates)
    : null;
  const tripCoordinates = [pickupCoordinate, dropoffCoordinate].filter(
    isCoordinate,
  );
  const fallbackPolylineCoordinates =
    tripCoordinates.length > 0 ? [driverLocation, ...tripCoordinates] : [];
  const polylineCoordinates =
    routePolyline.length > 1 ? routePolyline : fallbackPolylineCoordinates;
  const initialRegionCenter =
    pickupCoordinate ?? dropoffCoordinate ?? driverLocation;

  useEffect(() => {
    if (!authToken || !hasUser) {
      return;
    }

    const socket = connectRealtimeSocket(authToken);
    if (!socket) {
      return;
    }

    const handleQueueUpdate = (payload: any) => {
      const requests = Array.isArray(payload?.requests) ? payload.requests : [];
      dispatch(
        setDriverRideStatus({
          activeRideRequest: (requests[0] as any) ?? null,
        }),
      );
    };

    const handleRideRemoved = (payload: any) => {
      if (!payload?.requestId || !pendingRequestId) {
        return;
      }

      if (String(payload.requestId) !== String(pendingRequestId)) {
        return;
      }

      dispatch(
        setDriverRideStatus({
          activeRideRequest: null,
        }),
      );
    };

    const handleRideAccepted = (payload: any) => {
      if (!payload?.trip) {
        return;
      }

      dispatch(
        setDriverRideStatus({
          activeRideRequest: null,
          activeTrip: payload.trip,
          isBusy: true,
        }),
      );
    };

    const handleQueueError = (payload: any) => {
      console.log("ride-request:error", payload);
    };

    socket.on("ride-request:queue", handleQueueUpdate);
    socket.on("ride-request:removed", handleRideRemoved);
    socket.on("ride-request:accepted", handleRideAccepted);
    socket.on("ride-request:error", handleQueueError);
    socket.emit("ride-request:sync");

    return () => {
      socket.off("ride-request:queue", handleQueueUpdate);
      socket.off("ride-request:removed", handleRideRemoved);
      socket.off("ride-request:accepted", handleRideAccepted);
      socket.off("ride-request:error", handleQueueError);
    };
  }, [authToken, dispatch, hasUser, pendingRequestId]);

  useEffect(() => {
    if (storedDriverLocation) {
      setDriverLocation(
        pointToCoordinate(storedDriverLocation.point.coordinates),
      );
    }
  }, [storedDriverLocation]);

  useEffect(() => {
    if (tripCoordinates.length === 0) {
      setRoutePolyline([]);
    }
  }, [tripCoordinates.length]);

  useEffect(() => {
    if (!activeTrip) {
      hasFittedTripRef.current = false;
      setArrived(false);
      return;
    }

    if (hasFittedTripRef.current) {
      return;
    }

    const coordinates =
      routePolyline.length > 1
        ? routePolyline
        : [driverLocation, ...tripCoordinates];

    if (coordinates.length < 2) {
      return;
    }

    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: {
        top: verticalScale(110),
        right: scale(50),
        bottom: verticalScale(280),
        left: scale(50),
      },
      animated: true,
    });
    hasFittedTripRef.current = true;
  }, [activeTrip, driverLocation, pickupCoordinate, routePolyline]);

  useFocusEffect(
    useCallback(() => {
      let subscription: Location.LocationSubscription | null = null;

      const startWatching = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 5,
            timeInterval: 2000,
          },
          (loc) => {
            const nextLocation = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };

            setDriverLocation(nextLocation);
            setHeading(loc.coords.heading || 0);

            if (isOnline) {
              const now = Date.now();
              if (now - lastLocationSyncRef.current >= 2000) {
                lastLocationSyncRef.current = now;
                updateLocation({
                  lat: nextLocation.latitude,
                  lng: nextLocation.longitude,
                }).catch(() => {
                  // Ignore transient network failures; next tick retries.
                });
              }
            }

            if (pickupCoordinate) {
              const distanceToPickup = getDistance(
                nextLocation.latitude,
                nextLocation.longitude,
                pickupCoordinate.latitude,
                pickupCoordinate.longitude,
              );

              setArrived(distanceToPickup < 30);
              return;
            }

            setArrived(false);
          },
        );
      };

      startWatching();

      return () => {
        subscription?.remove();
        subscription = null;
      };
    }, [
      isOnline,
      pickupCoordinate?.latitude,
      pickupCoordinate?.longitude,
      updateLocation,
    ]),
  );

  const handleAcceptRequest = useCallback(async () => {
    if (!pendingRequestId) {
      return;
    }

    try {
      await acceptRideRequest({ requestId: pendingRequestId }).unwrap();
    } catch (error: any) {
      Alert.alert(
        "Accept request failed",
        getApiErrorMessage(error, "Could not accept the ride request."),
      );
    }
  }, [acceptRideRequest, pendingRequestId]);

  return (
    <View style={styles.mainContainer}>
      <TopMapControlls
        driverLocation={driverLocation}
        price={activeTrip?.pricing.finalFare}
      />

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        userInterfaceStyle="light"
        showsUserLocation={false}
        showsMyLocationButton
        initialRegion={{
          latitude: initialRegionCenter.latitude,
          longitude: initialRegionCenter.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
      >
        {fallbackPolylineCoordinates.length > 1 && (
          <RoadPolyline
            coordinates={fallbackPolylineCoordinates}
            strokeWidth={5}
            strokeColor="#6366F1"
            minOriginMovementMeters={50}
            onRouteCoordinatesChange={setRoutePolyline}
          />
        )}

        <MarkerCircle
          tracksViewChanges
          coordinate={driverLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          flat
          rotation={heading}
        />

        {dropoffCoordinate && (
          <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={dropoffCoordinate}>
            <MarkerTriangle />
          </Marker>
        )}

        {pickupCoordinate && (
          <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={pickupCoordinate}>
            <MarkerUser />
          </Marker>
        )}
      </MapView>

      {pendingRequestId && !activeTrip && requestPreview && (
        <RequestCard
          onAccept={handleAcceptRequest}
          isLoading={isAcceptingRideRequest}
          rideLabel={requestPreview.rideLabel}
          fare={requestPreview.fare}
          pickupAddress={requestPreview.pickupAddress}
          dropoffAddress={requestPreview.dropoffAddress}
          driverSharePercent={requestPreview.driverSharePercent}
        />
      )}

      {!activeTrip && !pendingRequestId && (
        <>
          {isOnline ? (
            <BottomSheet
              ref={bottomSheetRef}
              index={1}
              style={[
                styles.bottomSheet,
                { alignItems: "center", justifyContent: "center" },
              ]}
              snapPoints={[height * 0.06, height * 0.25]}
              enableDynamicSizing={false}
              activeOffsetY={[0, 1]}
              enablePanDownToClose={false}
              handleIndicatorStyle={{
                backgroundColor: "#ccc",
                width: scale(50),
                height: 8,
                marginTop: verticalScale(4),
              }}
            >
              <>
                <Text style={styles.statusHeader}>You&apos;re online</Text>
                <Text style={styles.statusSubtext}>
                  Finding your next customer...
                </Text>
                <View style={styles.statusLevelTrack}>
                  <View style={styles.statusLevelFill} />
                </View>
              </>
            </BottomSheet>
          ) : (
            <BottomSheet
              ref={bottomSheetRef}
              index={1}
              style={[
                styles.bottomSheet,
                { alignItems: "center", justifyContent: "center" },
              ]}
              snapPoints={[height * 0.06, height * 0.25]}
              enableDynamicSizing={false}
              activeOffsetY={[0, 1]}
              enablePanDownToClose={false}
              handleIndicatorStyle={{
                backgroundColor: "#ccc",
                width: scale(50),
                height: 8,
                marginTop: verticalScale(4),
              }}
            >
              <>
                <Text style={styles.statusHeader}>You&apos;re offline</Text>
                <DriverAvailabilityButton
                  driverLocation={driverLocation}
                  style={{
                    flexDirection: "row",
                    width: scale(270),
                    marginTop: verticalScale(20),
                  }}
                />
              </>
            </BottomSheet>
          )}
        </>
      )}

      {activeTrip && (
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          style={styles.bottomSheet}
          snapPoints={[height * 0.06, height * 0.43]}
          enableDynamicSizing={false}
          activeOffsetY={[0, 1]}
          enablePanDownToClose={false}
          handleIndicatorStyle={{
            backgroundColor: "#ccc",
            width: scale(50),
            height: 8,
            marginTop: verticalScale(4),
          }}
        >
          <RiderPickupCard currentLocation={driverLocation} />
        </BottomSheet>
      )}
    </View>
  );
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  bottomSheet: {
    paddingHorizontal: scale(20),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statusHeader: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    color: "#333",
    marginTop: scale(18),
    textAlign: "center",
  },
  statusSubtext: {
    fontSize: moderateScale(14),
    color: "#5B5B5B",
    marginTop: scale(8),
    marginBottom: scale(18),
    textAlign: "center",
  },
  statusLevelTrack: {
    width: scale(270),
    height: verticalScale(6),
    borderRadius: scale(999),
    backgroundColor: "#E7E7E7",
    overflow: "hidden",
  },
  statusLevelFill: {
    width: "11%",
    height: "100%",
    borderRadius: scale(999),
    backgroundColor: "#5E5CFF",
  },
});
