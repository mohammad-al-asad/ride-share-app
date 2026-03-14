import { colors } from "@/config/colors";
import { Home01Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import DriverAvailabilityButton, {
  DriverCoordinate,
} from "./DriverAvailabilityButton";

type TopMapControllsProps = {
  driverLocation?: DriverCoordinate | null;
  onStatusChange?: (isOnline: boolean) => void;
};

const TopMapControlls = ({
  driverLocation,
}: TopMapControllsProps) => {
  const [isEyeOpened, setIsEyeOpened] = useState(true);

  // Reanimated shared value
  const eyeValue = useSharedValue(1);
  const toggleEye = () => {
    eyeValue.value = isEyeOpened ? 0 : 1;
    setIsEyeOpened(!isEyeOpened);
  };
  // Animated pill style
  const pillStyle = useAnimatedStyle(() => {
    return {
      paddingHorizontal: withSpring(eyeValue.value ? 8 : 16, { duration: 500 }),
      borderRadius: withTiming(eyeValue.value ? 30 : 100, { duration: 200 }),
    };
  });
  return (
    <View style={styles.topControls}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => router.replace("/(protected)/(tab)")}
      >
        <HugeiconsIcon icon={Home01Icon} size={scale(24)} color={colors.main} />
      </TouchableOpacity>
      {/* Reanimated Wallet Pill */}
      <Animated.View style={[styles.walletPill, pillStyle]}>
        {!isEyeOpened && (
          <View style={[{ flexDirection: "row", alignItems: "center" }]}>
            <Text style={styles.walletText} numberOfLines={1}>
              <Text style={{ color: "#FFD283" }}>USD</Text> 0.00
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.walletIconCircle}
          onPress={toggleEye}
          activeOpacity={0.8}
        >
          <HugeiconsIcon
            icon={isEyeOpened ? ViewOffIcon : ViewIcon}
            size={scale(16)}
            color="#FFD700"
          />
        </TouchableOpacity>
      </Animated.View>
      {/* Button */}
      <View style={styles.statusButtonWrapper}>
        <DriverAvailabilityButton
        text={false}
          driverLocation={driverLocation}
          style={styles.goOnlineButton}
          textStyle={styles.goOnlineText}
          iconSize={scale(18)}
        />
      </View>
    </View>
  );
};

export default TopMapControlls;

const styles = StyleSheet.create({
  topControls: {
    position: "absolute",
    top: verticalScale(30),
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(20),
    zIndex: 10,
  },
  iconButton: {
    backgroundColor: "white",
    padding: scale(10),
    borderRadius: scale(100),
    elevation: 4,
  },
  walletPill: {
    backgroundColor: "#6366F1",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 30,
    minHeight: scale(40),
    overflow: "hidden",
    gap: scale(8),
  },
  walletText: {
    color: "white",
    fontWeight: "700",
    fontSize: moderateScale(16),
    marginRight: scale(10),
  },
  walletIconCircle: {
    backgroundColor: "#2E1A47",
    borderRadius: 100,
    padding: scale(6),
    justifyContent: "center",
    alignItems: "center",
  },
  statusButtonWrapper: {
    alignItems: "center",
  },
  goOnlineButton: {
    backgroundColor: "#6366F1",
    paddingVertical: scale(11),
    paddingHorizontal: scale(11),
    borderRadius: scale(8),
  },

  goOnlineText: {
    color: colors.gold,
    fontWeight: "600",
    fontSize: moderateScale(12),
  },
});
