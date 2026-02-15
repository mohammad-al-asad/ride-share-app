import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import CustomButton from "./CustomButton";

import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { MarkerCircle } from "./AnimatedMarker";
import DraggableMarker from "./DraggableMarker";

const ConfirmPickupScreen = () => {
  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 22.964017700766465,
    longitude: 91.47941870870076,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [markerPosition, setMarkerPosition] = useState({
    latitude: 22.964017700766465,
    longitude: 91.47941870870076,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  // Shared animated value for button bottom position
  const animatedBottom = useSharedValue(verticalScale(215));

  useEffect(() => {
    let subscription: any;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 0,
          timeInterval: 0,
        },
        (loc) => {
          const newLocation = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            // latitude: routeCoordinates[0].latitude,
            // longitude: routeCoordinates[0].longitude,
          };
          setCurrentLocation(newLocation as any);
          mapRef.current?.animateCamera({
            center: newLocation,
          });
        },
      );
    })();

    return () => subscription?.remove();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === 0) {
      animatedBottom.value = withTiming(verticalScale(55), {
        duration: 300,
      });
    } else {
      animatedBottom.value = withTiming(verticalScale(215), {
        duration: 300,
      });
    }
  }, []);

  const animatedLocateStyle = useAnimatedStyle(() => {
    return {
      bottom: animatedBottom.value,
    };
  });

  const pickupLocation = {
    latitude: 22.964017700766465,
    longitude: 91.47941870870076,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={pickupLocation}
        provider={PROVIDER_GOOGLE}
        userInterfaceStyle="light"
        showsCompass={false}
      >
        <MarkerCircle coordinate={currentLocation} />
        <DraggableMarker
          setMarkerPosition={setMarkerPosition}
          markerPosition={markerPosition}
        />
      </MapView>

      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Animated Locate Button */}
      <Animated.View style={[styles.locateButton, animatedLocateStyle]}>
        <TouchableOpacity onPress={() => setMarkerPosition(currentLocation)}>
          <MaterialIcons name="my-location" size={24} color="black" />
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        index={1}
        snapPoints={["5%"]}
        enablePanDownToClose={false}
        handleIndicatorStyle={{
          backgroundColor: "#ccc",
          width: scale(50),
          height: 8,
        }}
        backgroundStyle={{
          backgroundColor: "#F8F9FD",
        }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Confirm pickup spot</Text>

          <View style={styles.locationRow}>
            <Image
              style={{ height: 20, width: 20 }}
              source={require("@/assets/icons/selectedAddress.svg")}
            />
            <Text style={styles.addressText} numberOfLines={1}>
              Brac University Building 5
            </Text>
          </View>

          <CustomButton text="Confirm Location" onClick={() => {}} />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

export default ConfirmPickupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: "absolute",
    top: verticalScale(40),
    left: scale(20),
    backgroundColor: "white",
    padding: scale(10),
    borderRadius: scale(25),
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  locateButton: {
    position: "absolute",
    right: scale(20),
    backgroundColor: "white",
    padding: scale(12),
    borderRadius: scale(30),
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  markerContainer: {
    width: scale(40),
    height: scale(40),
    backgroundColor: "rgba(99, 102, 241, 0.3)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  markerDot: {
    width: scale(12),
    height: scale(12),
    backgroundColor: "#6366F1",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "white",
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#333",
    marginTop: verticalScale(12),
    marginBottom: verticalScale(20),
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: verticalScale(25),
    gap: scale(12),
  },
  locationIconOuter: {
    width: scale(22),
    height: scale(22),
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  locationIconInner: {
    width: scale(8),
    height: scale(8),
    borderRadius: 4,
    backgroundColor: "#6366F1",
  },
  addressText: {
    fontSize: moderateScale(15),
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
});
