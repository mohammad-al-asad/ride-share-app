import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const VerifyOtpScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const retry = () => {
    router.replace({
      pathname: "/(auth)/verify-otp",
      params: {
        email: params.email,
        path: params.path,
      },
    });
  };

  return (
    <View style={styles.container}>
      <AuthBackground />

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginHorizontal: "auto",
          marginBottom: 20,
        }}
      >
        <Image
          source={require("../../assets/images/tik-fail.svg")}
          style={{ top: 0, width: 52, height: 52 }}
          contentFit="contain"
        />
      </View>

      <View style={styles.inner}>
        <Text style={styles.heading}>Error !</Text>
        <Text style={styles.description}>
          You have input wrong code, please try again.
        </Text>
      </View>
      <CustomButton type="destructive" text="Retry" onClick={retry} />
    </View>
  );
};

export default VerifyOtpScreen;

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
