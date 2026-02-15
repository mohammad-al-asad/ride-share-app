import { colors } from "@/config/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DriverCard = () => {
  return (
    <View style={styles.driverCard}>
      <View style={styles.driverHeader}>
        <Image
          source={require("../assets/images/demo-profile.png")}
          style={styles.driverAvatar}
        />
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>David John</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.ratingText}>4.5</Text>
          </View>
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.plateNumber}>JBS 0144</Text>
          <Text style={styles.vehicleModel}>Toyota Sienna LE</Text>
          <Text style={styles.tripCount}>45 trips</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={()=>router.push("/ride-details/chat-box")}>
          <Ionicons name="chatbox-ellipses-outline" size={20} color="#1A0088" />
          <Text style={styles.secondaryButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={()=>router.push("/ride-details/profile")}>
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
