import { useGetRiderTripDriverProfileQuery } from "@/redux/api/rideBookApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DriverCard = () => {
  const matchedDriver = useAppSelector(
    (state: RootState) => state.rideBook.matchedDriver,
  );
  const matchedVehicle = useAppSelector(
    (state: RootState) => state.rideBook.matchedVehicle,
  );
  const activeTrip = useAppSelector(
    (state: RootState) => state.rideBook.activeTrip,
  );
  const tripId = activeTrip?._id ?? "";
  const { data: driverProfileResponse } = useGetRiderTripDriverProfileQuery(
    tripId,
    {
      skip: !tripId,
    },
  );

  const driverProfile = driverProfileResponse?.data?.driver;
  const vehicleProfile = driverProfileResponse?.data?.vehicle;

  const driverName =
    driverProfile?.name?.trim() ||
    matchedDriver?.name?.trim() ||
    "Driver assigned";
  const ratingValue = Number(
    driverProfile?.ratingAvg ?? matchedDriver?.ratingAvg,
  );
  const ratingText =
    Number.isFinite(ratingValue) && ratingValue > 0
      ? ratingValue.toFixed(1)
      : "N/A";
  const tripCountValue = Number(
    driverProfile?.tripsCount ?? matchedDriver?.tripsCount,
  );
  const tripCountText =
    Number.isFinite(tripCountValue) && tripCountValue >= 0
      ? `${tripCountValue} trips`
      : "Trips unavailable";

  const vehicleModel = useMemo(() => {
    const brandAndModel = [
      vehicleProfile?.brand ?? matchedVehicle?.brand,
      vehicleProfile?.model ?? matchedVehicle?.model,
    ]
      .filter(Boolean)
      .join(" ");

    if (brandAndModel) {
      return brandAndModel;
    }

    const rideOptionLabel = [
      activeTrip?.rideOption?.tier,
      activeTrip?.rideOption?.vehicleType,
    ]
      .filter(Boolean)
      .join(" ");
    return rideOptionLabel || "Vehicle details unavailable";
  }, [
    activeTrip?.rideOption?.tier,
    activeTrip?.rideOption?.vehicleType,
    matchedVehicle?.brand,
    matchedVehicle?.model,
    vehicleProfile?.brand,
    vehicleProfile?.model,
  ]);

  const licensePlate =
    vehicleProfile?.licensePlate?.trim() ||
    matchedVehicle?.licensePlate?.trim() ||
    "Plate unavailable";
  const driverAvatar = driverProfile?.profileImage
    ? { uri: driverProfile.profileImage }
    : matchedDriver?.profileImage
      ? { uri: matchedDriver.profileImage }
      : require("../assets/images/demo-profile.png");

  const ratingCountValue = Number(
    driverProfile?.ratingCount ?? matchedDriver?.ratingCount,
  );
  const ratingCountText =
    Number.isFinite(ratingCountValue) && ratingCountValue > 0
      ? `(${ratingCountValue})`
      : "";

  const vehicleTypeText =
    vehicleProfile?.type ??
    matchedVehicle?.type ??
    activeTrip?.rideOption?.vehicleType ??
    "";

  const vehicleSizeText =
    vehicleProfile?.size ??
    matchedVehicle?.size ??
    activeTrip?.rideOption?.size ??
    "";

  const vehicleMetaText = [vehicleTypeText, vehicleSizeText]
    .filter(Boolean)
    .join(" | ");

  const vehicleSubtitle = vehicleMetaText || tripCountText;

  return (
    <View style={styles.driverCard}>
      <View style={styles.driverHeader}>
        <Image source={driverAvatar} style={styles.driverAvatar} />
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{driverName}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.ratingText}>
              {ratingText} {ratingCountText}
            </Text>
          </View>
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.plateNumber}>{licensePlate}</Text>
          <Text style={styles.vehicleModel}>{vehicleModel}</Text>
          <Text style={styles.tripCount}>{vehicleSubtitle}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/(protected)/ride-details/chat-box")}
        >
          <Ionicons name="chatbox-ellipses-outline" size={20} color="#1A0088" />
          <Text style={styles.secondaryButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/(protected)/ride-details/profile")}
        >
          <Ionicons name="person-outline" size={20} color="#1A0088" />
          <Text style={styles.secondaryButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DriverCard;

const styles = StyleSheet.create({
  driverCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: "#C7D2FE",
    marginBottom: 15,
  },
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  driverAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: "700", color: "#333" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: { fontSize: 13, marginLeft: 4, color: "#666" },
  vehicleInfo: { alignItems: "flex-end" },
  plateNumber: { fontSize: 14, fontWeight: "700", color: "#333" },
  vehicleModel: { fontSize: 12, color: "#666" },
  tripCount: { fontSize: 12, color: "#999" },
  actionRow: { flexDirection: "row", gap: 10 },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C7D2FE",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  secondaryButtonText: { color: "#000", fontWeight: "600" },
});

