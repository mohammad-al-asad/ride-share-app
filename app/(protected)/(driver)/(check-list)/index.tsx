import AuthBackground from "@/components/AuthBackground";
import { colors } from "@/config/colors";
import { useGetDriverOnboardingStatusQuery } from "@/redux/api/onboardingApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { Home01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

type ChecklistItem = {
  id: string;
  title: string;
  route: string;
};

type StatusMeta = {
  label: string;
  color: string;
};

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "profile_photo",
    title: "Profile Picture",
    route: "/profile-picture",
  },
  {
    id: "driver_license_front",
    title: "Driver License",
    route: "/driver-license",
  },
  {
    id: "vehicle_registration",
    title: "Vehicle Registration",
    route: "/registration",
  },
  {
    id: "vehicle_insurance",
    title: "Vehicle Insurance Paper",
    route: "/insurance",
  },
  {
    id: "stripe",
    title: "Payment Information",
    route: "/payment",
  },
  {
    id: "vehicle",
    title: "Vehicle Information",
    route: "/vehicle-info",
  },
];

const STATUS_COLORS: Record<string, StatusMeta> = {
  missing: { label: "Missing", color: "#EF4444" },
  need_attention: { label: "Needs attention", color: "#EF4444" },
  in_review: { label: "In review", color: "#9CA3AF" },
  completed: { label: "Completed", color: "#10B981" },
  approved: { label: "Approved", color: "#10B981" },
  pending: { label: "Pending", color: "#9CA3AF" },
};

const toChecklistRoute = (route: string) =>
  `/(protected)/(driver)/(check-list)${route}`;

export default function OnboardingChecklist() {
  const router = useRouter();
  const driverName = useAppSelector((state: RootState) => state.auth.user?.name);
  const { data, isLoading, isFetching, error, refetch } =
    useGetDriverOnboardingStatusQuery();

  const statusById = React.useMemo(
    () =>
      (data?.data ?? []).reduce<Record<string, string | undefined>>(
        (acc, item) => {
          acc[item.key] = item.status;
          return acc;
        },
        {},
      ),
    [data?.data],
  );

  const getStatus = (id: string) => {
    const statusKey = statusById[id] ?? "pending";
    return STATUS_COLORS[statusKey]?.label ?? "Pending";
  };

  const getStatusColor = (id: string) => {
    const statusKey = statusById[id] ?? "pending";
    return STATUS_COLORS[statusKey]?.color ?? "#9CA3AF";
  };

  const apiError = error as
    | { data?: { error?: { message?: string }; message?: string } }
    | undefined;
  const errorMessage =
    apiError?.data?.error?.message ??
    apiError?.data?.message ??
    "Failed to load onboarding status.";

  return (
    <SafeAreaView style={styles.container}>
      <AuthBackground />
      <View style={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, {driverName ?? "Driver"}</Text>
          <Text style={styles.subText}>
            Please make sure to fill up all the data
          </Text>
          {isFetching && !isLoading && (
            <Text style={styles.refreshText}>Refreshing status...</Text>
          )}
        </View>

        <View style={styles.cardContainer}>
          {isLoading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="small" color={colors.main} />
              <Text style={styles.stateText}>Loading checklist...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            CHECKLIST_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.listItem,
                  index === CHECKLIST_ITEMS.length - 1 && styles.lastListItem,
                ]}
                onPress={() => router.push(toChecklistRoute(item.route) as any)}
              >
                <View>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text
                    style={[styles.itemStatus, { color: getStatusColor(item.id) }]}
                  >
                    {getStatus(item.id)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))
          )}
        </View>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("/(protected)/(tab)")}
        >
          <HugeiconsIcon icon={Home01Icon} size={20} color={colors.main} />
          <Text style={styles.homeButtonText}>Go to Home page</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          *Don&apos;t forget to add your contact information in Account Navigation
          {" -> "}Personal Info.
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
  refreshText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(12),
    color: colors.main,
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
  stateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(24),
    paddingHorizontal: scale(16),
  },
  stateText: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(13),
    color: "#6B7280",
    textAlign: "center",
  },
  errorText: {
    fontSize: moderateScale(13),
    color: "#DC2626",
    textAlign: "center",
  },
  retryButton: {
    marginTop: verticalScale(12),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    backgroundColor: "#EEF2FF",
  },
  retryText: {
    color: colors.main,
    fontSize: moderateScale(13),
    fontWeight: "600",
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
  lastListItem: {
    borderBottomWidth: 0,
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
    backgroundColor: "#A6AFFF",
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
