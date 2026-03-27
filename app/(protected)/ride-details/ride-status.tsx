import { colors } from "@/config/colors";
import {
  useGetDriverTripSummaryQuery,
  useSubmitRiderReviewMutation,
} from "@/redux/api/driverRIdeStart";
import {
  useGetRiderTripDetailsQuery,
  useSubmitTripRatingMutation,
} from "@/redux/api/rideBookApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setDriverRideStatus } from "@/redux/slices/driverRideStartSlice";
import { RootState } from "@/redux/store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

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

const formatFare = (currency?: string, amount?: number) => {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return "--";
  }

  if ((currency ?? "USD").toUpperCase() === "USD") {
    return `$${numeric.toFixed(2)}`;
  }

  return `${currency} ${numeric.toFixed(2)}`;
};

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

type TripPerson = {
  _id?: string;
  name?: string;
  profileImage?: string | null;
  ratingAvg?: number;
  ratingCount?: number;
};

type TripVehicle = {
  _id?: string;
  brand?: string;
  model?: string;
  type?: string;
  size?: string;
  licensePlate?: string;
};

type TripSummary = {
  _id?: string;
  riderId?: string | TripPerson;
  driverId?: string | TripPerson;
  vehicleId?: string | TripVehicle;
  driver?: TripPerson;
  pickup?: {
    address?: string;
  };
  dropoff?: {
    address?: string;
  };
  distanceMiles?: number;
  durationMinutes?: number;
  pricing?: {
    currency?: string;
    finalFare?: number;
  };
  fare?: {
    currency?: string;
    finalFare?: number;
    totalFare?: number;
  };
  rider?: TripPerson;
  vehicle?: TripVehicle;
  createdAt?: string;
  updatedAt?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export default function RideCompletedScreen() {
  const params = useLocalSearchParams<{ tripId?: string | string[] }>();
  const tripIdFromParams = Array.isArray(params.tripId)
    ? params.tripId[0]
    : params.tripId;

  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const isDriver = user?.role === "driver";
  const completedTrip = useAppSelector(
    (state: RootState) => state.driverRideStart.lastCompletedTrip,
  );
  const riderActiveTripId = useAppSelector(
    (state: RootState) => state.rideBook.activeTrip?._id ?? "",
  );
  const tripId =
    tripIdFromParams ?? (isDriver ? completedTrip?._id : riderActiveTripId) ?? "";
  const {
    data: driverTripSummaryResponse,
    isLoading: isDriverTripSummaryLoading,
    isFetching: isDriverTripSummaryFetching,
  } = useGetDriverTripSummaryQuery(tripId, {
    skip: !tripId || !isDriver,
    refetchOnMountOrArgChange: true,
  });
  const riderTripDetailsQuery = useGetRiderTripDetailsQuery(tripId, {
    skip: !tripId || isDriver,
    refetchOnMountOrArgChange: true,
  });
  const [submitRiderReview, { isLoading: isSubmittingDriverReview }] =
    useSubmitRiderReviewMutation();
  const [submitTripRating, { isLoading: isSubmittingRiderRating }] =
    useSubmitTripRatingMutation();
  const isSubmittingReview = isDriver
    ? isSubmittingDriverReview
    : isSubmittingRiderRating;
  const isTripSummaryLoading = isDriver
    ? isDriverTripSummaryLoading || isDriverTripSummaryFetching
    : riderTripDetailsQuery.isLoading || riderTripDetailsQuery.isFetching;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const summaryTrip = useMemo<TripSummary | null>(() => {
    if (isDriver) {
      const payload = driverTripSummaryResponse?.data;
      if (!payload || !isRecord(payload)) {
        return null;
      }

      if ("trip" in payload && isRecord((payload as { trip?: unknown }).trip)) {
        return (payload as { trip: TripSummary }).trip;
      }

      return payload as TripSummary;
    }

    return (riderTripDetailsQuery.data?.data as TripSummary | undefined) ?? null;
  }, [driverTripSummaryResponse?.data, isDriver, riderTripDetailsQuery.data?.data]);

  const counterpart = useMemo<TripPerson | null>(() => {
    if (!summaryTrip) {
      return null;
    }

    if (isDriver) {
      if (isRecord(summaryTrip.rider)) {
        return summaryTrip.rider as TripPerson;
      }

      if (isRecord(summaryTrip.riderId)) {
        return summaryTrip.riderId as TripPerson;
      }

      return null;
    }

    if (isRecord(summaryTrip.driver)) {
      return summaryTrip.driver as TripPerson;
    }

    if (isRecord(summaryTrip.driverId)) {
      return summaryTrip.driverId as TripPerson;
    }

    return null;
  }, [isDriver, summaryTrip]);

  const vehicle = useMemo<TripVehicle | null>(() => {
    if (!summaryTrip) {
      return null;
    }

    if (isRecord(summaryTrip.vehicle)) {
      return summaryTrip.vehicle as TripVehicle;
    }

    if (isRecord(summaryTrip.vehicleId)) {
      return summaryTrip.vehicleId as TripVehicle;
    }

    return null;
  }, [summaryTrip]);

  const counterpartName = counterpart?.name?.trim() || (isDriver ? "Rider" : "Driver");
  const counterpartRatingNumber = Number(counterpart?.ratingAvg ?? 0);
  const counterpartRating = Number.isFinite(counterpartRatingNumber)
    ? counterpartRatingNumber.toFixed(1)
    : "0.0";
  const counterpartAvatarSource = counterpart?.profileImage
    ? { uri: counterpart.profileImage }
    : require("@/assets/images/demo-profile.png");

  const dateTimeText = formatDateTime(
    summaryTrip?.updatedAt ??
      summaryTrip?.createdAt ??
      completedTrip?.updatedAt ??
      completedTrip?.createdAt,
  );
  const fareText = formatFare(
    summaryTrip?.fare?.currency ??
      summaryTrip?.pricing?.currency ??
      completedTrip?.pricing?.currency,
    summaryTrip?.fare?.totalFare ??
      summaryTrip?.fare?.finalFare ??
      summaryTrip?.pricing?.finalFare ??
      completedTrip?.pricing?.finalFare,
  );
  const dropoffAddress =
    summaryTrip?.dropoff?.address ??
    completedTrip?.dropoff?.address ??
    "Location not available";
  const distanceMiles = summaryTrip?.distanceMiles ?? completedTrip?.distanceMiles;
  const distanceText = Number.isFinite(Number(distanceMiles))
    ? `${Number(distanceMiles).toFixed(1)} mi`
    : "--";
  const durationMinutes =
    summaryTrip?.durationMinutes ?? completedTrip?.durationMinutes;
  const durationText = Number.isFinite(Number(durationMinutes))
    ? `${Math.max(1, Math.round(Number(durationMinutes)))} min`
    : "--";

  const vehicleText = useMemo(() => {
    if (vehicle) {
      const label = [vehicle.brand, vehicle.model].filter(Boolean).join(" ").trim();
      if (label) {
        return label;
      }
    }

    const rideOption = completedTrip?.rideOption;
    const fallback = [rideOption?.tier, rideOption?.vehicleType]
      .filter(Boolean)
      .map((value) => String(value).toUpperCase())
      .join(" ");

    return fallback || "Vehicle details unavailable";
  }, [completedTrip?.rideOption, vehicle]);

  const resetAndGoHome = () => {
    if (isDriver) {
      dispatch(setDriverRideStatus({ lastCompletedTrip: null }));
      router.replace("/(protected)/(driver)/(home)/zoomed-map");
      return;
    }

    router.replace("/(protected)/(tab)");
  };

  const handleDone = async () => {
    if (rating === 0) {
      Alert.alert("Rating missing", "Please rate the ride before submitting.");
      return;
    }

    if (!tripId) {
      Alert.alert("Trip missing", "Trip ID is not available to submit review.");
      return;
    }

    try {
      const trimmedComment = comment.trim();
      const response = isDriver
        ? await submitRiderReview({
            tripId,
            body: {
              stars: rating,
              ...(trimmedComment ? { comment: trimmedComment } : {}),
            },
          }).unwrap()
        : await submitTripRating({
            tripId,
            body: {
              stars: rating,
              ...(trimmedComment ? { comment: trimmedComment } : {}),
            },
          }).unwrap();

      const successMessage =
        response?.data?.message ??
        response?.message ??
        (isDriver
          ? "Rider review submitted successfully."
          : "Rating submitted successfully.");
      Alert.alert("Review submitted", successMessage, [
        {
          text: "OK",
          onPress: resetAndGoHome,
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Review failed",
        getApiErrorMessage(
          error,
          isDriver
            ? "Could not submit rider review."
            : "Could not submit trip rating.",
        ),
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ride Completed</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!summaryTrip && isTripSummaryLoading && (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={colors.main} />
            <Text style={styles.loadingText}>Loading trip summary...</Text>
          </View>
        )}

        <View style={styles.profileCard}>
          <Image source={counterpartAvatarSource} style={styles.avatar} />
          <View style={styles.profileMeta}>
            <Text style={styles.profileName}>{counterpartName}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.gold} />
              <Text style={styles.ratingValue}>{counterpartRating}</Text>
            </View>
          </View>
          <View style={styles.vehicleMeta}>
            <Text style={styles.plateText}>{vehicle?.licensePlate ?? "--"}</Text>
            <Text style={styles.vehicleText}>{vehicleText}</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <DetailRow
            icon={<Ionicons name="calendar-outline" size={18} color={colors.secondary} />}
            label="Date & Time"
            value={dateTimeText}
          />
          <DetailRow
            icon={<MaterialCommunityIcons name="cash-multiple" size={18} color={colors.secondary} />}
            label="Total Fare"
            value={fareText}
          />
          <DetailRow
            icon={<Ionicons name="location-outline" size={18} color={colors.secondary} />}
            label="You have arrived at your location"
            value={dropoffAddress}
          />
          <DetailRow
            icon={
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={18}
                color={colors.secondary}
              />
            }
            label="Distance covered"
            value={distanceText}
          />
          <DetailRow
            icon={<Ionicons name="time-outline" size={18} color={colors.secondary} />}
            label="Total time"
            value={durationText}
            isLast
          />
        </View>

        <Text style={styles.rateTitle}>Rate</Text>
        <View style={styles.starRow}>
          {Array.from({ length: 5 }).map((_, index) => {
            const starNumber = index + 1;
            const isFilled = starNumber <= rating;

            return (
              <Pressable key={starNumber} onPress={() => setRating(starNumber)}>
                <Ionicons
                  name={isFilled ? "star" : "star-outline"}
                  size={26}
                  color={colors.gold}
                />
              </Pressable>
            );
          })}
        </View>

        <TextInput
          style={styles.commentInput}
          multiline
          value={comment}
          onChangeText={setComment}
          placeholder="Give review about your journey"
          placeholderTextColor="#9CA3AF"
          textAlignVertical="top"
        />

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.skipButton} onPress={resetAndGoHome}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.doneButton,
              isSubmittingReview ? styles.doneButtonDisabled : null,
            ]}
            onPress={handleDone}
            disabled={isSubmittingReview}
          >
            <Text style={styles.doneText}>
              {isSubmittingReview ? "Submitting..." : "Done"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

type DetailRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
};

const DetailRow = ({ icon, label, value, isLast = false }: DetailRowProps) => (
  <View style={[styles.detailRow, isLast ? styles.detailRowLast : null]}>
    <View style={styles.detailIcon}>{icon}</View>
    <View style={styles.detailTextGroup}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECECEF",
  },
  header: {
    paddingTop: verticalScale(56),
    paddingBottom: verticalScale(16),
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    color: "#1F2937",
  },
  content: {
    padding: scale(16),
    paddingBottom: verticalScale(28),
  },
  profileCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: scale(12),
    padding: scale(12),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(14),
    gap: scale(10),
  },
  avatar: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: moderateScale(20),
    fontWeight: "600",
    color: "#1F2937",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    marginTop: verticalScale(2),
  },
  ratingValue: {
    fontSize: moderateScale(12),
    color: "#4B5563",
    fontWeight: "600",
  },
  vehicleMeta: {
    alignItems: "flex-end",
  },
  plateText: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#1F2937",
  },
  vehicleText: {
    marginTop: verticalScale(2),
    fontSize: moderateScale(11),
    color: "#6B7280",
    textAlign: "right",
  },
  detailsCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: scale(12),
    padding: scale(12),
    marginBottom: verticalScale(18),
  },
  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: verticalScale(10),
  },
  loadingText: {
    fontSize: moderateScale(12),
    color: "#6B7280",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingBottom: verticalScale(10),
    marginBottom: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  detailRowLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  detailIcon: {
    width: scale(22),
    alignItems: "center",
    marginRight: scale(8),
    marginTop: verticalScale(1),
  },
  detailTextGroup: {
    flex: 1,
  },
  detailLabel: {
    fontSize: moderateScale(13),
    color: "#9CA3AF",
  },
  detailValue: {
    marginTop: verticalScale(2),
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#111827",
  },
  rateTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: verticalScale(10),
  },
  starRow: {
    flexDirection: "row",
    gap: scale(8),
    marginBottom: verticalScale(14),
  },
  commentInput: {
    minHeight: verticalScale(140),
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: scale(10),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(13),
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
    marginBottom: verticalScale(16),
  },
  actionRow: {
    flexDirection: "row",
    gap: scale(12),
  },
  skipButton: {
    flex: 1,
    borderRadius: scale(10),
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(12),
  },
  skipText: {
    color: "#6B7280",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  doneButton: {
    flex: 1,
    borderRadius: scale(10),
    backgroundColor: colors.main,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(12),
  },
  doneButtonDisabled: {
    opacity: 0.7,
  },
  doneText: {
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    fontWeight: "700",
  },
});
