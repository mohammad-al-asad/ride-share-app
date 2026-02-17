import { MarkerCircle } from "@/components/AnimatedMarker";
import DriverCard from "@/components/DriverCard";
import { MarkerTriangle } from "@/components/Markers";
import TripDetails from "@/components/TripDetails";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const routeCoordinates = [
  { latitude: 32.783, longitude: -96.804 },
  { latitude: 32.783, longitude: -96.8 },
  { latitude: 32.785, longitude: -96.8 },
  { latitude: 32.785, longitude: -96.797 },
];

export default function TripProgressScreen() {
  // User state
  const [userLocation, setUserLocation] = useState(routeCoordinates[0]);
  const [heading, setHeading] = useState(0);
  const { height } = Dimensions.get("window");
  const bottomSheetRef = useRef<BottomSheet | null>(null);

  // Track driver location
  useFocusEffect(
    useCallback(() => {
      let subscription: Location.LocationSubscription | null = null;

      const startWatching = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") return;

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 5,
            timeInterval: 2000,
          },
          (loc) => {
            const newLocation = {
              latitude: routeCoordinates[0].latitude,
              longitude: routeCoordinates[0].longitude,
            };

            setUserLocation(newLocation);
            setHeading(loc.coords.heading || 0);
          },
        );
      };

      startWatching();

      // 🔴 This runs immediately when screen loses focus
      return () => {
        subscription?.remove();
        subscription = null;
      };
    }, [routeCoordinates]),
  );
  return (
    <View style={styles.container}>
      {/* Background Map with Route */}
      <MapView
        style={styles.map}
        userInterfaceStyle="light"
        initialRegion={{
          latitude: 32.7767,
          longitude: -96.797,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* User marker */}
        <MarkerCircle
          tracksViewChanges={true}
          coordinate={userLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          flat
          rotation={heading}
        />

        {/* Destination / pickup */}
        <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={routeCoordinates[3]}>
          <MarkerTriangle />
        </Marker>
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#7B61FF"
          strokeWidth={4}
        />
      </MapView>

      {/* Back/Minimize Button */}
      <TouchableOpacity style={styles.topCircleButton}>
        <Ionicons name="chevron-down" size={24} color="black" />
      </TouchableOpacity>

      {/* Trip Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={[height * 0.06, height * 0.67]}
        enableDynamicSizing={false}
        activeOffsetY={[0, 1]}
        enablePanDownToClose={false}
        handleIndicatorStyle={{
          backgroundColor: "#ccc",
          width: scale(50),
          height: 8,
          marginTop: verticalScale(4),
        }}
        style={styles.bottomSheet}
      >
        <Text style={styles.statusTitle}>Ride started</Text>

        {/* Driver Information Card */}
        <DriverCard />

        {/* Trip Details Section */}
        <TripDetails />

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel ride</Text>
        </TouchableOpacity>
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
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    alignSelf: "center",
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
    paddingTop: verticalScale(20),
  },

  cancelButton: {
    backgroundColor: "#FFEBEE",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: { color: "#D32F2F", fontSize: 16, fontWeight: "600" },
});
