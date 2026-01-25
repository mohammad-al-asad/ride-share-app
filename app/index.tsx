import {
  Trispace_400Regular,
  Trispace_700Bold,
  useFonts,
} from "@expo-google-fonts/trispace";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({ Trispace_700Bold, Trispace_400Regular });
  const stage = useSharedValue(0); // 0 = Splash1, 1 = Splash2, 2 = Splash3
  const isAuthenticated = true;
  const router = useRouter();

  useEffect(() => {
    if (fontsLoaded) {
      // Splash1 → Splash2
      stage.value = withDelay(
        100,
        withTiming(
          1,
          { duration: 100, easing: Easing.out(Easing.cubic) },
          () => {
            // Splash2 → Splash3
            stage.value = withDelay(
              2000,
              withTiming(2, {
                duration: 100,
                easing: Easing.out(Easing.cubic),
              }),
            );
          },
        ),
      );
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Background color
  const containerStyle = useAnimatedStyle(() => ({
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: interpolateColor(
      stage.value,
      [0, 1, 2],
      ["#1a008a", "#1a008a", "#FFFFFF"],
    ),
  }));

  // Logo animation
  const logoStyle = useAnimatedStyle(() => ({
    opacity:
      stage.value === 0
        ? withTiming(0)
        : stage.value === 1
          ? withTiming(1)
          : 0.3,
    transform: [{ scale: stage.value === 2 ? withTiming(3) : 1 }],
    position: stage.value > 1 ? (withTiming("absolute") as any) : "relative",
    width: 180,
    height: 180,
  }));

  // MA3 text animation (only shows in stage 2 / Splash3)
  const ma3Style = useAnimatedStyle(() => ({
    opacity: stage.value === 2 ? withTiming(1) : 0,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "Trispace_700Bold",
    fontSize: 36,
    color: "#1a008a",
  }));

  // Slogan text animation (always below logo)
  const sloganStyle = useAnimatedStyle(() => ({
    opacity: stage.value > 0 ? withTiming(1, { duration: 2000 }) : 0,
    color: stage.value === 2 ? "#1a008a" : "#FFD700",
    textAlign: "center",
  }));

  // Buttons animation
  const buttonStyle = useAnimatedStyle(() => ({
    opacity: stage.value === 2 ? withTiming(1) : 0,
    transform: [
      { translateY: stage.value === 2 ? withTiming(0) : withTiming(50) },
    ],
  }));
  useAnimatedReaction(
    () => stage.value,
    (currentStage) => {
      if (currentStage === 2 && isAuthenticated) {
        runOnJS(router.replace)("/home");
      }
    },
  );

  if (!fontsLoaded) return null;
  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Background Logo */}
      <Animated.Image
        source={require("../assets/images/icon.png")}
        style={logoStyle}
        resizeMode="contain"
      />

      {/* Text */}
      <View style={{ alignItems: "center" }}>
        {/* MA3 (only appears in Splash3) */}
        <Animated.Text style={ma3Style}>MA3</Animated.Text>

        {/* Slogan (always below logo) */}
        <Animated.Text style={[styles.slogan, sloganStyle]}>
          VETERAN RIDERSHARE{"\n"}PURSUIT FOR PERFECTION
        </Animated.Text>
      </View>

      {/* Buttons */}
      {!isAuthenticated && (
        <Animated.View style={[styles.buttonArea, buttonStyle]}>
          <TouchableOpacity style={styles.loginBtn}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineBtn}>
            <Text style={styles.outlineText}>Create an Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineBtn}>
            <Text style={styles.outlineText}>Continue With Google</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },

  slogan: {
    fontFamily: "Trispace_400Regular",
    fontSize: 16,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  buttonArea: { width: "85%", alignItems: "center", marginTop: 30 },

  loginBtn: {
    backgroundColor: "#1a008a",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  loginText: {
    color: "#FFF",
    fontSize: 16,
  },

  outlineBtn: {
    backgroundColor: "#F8F9FA",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    width: "100%",
  },
  outlineText: {
    color: "#333",
    fontSize: 14,
  },
});
