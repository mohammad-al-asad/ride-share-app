import AuthBackground from "@/components/AuthBackground";
import ReviewCard from "@/components/ReviewCard";
import { colors } from "@/config/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function RideDetailsScreen() {
  return (
    <View style={styles.container}>
      <AuthBackground />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color="#262626"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride details</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Driver Profile Section */}
        <View style={styles.profileRow}>
          <Image
            source={{ uri: "https://placeholder.com/driver" }}
            style={styles.avatar}
          />
          <View style={styles.driverInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.driverName}>David John</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>
                  (<Ionicons name="star" size={14} color="#FBBF24" /> 4.7)
                </Text>
              </View>
            </View>
            <Text style={styles.carModel}>Toyota Sienna LE</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Canceled</Text>
          </View>
        </View>

        {/* Fare and Rating Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
              }}
            >
              <MaterialCommunityIcons
                name="cash-multiple"
                size={20}
                color="#059669"
              />
              <Text style={styles.statValue}>$5.00</Text>
            </View>
            <Text style={styles.statLabel}>FARE</Text>
          </View>
          <View style={styles.statBox}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Ionicons name="star" size={20} color="#FBBF24" />
              <Text style={styles.statValue}>4.5</Text>
            </View>
            <Text style={styles.statLabel}>RATING</Text>
          </View>
        </View>

        {/* Journey Details Card */}
        <View style={styles.infoCard}>
          <DetailItem
            icon={
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.secondary}
              />
            }
            label="Date & Time"
            value="Mon, Jan 19, 2026 | 10:00 AM"
          />
          <DetailItem
            icon={<Ionicons name="radio-button-on" size={20} color="#6366F1" />}
            label="Pickup location"
            value="Brac University Building 5"
          />
          <DetailItem
            icon={<Ionicons name="location" size={20} color="#EF4444" />}
            label="Dropoff location"
            value="Gulshan 1 DNCC Market"
          />
          <DetailItem
            icon={
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={20}
                color={colors.secondary}
              />
            }
            label="Distance covered"
            value="1.3 mi"
          />
          <DetailItem
            icon={<Ionicons name="time-outline" size={20} color="#6366F1" />}
            label="Total time"
            value="24 min"
          />
        </View>

        {/* Rider Review Section */}
        <ReviewCard
          name="Tuval Mor"
          role="Rider"
          rating="5.0"
          comment="Great driver! Friendly, respectful, and easy to communicate with. Would be happy to have them again."
          avatar={require("@/assets/images/demo-profile.png")}
        />

        {/* Help Section */}
        <Text style={styles.sectionHeader}>Help</Text>
        <Pressable
          style={styles.helpButton}
          onPress={() => router.push("/(protected)/(account)/support")}
        >
          <MaterialCommunityIcons name="headset" size={22} color="#1A1A1A" />
          <Text style={styles.helpButtonText}>Customer Support</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// Sub-component for individual journey rows
const DetailItem = ({ icon, label, value }: any) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIconContainer}>{icon}</View>
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
  backBtn: {
    width: 40,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    height: 40,
    borderRadius: "100%",
    backgroundColor: "#F4F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: scale(15),
    paddingTop: scale(45),
    paddingBottom: scale(15),
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  headerTitle: {
    flex: 1,
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    marginRight: scale(36),
  },
  scrollContent: {
    padding: scale(20),
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  avatar: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: "#E5E7EB",
  },
  driverInfo: {
    flex: 1,
    marginLeft: scale(12),
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverName: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: scale(8),
  },
  ratingText: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginLeft: scale(2),
  },
  carModel: {
    fontSize: moderateScale(13),
    color: "#6B7280",
    marginTop: verticalScale(2),
  },
  statusBadge: {
    backgroundColor: "#DC2626",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: scale(15),
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: moderateScale(11),
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(20),
  },
  statBox: {
    backgroundColor: "#FFFFFF",
    width: "48%",
    padding: scale(10),
    borderRadius: scale(4),
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "#1A1A1A",
    marginVertical: verticalScale(4),
  },
  statLabel: {
    fontSize: moderateScale(10),
    color: "#9CA3AF",
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(16),
    padding: scale(15),
    marginBottom: verticalScale(20),
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: verticalScale(15),
  },
  detailIconContainer: {
    width: scale(30),
    alignItems: "center",
  },
  detailTextContainer: {
    marginLeft: scale(10),
  },
  detailLabel: {
    fontSize: moderateScale(11),
    color: "#9CA3AF",
  },
  detailValue: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: verticalScale(2),
  },

  sectionHeader: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    marginBottom: verticalScale(10),
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: scale(15),
    borderRadius: scale(12),
    marginBottom: verticalScale(30),
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  helpButtonText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    marginLeft: scale(12),
  },
});
