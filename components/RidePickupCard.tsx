import { colors } from "@/config/colors";
import {
  useArrivedAtPickupMutation,
  useCancelTripMutation,
  useCompleteTripMutation,
  useGetTripRiderProfileQuery,
  useVerifyTripOtpMutation,
} from "@/redux/api/driverRIdeStart";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import ConfirmationModal from "./ConfirmationModal";
import VerifyRiderModal from "./VerifyRiderModal";

const PRE_CANCEL_COUNTDOWN_SECONDS = 90; // 1.5 minutes
const CANCEL_WINDOW_SECONDS = 270; // 4.5 minutes
const PICKUP_ARRIVAL_RADIUS_METERS = 30;
const DROPOFF_ARRIVAL_RADIUS_METERS = 35000;

type CancelTimerPhase = "pre_cancel" | "cancel_window" | "ended";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type RiderPickupCardProps = {
  currentLocation: Coordinate | null;
};

const pointToCoordinate = ([longitude, latitude]: [
  number,
  number,
]): Coordinate => ({
  latitude,
  longitude,
});

const getDistanceInMeters = (
  origin: Coordinate,
  destination: Coordinate,
): number => {
  const earthRadius = 6371e3;
  const phi1 = (origin.latitude * Math.PI) / 180;
  const phi2 = (destination.latitude * Math.PI) / 180;
  const deltaPhi = ((destination.latitude - origin.latitude) * Math.PI) / 180;
  const deltaLambda =
    ((destination.longitude - origin.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

const getApiErrorMessage = (error: any, fallbackMessage: string) =>
  error?.data?.error?.message ?? error?.data?.message ?? fallbackMessage;

const RiderPickupCard = ({ currentLocation }: RiderPickupCardProps) => {
  const [isModal, setIsModal] = useState(false);
  const [isCancelModal, setIsCancelModal] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const activeTrip = useAppSelector(
    (state: RootState) => state.driverRideStart.activeTrip,
  );
  const tripId = activeTrip?._id ?? "";
  const { data: riderProfileResponse } = useGetTripRiderProfileQuery(tripId, {
    skip: !tripId,
  });
  const [cancelTrip, { isLoading: isCancelingTrip }] = useCancelTripMutation();
  const [arrivedAtPickup, { isLoading: isUpdatingArrival }] =
    useArrivedAtPickupMutation();
  const [verifyTripOtp, { isLoading: isVerifyingOtp }] =
    useVerifyTripOtpMutation();
  const [completeTrip, { isLoading: isCompletingTrip }] = useCompleteTripMutation();
  const tripCreatedAtMs = useMemo(() => {
    if (!activeTrip?.createdAt) {
      return Number.NaN;
    }

    const parsed = new Date(activeTrip.createdAt).getTime();
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }, [activeTrip?.createdAt]);

  const elapsedSeconds = useMemo(() => {
    if (!Number.isFinite(tripCreatedAtMs)) {
      return 0;
    }

    return Math.max(0, Math.floor((nowMs - tripCreatedAtMs) / 1000));
  }, [nowMs, tripCreatedAtMs]);

  const { timerPhase, remainingSeconds } = useMemo(() => {
    const totalCountdownSeconds =
      PRE_CANCEL_COUNTDOWN_SECONDS + CANCEL_WINDOW_SECONDS;

    if (!tripId || !Number.isFinite(tripCreatedAtMs)) {
      return {
        timerPhase: "pre_cancel" as CancelTimerPhase,
        remainingSeconds: PRE_CANCEL_COUNTDOWN_SECONDS,
      };
    }

    if (elapsedSeconds < PRE_CANCEL_COUNTDOWN_SECONDS) {
      return {
        timerPhase: "pre_cancel" as CancelTimerPhase,
        remainingSeconds: PRE_CANCEL_COUNTDOWN_SECONDS - elapsedSeconds,
      };
    }

    if (elapsedSeconds < totalCountdownSeconds) {
      return {
        timerPhase: "cancel_window" as CancelTimerPhase,
        remainingSeconds: totalCountdownSeconds - elapsedSeconds,
      };
    }

    return {
      timerPhase: "ended" as CancelTimerPhase,
      remainingSeconds: 0,
    };
  }, [elapsedSeconds, tripCreatedAtMs, tripId]);

  const showCancelButton = timerPhase !== "pre_cancel";
  const centerTimerBadge = !showCancelButton;
  const isOtpVerified =
    activeTrip?.status === "otp_verified" || activeTrip?.status === "started";
  const pickupCoordinate = useMemo(() => {
    const coordinates = activeTrip?.pickup?.point?.coordinates;
    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      return null;
    }

    const [longitude, latitude] = coordinates;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return null;
    }

    return pointToCoordinate([longitude, latitude]);
  }, [activeTrip?.pickup?.point?.coordinates]);
  const dropoffCoordinate = useMemo(() => {
    const coordinates = activeTrip?.dropoff?.point?.coordinates;
    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      return null;
    }

    const [longitude, latitude] = coordinates;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return null;
    }

    return pointToCoordinate([longitude, latitude]);
  }, [activeTrip?.dropoff?.point?.coordinates]);

  const riderSummary = useMemo(() => {
    const riderFromApi = riderProfileResponse?.data?.rider;
    if (riderFromApi) {
      return {
        name: riderFromApi.name ?? "Rider",
        profileImage: riderFromApi.profileImage ?? null,
        ratingAvg: Number(riderFromApi.ratingAvg ?? 0),
      };
    }

    const rider = (activeTrip as any)?.rider ?? (activeTrip as any)?.riderId;
    if (rider && typeof rider === "object") {
      return {
        name: rider.name ?? "Rider",
        profileImage: rider.profileImage ?? null,
        ratingAvg: Number(rider.ratingAvg ?? 0),
      };
    }

    return {
      name: "Rider",
      profileImage: null as string | null,
      ratingAvg: 0,
    };
  }, [activeTrip, riderProfileResponse?.data?.rider]);

  const statusLabel = useMemo(() => {
    const status = activeTrip?.status;
    if (
      status === "started" &&
      currentLocation &&
      dropoffCoordinate &&
      getDistanceInMeters(currentLocation, dropoffCoordinate) <=
        DROPOFF_ARRIVAL_RADIUS_METERS
    ) {
      return "Arrived at dropoff location";
    }
    if (status === "driver_arrived") return "Driver arrived at pickup";
    if (status === "otp_verified") return "Rider verified";
    if (status === "started") return "Trip in progress";
    if (status === "completed") return "Trip completed";
    if (status === "cancelled") return "Trip cancelled";
    return "Picking up rider";
  }, [activeTrip?.status, currentLocation, dropoffCoordinate]);

  const pickupDistanceMeters = useMemo(() => {
    if (!currentLocation || !pickupCoordinate) {
      return Number.POSITIVE_INFINITY;
    }

    return getDistanceInMeters(currentLocation, pickupCoordinate);
  }, [currentLocation, pickupCoordinate]);
  const dropoffDistanceMeters = useMemo(() => {
    if (!currentLocation || !dropoffCoordinate) {
      return Number.POSITIVE_INFINITY;
    }

    return getDistanceInMeters(currentLocation, dropoffCoordinate);
  }, [currentLocation, dropoffCoordinate]);
  const isHeadingToDropoff = activeTrip?.status === "started";

  const distanceText = useMemo(() => {
    const distanceMeters = isHeadingToDropoff
      ? dropoffDistanceMeters
      : pickupDistanceMeters;
    if (Number.isFinite(distanceMeters)) {
      const miles = distanceMeters / 1609.344;
      return `${miles.toFixed(1)} mi`;
    }

    return "--";
  }, [dropoffDistanceMeters, isHeadingToDropoff, pickupDistanceMeters]);

  const isAwaitingPickupArrival = activeTrip?.status === "accepted";
  const hasArrivedAtPickup =
    isAwaitingPickupArrival &&
    pickupDistanceMeters <= PICKUP_ARRIVAL_RADIUS_METERS;
  const hasArrivedAtDropoff =
    isHeadingToDropoff && dropoffDistanceMeters <= DROPOFF_ARRIVAL_RADIUS_METERS;
  const canCompleteRide = Boolean(tripId) && hasArrivedAtDropoff;
  const showActionTimer =
    activeTrip?.status === "accepted" || activeTrip?.status === "driver_arrived";

  useEffect(() => {
    if (!tripId) {
      return;
    }

    setNowMs(Date.now());
    const timerId = setInterval(() => setNowMs(Date.now()), 1000);

    return () => clearInterval(timerId);
  }, [tripId]);

  useEffect(() => {
    if (!tripId || !hasArrivedAtPickup || isUpdatingArrival) {
      return;
    }

    arrivedAtPickup({ tripId })
      .unwrap()
      .catch(() => {
        // Keep this silent; we'll retry on upcoming location updates.
      });
  }, [arrivedAtPickup, hasArrivedAtPickup, isUpdatingArrival, tripId]);

  const timerText = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }, [remainingSeconds]);

  const riderAvatarSource = riderSummary.profileImage
    ? { uri: riderSummary.profileImage }
    : require("../assets/images/demo-profile.png");

  const handleCancelTrip = useCallback(async () => {
    if (!tripId) {
      setIsCancelModal(false);
      return;
    }

    try {
      await cancelTrip({ tripId }).unwrap();
      setIsCancelModal(false);
    } catch (error: any) {
      Alert.alert(
        "Cancel trip failed",
        getApiErrorMessage(error, "Could not cancel this trip."),
      );
    }
  }, [cancelTrip, tripId]);

  const handleVerifyOtp = useCallback(
    async (otp: string) => {
      const cleanOtp = otp.trim();

      if (!tripId) {
        return;
      }

      if (cleanOtp.length !== 4) {
        Alert.alert("Invalid OTP", "Please enter the 4-digit OTP.");
        return;
      }

      try {
        await verifyTripOtp({
          tripId,
          otp: cleanOtp,
        }).unwrap();
        setIsModal(false);
      } catch (error: any) {
        Alert.alert(
          "OTP verification failed",
          getApiErrorMessage(error, "Could not verify rider OTP."),
        );
      }
    },
    [tripId, verifyTripOtp],
  );
  const handleCompleteRide = useCallback(async () => {
    if (!tripId || !canCompleteRide || isCompletingTrip) {
      return;
    }

    try {
      const response = await completeTrip({ tripId }).unwrap();
      const successMessage =
        response?.data?.message ??
        response?.message ??
        "Ride has been completed successfully.";
      Alert.alert("Ride completed", successMessage, [
        {
          text: "OK",
          onPress: () => router.push("/(protected)/ride-details/ride-status"),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Complete ride failed",
        getApiErrorMessage(error, "Could not complete this ride."),
      );
    }
  }, [canCompleteRide, completeTrip, isCompletingTrip, tripId]);

  return (
    <View style={styles.container}>
      <ConfirmationModal
        visible={isCancelModal}
        onClose={() => setIsCancelModal(false)}
        onConfirm={handleCancelTrip}
        title="Are you sure you want to Cancel the ride?"
        message="Once canceled, you won't be able to recover this ride. Please confirm your action."
        confirmLabel="Yes"
        cancelLabel="No"
        isLoading={isCancelingTrip}
      />
      <VerifyRiderModal
        isVisible={isModal}
        onClose={() => setIsModal(false)}
        onVerify={handleVerifyOtp}
        isLoading={isVerifyingOtp}
      />
      {/* Top Distance Indicator */}
      <View style={styles.headerInfo}>
        <View style={styles.distanceRow}>
          <View style={styles.personIconCircle}>
            <Ionicons name="person" size={scale(16)} color="#6366F1" />
          </View>
          <Text style={styles.distanceText}>{distanceText}</Text>
        </View>
        <Text style={styles.subtext}>{statusLabel}</Text>
      </View>

      {showActionTimer && (
        <View style={styles.actionRow}>
          <View
            style={[
              styles.timerBadge,
              centerTimerBadge ? styles.timerBadgeCentered : styles.timerBadgeLeft,
            ]}
          >
            <Text style={styles.timerText}>{timerText}</Text>
          </View>
          {showCancelButton && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsCancelModal(true)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {/* Main Card */}
      <View style={styles.card}>
        <View style={styles.topSection}>
          <View style={styles.riderInfo}>
            <Image source={riderAvatarSource} style={styles.avatar} />
            <View>
              <Text style={styles.riderName}>{riderSummary.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={scale(14)} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {riderSummary.ratingAvg.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Start Button */}
          {!isOtpVerified && (
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
          )}
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
      {canCompleteRide && (
        <TouchableOpacity
          style={[
            styles.completeRideButton,
            isCompletingTrip ? styles.completeRideButtonDisabled : null,
          ]}
          onPress={handleCompleteRide}
          disabled={isCompletingTrip}
        >
          <Text style={styles.completeRideText}>
            {isCompletingTrip ? "Completing..." : "Complete Ride"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingTop: 20,
  },
  headerInfo: {
    alignItems: "center",
    marginBottom: 15,
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
  startButtonDisabled: {
    opacity: 0.7,
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
    minWidth: scale(62),
    backgroundColor: "#A5B4FC",
    paddingHorizontal: scale(15),
    paddingVertical: scale(5),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: colors.main,
    alignItems: "center",
  },
  timerBadgeLeft: {
    left: 0,
  },
  timerBadgeCentered: {
    left: "50%",
    transform: [{ translateX: -scale(31) }],
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
  completeRideButton: {
    width: "100%",
    marginTop: verticalScale(12),
    backgroundColor: colors.main,
    borderRadius: scale(10),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(12),
  },
  completeRideButtonDisabled: {
    opacity: 0.7,
  },
  completeRideText: {
    color: "white",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
});

export default RiderPickupCard;
