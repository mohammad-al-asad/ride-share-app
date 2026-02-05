import { colors } from "@/config/colors";
import { Entypo, Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { moderateScale, scale } from "react-native-size-matters";

export const MarkerCircle = () => {
  // Use a unique name to avoid conflict with 'scale' import from size-matters
  const animationValue = useSharedValue(0);

  useEffect(() => {
    // Reset and start animation
    animationValue.value = 0;
    animationValue.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.out(Easing.ease),
      }),
      -1, // Infinite
      false, // Restart from 0 each time
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          // Scale from 1x to 3x size
          scale: interpolate(animationValue.value, [0, 1], [1, 3]),
        },
      ],
      // Fade out as it expands
      opacity: interpolate(animationValue.value, [0, 0.7, 1], [0.5, 0.3, 0]),
    };
  });

  return (
    <View style={styles.container}>
      {/* 1. The Pulsing Ring (Animated) */}
      <Animated.View style={[styles.pulseRing, animatedStyle]} />

      {/* 2. The Static Outer Circle (matches your image) */}
      <View style={styles.outerCircle} />

      {/* 3. The Main Center Button */}
      <View style={styles.centerButton}>
        <Ionicons name="navigate" size={18} color="white" />
      </View>
    </View>
  );
};

export const MarkerUser = () => {
  return (
    <View style={styles.markerUser}>
      <Ionicons name="man" size={20} color="white" />
    </View>
  );
};

export const MarkerTriangle = () => {
  return (
    <View style={styles.dropoffContainer}>
      <Entypo
        style={{
          backgroundColor: "#fff",

          borderRadius: 100,
        }}
        name="triangle-down"
        size={25}
        color="#6662FF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropoffContainer: {
    padding: scale(20),
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.main,
    backgroundColor: "#4500FF52",
  },

  markerUser: {
    backgroundColor: "#6366F1",
    padding: moderateScale(8),
    borderRadius: 200,
    borderWidth: 2,
    borderColor: colors.main,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    height: 100,
  },
  pulseRing: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6662FF",
  },
  outerCircle: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(69, 0, 255, 0.15)", // The #4500FF52 from your code
    borderWidth: 1,
    borderColor: "rgba(102, 98, 255, 0.3)",
  },
  centerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6662FF",
    justifyContent: "center",
    alignItems: "center",
    // Adding shadow to match the 'elevated' look in the images
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});
