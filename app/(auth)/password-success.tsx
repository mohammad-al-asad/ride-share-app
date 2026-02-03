import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageBackground } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const PasswordSuccess: React.FC = () => {
  const { title } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <AuthBackground />

      <ImageBackground
        source={require("../../assets/images/tik-bg.svg")}
        style={{
          top: 0,
          width: 100,
          height: 100,
          justifyContent: "center",
          alignItems: "center",
          marginHorizontal: "auto",
          marginBottom: 10,
        }}
        contentFit="contain"
      >
        <Image
          source={require("../../assets/images/tik.svg")}
          style={{ top: 0, width: 52, height: 52 }}
          contentFit="contain"
        />
      </ImageBackground>

      <View style={styles.inner}>
        <Text style={styles.heading}>{title}</Text>
        <Text style={styles.description}>
          Return to the login page to enter your account with your new password
        </Text>
      </View>
      {title !== "Successfully Set Password!" ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Ionicons name="chevron-back" size={20} color={colors.main} />
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      ) : (
        <CustomButton
          type="main"
          text="Next"
          onClick={() => router.replace("/(auth)/login")}
        />
      )}
    </View>
  );
};

export default PasswordSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  inner: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  heading: {
    fontSize: moderateScale(28),
    fontWeight: 500,
    marginBottom: verticalScale(12),
    color: "#000",
    textAlign: "center",
  },

  description: {
    width: scale(250),
    fontSize: moderateScale(13),
    color: colors.secondaryText,
    textAlign: "center",
    marginBottom: verticalScale(20),
    marginHorizontal: "auto",
    lineHeight: moderateScale(18),
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 4,
  },
  backText: {
    color: colors.main,
    fontSize: 15,
    fontWeight: "600",
  },
});
