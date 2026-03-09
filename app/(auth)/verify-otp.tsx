import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import {
  useSendVerificationMutation,
  useVerifyEmailMutation,
} from "@/redux/api/authApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
  const [sendVerification, { isLoading: isResending }] =
    useSendVerificationMutation();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const { path, email } = useLocalSearchParams<{
    path?: string;
    email?: string;
  }>();
  const emailValue = Array.isArray(email) ? email[0] : email;

  const verify = async () => {
    if (!emailValue) {
      Alert.alert("Missing email", "Please go back and enter your email again.");
      return;
    }
    if (otp.length !== 4) {
      Alert.alert("Invalid OTP", "Please enter the 4-digit OTP code.");
      return;
    }

    try {
      const response = await verifyEmail({
        email: emailValue,
        otp,
      }).unwrap();

      Alert.alert(
        "Success",
        response?.data?.message ?? "Email verified",
        [
          {
            text: "OK",
            onPress: () => {
              if (path) {
                if (emailValue) {
                  router.replace({
                    pathname: path as any,
                    params: { email: emailValue },
                  } as any);
                } else {
                  router.replace(path as any);
                }
                return;
              }
              router.replace("/(auth)/login");
            },
          },
        ],
        { cancelable: false },
      );
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        "Invalid or expired OTP";
      Alert.alert("Verification failed", message);
      console.log("Verify email failed:", err);
    }
  };

  const resendOtp = async () => {
    if (!emailValue) {
      Alert.alert("Missing email", "Please go back and enter your email again.");
      return;
    }

    try {
      const response = await sendVerification({ email: emailValue }).unwrap();
      Alert.alert("OTP sent", response?.data?.message ?? "Verification code sent.");
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        "Failed to resend verification code.";
      Alert.alert("Error", message);
      console.log("Resend verification failed:", err);
    }
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
          We sent OTP code to your email {emailValue ?? "example@gmail.com"}. Enter
          the code below to verify.
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
      <CustomButton
        type="main"
        text={isVerifying ? "Verifying..." : "Verify"}
        onClick={verify}
        isDisable={isVerifying}
      />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't receive OTP? </Text>
        <TouchableOpacity onPress={resendOtp} disabled={isResending}>
          <Text style={styles.linkText}>
            {isResending ? "Sending..." : "Resend again"}
          </Text>
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
