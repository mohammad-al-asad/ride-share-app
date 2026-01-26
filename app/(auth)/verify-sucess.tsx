import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import { Image, ImageBackground } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const VerifySuccess: React.FC = () => {
  const next = () => {
    router.replace("/(auth)/role");
  };

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
        <Text style={styles.heading}>Successfully Verified</Text>
        <Text style={styles.description}>
          Your email is verified. Now fill the important data to complete
          finishing your profile setup.
        </Text>
      </View>
      <CustomButton type="main" text="Next" onClick={next} />
    </View>
  );
};

export default VerifySuccess;

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
});
