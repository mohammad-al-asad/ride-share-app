import AuthBackground from "@/components/AuthBackground";
import ReviewCard from "@/components/ReviewCard";
import { colors } from "@/config/colors";
import {
  useGetDriverTripSummaryQuery,
} from "@/redux/api/driverRIdeStart";
import { useGetRiderTripDetailsQuery } from "@/redux/api/rideBookApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

type TripPerson = {
  name?: string;
  profileImage?: string | null;
  ratingAvg?: number;
  ratingCount?: number;
};

type TripVehicle = {
  brand?: string;
  model?: string;
  type?: string;
  size?: string;
  licensePlate?: string;
};

type TripDetails = {
  _id?: string;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  pickup?: {
    address?: string;
  };
  dropoff?: {
    address?: string;
  };
  distanceMiles?: number;
  durationMinutes?: number;
  fare?: {
    currency?: string;
    estimatedFare?: number;
    finalFare?: number;
    totalFare?: number;
  };
  pricing?: {
    currency?: string;
    finalFare?: number;
  };
  driver?: TripPerson;
  rider?: TripPerson;
  vehicle?: TripVehicle;
  vehicleId?: TripVehicle | string;
  reviewGiven?: {
    stars?: number;
    comment?: string;
    createdAt?: string;
  } | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

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

const formatDateTime = (value?: string) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDuration = (value?: number) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "--";
  }
  return `${Math.max(1, Math.round(numeric))} min`;
};

const formatDistance = (value?: number) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "--";
  }
  return `${numeric.toFixed(1)} mi`;
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

const formatFare = (currency?: string, amount?: number) => {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return "--";
  }

  if ((currency ?? "USD").toUpperCase() === "USD") {
    return `$${numeric.toFixed(2)}`;
  }

  return `${currency ?? ""} ${numeric.toFixed(2)}`.trim();
};

export default function RideDetailsScreen() {
  const params = useLocalSearchParams<{ tripId?: string | string[] }>();
  const tripIdFromParams = Array.isArray(params.tripId)
    ? params.tripId[0]
    : params.tripId;

  const user = useAppSelector((state: RootState) => state.auth.user);
  const isDriver = user?.role === "driver";
  const driverFallbackTripId = useAppSelector((state: RootState) => {
    return (
      state.driverRideStart.lastCompletedTrip?._id ??
      state.driverRideStart.activeTrip?._id ??
      ""
    );
  });
  const riderFallbackTripId = useAppSelector(
    (state: RootState) => state.rideBook.activeTrip?._id ?? "",
  );

  const tripId =
    tripIdFromParams ?? (isDriver ? driverFallbackTripId : riderFallbackTripId);

  const driverTripSummaryQuery = useGetDriverTripSummaryQuery(tripId, {
    skip: !isDriver || !tripId,
    refetchOnMountOrArgChange: true,
  });
  const riderTripDetailsQuery = useGetRiderTripDetailsQuery(tripId, {
    skip: isDriver || !tripId,
    refetchOnMountOrArgChange: true,
  });

  const isLoading = isDriver
    ? driverTripSummaryQuery.isLoading || driverTripSummaryQuery.isFetching
    : riderTripDetailsQuery.isLoading || riderTripDetailsQuery.isFetching;
  const detailsError = isDriver
    ? driverTripSummaryQuery.error
    : riderTripDetailsQuery.error;
  const errorMessage = detailsError
    ? getApiErrorMessage(detailsError, "Could not load trip details.")
    : null;

  const trip = useMemo<TripDetails | null>(() => {
    if (isDriver) {
      const payload = driverTripSummaryQuery.data?.data;
      if (!payload) {
        return null;
      }

      if (
        isRecord(payload) &&
        "trip" in payload &&
        isRecord((payload as { trip?: unknown }).trip)
      ) {
        return (payload as { trip: TripDetails }).trip;
      }

      return payload as TripDetails;
    }

    return (riderTripDetailsQuery.data?.data as TripDetails | undefined) ?? null;
  }, [driverTripSummaryQuery.data?.data, isDriver, riderTripDetailsQuery.data?.data]);

  const counterparty = useMemo<TripPerson | null>(() => {
    if (!trip) {
      return null;
    }
    return isDriver ? trip.rider ?? null : trip.driver ?? null;
  }, [isDriver, trip]);

  const vehicle = useMemo<TripVehicle | null>(() => {
    if (!trip) {
      return null;
    }

    if (isRecord(trip.vehicle)) {
      return trip.vehicle as TripVehicle;
    }

    if (isRecord(trip.vehicleId)) {
      return trip.vehicleId as TripVehicle;
    }

    return null;
  }, [trip]);

  const counterpartName = counterparty?.name?.trim() || (isDriver ? "Rider" : "Driver");
  const counterpartRating = Number(counterparty?.ratingAvg);
  const counterpartRatingText =
    Number.isFinite(counterpartRating) && counterpartRating >= 0
      ? counterpartRating.toFixed(1)
      : "N/A";
  const counterpartRole = isDriver ? "Rider" : "Driver";
  const avatarSource = counterparty?.profileImage
    ? { uri: counterparty.profileImage }
    : require("@/assets/images/demo-profile.png");

  const statusText = formatStatus(trip?.status);
  const paymentStatusText = formatStatus(trip?.paymentStatus);
  const fareText = formatFare(
    trip?.fare?.currency ?? trip?.pricing?.currency,
    trip?.fare?.totalFare ?? trip?.fare?.finalFare ?? trip?.pricing?.finalFare,
  );
  const dateTimeText = formatDateTime(trip?.updatedAt ?? trip?.createdAt);
  const pickupText = trip?.pickup?.address ?? "Pickup unavailable";
  const dropoffText = trip?.dropoff?.address ?? "Dropoff unavailable";
  const distanceText = formatDistance(trip?.distanceMiles);
  const durationText = formatDuration(trip?.durationMinutes);
  const vehicleModelText =
    [vehicle?.brand, vehicle?.model].filter(Boolean).join(" ") ||
    "Vehicle details unavailable";

  const statusStyle = useMemo(() => {
    const normalized = String(trip?.status ?? "").toLowerCase();
    if (normalized === "completed") {
      return styles.statusBadgeCompleted;
    }
    if (normalized === "cancelled" || normalized === "canceled") {
      return styles.statusBadgeCancelled;
    }
    return styles.statusBadgeInProgress;
  }, [trip?.status]);

  const showReviewCard = Boolean(trip?.reviewGiven);
  const reviewRatingValue = Number(trip?.reviewGiven?.stars);
  const reviewRatingText =
    Number.isFinite(reviewRatingValue) && reviewRatingValue >= 0
      ? reviewRatingValue.toFixed(1)
      : counterpartRatingText;
  const reviewComment =
    trip?.reviewGiven?.comment?.trim() || "No review comment available.";

  return (
    <View style={styles.container}>
      <AuthBackground />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#262626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride details</Text>
      </View>

      {!tripId && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>No trip selected.</Text>
        </View>
      )}

      {tripId && isLoading && !trip && (
        <View style={styles.infoContainer}>
          <ActivityIndicator size="small" color={colors.main} />
          <Text style={styles.infoText}>Loading trip details...</Text>
        </View>
      )}

      {tripId && !isLoading && errorMessage && !trip && (
        <View style={styles.infoContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {trip && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.profileRow}>
            <Image source={avatarSource} style={styles.avatar} />
            <View style={styles.driverInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.driverName}>{counterpartName}</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="#FBBF24" />
                  <Text style={styles.ratingText}>{counterpartRatingText}</Text>
                </View>
              </View>
              <Text style={styles.carModel}>{vehicleModelText}</Text>
            </View>
            <View style={[styles.statusBadge, statusStyle]}>
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <View style={styles.statTop}>
                <MaterialCommunityIcons
                  name="cash-multiple"
                  size={20}
                  color="#059669"
                />
                <Text style={styles.statValue}>{fareText}</Text>
              </View>
              <Text style={styles.statLabel}>FARE</Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.statTop}>
                <Ionicons name="card-outline" size={20} color="#6366F1" />
                <Text style={styles.statValue}>{paymentStatusText}</Text>
              </View>
              <Text style={styles.statLabel}>PAYMENT</Text>
            </View>
          </View>

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
              value={dateTimeText}
            />
            <DetailItem
              icon={<Ionicons name="radio-button-on" size={20} color="#6366F1" />}
              label="Pickup location"
              value={pickupText}
            />
            <DetailItem
              icon={<Ionicons name="location" size={20} color="#EF4444" />}
              label="Dropoff location"
              value={dropoffText}
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
              value={distanceText}
            />
            <DetailItem
              icon={<Ionicons name="time-outline" size={20} color="#6366F1" />}
              label="Total time"
              value={durationText}
            />
          </View>

          {showReviewCard && (
            <ReviewCard
              name={counterpartName}
              role={counterpartRole}
              rating={reviewRatingText}
              comment={reviewComment}
              avatar={avatarSource}
            />
          )}

          <Text style={styles.sectionHeader}>Help</Text>
          <Pressable
            style={styles.helpButton}
            onPress={() => router.push("/(protected)/(account)/support")}
          >
            <MaterialCommunityIcons name="headset" size={22} color="#1A1A1A" />
            <Text style={styles.helpButtonText}>Customer Support</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
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
    borderRadius: 20,
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
  infoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(30),
  },
  infoText: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(13),
    color: "#6B7280",
    textAlign: "center",
  },
  errorText: {
    fontSize: moderateScale(13),
    color: "#B91C1C",
    textAlign: "center",
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
    gap: scale(3),
  },
  ratingText: {
    fontSize: moderateScale(12),
    color: "#6B7280",
  },
  carModel: {
    fontSize: moderateScale(13),
    color: "#6B7280",
    marginTop: verticalScale(2),
  },
  statusBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: scale(15),
  },
  statusBadgeCompleted: {
    backgroundColor: "#059669",
  },
  statusBadgeCancelled: {
    backgroundColor: "#DC2626",
  },
  statusBadgeInProgress: {
    backgroundColor: "#6B7280",
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
  statTop: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(8),
    marginBottom: verticalScale(6),
  },
  statValue: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    color: "#1A1A1A",
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
    flex: 1,
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
