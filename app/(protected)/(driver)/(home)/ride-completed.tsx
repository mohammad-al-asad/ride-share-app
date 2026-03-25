import { colors } from "@/config/colors";
import { useGetTripRiderProfileQuery } from "@/redux/api/driverRIdeStart";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setDriverRideStatus } from "@/redux/slices/driverRideStartSlice";
import { RootState } from "@/redux/store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
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

export default function RideCompletedScreen() {
  const dispatch = useAppDispatch();
  const completedTrip = useAppSelector(
    (state: RootState) => state.driverRideStart.lastCompletedTrip,
  );
  const tripId = completedTrip?._id ?? "";
  const { data: riderProfileResponse } = useGetTripRiderProfileQuery(tripId, {
    skip: !tripId,
  });

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const rider = riderProfileResponse?.data?.rider;
  const riderName = rider?.name?.trim() || "Rider";
  const riderRating = Number(rider?.ratingAvg ?? 4.7).toFixed(1);
  const riderAvatarSource = rider?.profileImage
    ? { uri: rider.profileImage }
    : require("@/assets/images/demo-profile.png");

  const dateTimeText = formatDateTime(
    completedTrip?.updatedAt ?? completedTrip?.createdAt,
  );
  const fareText = formatFare(
    completedTrip?.pricing?.currency,
    completedTrip?.pricing?.finalFare,
  );
  const dropoffAddress = completedTrip?.dropoff?.address ?? "Location not available";
  const distanceText = Number.isFinite(Number(completedTrip?.distanceMiles))
    ? `${Number(completedTrip?.distanceMiles).toFixed(1)} mi`
    : "--";
  const durationText = Number.isFinite(Number(completedTrip?.durationMinutes))
    ? `${Math.max(1, Math.round(Number(completedTrip?.durationMinutes)))} min`
    : "--";

  const vehicleText = useMemo(() => {
    const rideOption = completedTrip?.rideOption;
    if (!rideOption) {
      return "Trip complete";
    }

    return [rideOption.tier, rideOption.vehicleType]
      .filter(Boolean)
      .map((value) => String(value).toUpperCase())
      .join(" ");
  }, [completedTrip?.rideOption]);

  const resetAndGoHome = () => {
    dispatch(setDriverRideStatus({ lastCompletedTrip: null }));
    router.replace("/(protected)/(driver)/(home)/zoomed-map");
  };

  const handleDone = () => {
    if (rating === 0) {
      Alert.alert("Rating missing", "Please rate the ride before submitting.");
      return;
    }

    resetAndGoHome();
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
        <View style={styles.profileCard}>
          <Image source={riderAvatarSource} style={styles.avatar} />
          <View style={styles.profileMeta}>
            <Text style={styles.profileName}>{riderName}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.gold} />
              <Text style={styles.ratingValue}>{riderRating}</Text>
            </View>
          </View>
          <View style={styles.vehicleMeta}>
            <Text style={styles.plateText}>{completedTrip?.vehicleId ?? "--"}</Text>
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
            icon={<MaterialCommunityIcons name="cash-multiple" size={18} color={colors.main} />}
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
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneText}>Done</Text>
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
    backgroundColor: "#ECECEF",
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
    backgroundColor: "#E5E7EB",
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
  doneText: {
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    fontWeight: "700",
  },
});
