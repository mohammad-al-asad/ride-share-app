import AuthBackground from "@/components/AuthBackground";
import { colors } from "@/config/colors";
import { Ionicons } from "@expo/vector-icons";
import { Home01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const CHECKLIST_ITEMS = [
  {
    id: "1",
    title: "Profile Picture",
    status: "In review",
    statusColor: "#9CA3AF",
    route: "/profile-picture",
  },
  {
    id: "2",
    title: "Driver License",
    status: "In review",
    statusColor: "#9CA3AF",
    route: "/driver-license",
  },
  {
    id: "3",
    title: "Vehicle Registration",
    status: "Needs attention",
    statusColor: "#EF4444",
    route: "/registration",
  },
  {
    id: "4",
    title: "Vehicle Insurance Paper",
    status: "In review",
    statusColor: "#9CA3AF",
    route: "/insurance",
  },
  {
    id: "5",
    title: "Payment Information",
    status: "Completed",
    statusColor: "#10B981",
    route: "/payment",
  },
  {
    id: "6",
    title: "Vehicle Information",
    status: "Completed",
    statusColor: "#10B981",
    route: "/vehicle-info",
  },
];

export default function OnboardingChecklist() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <AuthBackground />
      <View style={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, David</Text>
          <Text style={styles.subText}>
            Please make sure to fill up all the data
          </Text>
        </View>

        <View style={styles.cardContainer}>
          {CHECKLIST_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.listItem,
                index === CHECKLIST_ITEMS.length - 1 && {
                  borderBottomWidth: 0,
                },
              ]}
              onPress={() => router.push(item.route as any)}
            >
              <View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={[styles.itemStatus, { color: item.statusColor }]}>
                  {item.status}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Home Page Navigation */}
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("/(protected)/(tab)")}
        >
          <HugeiconsIcon icon={Home01Icon} size={20} color={colors.main} />
          <Text style={styles.homeButtonText}>Go to Home page</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          *Don&apos;t forget to add your contact information in Account
          Navigation → Personal Info.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(40),
  },
  header: {
    marginBottom: verticalScale(20),
  },
  welcomeText: {
    fontSize: moderateScale(24),
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  subText: {
    fontSize: moderateScale(14),
    color: "#4B5563",
    marginTop: verticalScale(4),
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(16),
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: verticalScale(20),
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemTitle: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#1A1A1A",
  },
  itemStatus: {
    fontSize: moderateScale(12),
    marginTop: verticalScale(2),
  },
  homeButton: {
    backgroundColor: "#A6AFFF", // Light purple button
    height: moderateScale(50),
    borderRadius: scale(12),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(30),
  },
  homeButtonText: {
    marginLeft: scale(8),
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: colors.main,
  },
  footerNote: {
    fontSize: moderateScale(12),
    color: "#4B5563",
    textAlign: "left",
    lineHeight: moderateScale(18),
  },
});
