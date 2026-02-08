import { colors } from "@/config/colors";
import { Ionicons } from "@expo/vector-icons";
import { Gps01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { ActivityIndicator } from "react-native-paper";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const pickupOptions = [
  { label: "Pickup now", value: "now", icon: "time-outline" },
  { label: "Pickup later", value: "later", icon: "calendar-outline" },
];

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_MAP_API_KEY;

export default function LocationSelectionScreen() {
  const [pickupType, setPickupType] = useState("now");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [pickUpLocation, setPickUpLocation] = useState("");
  const [dropOffLocation, setDropOffLocation] = useState("");
  const [pickUpText, setPickUpText] = useState("");
  const [dropOffText, setDropOffText] = useState("");
  const [currentInput, setCurrentInput] = useState<"pickup" | "dropoff">(
    "dropoff",
  );
  const [gettingLocation, setGettingLocation] = useState(false);
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto-navigate when both are filled
  useEffect(() => {
    if (pickUpLocation && dropOffLocation) {
      router.push("/(protected)/(book)/choose-time");
    }
  }, [pickUpLocation, dropOffLocation]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimer) clearTimeout(searchTimer);
    };
  }, [searchTimer]);

  // Debounced Search Logic
  const debouncedSearch = (text: string) => {
    if (searchTimer) clearTimeout(searchTimer);

    if (text.length > 1) {
      const timer = setTimeout(() => {
        performSearch(text);
      }, 500); // 500ms delay
      setSearchTimer(timer as any);
    } else {
      setSearchResults([]);
    }
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
      console.error(error);
      setSearchResults([]);
    }
  };

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setGettingLocation(false);
      alert("Permission to access location was denied");
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync(location.coords);
      const formattedAddress =
        `${address?.name || ""} ${address?.street || ""}`.trim();

      setPickUpLocation(formattedAddress);
      setPickUpText(formattedAddress);
    } catch (error) {
      console.error(error);
    }
    setGettingLocation(false);
  };

  const handleLocationSelect = (item: any) => {
    const mainText =
      item?.structured_formatting?.main_text || item?.description || "";
    const fullDescription = item?.description || "";

    if (currentInput === "pickup") {
      setPickUpLocation(mainText);
      setPickUpText(fullDescription);
    } else {
      setDropOffLocation(mainText);
      setDropOffText(fullDescription);
    }
    setSearchResults([]);
  };

  const renderItem = (item: any) => {
    return (
      <View style={styles.itemContainer}>
        <Ionicons
          name={item.icon}
          size={moderateScale(18)}
          color={colors.main}
        />

        <Text style={styles.itemText}>{item.label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.pickupNowText}
        selectedTextStyle={styles.pickupNowText}
        data={pickupOptions}
        maxHeight={300}
        labelField="label"
        valueField="value"
        value={pickupType}
        onChange={(item: any) => setPickupType(item.value)}
        renderLeftIcon={() => (
          <Ionicons
            name={pickupType === "now" ? "time-outline" : "calendar-outline"}
            size={moderateScale(18)}
            color={colors.main}
            style={{ marginRight: scale(6) }}
          />
        )}
        renderRightIcon={() => (
          <Ionicons
            name="chevron-down"
            size={moderateScale(16)}
            color={colors.main}
            style={{ marginLeft: scale(6) }}
          />
        )}
        renderItem={renderItem}
        containerStyle={styles.dropdownListContainer}
      />

      <View style={styles.inputCard}>
        {/* Pickup Input */}
        <View style={styles.inputRow}>
          {pickUpLocation ? (
            <Image
              style={{ height: 20, width: 20 }}
              source={require("@/assets/icons/selectedAddress.svg")}
            />
          ) : (
            <Ionicons name="search-outline" size={20} color="#666" />
          )}

          <TextInput
            placeholder="Pickup Location"
            style={styles.input}
            value={pickUpText}
            onChangeText={(text: string) => {
              setCurrentInput("pickup");
              setPickUpText(text);
              if (text === "" || text.length < pickUpText.length) {
                setPickUpLocation("");
                setSearchResults([]);
              } else {
                debouncedSearch(text);
              }
            }}
          />
        </View>

        <View style={styles.divider} />

        {/* Dropoff Input */}
        <View style={styles.inputRow}>
          {dropOffLocation ? (
            <Image
              style={{ height: 20, width: 20 }}
              source={require("@/assets/icons/selectedAddress.svg")}
            />
          ) : (
            <Ionicons name="search-outline" size={20} color="#666" />
          )}
          <TextInput
            placeholder="Dropoff location"
            style={styles.input}
            value={dropOffText}
            onChangeText={(text: string) => {
              setCurrentInput("dropoff");
              setDropOffText(text);
              if (text === "" || text.length < dropOffText.length) {
                setDropOffLocation(""); // Clear state when text is cleared
                setSearchResults([]);
              } else {
                debouncedSearch(text);
              }
            }}
          />
        </View>
      </View>

      {/* Search Results List */}
      {searchResults.length > 0 && (
        <View style={styles.listWrapper}>
          <FlatList
            data={searchResults}
            keyExtractor={(item: any) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.locationItem}
                onPress={() => handleLocationSelect(item)}
              >
                <View style={styles.timeIconContainer}>
                  <Ionicons name="location-outline" size={22} color="#333" />
                </View>

                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationName} numberOfLines={1}>
                    {item?.structured_formatting?.main_text ||
                      item?.description}
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

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={getCurrentLocation}
        disabled={gettingLocation}
      >
        {gettingLocation ? (
          <ActivityIndicator
            size="small"
            color={colors.main}
            style={{ flex: 1 }}
          />
        ) : (
          <>
            <HugeiconsIcon
              icon={Gps01Icon}
              size={moderateScale(20)}
              color={colors.main}
            />
            <Text style={styles.actionButtonText}>Current location</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push("/(protected)/(book)/choose-time")}
      >
        <Ionicons
          name="location-outline"
          size={moderateScale(20)}
          color={colors.main}
        />
        <Text style={styles.actionButtonText}>Set location on map</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E5E5",
    paddingHorizontal: scale(10),
    paddingTop: verticalScale(20),
  },
  dropdown: {
    backgroundColor: "#BCC8FF",
    width: scale(135),
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(10),
    borderRadius: scale(8),
    marginBottom: verticalScale(15),
  },
  dropdownListContainer: {
    borderRadius: scale(8),
    marginTop: verticalScale(2),
    overflow: "hidden",
  },

  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(10),
    gap: scale(10),
  },
  itemText: {
    fontSize: moderateScale(13),
    color: "#333",
    fontWeight: "500",
  },
  inputCard: {
    backgroundColor: "white",
    borderRadius: scale(12),
    borderWidth: 2,
    borderColor: "#dad6ffc7",
    marginBottom: verticalScale(10),
    zIndex: 5,
  },
  input: { flex: 1, fontSize: moderateScale(14) },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(15),
    minHeight: verticalScale(50),
    gap: scale(10),
  },
  divider: {
    height: 1.5,
    backgroundColor: "#DAD6FF",
    marginHorizontal: scale(15),
  },
  listWrapper: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: scale(10),
    maxHeight: verticalScale(324),
  },
  locationItem: { flexDirection: "row", alignItems: "center", padding: 15 },
  timeIconContainer: { width: 40, alignItems: "center" },
  locationTextContainer: { flex: 1 },
  locationName: { fontSize: 15, fontWeight: "600", color: "#262626" },
  locationAddress: { fontSize: 13, color: "#666" },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#BCC8FF",
    height: verticalScale(48),
    borderRadius: verticalScale(12),
    paddingHorizontal: scale(15),
    gap: scale(12),
    marginBottom: scale(10),
  },
  actionButtonText: {
    color: "#1A1A11",
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
  pickupNowText: {
    color: colors.main,
    fontWeight: "600",
    fontSize: moderateScale(13),
  },
});
