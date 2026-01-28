import AuthBackground from "@/components/AuthBackground";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function ProfileScreen() {
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  return (
    <View style={styles.container}>
      <AuthBackground />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Ionicons
                name="person-outline"
                size={scale(40)}
                color="#6B7280"
              />
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={scale(14)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>John Smith</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.ratingText}>4.7</Text>
            </View>
          </View>
        </View>

        {/* Settings Group */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.card}>
          <SettingItem icon="person-outline" label="Personal Info" />
          <View style={styles.divider} />
          <SettingItem icon="lock-closed-outline" label="Change Password" />
          <View style={styles.divider} />
          <SettingItem icon="checkmark-circle-outline" label="Linked account" />
        </View>

        {/* Ratings Group */}
        <Text style={styles.sectionTitle}>My Ratings & Reviews</Text>
        <View style={styles.card}>
          <SettingItem
            icon="star-outline"
            label="Feedback"
            onPress={() => {
              router.push("/(protected)/(tab)/account/feedback");
            }}
          />
        </View>

        {/* Support Group */}
        <Text style={styles.sectionTitle}>Support & Policies</Text>
        <View style={styles.card}>
          <SettingItem icon="headset-outline" label="Customer Support" />
          <View style={styles.divider} />
          <SettingItem
            icon="document-text-outline"
            label="Terms & Conditions"
          />
          <View style={styles.divider} />
          <SettingItem
            icon="shield-checkmark-outline"
            label="Privacy & Policy"
          />
        </View>

        {/* Account Actions Group */}
        <View style={[styles.card, { marginTop: verticalScale(20) }]}>
          <SettingItem icon="log-out-outline" label="Logout" />
          <View style={styles.divider} />
          <SettingItem
            icon="trash-outline"
            label="Delete Account"
            labelStyle={{ color: "#EF4444" }}
            iconColor="#EF4444"
            onPress={() => setDeleteConfirmation(true)}
          />
        </View>
      </ScrollView>
      <ConfirmationModal
        onClose={() => setDeleteConfirmation(false)}
        onConfirm={() => setDeleteConfirmation(false)}
        visible={deleteConfirmation}
        title="Are you sure you want to delete?"
        message="This action is permanent, and you will lose all your data and history. If you proceed, you won’t be able to recover your account."
      />
    </View>
  );
}

// Sub-component for individual setting rows
const SettingItem = ({
  icon,
  label,
  labelStyle,
  iconColor = "#1A1A1A",
  onPress,
}: any) => {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={22} color={iconColor} />
        <Text style={[styles.settingLabel, labelStyle]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(120),
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: verticalScale(5),
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: verticalScale(12),
  },
  avatarCircle: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#A6AFFF",
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F8F9FF",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: scale(8),
  },
  ratingText: {
    fontSize: moderateScale(14),
    color: "#6B7280",
    marginLeft: scale(2),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: verticalScale(10),
    marginTop: verticalScale(15),
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: scale(16),
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#374151",
    marginLeft: scale(12),
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: scale(16),
  },
});
