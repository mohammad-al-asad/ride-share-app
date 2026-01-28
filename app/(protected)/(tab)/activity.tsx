import AuthBackground from "@/components/AuthBackground";
import FeedbackModal from "@/components/FeedbackModal"; // Assuming this is where you saved the modal
import { colors } from "@/config/colors";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

// Mock data based on your UI
const RIDE_HISTORY = [
  {
    id: "1",
    location: "Gulshan 1 DNCC Market",
    date: "Jan 18 • 6:53 AM",
    price: "$5.00",
    status: "Canceled",
    image: require("../../../assets/images/cars/car.png"),
  },
  {
    id: "2",
    location: "Gulshan 1 DNCC Market",
    date: "Jan 18 • 6:53 AM",
    price: "$5.00",
    status: "Completed",
    image: require("../../../assets/images/cars/car.png"),
  },
  {
    id: "3",
    location: "Gulshan 1 DNCC Market",
    date: "Jan 18 • 6:53 AM",
    price: "$0.00",
    status: "Canceled",
    image: require("../../../assets/images/cars/car.png"),
  },
];

export default function RideHistoryScreen() {


  // Handles the logic for showing success/failed modals
  const handleRebook = (status: string) => {

  };

  const renderItem = ({ item }: { item: (typeof RIDE_HISTORY)[0] }) => (
    <Pressable
      style={styles.card}
      onPress={() => {
        console.log("pressed");

        router.push("/(protected)/ride-details");
      }}
    >
      <View style={styles.cardContent}>
        {/* Ride Image */}
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.carImage}
            resizeMode="contain"
          />
        </View>

        {/* Ride Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location}
          </Text>
          <Text style={styles.dateText}>{item.date}</Text>
          <Text style={styles.priceStatusText}>
            {item.price} • <Text style={styles.statusLabel}>{item.status}</Text>
          </Text>
        </View>

        {/* Rebook Button */}
        <TouchableOpacity
          style={styles.rebookButton}
          onPress={() => handleRebook(item.status)}
        >
          <Text style={styles.rebookText}>Rebook</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <AuthBackground />

      {/* Header taken from your requested code */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      <FlatList
        data={RIDE_HISTORY}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
  headerContainer: {
    backgroundColor: colors.white,
    padding: scale(15),
    paddingTop: scale(45),
    marginBottom: scale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: scale(15),
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    padding: scale(12),
    marginBottom: verticalScale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: moderateScale(60),
    height: scale(40),
    justifyContent: "center",
    alignItems: "center",
  },
  carImage: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    flex: 1,
    marginLeft: scale(12),
  },
  locationText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1A1A1A",
  },
  dateText: {
    fontSize: moderateScale(12),
    color: "#888",
    marginVertical: verticalScale(2),
  },
  priceStatusText: {
    fontSize: moderateScale(12),
    color: "#888",
  },
  statusLabel: {
    fontWeight: "500",
  },
  rebookButton: {
    backgroundColor: "#B4C0FF", // Matching the light blue/purple from UI
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(6),
    borderRadius: scale(8),
  },
  rebookText: {
    color: colors.main, // Deep purple brand color
    fontSize: moderateScale(12),
    fontWeight: "600",
  },
});
