import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const { width } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Background Grid Pattern */}
      <AuthBackground />

      <View style={styles.content}>
        {/* Branding Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo-blue.svg")}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Earn with MA3</Text>
          <Text style={styles.description}>
            We&apos;re excited to have you onboard. Please note that our app is
            currently only available for use in DFW (Dallas-Fort Worth) Texas.
          </Text>
        </View>

        {/* Action Button */}
        <CustomButton
          text="Next"
          onClick={() => router.push("/(driver)/select-car")}
          type="main"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(30),
  },
  logoContainer: {
    marginBottom: verticalScale(40),
  },
  logo: {
    width: scale(180),
    height: verticalScale(120),
  },
  textContainer: {
    alignItems: "center",
    marginBottom: verticalScale(40),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: verticalScale(12),
  },
  description: {
    fontSize: moderateScale(13),
    color: "#4B5563",
    textAlign: "center",
    lineHeight: moderateScale(20),
  },
  nextButton: {
    backgroundColor: colors.main,
    width: "100%",
    height: verticalScale(55),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: verticalScale(50),
  },
  nextButtonText: {
    color: "#FBBF24", // Golden yellow text
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
});
