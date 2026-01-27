import { colors } from "@/config/colors";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const pickupOptions = [
  { label: "Pickup now", value: "now", icon: "time-outline" },
  { label: "Pickup later", value: "later", icon: "calendar-outline" },
];

export default function LocationSelectionScreen() {
  const [pickupType, setPickupType] = useState("now");

  const RECENT_LOCATIONS = [
    {
      id: "1",
      name: "Hazrat Shahjalal International Airport",
      address: "Airport - Dakshinkhan Rd, Dhaka",
      distance: "34.4 km",
    },
    {
      id: "2",
      name: "Hazrat Shahjalal International Airport",
      address: "Airport - Dakshinkhan Rd, Dhaka",
      distance: "34.4 km",
    },
  ];

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log(status);
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return;
    }

    const isEnabled = await Location.hasServicesEnabledAsync();
    console.log(isEnabled);

    if (!isEnabled) {
      alert("Please enable location services on your device.");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    console.log(location.coords); // { latitude, longitude }

    // Optionally reverse geocode to get an address
    let [address] = await Location.reverseGeocodeAsync(location.coords);
    console.log(address);
  };

  // Helper to render the dropdown item design
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
      {/* Responsive Pickup Timing Dropdown */}
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

      {/* Input Group */}
      <View style={styles.inputCard}>
        <View style={styles.inputRow}>
          <Ionicons
            name="search-outline"
            size={moderateScale(20)}
            color="#666"
          />
          <TextInput
            placeholder="Pickup Location"
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.inputRow}>
          <Ionicons
            name="search-outline"
            size={moderateScale(20)}
            color="#666"
          />
          <TextInput
            placeholder="Dropoff location"
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View
        style={{
          backgroundColor: "#F4F4F6",
          marginBottom: scale(10),
          borderRadius: 12,
        }}
      >
        <FlatList
          data={RECENT_LOCATIONS}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity style={styles.locationItem}>
              <View style={styles.timeIconContainer}>
                <Ionicons name="time-outline" size={24} color="#333" />
                <Text style={styles.distance}>{item.distance}</Text>
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.locationAddress} numberOfLines={1}>
                  {item.address}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={getCurrentLocation}
      >
        <Ionicons
          name="locate-outline"
          size={moderateScale(20)}
          color={colors.main}
        />
        <Text style={styles.actionButtonText}>Current location</Text>
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
    paddingHorizontal: scale(20),
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
  pickupNowText: {
    color: colors.main,
    fontWeight: "600",
    fontSize: moderateScale(13),
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
  },
  timeIconContainer: {
    width: 50,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  distance: {
    fontSize: 12,
    color: "#666",
  },
  locationAddress: {
    fontSize: 13,
    color: "#666",
  },

  inputCard: {
    backgroundColor: "white",
    borderRadius: scale(12),
    borderWidth: 2,
    borderColor: "#dad6ffc7",
    marginBottom: verticalScale(10),
    overflow: "hidden",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(15),
    height: verticalScale(45),
    gap: scale(10),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(14),
    color: "#333",
  },
  divider: {
    height: 3,
    width: "100%",
    backgroundColor: "#DAD6FF",
    marginHorizontal: scale(5),
  },
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
    color: "#1A1A1A",
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
});
