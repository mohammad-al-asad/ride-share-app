import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const TripDetails = () => {
  const latestRideRequest = useAppSelector(
    (state: RootState) => state.rideBook.latestRideRequest,
  );
  const activeTrip = useAppSelector(
    (state: RootState) => state.rideBook.activeTrip,
  );
  const otpCode = activeTrip?.otp?.hash?.trim() ?? "";

  const dropoffAddress =
    activeTrip?.dropoff?.address ||
    latestRideRequest?.dropoff?.address ||
    "Dropoff not set";

  const rideStatusText = useMemo(() => {
    const status = (
      activeTrip?.status ??
      latestRideRequest?.status ??
      ""
    ).toLowerCase();
    if (status === "started") {
      return "Heading to dropoff location";
    }
    if (status === "completed") {
      return "Ride completed";
    }
    return "Meet at the pickup location";
  }, [activeTrip?.status, latestRideRequest?.status]);

  const priceText = useMemo(() => {
    const fareValue =
      activeTrip?.pricing?.finalFare ??
      activeTrip?.pricing?.estimatedFare ??
      latestRideRequest?.quote?.estimatedFare;
    const currency =
      activeTrip?.pricing?.currency ??
      latestRideRequest?.quote?.currency ??
      "USD";
    const numericFare = Number(fareValue);

    if (!Number.isFinite(numericFare)) {
      return "--";
    }

    if (currency.toUpperCase() === "USD") {
      return `$${numericFare.toFixed(2)}`;
    }

    return `${currency} ${numericFare.toFixed(2)}`;
  }, [
    activeTrip?.pricing?.currency,
    activeTrip?.pricing?.estimatedFare,
    activeTrip?.pricing?.finalFare,
    latestRideRequest?.quote?.currency,
    latestRideRequest?.quote?.estimatedFare,
  ]);

  return (
    <View style={styles.detailsCard}>
      <View style={styles.detailItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="location-outline" size={25} color="#7B61FF" />
        </View>
        <View style={styles.detailTextContainer}>
          <Text style={styles.detailLabel}>Dropoff location</Text>
          <Text style={styles.detailValue}>{dropoffAddress}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/(protected)/(book)/edit-map")}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={22}
            color="#1A0088"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.detailItem}>
        <View style={styles.iconContainer}>
          <Image
            style={{ height: 22, width: 22 }}
            source={require("@/assets/icons/selectedAddress.svg")}
          />
        </View>
        <View style={styles.detailTextContainer}>
          <Text style={styles.detailLabel}>Ride details</Text>
          <Text style={styles.detailValue}>{rideStatusText}</Text>
        </View>
      </View>

      <View style={styles.detailItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="cash-outline" size={25} color="#7B61FF" />
        </View>
        <View style={styles.detailTextContainer}>
          <Text style={styles.detailLabel}>Estimated Price</Text>
          <Text style={styles.detailValue}>{priceText}</Text>
        </View>
      </View>
      <View style={[styles.detailItem, styles.otpItem]}>
        <View style={[styles.iconContainer]}>
          <Ionicons name="shield-checkmark-outline" size={25} color="#6366F1" />
        </View>
        <View style={styles.detailTextContainer}>
          <Text style={styles.detailLabel}>Share this OTP with driver</Text>
          <Text style={styles.otpText}>{otpCode || "--"}</Text>
        </View>
      </View>
    </View>
  );
};

export default TripDetails;

const styles = StyleSheet.create({
  detailsCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E8EAF6",
    marginBottom: 20,
  },
  detailItem: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailTextContainer: { flex: 1 },
  detailLabel: { fontSize: 12, color: "#999" },
  editButton: { padding: 8, backgroundColor: "#C7D2FE", borderRadius: 8 },
  detailValue: { fontSize: 14, fontWeight: "600", color: "#333" },
  otpItem: {
    marginBottom: 0,
  },
  otpIconContainer: {
    backgroundColor: "#EEF2FF",
  },
  otpText: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: 1,
  },
});
