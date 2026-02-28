import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale } from "react-native-size-matters";

type Props = {
  onAccept: () => void;
};

const RequestCard = ({ onAccept }: Props) => {
  return (
    <View style={styles.requestCard}>
      <TouchableOpacity style={styles.closeButton}>
        <Ionicons name="close" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.serviceType}>PREMIUM VAN (COMPACT)</Text>
      <View style={styles.priceRow}>
        <Text style={styles.priceText}>$5.54</Text>
      </View>

      <View style={styles.ratingBadge}>
        <Ionicons name="person-circle" size={20} color="#CCC" />
        <View style={styles.starBadge}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>4.5</Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <Ionicons name="radio-button-on" size={20} color="#6366F1" />
          <View style={styles.locationInfo}>
            <Text style={styles.distanceText}>Pickup location 1.2 mi away</Text>
            <Text style={styles.addressText}>Brac University Building 5</Text>
          </View>
        </View>

        <View style={styles.dashLine} />

        <View style={styles.locationRow}>
          <Ionicons name="location" size={20} color="#6366F1" />
          <View style={styles.locationInfo}>
            <Text style={styles.distanceText}>
              Dropoff location 2.1 mi away
            </Text>
            <Text style={styles.addressText}>Gulshan 1 DNCC Market</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="alert-circle-outline" size={18} color="#10B981" />
        <Text style={styles.infoText}>You will get 60% of the total fare.</Text>
      </View>

      <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
        <Text style={styles.acceptButtonText}>Accept</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RequestCard;

const styles = StyleSheet.create({
  // Request Card Styles
  requestCard: {
    position: "absolute",
    bottom: scale(20),
    left: scale(15),
    right: scale(15),
    backgroundColor: "white",
    borderRadius: scale(20),
    padding: scale(20),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex:100
  },
  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    padding: 5,
  },
  serviceType: {
    fontSize: moderateScale(12),
    color: "#666",
    fontWeight: "600",
  },
  priceRow: {
    paddingVertical: 5,
  },
  priceText: { fontSize: moderateScale(32), fontWeight: "800", color: "#111" },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  starBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  ratingText: { fontWeight: "700", fontSize: 12 },

  locationContainer: {
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  locationRow: { flexDirection: "row", gap: 12 },
  locationInfo: { flex: 1 },
  distanceText: { fontSize: 11, color: "#9CA3AF" },
  addressText: { fontSize: 13, fontWeight: "700", color: "#374151" },
  dashLine: {
    height: 20,
    width: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#DDD",
    marginLeft: 10,
    marginVertical: 2,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  infoText: { color: "#10B981", fontSize: 13, fontWeight: "500" },
  acceptButton: {
    backgroundColor: "#1E0078",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  acceptButtonText: { color: "white", fontWeight: "700", fontSize: 18 },
});
