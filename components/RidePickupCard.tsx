import { colors } from "@/config/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import ConfirmationModal from "./ConfirmationModal";
import VerifyRiderModal from "./VerifyRiderModal";

const RiderPickupCard = () => {
  const [isModal, setIsModal] = useState(false);
  const [isCancelModal, setIsCancelModal] = useState(false);
  return (
    <View style={styles.container}>
      <ConfirmationModal
        visible={isCancelModal}
        onClose={() => setIsCancelModal(false)}
        onConfirm={() => setIsCancelModal(false)}
        title="Are you sure you want to Cancel the ride?"
        message="Once canceled, you won't be able to recover this ride. Please confirm your action."
        confirmLabel="Yes"
        cancelLabel="No"
      />
      <VerifyRiderModal
        isVisible={isModal}
        onClose={() => setIsModal(false)}
        onVerify={() => setIsModal(false)}
      />
      {/* Top Distance Indicator */}
      <View style={styles.headerInfo}>
        <View style={styles.distanceRow}>
          <View style={styles.personIconCircle}>
            <Ionicons name="person" size={scale(16)} color="#6366F1" />
          </View>
          <Text style={styles.distanceText}>1.2 mi</Text>
        </View>
        <Text style={styles.subtext}>Picking up Tuval</Text>
      </View>

      <View style={styles.actionRow}>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>0:00</Text>
        </View>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setIsCancelModal(true)}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      {/* Main Card */}
      <View style={styles.card}>
        <View style={styles.topSection}>
          <View style={styles.riderInfo}>
            <Image
              source={require("../assets/images/demo-profile.png")}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.riderName}>Tuval Mor</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={scale(14)} color="#FFD700" />
                <Text style={styles.ratingText}>4.5</Text>
              </View>
            </View>
          </View>

          {/* Start Button */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => {
              setIsModal(true);
            }}
          >
            <Ionicons
              name="shield-checkmark"
              size={scale(20)}
              color="#FFD700"
            />
            <Text style={styles.startText}>Start</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(protected)/ride-details/chat-box")}
          >
            <MaterialCommunityIcons
              name="message-text-outline"
              size={scale(18)}
              color="#333"
            />
            <Text style={styles.buttonText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(protected)/ride-details/profile")}
          >
            <Ionicons name="person-outline" size={scale(18)} color="#333" />
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  headerInfo: {
    alignItems: "center",
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  personIconCircle: {
    backgroundColor: "#E0E7FF",
    padding: scale(4),
    borderRadius: 100,
  },
  distanceText: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    color: "#333",
  },
  subtext: {
    fontSize: moderateScale(14),
    color: "#666",
    marginTop: verticalScale(2),
  },
  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: scale(15),
    borderWidth: 1,
    borderColor: "#6366F1",
    padding: scale(15),
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(15),
  },
  riderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  avatar: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    borderWidth: 2,
    borderColor: "#6366F1",
  },
  riderName: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#1F2937",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  ratingText: {
    fontSize: moderateScale(14),
    color: "#4B5563",
  },
  startButton: {
    backgroundColor: colors.main,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    borderRadius: scale(15),
    gap: scale(8),
  },

  startText: {
    color: "#FFD700",
    fontWeight: "700",
    fontSize: moderateScale(16),
  },
  buttonRow: {
    flexDirection: "row",
    gap: scale(12),
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#C7D2FE",
    paddingVertical: verticalScale(12),
    borderRadius: scale(15),
    justifyContent: "center",
    alignItems: "center",
    gap: scale(8),
  },
  buttonText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1F2937",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: verticalScale(20),
    marginBottom: verticalScale(25),
    position: "relative",
    width: "100%",
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  timerBadge: {
    height: scale(30),
    position: "absolute",
    backgroundColor: "#A5B4FC",
    paddingHorizontal: scale(15),
    paddingVertical: scale(5),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: colors.main,
    left: 0,
  },
  timerText: {
    color: colors.main,
    fontWeight: "600",
  },
  cancelButton: {
    position: "absolute",
    backgroundColor: "#B91C1C",
    paddingHorizontal: scale(15),
    paddingVertical: scale(8),
    borderRadius: scale(8),
    right: 0,
  },
  cancelText: { color: "white", fontWeight: "600" },
});

export default RiderPickupCard;
