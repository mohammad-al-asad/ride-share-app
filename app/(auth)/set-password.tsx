import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function SetPasswordScreen() {
  const router = useRouter();
  const { resetToken } = useLocalSearchParams();

  return (
    <View style={styles.mainContainer}>
      {/* Background Grid */}
      <AuthBackground />

      <View style={styles.container}>
        {/* Illustration Section */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(800)}
          style={styles.illustrationContainer}
        >
          <Image
            source={require("../../assets/images/VerifySucsess.svg")}
            style={styles.illustration}
            contentFit="contain"
          />
        </Animated.View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Set Password</Text>
          <Text style={styles.subtitle}>
            Please set a new password. To set a new password press on
            continue...
          </Text>
        </View>

        {/* Action Button */}
        <View style={styles.buttonWrapper}>
          <CustomButton
            type="main"
            text="Next"
            onClick={() => {
              router.replace({
                pathname: "/(auth)/set-password-form",
                params: {
                  resetToken,
                },
              });
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  illustrationContainer: {
    width: width * 0.6,
    height: width * 0.5,
    marginBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  buttonWrapper: {
    width: "100%",
  },
});
