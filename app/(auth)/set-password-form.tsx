import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { useResetPasswordMutation } from "@/redux/api/authApi";
import { resetPasswordSchema, ResetPasswordType } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { CustomInput } from "../../components/CustomInput";

export default function SetPasswordFormScreen() {
  const router = useRouter();
  const { resetToken: resetTokenParam } = useLocalSearchParams<{
    resetToken?: string | string[];
  }>();
  const resetToken = Array.isArray(resetTokenParam)
    ? resetTokenParam[0]
    : resetTokenParam;
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const setPassword = handleSubmit(async (values) => {
    if (!resetToken) {
      Alert.alert(
        "Missing reset token",
        "Please verify OTP again to continue resetting your password.",
      );
      router.replace("/(auth)/forgot");
      return;
    }

    try {
      const response = await resetPassword({
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
        resetToken,
      }).unwrap();

      router.replace({
        pathname: "/(auth)/password-success",
        params: {
          title: "Successfully Set Password!",
        },
      });
      
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        "Failed to reset password. Please try again.";
      Alert.alert("Update failed", message);
      console.log("Reset password failed:", err);
    }
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AuthBackground />
      <Image
        source={require("../../assets/images/logo-blue.svg")}
        style={styles.logo}
        contentFit="contain"
      />

      <Text style={styles.title}>New Password</Text>
      <Text style={styles.subtitle}>
        Set a new password and continue using this app.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>New Password</Text>
        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onBlur, onChange, value } }) => (
            <CustomInput
              icon="lock-closed-outline"
              placeholder="New password"
              isPassword
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.newPassword?.message}
              autoCapitalize="none"
            />
          )}
        />
        <Text style={styles.label}>Confirm Password</Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onBlur, onChange, value } }) => (
            <CustomInput
              icon="lock-closed-outline"
              placeholder="Confirm password"
              isPassword
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
              autoCapitalize="none"
            />
          )}
        />

        <CustomButton
          type="main"
          text={isLoading ? "Please wait..." : "Next"}
          onClick={setPassword}
          isLoading={isLoading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8F9FB",
    padding: 25,
    paddingTop: 70,
    alignItems: "center",
  },
  logo: { width: 220, height: 150, marginTop: 40, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "700", color: "#333", marginBottom: 8 },
  subtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 30,
  },
  form: { width: "100%" },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    marginLeft: 2,
  },
});
