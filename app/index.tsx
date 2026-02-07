import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loadCredentials } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store";
import {
  Trispace_400Regular,
  Trispace_700Bold,
  Trispace_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/trispace";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useLayoutEffect } from "react";
// Added ImageBackground to imports
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

export default function App() {
  const [fontsLoaded] = useFonts({
    Trispace_700Bold,
    Trispace_400Regular,
    Trispace_800ExtraBold,
  });

  const stage = useSharedValue(0);
  const router = useRouter();
  const token = useAppSelector((state: RootState) => state.auth.token);
  let isAuthenticated = token ? true : false;
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    dispatch(loadCredentials());
    setTimeout(() => {
      if (isAuthenticated) router.replace("/(protected)/(tab)");
    }, 2500);
  }, [isAuthenticated]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      stage.value = withDelay(
        1000,
        withTiming(
          1,
          { duration: 200, easing: Easing.out(Easing.cubic) },
          () => {
            stage.value = withDelay(
              3000,
              withTiming(2, {
                duration: 0,
                easing: Easing.out(Easing.cubic),
              }),
            );
          },
        ),
      );
    }
  }, [fontsLoaded]);

  const containerStyle = useAnimatedStyle(() => ({
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: interpolateColor(
      stage.value,
      [0, 1, 2],
      [colors.main, colors.main, "#FFFFFF"],
    ),
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity:
      stage.value === 0
        ? 0
        : stage.value === 1
          ? withTiming(1, { duration: 1000 })
          : withTiming(0.3),
    transform: [{ scale: stage.value !== 2 ? 1 : withTiming(3) }],
    position: stage.value > 1 ? "absolute" : "relative",
    width: 220,
    height: 150,
    top: stage.value === 2 ? 280 : 0,
  }));

  const ma3Style = useAnimatedStyle(() => ({
    opacity: stage.value === 2 ? withTiming(1) : 0,
    display: stage.value === 2 ? withTiming("flex") : "none",
    textAlign: "center",
    fontFamily: "Trispace_700Bold",
    fontSize: 60,
    color: colors.main,
  }));

  const sloganStyle = useAnimatedStyle(() => ({
    opacity: stage.value === 0 ? 0 : withTiming(1, { duration: 1000 }),
    color: stage.value === 2 ? withTiming(colors.main) : "#FFD700",
    textAlign: "center",
    marginTop: stage.value === 2 ? 0 : 10,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: stage.value === 2 ? withTiming(1, { duration: 1000 }) : 0,
    transform: [
      {
        translateY:
          stage.value === 2
            ? withTiming(0, { duration: 1000 })
            : withTiming(50),
      },
    ],
  }));

  if (!fontsLoaded) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <StatusBar hidden />
      {/* Main Content */}
      <Animated.Image
        source={require("../assets/images/logo-golden.png")}
        style={[logoStyle, { marginTop: 0 }]}
        resizeMode="contain"
      />

      <View style={{ alignItems: "center" }}>
        <Animated.Text style={ma3Style}>MA3</Animated.Text>
        <Animated.Text style={[styles.slogan, sloganStyle]}>
          VETERAN RIDERSHARE{"\n"}PURSUIT FOR PERFECTION
        </Animated.Text>
      </View>

      {!isAuthenticated && (
        <Animated.View style={[styles.buttonArea, buttonStyle]}>
          <CustomButton
            onClick={() => router.replace("/(auth)/login")}
            type="main"
            text="Login"
          />
          <CustomButton
            type="outline"
            text="Create an Account"
            onClick={() => router.replace("/(auth)/sign-up")}
          />

          <TouchableOpacity style={styles.googleBtn}>
            <Image
              style={{ width: 24, height: 24 }}
              source={require("../assets/icons/Google.svg")}
            />
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
    fontFamily: "Trispace_800ExtraBold",
    fontSize: 16,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  buttonArea: { width: "85%", alignItems: "center", marginTop: 30 },
  googleBtn: {
    backgroundColor: "#F8F9FA",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  outlineText: {
    color: "#333",
    fontSize: 14,
  },
});
