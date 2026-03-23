import { MarkerCircle } from "@/components/AnimatedMarker";
import DriverCard from "@/components/DriverCard";
import { MarkerTriangle } from "@/components/Markers";
import RoadPolyline from "@/components/RoadPolyline";
import TripDetails from "@/components/TripDetails";
import { connectRealtimeSocket } from "@/config/realtime-socket";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setRideDriverProgress,
  setRideMatchedData,
} from "@/redux/slices/rideBookSlice";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
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

export default function TripProgressScreen() {
  const dispatch = useAppDispatch();
  const { height } = Dimensions.get("window");
  const bottomSheetRef = useRef<BottomSheet | null>(null);

  const authToken = useAppSelector((state) => state.auth.token);
  const rideStatus = useAppSelector(
    (state) => state.rideBook.latestRideRequest?.status,
  );
  const activeTrip = useAppSelector((state) => state.rideBook.activeTrip);
  const driverProgress = useAppSelector(
    (state) => state.rideBook.driverProgress,
  );
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

    socket.on("ride-request:matched", handleRideMatched);
    socket.on("trip:driver-location", handleDriverLocation);

    return () => {
      socket.off("ride-request:matched", handleRideMatched);
      socket.off("trip:driver-location", handleDriverLocation);
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
        onPress={() => router.back()}
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
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel ride</Text>
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
  cancelButtonText: { color: "#D32F2F", fontSize: 16, fontWeight: "600" },
});
