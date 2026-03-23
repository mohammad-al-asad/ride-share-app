import { MarkerCircle } from "@/components/AnimatedMarker";
import FareModal from "@/components/FareModal";
import { MarkerTriangle } from "@/components/Markers";
import RoadPolyline from "@/components/RoadPolyline";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
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

/* ---------- Mock Route (Like Screenshot) ---------- */
const routeCoordinates = [
  { latitude: 32.7801, longitude: -96.8055 },
  { latitude: 32.7815, longitude: -96.8055 },
  { latitude: 32.7825, longitude: -96.7985 },
  { latitude: 32.7845, longitude: -96.801 },
  { latitude: 32.7858, longitude: -96.7975 },
];

export default function MapSelectionScreen() {
  const mapRef = useRef<MapView>(null);

  const [pickUpText, setPickUpText] = useState("Brac University Building 5");
  const [dropOffText, setDropOffText] = useState("Hazrat Shahjalal Airport");

  const [userLocation, setUserLocation] = useState(routeCoordinates[0]);
  const [heading, setHeading] = useState(0);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentInput, setCurrentInput] = useState<"pickup" | "dropoff">(
    "dropoff",
  );

  const [modalVisible, setModalVisible] = useState(false);

  const [searchTimer, setSearchTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  /* ---------- Location Tracking ---------- */
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
            distanceInterval: 1,
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

      // This runs when screen loses focus
      return () => {
        subscription?.remove();
        subscription = null;
      };
    }, [routeCoordinates]),
  );

  /* ---------- Debounced Search ---------- */
  const debouncedSearch = (text: string) => {
    if (searchTimer) clearTimeout(searchTimer);

    const timer = setTimeout(() => {
      performSearch(text);
    }, 400);

    setSearchTimer(timer);
  };

  const performSearch = async (text: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text,
        )}&key=${GOOGLE_MAPS_API_KEY}&types=geocode`,
      );
      const json = await response.json();
      setSearchResults(json?.predictions || []);
    } catch (error) {
      console.log(error);
      setSearchResults([]);
    }
  };

  const handleLocationSelect = (item: any) => {
    const fullDescription = item?.description || "";

    if (currentInput === "pickup") {
      setPickUpText(fullDescription);
    } else {
      setDropOffText(fullDescription);
    }

    setSearchResults([]);
    Keyboard.dismiss();

    // Optional: Animate map (center on mock route end)
    mapRef.current?.animateToRegion(
      {
        latitude: routeCoordinates[4].latitude,
        longitude: routeCoordinates[4].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      600,
    );
  };

  return (
    <View style={styles.container}>
      <FareModal
        visible={modalVisible}
        price={10.0}
        onCancel={() => setModalVisible(false)}
        onConfirm={() => {
          console.log("Fare accepted");
          setModalVisible(false);
        }}
      />
      {/* ---------- MAP ---------- */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 32.7767,
          longitude: -96.797,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        userInterfaceStyle="light"
      >
        <MarkerCircle
          coordinate={userLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          flat
          rotation={heading}
        />

        <Marker coordinate={routeCoordinates[4]} anchor={{ x: 0.5, y: 0.5 }}>
          <MarkerTriangle />
        </Marker>

        <RoadPolyline
          coordinates={routeCoordinates}
          strokeColor="#7B61FF"
          strokeWidth={4}
        />
      </MapView>

      {/* ---------- HEADER ---------- */}
      <View style={styles.searchHeader}>
        <View style={styles.row}>
          <View style={{ flex: 1, marginLeft: scale(10) }}>
            <View style={styles.inputCard}>
              {/* Pickup */}
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <View style={styles.inputBox}>
                  <Ionicons name="radio-button-on" size={26} color="#7B61FF" />
                  <TextInput
                    placeholder="Pickup location"
                    style={styles.input}
                    value={pickUpText}
                    onChangeText={(text) => {
                      setCurrentInput("pickup");
                      setPickUpText(text);
                      if (text.length > 1) debouncedSearch(text);
                      else setSearchResults([]);
                    }}
                  />
                </View>
              </View>

              {/* Dropoff */}
              <View style={styles.inputRow}>
                <View style={styles.inputBox}>
                  <Ionicons name="location-sharp" size={26} color="#7B61FF" />
                  <TextInput
                    placeholder="Dropoff location"
                    style={styles.input}
                    value={dropOffText}
                    onChangeText={(text) => {
                      setCurrentInput("dropoff");
                      setDropOffText(text);
                      if (text.length > 1) debouncedSearch(text);
                      else setSearchResults([]);
                    }}
                  />
                </View>
              </View>
            </View>

            {/* ---------- SEARCH RESULTS ---------- */}
            {searchResults.length > 0 && (
              <View style={styles.listWrapper}>
                <FlatList
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  data={searchResults}
                  keyExtractor={(item: any) => item.place_id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.locationItem}
                      onPress={() => handleLocationSelect(item)}
                    >
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color="#333"
                      />
                      <View
                        style={{
                          marginLeft: 10,
                          flex: 1,
                        }}
                      >
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

      {/* ---------- BOTTOM ACTIONS ---------- */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.primaryBtnText}>Check fare</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ===================== STYLES ===================== */

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

  input: {
    fontSize: moderateScale(14),
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
