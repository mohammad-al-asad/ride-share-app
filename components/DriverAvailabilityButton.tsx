import { colors } from "@/config/colors";
import {
  useGoOfflineMutation,
  useGoOnlineMutation,
} from "@/redux/api/driverRIdeStart";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { moderateScale, scale } from "react-native-size-matters";

export type DriverCoordinate = {
  latitude: number;
  longitude: number;
};

type DriverAvailabilityButtonProps = {
  driverLocation?: DriverCoordinate | null;
  style?: StyleProp<ViewStyle>;
  onlineStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconSize?: number;
  disabled?: boolean;
  text?:boolean;
  onStatusChange?: (isOnline: boolean) => void;
};

const getApiErrorMessage = (error: any, fallbackMessage: string) =>
  error?.data?.message ?? error?.data?.error?.message ?? fallbackMessage;

const DriverAvailabilityButton = ({
  driverLocation,
  style,
  onlineStyle,
  textStyle,
  iconSize = 24,
  disabled = false,
  text=true,
}: DriverAvailabilityButtonProps) => {
  const isOnline = useAppSelector(
    (state: RootState) => state.driverRideStart.isOnline,
  );
  const [goOnline, { isLoading: isGoingOnline }] = useGoOnlineMutation();
  const [goOffline, { isLoading: isGoingOffline }] = useGoOfflineMutation();

  const isUpdating = disabled || isGoingOnline || isGoingOffline;
  const label = isGoingOnline
    ? "Starting..."
    : isGoingOffline
      ? "Stopping..."
      : isOnline
        ? "Stop"
        : "Go Online";

  const handlePress = useCallback(async () => {
    if (isOnline) {
      try {
        const response = await goOffline().unwrap();
      } catch (error: any) {
        Alert.alert(
          "Go offline failed",
          getApiErrorMessage(error, "Could not update driver availability."),
        );
      }
      return;
    }

    if (!driverLocation) {
      Alert.alert(
        "Location unavailable",
        "Waiting for your current location. Please try again in a moment.",
      );
      return;
    }

    try {
      const response = await goOnline({
        lat: driverLocation.latitude,
        lng: driverLocation.longitude,
      }).unwrap();
    } catch (error: any) {
      Alert.alert(
        "Go online failed",
        getApiErrorMessage(error, "Could not update driver availability."),
      );
    }
  }, [driverLocation, goOffline, goOnline, isOnline]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.button,
        style,
        isOnline && onlineStyle,
        isUpdating && styles.buttonDisabled,
      ]}
      activeOpacity={0.85}
      disabled={isUpdating}
    >
      {isUpdating ? (
        <ActivityIndicator size="small" color={colors.gold} />
      ) : (
        <MaterialCommunityIcons
          name={isOnline ? "checkbox-blank-outline" : "steering"}
          size={iconSize}
          color={colors.gold}
        />
      )}
      {text && <Text style={[styles.text, textStyle]}>{label}</Text>}
    </TouchableOpacity>
  );
};

export default DriverAvailabilityButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(8),
    backgroundColor:colors.main,
    paddingVertical: scale(16),
    borderRadius: scale(18),
  },

  buttonDisabled: {
    opacity: 0.9,
  },
  text: {
    color: colors.gold,
    fontWeight: "600",
    fontSize: moderateScale(14),
  },
});
