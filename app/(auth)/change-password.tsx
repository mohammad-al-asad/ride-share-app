import AuthBackground from "@/components/AuthBackground";
import { colors } from "@/config/colors";
import { useChangePasswordMutation } from "@/redux/api/authApi";
import { changePasswordSchema, ChangePasswordType } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomButton from "../../components/CustomButton";
import { CustomInput } from "../../components/CustomInput";

export default function SetPasswordFormScreen() {
  const router = useRouter();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordType>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const setPassword = handleSubmit(async (values) => {
    try {
      const response = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();

      Alert.alert("Success", response?.data?.message ?? "Password changed", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        "Failed to change password.";
      Alert.alert("Update failed", message);
      console.log("Change password failed:", err);
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

      <Text style={styles.title}>Change Password</Text>
      <Text style={styles.subtitle}>
        Set a new password and continue using this app.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Current Password</Text>
        <Controller
          control={control}
          name="currentPassword"
          render={({ field: { onBlur, onChange, value } }) => (
            <CustomInput
              icon="lock-closed-outline"
              placeholder="Current password"
              isPassword
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.currentPassword?.message}
              autoCapitalize="none"
            />
          )}
        />
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

        {/* Replaced with CustomButton */}
        <CustomButton
          type="main"
          text={isLoading ? "Changing..." : "Change Password"}
          onClick={setPassword}
          isLoading={isLoading}
        />
        <TouchableOpacity
          style={styles.backButton}
          disabled={isLoading}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color={colors.main} />
          <Text style={styles.backText}>Back to profile</Text>
        </TouchableOpacity>
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
