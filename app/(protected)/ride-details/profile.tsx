import ReviewCard from "@/components/ReviewCard";
import { useGetTripRiderProfileQuery } from "@/redux/api/driverRIdeStart";
import { useGetRiderTripDriverProfileQuery } from "@/redux/api/rideBookApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageBackground } from "expo-image";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function DriverProfileScreen() {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const viewerRole = user?.role === "driver" ? "driver" : "rider";

  const riderActiveTrip = useAppSelector(
    (state: RootState) => state.rideBook.activeTrip,
  );
  const driverActiveTrip = useAppSelector(
    (state: RootState) => state.driverRideStart.activeTrip,
  );
  const matchedDriver = useAppSelector(
    (state: RootState) => state.rideBook.matchedDriver,
  );
  const matchedVehicle = useAppSelector(
    (state: RootState) => state.rideBook.matchedVehicle,
  );

  const riderTripId = riderActiveTrip?._id ?? "";
  const driverTripId = driverActiveTrip?._id ?? "";
  const isRiderView = viewerRole === "rider";

  const riderTripDriverProfileQuery = useGetRiderTripDriverProfileQuery(
    riderTripId,
    {
      skip: !isRiderView || !riderTripId,
    },
  );
  const driverTripRiderProfileQuery = useGetTripRiderProfileQuery(driverTripId, {
    skip: isRiderView || !driverTripId,
  });

  const profilePayload = isRiderView
    ? riderTripDriverProfileQuery.data?.data?.driver
    : driverTripRiderProfileQuery.data?.data?.rider;
  const vehiclePayload = isRiderView
    ? riderTripDriverProfileQuery.data?.data?.vehicle
    : null;
  const reviews = isRiderView
    ? riderTripDriverProfileQuery.data?.data?.reviews ?? []
    : driverTripRiderProfileQuery.data?.data?.reviews ?? [];
  const isFetching = isRiderView
    ? riderTripDriverProfileQuery.isFetching
    : driverTripRiderProfileQuery.isFetching;

  const profileTitle = isRiderView ? "Driver Profile" : "Rider Profile";
  const reviewRoleLabel = isRiderView ? "Rider" : "Driver";
  const profileName =
    profilePayload?.name?.trim() ||
    (isRiderView ? matchedDriver?.name?.trim() : "") ||
    (isRiderView ? "Driver" : "Rider");

  const ratingAvg = Number(
    profilePayload?.ratingAvg ??
      (isRiderView ? matchedDriver?.ratingAvg : undefined),
  );
  const ratingText =
    Number.isFinite(ratingAvg) && ratingAvg >= 0 ? ratingAvg.toFixed(1) : "N/A";

  const tripsCount = Number(
    profilePayload?.tripsCount ??
      (isRiderView ? matchedDriver?.tripsCount : undefined),
  );
  const tripsCountText =
    Number.isFinite(tripsCount) && tripsCount >= 0 ? String(tripsCount) : "--";

  const yearsOnPlatformText = useMemo(() => {
    const yearsValue = Number(profilePayload?.yearsOnPlatform);
    if (Number.isFinite(yearsValue) && yearsValue >= 0) {
      return String(Math.floor(yearsValue));
    }

    const daysValue = Number(profilePayload?.daysOnPlatform);
    if (Number.isFinite(daysValue) && daysValue >= 0) {
      return String(Math.floor(daysValue / 365));
    }

    const createdAt = profilePayload?.profileCreatedAt;
    if (createdAt) {
      const createdAtMs = new Date(createdAt).getTime();
      if (Number.isFinite(createdAtMs)) {
        const diffYears = Math.floor(
          (Date.now() - createdAtMs) / (1000 * 60 * 60 * 24 * 365),
        );
        return String(Math.max(0, diffYears));
      }
    }

    return "--";
  }, [
    profilePayload?.daysOnPlatform,
    profilePayload?.profileCreatedAt,
    profilePayload?.yearsOnPlatform,
  ]);

  const avatarSource = profilePayload?.profileImage
    ? { uri: profilePayload.profileImage }
    : isRiderView && matchedDriver?.profileImage
      ? { uri: matchedDriver.profileImage }
      : require("@/assets/images/demo-profile.png");

  const licensePlate = isRiderView
    ? vehiclePayload?.licensePlate?.trim() ||
      matchedVehicle?.licensePlate?.trim() ||
      "Plate unavailable"
    : "";
  const vehicleModel = isRiderView
    ? [vehiclePayload?.brand, vehiclePayload?.model].filter(Boolean).join(" ") ||
      [matchedVehicle?.brand, matchedVehicle?.model].filter(Boolean).join(" ") ||
      "Vehicle details unavailable"
    : "";

  const reviewCards = useMemo(
    () =>
      reviews.map((review, index) => {
        const reviewer =
          (review as any)?.rider ??
          (review as any)?.driver ??
          (review as any)?.reviewer ??
          null;
        const reviewRating = Number((review as any)?.stars);

        return {
          id: String((review as any)?._id ?? index),
          name: reviewer?.name ?? "User",
          rating:
            Number.isFinite(reviewRating) && reviewRating >= 0
              ? reviewRating.toFixed(1)
              : "0.0",
          comment: (review as any)?.comment ?? "No comment provided.",
          avatar: reviewer?.profileImage
            ? { uri: reviewer.profileImage }
            : require("@/assets/images/demo-profile.png"),
        };
      }),
    [reviews],
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerNav}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{profileTitle}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topProfileSection}>
          <ImageBackground
            style={styles.darkHeaderBg}
            source={require("@/assets/images/grid-blue-bg.svg")}
          />
          <View style={styles.driverInfoContainer}>
            <Image source={avatarSource} style={styles.mainAvatar} />
            <Text style={styles.driverName}>{profileName}</Text>
          </View>
        </View>

        <View style={styles.contentPadding}>
          {isFetching && !profilePayload && (
            <ActivityIndicator style={{ marginBottom: verticalScale(10) }} />
          )}

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{tripsCountText}</Text>
              <Text style={styles.statLabel}>TRIPS</Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.ratingBoxHeader}>
                <Ionicons name="star" size={14} color="#FBBF24" />
                <Text style={styles.statValue}>{ratingText}</Text>
              </View>
              <Text style={styles.statLabel}>RATING</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{yearsOnPlatformText}</Text>
              <Text style={styles.statLabel}>YEARS</Text>
            </View>
          </View>

          {isRiderView && (
            <>
              <Text style={styles.sectionTitle}>Vehicle Details</Text>
              <View style={styles.vehicleCard}>
                <Image
                  source={require("@/assets/images/cars/car.png")}
                  style={styles.vehicleImage}
                  contentFit="contain"
                />
                <View style={styles.vehicleTextContainer}>
                  <Text style={styles.plateNumber}>{licensePlate}</Text>
                  <Text style={styles.modelName}>{vehicleModel}</Text>
                </View>
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Reviews</Text>
          {reviewCards.length > 0 ? (
            reviewCards.map((review) => (
              <ReviewCard
                key={review.id}
                name={review.name}
                role={reviewRoleLabel}
                rating={review.rating}
                comment={review.comment}
                avatar={review.avatar}
              />
            ))
          ) : (
            <Text style={styles.noReviewText}>No reviews available yet.</Text>
          )}
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
  noReviewText: {
    fontSize: moderateScale(13),
    color: "#6B7280",
    marginBottom: verticalScale(10),
  },
});
