import AuthBackground from "@/components/AuthBackground";
import { colors } from "@/config/colors";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const NOTIFICATIONS = [
  {
    id: "1",
    message: "Your Driver's License needs attention now",
    time: "13 hours ago",
  },
  {
    id: "2",
    message: "Your Driver's License needs attention now",
    time: "13 hours ago",
  },
  {
    id: "3",
    message: "Your Driver's License needs attention now",
    time: "13 hours ago",
  },
  {
    id: "4",
    message: "Your Driver's License needs attention now",
    time: "13 hours ago",
  },
  {
    id: "5",
    message: "Your Driver's License needs attention now",
    time: "13 hours ago",
  },
];

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

export default function ActivityScreen() {
  const [activeTab, setActiveTab] = useState("history");
  const user = useAppSelector((state: RootState) => state.auth.user);
  const isDriver = user?.role === "driver";
  const handleRebook = (status: string) => {};

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
            contentFit="contain"
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

        {isDriver ? (
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#262626"
          />
        ) : (
          <TouchableOpacity
            style={styles.rebookButton}
            onPress={() => handleRebook(item.status)}
          >
            <Text style={styles.rebookText}>Rebook</Text>
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <AuthBackground />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      <View style={styles.content}>
        {/* Toggle Header */}
        {isDriver && (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "notifications" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("notifications")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "notifications" && styles.activeTabText,
                ]}
              >
                Notifications
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "history" && styles.activeTab]}
              onPress={() => setActiveTab("history")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "history" && styles.activeTabText,
                ]}
              >
                Trip History
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications List */}
        {activeTab === "notifications" && (
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardContainer}>
              {NOTIFICATIONS.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.notificationItem,
                    index === NOTIFICATIONS.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                >
                  <Text style={styles.messageText}>{item.message}</Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Notifications List */}
        {activeTab === "history" && (
          <View>
            <FlatList
              data={RIDE_HISTORY}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB", // Grey background for the toggle
    borderRadius: scale(12),
    padding: scale(4),
    height: verticalScale(55),
    marginBottom: verticalScale(20),
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: scale(10),
  },
  activeTab: {
    backgroundColor: "#FFFFFF", // White background for active tab
  },
  tabText: {
    fontSize: moderateScale(14),
    color: "#4B5563",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#1A1A1A",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: verticalScale(20),
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(18),
    paddingHorizontal: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  messageText: {
    fontSize: moderateScale(13),
    color: "#262626",
    flex: 0.75,
    lineHeight: moderateScale(18),
  },
  timeText: {
    fontSize: moderateScale(11),
    color: "#4D4D4D",
    flex: 0.25,
    textAlign: "right",
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
  headerContainer: {
    backgroundColor: colors.white,
    padding: scale(15),
    paddingTop: scale(45),
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
});
