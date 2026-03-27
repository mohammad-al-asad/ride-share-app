import AuthBackground from "@/components/AuthBackground";
import { colors } from "@/config/colors";
import {
  DriverTripHistoryItem,
  useGetDriverTripsQuery,
} from "@/redux/api/driverRIdeStart";
import {
  RiderTripHistoryItem,
  useGetRiderTripsQuery,
} from "@/redux/api/rideBookApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
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

type TripHistoryItem = DriverTripHistoryItem | RiderTripHistoryItem;

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  const payload = error as
    | {
        data?: {
          message?: string;
          error?: {
            message?: string;
          };
        };
      }
    | undefined;

  return (
    payload?.data?.error?.message ?? payload?.data?.message ?? fallbackMessage
  );
};

const formatTripDateTime = (value?: string) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatTripStatus = (status?: string) => {
  if (!status) {
    return "Unknown";
  }

  return status
    .split("_")
    .map((part) =>
      part.length > 0 ? part[0].toUpperCase() + part.slice(1).toLowerCase() : "",
    )
    .join(" ");
};

const formatTripFare = (currency?: string, amount?: number) => {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return "--";
  }

  if ((currency ?? "USD").toUpperCase() === "USD") {
    return `$${numeric.toFixed(2)}`;
  }

  return `${currency ?? ""} ${numeric.toFixed(2)}`.trim();
};

export default function ActivityScreen() {
  const [activeTab, setActiveTab] = useState("history");
  const user = useAppSelector((state: RootState) => state.auth.user);
  const isDriver = user?.role === "driver";

  const driverTripsQuery = useGetDriverTripsQuery(undefined, {
    skip: !isDriver,
    refetchOnMountOrArgChange: true,
  });
  const riderTripsQuery = useGetRiderTripsQuery(undefined, {
    skip: isDriver,
    refetchOnMountOrArgChange: true,
  });

  const tripHistory = useMemo<TripHistoryItem[]>(
    () =>
      isDriver
        ? driverTripsQuery.data?.data?.trips ?? []
        : riderTripsQuery.data?.data?.trips ?? [],
    [driverTripsQuery.data?.data?.trips, isDriver, riderTripsQuery.data?.data?.trips],
  );

  const isHistoryLoading = isDriver
    ? driverTripsQuery.isLoading || driverTripsQuery.isFetching
    : riderTripsQuery.isLoading || riderTripsQuery.isFetching;
  const historyError = isDriver ? driverTripsQuery.error : riderTripsQuery.error;
  const historyErrorMessage = historyError
    ? getApiErrorMessage(historyError, "Could not load trip history.")
    : null;

  const renderItem = ({ item }: { item: TripHistoryItem }) => {
    const locationText =
      item.destination?.trim() ||
      item.dropoff?.address?.trim() ||
      "Destination unavailable";
    const dateText = formatTripDateTime(item.createdAt);
    const fareValue = item.fare?.totalFare ?? item.fare?.finalFare;
    const priceText = formatTripFare(item.fare?.currency, fareValue);
    const statusText = formatTripStatus(item.status);

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/(protected)/ride-details",
            params: { tripId: item._id },
          })
        }
      >
        <View style={styles.cardContent}>
          <View style={styles.imageContainer}>
            <Image
              source={require("../../../assets/images/cars/car.png")}
              style={styles.carImage}
              contentFit="contain"
            />
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.locationText} numberOfLines={1}>
              {locationText}
            </Text>
            <Text style={styles.dateText}>{dateText}</Text>
            <Text style={styles.priceStatusText}>
              {priceText} | <Text style={styles.statusLabel}>{statusText}</Text>
            </Text>
          </View>

          <MaterialCommunityIcons name="chevron-right" size={24} color="#262626" />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <AuthBackground />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      <View style={styles.content}>
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

        {activeTab === "history" && (
          <View style={styles.historyContainer}>
            {isHistoryLoading && (
              <View style={styles.infoContainer}>
                <ActivityIndicator size="small" color={colors.main} />
                <Text style={styles.infoText}>Loading trip history...</Text>
              </View>
            )}

            {!isHistoryLoading && historyErrorMessage && (
              <View style={styles.infoContainer}>
                <Text style={styles.errorText}>{historyErrorMessage}</Text>
              </View>
            )}

            {!isHistoryLoading && !historyErrorMessage && tripHistory.length === 0 && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>No trips found yet.</Text>
              </View>
            )}

            {!isHistoryLoading && !historyErrorMessage && tripHistory.length > 0 && (
              <FlatList
                data={tripHistory}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.historyListContent}
              />
            )}
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
    backgroundColor: "#E5E7EB",
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
    backgroundColor: "#FFFFFF",
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
  historyContainer: {
    flex: 1,
    paddingBottom: verticalScale(100),
  },
  historyListContent: {
    paddingBottom: verticalScale(16),
  },
  infoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(24),
  },
  infoText: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(13),
    color: "#6B7280",
  },
  errorText: {
    fontSize: moderateScale(13),
    color: "#B91C1C",
    textAlign: "center",
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
