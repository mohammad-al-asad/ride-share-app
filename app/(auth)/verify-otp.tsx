import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const VerifyOtpScreen: React.FC = () => {
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const { path } = useLocalSearchParams();
  const verify = () => {
    router.replace(path as any);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <AuthBackground />
      <View style={styles.inner}>
        <Text style={styles.heading}>Verify Code</Text>
        <Text style={styles.description}>
          We Sent OTP code to your email example@gmail.com. Enter the code below
          to verify.
        </Text>

        <OtpInput
          numberOfDigits={4}
          autoFocus={true}
          onFilled={(code) => setOtp(code)}
          focusColor={colors.main}
          theme={{
            pinCodeContainerStyle: styles.otpBox,
            containerStyle: { marginBottom: scale(12) },
          }}
        />
      </View>
      <CustomButton type="main" text="Verify" onClick={verify} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don’t receive OTP? </Text>
        <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
          <Text style={styles.linkText}>Resend again</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  otpBox: {
    width: scale(50),
    height: verticalScale(55),
    borderWidth: 2,
    borderColor: "#DAD6FF",
    borderRadius: 10,
  },
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { color: colors.secondaryText },
  linkText: { color: colors.main, fontWeight: "700" },
});
