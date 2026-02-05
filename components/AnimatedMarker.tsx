import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const MarkerCircle = ({ ...props }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(progress.value, [0, 1], [1, 3]),
        },
      ],
      opacity: interpolate(progress.value, [0, 0.7, 1], [0.5, 0.3, 0]),
    };
  });

  return (
    <Marker.Animated {...props}>
      <View style={styles.container}>
        {/* Pulsing Ring */}
        <Animated.View style={[styles.pulseRing, pulseStyle]} />

        {/* Outer Static Circle */}
        <View style={styles.outerCircle} />

        {/* Center Dot */}
        <View style={styles.centerButton}>
          <Ionicons name="navigate" size={18} color="white" />
        </View>
      </View>
    </Marker.Animated>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: "rgba(69, 0, 255, 0.15)",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});
