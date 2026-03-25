import { MarkerCircle } from "@/components/AnimatedMarker";
import FareModal from "@/components/FareModal";
import { MarkerTriangle } from "@/components/Markers";
import RoadPolyline from "@/components/RoadPolyline";
import {
  DestinationMetricsPayload,
  useChangeRideRequestDestinationMutation,
  useChangeTripDestinationMutation,
  useCheckRideRequestFareMutation,
  useCheckTripFareMutation,
} from "@/redux/api/rideBookApi";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_MAP_API_KEY;

type Coordinate = {
  latitude: number;
  longitude: number;
};

type DropoffLocation = {
  address: string;
  lat: number;
  lng: number;
};

type GooglePrediction = {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

const DEFAULT_COORDINATE: Coordinate = {
  latitude: 23.7806,
  longitude: 90.4071,
};

const pointToCoordinate = (
  coordinates?: [number, number],
): Coordinate | null => {
  if (
    !Array.isArray(coordinates) ||
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

const parseFareAmount = (fareSnapshot: any) => {
  const parsed = Number(
    fareSnapshot?.estimatedFare ??
      fareSnapshot?.finalFare ??
      fareSnapshot?.totalFare,
  );
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export default function MapSelectionScreen() {
  const mapRef = useRef<MapView>(null);
  const [searchTimer, setSearchTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const latestRideRequest = useAppSelector(
    (state) => state.rideBook.latestRideRequest,
  );
  const activeTrip = useAppSelector((state) => state.rideBook.activeTrip);

  const pickupFromState = useMemo(() => {
    const activePickupCoordinate = pointToCoordinate(
      activeTrip?.pickup?.point?.coordinates as [number, number] | undefined,
    );
    if (activePickupCoordinate && activeTrip?.pickup?.address) {
      return {
        address: activeTrip.pickup.address,
        lat: activePickupCoordinate.latitude,
        lng: activePickupCoordinate.longitude,
      };
    }

    const requestPickupCoordinate = pointToCoordinate(
      latestRideRequest?.pickup?.point?.coordinates,
    );
    if (requestPickupCoordinate && latestRideRequest?.pickup?.address) {
      return {
        address: latestRideRequest.pickup.address,
        lat: requestPickupCoordinate.latitude,
        lng: requestPickupCoordinate.longitude,
      };
    }

    return null;
  }, [
    activeTrip?.pickup?.address,
    activeTrip?.pickup?.point?.coordinates,
    latestRideRequest?.pickup?.address,
    latestRideRequest?.pickup?.point?.coordinates,
  ]);

  const initialDropoff = useMemo(() => {
    const activeDropoffCoordinate = pointToCoordinate(
      activeTrip?.dropoff?.point?.coordinates as [number, number] | undefined,
    );
    if (activeDropoffCoordinate && activeTrip?.dropoff?.address) {
      return {
        address: activeTrip.dropoff.address,
        lat: activeDropoffCoordinate.latitude,
        lng: activeDropoffCoordinate.longitude,
      } as DropoffLocation;
    }

    const requestDropoffCoordinate = pointToCoordinate(
      latestRideRequest?.dropoff?.point?.coordinates,
    );
    if (requestDropoffCoordinate && latestRideRequest?.dropoff?.address) {
      return {
        address: latestRideRequest.dropoff.address,
        lat: requestDropoffCoordinate.latitude,
        lng: requestDropoffCoordinate.longitude,
      } as DropoffLocation;
    }

    return null;
  }, [
    activeTrip?.dropoff?.address,
    activeTrip?.dropoff?.point?.coordinates,
    latestRideRequest?.dropoff?.address,
    latestRideRequest?.dropoff?.point?.coordinates,
  ]);

  const pickupText = pickupFromState?.address ?? "Pickup location";
  const [dropOffText, setDropOffText] = useState(initialDropoff?.address ?? "");
  const [selectedDropoff, setSelectedDropoff] = useState<DropoffLocation | null>(
    initialDropoff,
  );
  const hasEditedDropoffRef = useRef(false);
  const [userLocation, setUserLocation] = useState<Coordinate>(
    pickupFromState
      ? { latitude: pickupFromState.lat, longitude: pickupFromState.lng }
      : DEFAULT_COORDINATE,
  );
  const [heading, setHeading] = useState(0);
  const [searchResults, setSearchResults] = useState<GooglePrediction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [checkedFare, setCheckedFare] = useState(0);
  const [pendingBody, setPendingBody] = useState<DestinationMetricsPayload | null>(
    null,
  );

  const [checkRideRequestFare, { isLoading: isCheckingRideRequestFare }] =
    useCheckRideRequestFareMutation();
  const [checkTripFare, { isLoading: isCheckingTripFare }] =
    useCheckTripFareMutation();
  const [changeRideRequestDestination, { isLoading: isChangingRideRequest }] =
    useChangeRideRequestDestinationMutation();
  const [changeTripDestination, { isLoading: isChangingTrip }] =
    useChangeTripDestinationMutation();

  const isCheckingFare = isCheckingRideRequestFare || isCheckingTripFare;
  const isChangingDestination = isChangingRideRequest || isChangingTrip;

  const pickupCoordinate = pickupFromState
    ? { latitude: pickupFromState.lat, longitude: pickupFromState.lng }
    : null;
  const dropoffCoordinate = selectedDropoff
    ? { latitude: selectedDropoff.lat, longitude: selectedDropoff.lng }
    : null;
  const mapCenter = dropoffCoordinate ?? pickupCoordinate ?? userLocation;

  const routeCoordinates = useMemo(() => {
    if (pickupCoordinate && dropoffCoordinate) {
      return [pickupCoordinate, dropoffCoordinate];
    }

    if (dropoffCoordinate) {
      return [userLocation, dropoffCoordinate];
    }

    return [];
  }, [dropoffCoordinate, pickupCoordinate, userLocation]);

  const getApiErrorMessage = useCallback(
    (error: any, fallbackMessage: string) =>
      error?.data?.error?.message ?? error?.data?.message ?? fallbackMessage,
    [],
  );

  useEffect(() => {
    if (!initialDropoff || hasEditedDropoffRef.current) {
      return;
    }

    setDropOffText(initialDropoff.address);
    setSelectedDropoff(initialDropoff);
  }, [initialDropoff]);

  useFocusEffect(
    useCallback(() => {
      let subscription: Location.LocationSubscription | null = null;

      const startWatching = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000,
            distanceInterval: 3,
          },
          (loc) => {
            setUserLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
            setHeading(loc.coords.heading || 0);
          },
        );
      };

      startWatching();

      return () => {
        subscription?.remove();
        subscription = null;
      };
    }, []),
  );

  const performSearch = useCallback(async (text: string) => {
    if (!GOOGLE_MAPS_API_KEY) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text,
        )}&key=${GOOGLE_MAPS_API_KEY}&types=geocode`,
      );
      const json = await response.json();
      setSearchResults((json?.predictions || []) as GooglePrediction[]);
    } catch (error) {
      console.log(error);
      setSearchResults([]);
    }
  }, []);

  const debouncedSearch = useCallback(
    (text: string) => {
      if (searchTimer) clearTimeout(searchTimer);

      const timer = setTimeout(() => {
        performSearch(text);
      }, 400);

      setSearchTimer(timer);
    },
    [performSearch, searchTimer],
  );

  const fetchPlaceDetails = useCallback(async (placeId: string) => {
    if (!GOOGLE_MAPS_API_KEY) {
      return null;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
        placeId,
      )}&fields=formatted_address,geometry&key=${GOOGLE_MAPS_API_KEY}`,
    );
    const json = await response.json();
    const location = json?.result?.geometry?.location;
    const formattedAddress = json?.result?.formatted_address;

    if (
      !location ||
      typeof location.lat !== "number" ||
      typeof location.lng !== "number"
    ) {
      return null;
    }

    return {
      address: formattedAddress || "Selected location",
      lat: location.lat,
      lng: location.lng,
    } as DropoffLocation;
  }, []);

  const handleLocationSelect = useCallback(
    async (item: GooglePrediction) => {
      try {
        const detailedLocation = await fetchPlaceDetails(item.place_id);

        if (!detailedLocation) {
          Alert.alert(
            "Location unavailable",
            "Could not load this place. Please try another location.",
          );
          return;
        }

        setDropOffText(detailedLocation.address);
        setSelectedDropoff(detailedLocation);
        hasEditedDropoffRef.current = true;
        setSearchResults([]);
        Keyboard.dismiss();

        mapRef.current?.animateToRegion(
          {
            latitude: detailedLocation.lat,
            longitude: detailedLocation.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          600,
        );
      } catch (error) {
        Alert.alert("Search failed", "Could not load place details right now.");
      }
    },
    [fetchPlaceDetails],
  );

  const resolveDirectionsEstimate = useCallback(
    async (pickup: DropoffLocation, dropoff: DropoffLocation) => {
      if (!GOOGLE_MAPS_API_KEY) {
        return fallbackEstimate(
          { latitude: pickup.lat, longitude: pickup.lng },
          { latitude: dropoff.lat, longitude: dropoff.lng },
        );
      }

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${pickup.lat},${pickup.lng}&destination=${dropoff.lat},${dropoff.lng}&key=${GOOGLE_MAPS_API_KEY}`,
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
            { latitude: pickup.lat, longitude: pickup.lng },
            { latitude: dropoff.lat, longitude: dropoff.lng },
          );
        }

        const estimatedMiles = Number((distanceMeters * 0.000621371).toFixed(1));
        const estimatedMinutes = Math.max(1, Math.round(durationSeconds / 60));
        return { estimatedMiles, estimatedMinutes };
      } catch (error) {
        return fallbackEstimate(
          { latitude: pickup.lat, longitude: pickup.lng },
          { latitude: dropoff.lat, longitude: dropoff.lng },
        );
      }
    },
    [],
  );

  const handleCheckFare = useCallback(async () => {
    if (!pickupFromState) {
      Alert.alert(
        "Missing pickup",
        "Pickup location is unavailable. Please try again.",
      );
      return;
    }

    if (!selectedDropoff) {
      Alert.alert(
        "Missing dropoff",
        "Please select a dropoff location from search results.",
      );
      return;
    }

    const tripId = activeTrip?._id ?? "";
    const requestId = latestRideRequest?._id ?? "";

    if (!tripId && !requestId) {
      Alert.alert(
        "No active ride",
        "There is no active request or trip to update.",
      );
      return;
    }

    try {
      const estimate = await resolveDirectionsEstimate(pickupFromState, selectedDropoff);
      const body: DestinationMetricsPayload = {
        dropoff: {
          address: selectedDropoff.address,
          lng: selectedDropoff.lng,
          lat: selectedDropoff.lat,
        },
        estimatedMiles: estimate.estimatedMiles,
        estimatedMinutes: estimate.estimatedMinutes,
      };

      if (tripId) {
        const response = await checkTripFare({
          tripId,
          body,
        }).unwrap();
        const checkedFareAmount = parseFareAmount(response?.data?.checkedFare);
        const fallbackFareAmount = parseFareAmount(response?.data?.currentFare);
        const fareAmount = Number.isFinite(checkedFareAmount)
          ? checkedFareAmount
          : fallbackFareAmount;
        if (!Number.isFinite(fareAmount)) {
          Alert.alert("Fare unavailable", "Could not calculate updated fare.");
          return;
        }

        setPendingBody(body);
        setCheckedFare(fareAmount);
        setModalVisible(true);
        return;
      }

      const response = await checkRideRequestFare({
        requestId,
        body,
      }).unwrap();
      const checkedFareAmount = parseFareAmount(response?.data?.checkedQuote);
      const fallbackFareAmount = parseFareAmount(response?.data?.currentQuote);
      const fareAmount = Number.isFinite(checkedFareAmount)
        ? checkedFareAmount
        : fallbackFareAmount;
      if (!Number.isFinite(fareAmount)) {
        Alert.alert("Fare unavailable", "Could not calculate updated fare.");
        return;
      }

      setPendingBody(body);
      setCheckedFare(fareAmount);
      setModalVisible(true);
    } catch (error: any) {
      Alert.alert(
        "Check fare failed",
        getApiErrorMessage(error, "Could not check fare right now."),
      );
    }
  }, [
    activeTrip?._id,
    checkRideRequestFare,
    checkTripFare,
    getApiErrorMessage,
    latestRideRequest?._id,
    pickupFromState,
    resolveDirectionsEstimate,
    selectedDropoff,
  ]);

  const handleConfirmChange = useCallback(async () => {
    if (isChangingDestination || !pendingBody) {
      return;
    }

    const tripId = activeTrip?._id ?? "";
    const requestId = latestRideRequest?._id ?? "";

    try {
      if (tripId) {
        await changeTripDestination({
          tripId,
          body: pendingBody,
        }).unwrap();
      } else if (requestId) {
        await changeRideRequestDestination({
          requestId,
          body: pendingBody,
        }).unwrap();
      } else {
        Alert.alert(
          "No active ride",
          "There is no active request or trip to update.",
        );
        return;
      }

      setModalVisible(false);
      Alert.alert("Destination updated", "Dropoff location changed successfully.");
      router.back();
    } catch (error: any) {
      Alert.alert(
        "Update failed",
        getApiErrorMessage(error, "Could not update dropoff location."),
      );
    }
  }, [
    activeTrip?._id,
    changeRideRequestDestination,
    changeTripDestination,
    getApiErrorMessage,
    isChangingDestination,
    latestRideRequest?._id,
    pendingBody,
  ]);

  return (
    <View style={styles.container}>
      <FareModal
        visible={modalVisible}
        price={checkedFare}
        onCancel={() => setModalVisible(false)}
        onConfirm={handleConfirmChange}
        isLoading={isChangingDestination}
      />

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: mapCenter.latitude,
          longitude: mapCenter.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        userInterfaceStyle="light"
      >
        <MarkerCircle
          coordinate={userLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          flat
          rotation={heading}
        />

        {dropoffCoordinate && (
          <Marker coordinate={dropoffCoordinate} anchor={{ x: 0.5, y: 0.5 }}>
            <MarkerTriangle />
          </Marker>
        )}

        {routeCoordinates.length > 1 && (
          <RoadPolyline
            coordinates={routeCoordinates}
            strokeColor="#7B61FF"
            strokeWidth={4}
          />
        )}
      </MapView>

      <View style={styles.searchHeader}>
        <View style={styles.row}>
          <View style={{ flex: 1, marginLeft: scale(10) }}>
            <View style={styles.inputCard}>
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <View style={[styles.inputBox, styles.inputBoxDisabled]}>
                  <Ionicons name="radio-button-on" size={26} color="#7B61FF" />
                  <TextInput
                    placeholder="Pickup location"
                    style={styles.input}
                    value={pickupText}
                    editable={false}
                    selectTextOnFocus={false}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputBox}>
                  <Ionicons name="location-sharp" size={26} color="#7B61FF" />
                  <TextInput
                    placeholder="Dropoff location"
                    style={styles.input}
                    value={dropOffText}
                    onChangeText={(text) => {
                      hasEditedDropoffRef.current = true;
                      setDropOffText(text);
                      setSelectedDropoff(null);
                      if (text.length > 1) debouncedSearch(text);
                      else setSearchResults([]);
                    }}
                  />
                </View>
              </View>
            </View>

            {searchResults.length > 0 && (
              <View style={styles.listWrapper}>
                <FlatList
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  data={searchResults}
                  keyExtractor={(item) => item.place_id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.locationItem}
                      onPress={() => handleLocationSelect(item)}
                    >
                      <Ionicons name="location-outline" size={20} color="#333" />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={styles.locationName} numberOfLines={1}>
                          {item?.structured_formatting?.main_text}
                        </Text>
                        <Text style={styles.locationAddress} numberOfLines={1}>
                          {item?.structured_formatting?.secondary_text}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()}>
          <Text style={styles.secondaryBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryBtn, isCheckingFare ? styles.buttonDisabled : null]}
          onPress={handleCheckFare}
          disabled={isCheckingFare}
        >
          <Text style={styles.primaryBtnText}>
            {isCheckingFare ? "Checking..." : "Check fare"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  map: { ...StyleSheet.absoluteFillObject },

  searchHeader: {
    backgroundColor: "#F4F4F6",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: verticalScale(50),
    paddingHorizontal: scale(10),
    borderRadius: scale(10),
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "white",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  inputCard: {
    overflow: "hidden",
    gap: verticalScale(10),
    paddingBottom: scale(10),
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: verticalScale(40),
    gap: scale(10),
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8E8FF",
    minHeight: verticalScale(40),
    backgroundColor: "#fff",
    padding: 7,
    gap: scale(7),
    paddingLeft: 10,
    flex: 1,
  },
  inputBoxDisabled: {
    backgroundColor: "#F2F4F7",
  },

  input: {
    fontSize: moderateScale(14),
    flex: 1,
  },

  listWrapper: {
    paddingVertical: scale(8),
    maxHeight: verticalScale(300),
  },

  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },

  locationName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#262626",
  },

  locationAddress: {
    fontSize: 13,
    color: "#666",
  },

  bottomActions: {
    position: "absolute",
    bottom: 20,
    left: 15,
    right: 15,
    flexDirection: "row",
    gap: scale(10),
  },

  primaryBtn: {
    flex: 2,
    backgroundColor: "#1A0066",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.65,
  },

  primaryBtnText: {
    color: "white",
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },

  secondaryBtn: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  secondaryBtnText: {
    fontSize: moderateScale(16),
    color: "#333",
  },
});
