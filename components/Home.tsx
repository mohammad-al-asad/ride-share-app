import AuthBackground from "@/components/AuthBackground";
import { colors } from "@/config/colors";
import { useGetActiveRideQuery, useGetRiderTripsQuery } from "@/redux/api/rideBookApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

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

const formatStatus = (status?: string) => {
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

export default function HomeScreen() {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const authToken = useAppSelector((state: RootState) => state.auth.token);
  const latestRideRequest = useAppSelector(
    (state: RootState) => state.rideBook.latestRideRequest,
  );
  const activeTrip = useAppSelector((state: RootState) => state.rideBook.activeTrip);
  const userName = user?.name?.trim() || "User";
  const {
    refetch: refetchActiveRide,
  } = useGetActiveRideQuery(undefined, {
    skip: !user || !authToken,
    refetchOnMountOrArgChange: true,
  });
  const riderTripsQuery = useGetRiderTripsQuery(undefined, {
    skip: !user || !authToken || user.role === "driver",
    refetchOnMountOrArgChange: true,
  });

  useFocusEffect(
    useCallback(() => {
      if (user && authToken) {
        refetchActiveRide();
      }
    }, [user, authToken, refetchActiveRide]),
  );

  const recentTrips = useMemo(() => {
    const trips = riderTripsQuery.data?.data?.trips ?? [];

    return [...trips]
      .sort((a, b) => {
        const aTime = new Date(a.createdAt ?? "").getTime();
        const bTime = new Date(b.createdAt ?? "").getTime();
        return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
      })
      .slice(0, 5);
  }, [riderTripsQuery.data?.data?.trips]);

  const isRecentTripsLoading = riderTripsQuery.isLoading || riderTripsQuery.isFetching;
  const recentTripsErrorMessage = riderTripsQuery.error
    ? getApiErrorMessage(riderTripsQuery.error, "Could not load recent trips.")
    : null;

  const hasActiveRideRequest =
    Boolean(latestRideRequest) &&
    !["cancelled", "completed", "expired"].includes(
      String(latestRideRequest?.status ?? "").toLowerCase(),
    );
  const hasActiveRide = hasActiveRideRequest || Boolean(activeTrip);

  return (
    <View style={styles.mainContainer}>
      {/* Background Grid */}
      <AuthBackground />

      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/logo-blue.svg")}
            style={styles.smallLogo}
            contentFit="contain"
          />
          <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
        </View>

        {/* Search Bar Section */}
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchInputWrapper}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/(protected)/(book)",
                params: { pickupType: "now" },
              } as any)
            }
          >
            <Ionicons
              name="search-outline"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <Text style={styles.input}>Get a ride</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.laterButton}
            onPress={() =>
              router.push({
                pathname: "/(protected)/(book)",
                params: { pickupType: "later" },
              } as any)
            }
          >
            <Ionicons name="calendar-outline" size={18} color={colors.main} />
            <Text style={styles.laterText}>Later</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Locations */}
        <Text style={styles.sectionTitle}>Recent Trips</Text>

        {isRecentTripsLoading && (
          <View style={styles.infoContainer}>
            <ActivityIndicator size="small" color={colors.main} />
            <Text style={styles.infoText}>Loading recent trips...</Text>
          </View>
        )}

        {!isRecentTripsLoading && recentTripsErrorMessage && (
          <View style={styles.infoContainer}>
            <Text style={styles.errorText}>{recentTripsErrorMessage}</Text>
          </View>
        )}

        {!isRecentTripsLoading &&
          !recentTripsErrorMessage &&
          recentTrips.length === 0 && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>No recent trips found.</Text>
            </View>
          )}

        {!isRecentTripsLoading &&
          !recentTripsErrorMessage &&
          recentTrips.length > 0 && (
            <FlatList
              data={recentTrips}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.locationItem}
                  onPress={() =>
                    router.push({
                      pathname: "/(protected)/ride-details",
                      params: { tripId: item._id },
                    })
                  }
                >
                  <View style={styles.timeIconContainer}>
                    <Ionicons name="time-outline" size={20} color="#333" />
                  </View>
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.locationName} numberOfLines={1}>
                      {item.destination?.trim() ||
                        item.dropoff?.address?.trim() ||
                        "Destination unavailable"}
                    </Text>
                    <Text style={styles.locationAddress} numberOfLines={1}>
                      {`${formatTripDateTime(item.createdAt)} | ${formatStatus(item.status)}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
      </View>

      {hasActiveRide && (
        <TouchableOpacity
          style={styles.ridingShortcut}
          activeOpacity={0.85}
          onPress={() => router.push("/(protected)/(book)/ride-map" as any)}
        >
          <Text style={styles.ridingShortcutText}>Riding...</Text>
          <View style={styles.ridingShortcutIcon}>
            <Ionicons name="car-sport" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    gap: 12,
  },
  smallLogo: {
    width: 50,
    height: 50,
  },
  welcomeText: {
    fontSize: scale(20),
    fontWeight: "500",
    color: "#1A1A1A",
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F2F4",
    borderRadius: 12,
    alignItems: "center",
    paddingHorizontal: 15,
    height: 60,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 10,
  },
  laterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#BCC8FF", // Light blue button background
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  laterText: {
    color: "#240183",
    fontWeight: "600",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 15,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB", // Grey background for list items
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  timeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 13,
    color: "#666",
  },
  infoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(14),
  },
  infoText: {
    marginTop: verticalScale(8),
    fontSize: 13,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 13,
    color: "#B91C1C",
    textAlign: "center",
  },
  ridingShortcut: {
    position: "absolute",
    bottom: verticalScale(120),
    alignSelf: "center",
    backgroundColor: "#A5B4FC",
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  ridingShortcutText: {
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: "600",
  },
  ridingShortcutIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#312E81",
    alignItems: "center",
    justifyContent: "center",
  },
});
