import { useCreateRideRequestMutation } from "@/redux/api/rideBookApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  RideLocation,
  RideRequestPayload,
  setLatestRideRequest,
  setRideEstimate,
  setStep1Locations,
} from "@/redux/slices/rideBookSlice";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import CustomButton from "./CustomButton";

import { Image } from "expo-image";
import * as Location from "expo-location";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { MarkerCircle } from "./AnimatedMarker";
import DraggableMarker from "./DraggableMarker";

type ConfirmLocationMode = "pickup" | "dropoff";
type Coordinate = {
  latitude: number;
  longitude: number;
};

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_MAP_API_KEY;
const DEFAULT_COORDINATE: Coordinate = {
  latitude: 23.7806,
  longitude: 90.4071,
};

const formatReverseGeocodeAddress = (
  address: Location.LocationGeocodedAddress,
) => {
  const formatted = [
    address.name,
    address.street,
    address.city,
    address.region,
    address.country,
  ]
    .filter(Boolean)
    .join(", ")
    .trim();

  return formatted || "Selected location";
};

const haversineMiles = (from: Coordinate, to: Coordinate) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;

  const latDiff = toRad(to.latitude - from.latitude);
  const lngDiff = toRad(to.longitude - from.longitude);

  const a =
    Math.sin(latDiff / 2) ** 2 +
    Math.cos(toRad(from.latitude)) *
      Math.cos(toRad(to.latitude)) *
      Math.sin(lngDiff / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
};

const fallbackEstimate = (pickup: Coordinate, dropoff: Coordinate) => {
  const estimatedMiles = Number(haversineMiles(pickup, dropoff).toFixed(1));
  const estimatedMinutes = Math.max(1, Math.round((estimatedMiles / 22) * 60));

  return { estimatedMiles, estimatedMinutes };
};

const ConfirmLocation = ({
  mode = "pickup",
}: {
  mode?: ConfirmLocationMode;
}) => {
  const dispatch = useAppDispatch();
  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const hasCenteredFromGpsRef = useRef(false);
  const [createRideRequest] = useCreateRideRequestMutation();

  const { pickup, dropoff, schedule } = useAppSelector(
    (state) => state.rideBook.step1,
  );
  const preference = useAppSelector((state) => state.rideBook.step2.preference);
  const payment = useAppSelector((state) => state.rideBook.payment);

  const seededCoordinate: Coordinate =
    mode === "dropoff"
      ? dropoff
        ? { latitude: dropoff.lat, longitude: dropoff.lng }
        : DEFAULT_COORDINATE
      : pickup
        ? { latitude: pickup.lat, longitude: pickup.lng }
        : DEFAULT_COORDINATE;

  const [currentLocation, setCurrentLocation] =
    useState<Coordinate>(seededCoordinate);
  const [markerPosition, setMarkerPosition] =
    useState<Coordinate>(seededCoordinate);
  const [resolvedAddress, setResolvedAddress] = useState<string>(
    mode === "dropoff" ? (dropoff?.address ?? "") : (pickup?.address ?? ""),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shared animated value for button bottom position
  const animatedBottom = useSharedValue(verticalScale(215));

  useEffect(() => {
    const selected = mode === "dropoff" ? dropoff : pickup;
    if (!selected) {
      return;
    }

    const nextCoordinate = {
      latitude: selected.lat,
      longitude: selected.lng,
    };

    setMarkerPosition(nextCoordinate);
    setResolvedAddress(selected.address);
    mapRef.current?.animateCamera({
      center: nextCoordinate,
    });
  }, [dropoff, mode, pickup]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: markerPosition.latitude,
          longitude: markerPosition.longitude,
        });

        if (!cancelled && address) {
          setResolvedAddress(formatReverseGeocodeAddress(address));
        }
      } catch (error) {
        console.log("Reverse geocode failed:", error);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [markerPosition.latitude, markerPosition.longitude]);

  useFocusEffect(
    useCallback(() => {
      let subscription: Location.LocationSubscription | null = null;
      hasCenteredFromGpsRef.current = false;

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
            const nextLocation = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };

            setCurrentLocation(nextLocation);

            const hasExistingLocation =
              mode === "dropoff" ? !!dropoff : !!pickup;
            if (!hasExistingLocation && !hasCenteredFromGpsRef.current) {
              hasCenteredFromGpsRef.current = true;
              setMarkerPosition(nextLocation);
              mapRef.current?.animateCamera({
                center: nextLocation,
              });
            }
          },
        );
      };

      startWatching();

      return () => {
        subscription?.remove();
        subscription = null;
      };
    }, [dropoff, mode, pickup]),
  );

  const handleSheetChanges = useCallback((index: number) => {
    if (index === 0) {
      animatedBottom.value = withTiming(verticalScale(100), {
        duration: 300,
      });
      return;
    }

    animatedBottom.value = withTiming(verticalScale(260), {
      duration: 300,
    });
  }, []);

  const animatedLocateStyle = useAnimatedStyle(() => {
    return {
      bottom: animatedBottom.value,
    };
  });

  const resolveDirectionsEstimate = async (
    start: RideLocation,
    end: RideLocation,
  ) => {
    if (!GOOGLE_MAPS_API_KEY) {
      return fallbackEstimate(
        { latitude: start.lat, longitude: start.lng },
        { latitude: end.lat, longitude: end.lng },
      );
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const data = await response.json();
      const leg = data?.routes?.[0]?.legs?.[0];
      const distanceMeters = Number(leg?.distance?.value);
      const durationSeconds = Number(leg?.duration?.value);

      if (
        !Number.isFinite(distanceMeters) ||
        !Number.isFinite(durationSeconds)
      ) {
        return fallbackEstimate(
          { latitude: start.lat, longitude: start.lng },
          { latitude: end.lat, longitude: end.lng },
        );
      }

      const estimatedMiles = Number((distanceMeters * 0.000621371).toFixed(1));
      const estimatedMinutes = Math.max(1, Math.round(durationSeconds / 60));

      return { estimatedMiles, estimatedMinutes };
    } catch (error) {
      console.log("Failed to fetch directions estimate:", error);
      return fallbackEstimate(
        { latitude: start.lat, longitude: start.lng },
        { latitude: end.lat, longitude: end.lng },
      );
    }
  };

  const buildLocationFromMarker = async () => {
    let addressText = resolvedAddress.trim();

    if (!addressText) {
      const [address] = await Location.reverseGeocodeAsync({
        latitude: markerPosition.latitude,
        longitude: markerPosition.longitude,
      });
      addressText = address
        ? formatReverseGeocodeAddress(address)
        : "Selected location";
    }

    return {
      address: addressText,
      lat: markerPosition.latitude,
      lng: markerPosition.longitude,
    } as RideLocation;
  };

  const onConfirmLocation = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const confirmedLocation = await buildLocationFromMarker();
      if (mode === "dropoff") {
        dispatch(setStep1Locations({ dropoff: confirmedLocation }));
        router.replace({
          pathname: "/(protected)/(book)",
          params: { preserve: "1" },
        } as any);
        return;
      }

      dispatch(setStep1Locations({ pickup: confirmedLocation }));

      if (!dropoff) {
        Alert.alert(
          "Missing dropoff",
          "Please select your dropoff location first.",
        );
        return;
      }
      if (!preference) {
        Alert.alert(
          "Missing car type",
          "Please select your ride preference first.",
        );
        return;
      }

      if (!payment) {
        Alert.alert(
          "Missing payment",
          "Please add your payment method first.",
        );
        return;
      }

      const estimate = await resolveDirectionsEstimate(
        confirmedLocation,
        dropoff,
      );
      dispatch(
        setRideEstimate({
          estimatedMiles: estimate.estimatedMiles,
          estimatedMinutes: estimate.estimatedMinutes,
        }),
      );

      const payload: RideRequestPayload = {
        pickup: confirmedLocation,
        dropoff,
        schedule:
          schedule.kind === "later"
            ? {
                kind: "later",
                pickupAt: schedule.pickupAt ?? null,
              }
            : { kind: "now" },
        preference,
        payment,
        estimatedMiles: estimate.estimatedMiles,
        estimatedMinutes: estimate.estimatedMinutes,
      };

      const response = await createRideRequest(payload).unwrap();
      dispatch(setLatestRideRequest(response.data.rideRequest));
      console.log(response.data.rideRequest);
      
      router.replace("/(protected)/(book)/ride-map");
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        "Failed to create ride request. Please try again.";
      Alert.alert("Ride request failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: seededCoordinate.latitude,
          longitude: seededCoordinate.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        provider={PROVIDER_GOOGLE}
        userInterfaceStyle="light"
        showsCompass={false}
      >
        <MarkerCircle coordinate={currentLocation} />
        <DraggableMarker
          setMarkerPosition={(coordinate: Coordinate) =>
            setMarkerPosition({
              latitude: coordinate.latitude,
              longitude: coordinate.longitude,
            })
          }
          markerPosition={markerPosition}
        />
      </MapView>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>

      <Animated.View style={[styles.locateButton, animatedLocateStyle]}>
        <TouchableOpacity
          onPress={() => {
            setMarkerPosition(currentLocation);
            mapRef.current?.animateCamera({
              center: currentLocation,
            });
          }}
        >
          <MaterialIcons name="my-location" size={24} color="black" />
        </TouchableOpacity>
      </Animated.View>

      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        index={1}
        snapPoints={["7%", "32%"]}
        enablePanDownToClose={false}
        handleIndicatorStyle={{
          backgroundColor: "#ccc",
          width: scale(50),
          height: 8,
          marginTop: verticalScale(4),
        }}
        backgroundStyle={{
          backgroundColor: "#F8F9FD",
        }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>
            {mode === "dropoff" ? "Select dropoff spot" : "Confirm pickup spot"}
          </Text>

          <View style={styles.locationRow}>
            <Image
              style={{ height: 20, width: 20 }}
              source={require("@/assets/icons/selectedAddress.svg")}
            />
            <Text style={styles.addressText} numberOfLines={1}>
              {resolvedAddress || "Resolving location..."}
            </Text>
          </View>

          <CustomButton
            text={mode === "dropoff" ? "Confirm Dropoff" : "Book Ride Now"}
            onClick={onConfirmLocation}
            isLoading={isSubmitting}
          />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

export default ConfirmLocation;

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
    marginTop: verticalScale(30),
    marginBottom: verticalScale(20),
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: verticalScale(25),
    gap: scale(12),
  },
  addressText: {
    fontSize: moderateScale(15),
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
});
