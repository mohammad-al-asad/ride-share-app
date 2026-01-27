import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const { width, height } = Dimensions.get("window");

export default function ConfirmDetailsScreen() {
  return (
    <View style={styles.container}>
      {/* 1. Map Background Placeholder */}
      <View style={styles.mapContainer}>
        {/* In a real app, replace this View with <MapView /> */}
        <Image
          source={{ uri: "https://placeholder-map-uri.com" }}
          style={styles.mapBackground}
        />

        {/* Map Overlays */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.locationFab}>
          <MaterialIcons name="my-location" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* 2. Confirm Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />

        <Text style={styles.sheetTitle}>Confirm details</Text>

        {/* Vehicle Selection Card */}
        <View style={styles.vehicleCard}>
          <Image
            source={{ uri: "https://placeholder-van-uri.com" }}
            style={styles.vehicleImage}
            resizeMode="contain"
          />
          <View style={styles.vehicleInfo}>
            <View>
              <Text style={styles.vehicleCategory}>Premium</Text>
              <View style={styles.vehicleTypeRow}>
                <Text style={styles.vehicleName}>Van (Compact)</Text>
                <Ionicons
                  name="people"
                  size={16}
                  color="#888"
                  style={{ marginLeft: 8 }}
                />
                <Text style={styles.passengerCount}>8</Text>
              </View>
            </View>
            <Text style={styles.price}>$5.00</Text>
          </View>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>
            Choose Premium Van (Compact)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapContainer: {
    flex: 1,
  },
  mapBackground: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: verticalScale(50),
    left: scale(20),
    backgroundColor: "#fff",
    borderRadius: scale(25),
    padding: scale(10),
    elevation: 3,
  },
  locationFab: {
    position: "absolute",
    bottom: verticalScale(300), // Adjusted to sit above bottom sheet
    right: scale(20),
    backgroundColor: "#fff",
    borderRadius: scale(30),
    padding: scale(12),
    elevation: 3,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: width,
    backgroundColor: "#F7F8FA",
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(30),
    alignItems: "center",
  },
  dragHandle: {
    width: scale(40),
    height: verticalScale(4),
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
  },
  sheetTitle: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: verticalScale(20),
  },
  vehicleCard: {
    width: "100%",
    backgroundColor: "#F1F3FF", // Light blue tint
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: "#D0D7FF",
    padding: scale(15),
    marginBottom: verticalScale(20),
  },
  vehicleImage: {
    width: "100%",
    height: verticalScale(100),
    marginBottom: verticalScale(10),
  },
  vehicleInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  vehicleCategory: {
    fontSize: moderateScale(12),
    color: "#888",
  },
  vehicleTypeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleName: {
    fontSize: moderateScale(14),
    fontWeight: "bold",
    color: "#333",
  },
  passengerCount: {
    fontSize: moderateScale(14),
    color: "#888",
    marginLeft: scale(4),
  },
  price: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1A1A1A",
  },
  confirmButton: {
    backgroundColor: "#1E0078", // Deep purple from UI
    width: "100%",
    paddingVertical: verticalScale(16),
    borderRadius: scale(14),
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
});
