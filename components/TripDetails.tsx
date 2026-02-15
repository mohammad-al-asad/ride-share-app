import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const TripDetails = () => {
  return (
    <View style={styles.detailsCard}>
      <View style={styles.detailItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="location-outline" size={25} color="#7B61FF" />
        </View>
        <View style={styles.detailTextContainer}>
          <Text style={styles.detailLabel}>Dropoff location</Text>
          <Text style={styles.detailValue}>Gulshan 1 DNCC Market</Text>
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
          <Text style={styles.detailValue}>Meet at the pickup location</Text>
        </View>
      </View>

      <View style={styles.detailItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="cash-outline" size={25} color="#7B61FF" />
        </View>
        <View style={styles.detailTextContainer}>
          <Text style={styles.detailLabel}>Estimated Price</Text>
          <Text style={styles.detailValue}>$5.00</Text>
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
});
