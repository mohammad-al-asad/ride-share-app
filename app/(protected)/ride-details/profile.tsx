import ReviewCard from "@/components/ReviewCard";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageBackground } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function DriverProfileScreen() {
  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerNav}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Driver Profile</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topProfileSection}>
          {/* Dark Blue Grid Header Area */}
          <ImageBackground
            style={styles.darkHeaderBg}
            source={require("@/assets/images/grid-blue-bg.svg")}
          ></ImageBackground>
          {/* Driver Avatar & Name */}
          <View style={styles.driverInfoContainer}>
            <Image
              source={require("@/assets/images/demo-profile.png")}
              style={styles.mainAvatar}
            />
            <Text style={styles.driverName}>David John</Text>
          </View>
        </View>

        <View style={styles.contentPadding}>
          {/* Driver Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statLabel}>TRIPS</Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.ratingBoxHeader}>
                <Ionicons name="star" size={14} color="#FBBF24" />
                <Text style={styles.statValue}>4.7</Text>
              </View>
              <Text style={styles.statLabel}>RATING</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>YEARS</Text>
            </View>
          </View>

          {/* Vehicle Details */}
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <View style={styles.vehicleCard}>
            <Image
              source={require("@/assets/images/cars/car.png")}
              style={styles.vehicleImage}
              contentFit="contain"
            />
            <View style={styles.vehicleTextContainer}>
              <Text style={styles.plateNumber}>JBS 0144</Text>
              <Text style={styles.modelName}>Toyota Sienna LE</Text>
            </View>
          </View>

          {/* Reviews Section */}
          <Text style={styles.sectionTitle}>Reviews</Text>
          <ReviewCard
            name="Tuval Mor"
            role="Rider"
            rating="5.0"
            comment="Great driver! Friendly, respectful, and easy to communicate with. Would be happy to have them again."
            avatar={require("@/assets/images/demo-profile.png")}
          />
          <ReviewCard
            name="Jade Smith"
            role="Rider"
            rating="4.5"
            comment="Great driver! Friendly, respectful, and easy to communicate with. Would be happy to have them again."
            avatar={require("@/assets/images/demo-profile.png")}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FF" },
  topProfileSection: {
    height: verticalScale(100),
    marginBottom: verticalScale(60),
  },
  darkHeaderBg: {
    height: moderateScale(120),
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    padding: scale(10),
    paddingTop: scale(45),
},
backButton: {
    backgroundColor: "#FFFFFF",
    width: scale(32),
    height: scale(32),
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
},
  navTitle: {
    flex: 1,
    textAlign: "center",
    color: "#000",
    fontSize: moderateScale(18),
    fontWeight: "600",
    marginRight: scale(32),
  },
  driverInfoContainer: {
    position: "absolute",
    bottom: -100,
    left: scale(20),
    alignItems: "flex-start",
  },
  mainAvatar: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    borderWidth: 4,
    borderColor: "#FFFFFF",
    marginBottom: verticalScale(5),
  },
  driverName: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#1A1A1A",
    marginLeft: scale(5),
  },
  contentPadding: { padding: scale(20) },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(25),
    marginTop: verticalScale(10),
  },
  statBox: {
    backgroundColor: "#FFFFFF",
    width: "31%",
    paddingVertical: verticalScale(12),
    borderRadius: scale(8),
    alignItems: "center",
    elevation: 1,
  },
  ratingBoxHeader: { flexDirection: "row", alignItems: "center" },
  statValue: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "#1A1A1A",
    marginLeft: 4,
  },
  statLabel: {
    fontSize: moderateScale(10),
    color: "#9CA3AF",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: verticalScale(12),
  },
  vehicleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(16),
    padding: scale(16),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(25),
    elevation: 1,
  },
  vehicleImage: { width: scale(140), height: verticalScale(80) },
  vehicleTextContainer: { flex: 1, alignItems: "flex-end" },
  plateNumber: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  modelName: { fontSize: moderateScale(12), color: "#6B7280" },
});
