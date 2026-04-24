import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import {
  useSendVerificationMutation,
  useVerifyEmailMutation,
  useVerifyResetOtpMutation,
} from "@/redux/api/authApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { persistCredentials } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const dispatch = useAppDispatch();
  const existingUser = useAppSelector((state: RootState) => state.auth.user);
  const [sendVerification, { isLoading: isResending }] =
    useSendVerificationMutation();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [verifyResetOtp, { isLoading: isVerifyingReset }] =
    useVerifyResetOtpMutation();
  const { path, email } = useLocalSearchParams<{
    path?: string;
    email?: string;
  }>();
  const emailValue = Array.isArray(email) ? email[0] : email;
  const isResetFlow = path === "/(auth)/set-password";

  useEffect(() => {
    if (!emailValue) {
      Alert.alert(
        "Missing email",
        "Please go back and enter your email again.",
      );
      return;
    }
  }, []);

  async function verifyEmailFn() {
    const response = await verifyEmail({
      email: emailValue,
      otp,
    }).unwrap();

    const token = response?.data?.accessToken;
    const refreshToken = response?.data?.refreshToken;
    const user = response?.data?.user;

    if (token && refreshToken) {
      await dispatch(
        persistCredentials({
          user: {
            id: user?._id ?? existingUser?.id,
            name: user?.name ?? existingUser?.name,
            email: user?.email ?? existingUser?.email,
            phone: user?.phone ?? existingUser?.phone,
            role: user?.role ?? existingUser?.role,
            profileImage: user?.profileImage ?? existingUser?.profileImage,
            emailVerifiedAt:
              user?.emailVerifiedAt ?? existingUser?.emailVerifiedAt ?? null,
          },
          token,
          refreshToken,
        }),
      ).unwrap();
    }

    router.replace({
      pathname: path as any,
      params: { email: emailValue },
    } as any);
  }

  async function verifyResetOtpFn() {
    const response = await verifyResetOtp({
      email: emailValue,
      otp,
    }).unwrap();
    const resetToken = response?.data?.resetToken;
    if (resetToken) {
      router.replace({
        pathname: path as any,
        params: { resetToken },
      } as any);
    }
  }

  const verify = async () => {
    if (otp.length !== 4) {
      Alert.alert("Invalid OTP", "Please enter the 4-digit OTP code.");
      return;
    }

    try {
      if (isResetFlow) {
        verifyResetOtpFn();
      } else {
        verifyEmailFn();
      }
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        "Invalid or expired OTP";
      router.replace({
        pathname: "/(auth)/verify-fail",
        params: {
          email: emailValue,
          message: message,
          path,
        },
      });
      console.log("Verify email failed:", err);
    }
  };

  const resendOtp = async () => {
    if (!emailValue) {
      Alert.alert(
        "Missing email",
        "Please go back and enter your email again.",
      );
      return;
    }

    try {
      const response = await sendVerification({ email: emailValue }).unwrap();
      console.log("resend", response);
      
      Alert.alert(
        "OTP sent",
        response?.data?.message ?? "Verification code sent.",
      );
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
          We sent OTP code to your email {emailValue ?? "example@gmail.com"}.
          Enter the code below to verify.
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
        text="Verify"
        onClick={verify}
        isLoading={isVerifying || isVerifyingReset}
      />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don&apos;t receive OTP? </Text>
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
