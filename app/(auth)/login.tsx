import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import { useLoginMutation } from "@/redux/api/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { persistCredentials } from "@/redux/slices/authSlice";
import { loginSchema, LoginType } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CustomInput } from "../../components/CustomInput";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const isIOS = Platform.OS === "ios";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await login(values).unwrap();
      const { accessToken, refreshToken, user } = response.data;

      await dispatch(
        persistCredentials({
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token: accessToken,
          refreshToken,
        }),
      ).unwrap();

      router.replace("/(protected)/(tab)");
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        "Login failed. Please try again.";
      Alert.alert("Login failed", message);
      console.log("Login failed:", err);
    }
  });

  const handleGoogleLogin = () => {
    console.log("Google login pressed");
  };

  return (
    <View style={styles.mainContainer}>
      <AuthBackground />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={isIOS ? "padding" : "height"}
        keyboardVerticalOffset={0}
        enabled
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={isIOS ? "interactive" : "on-drag"}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../../assets/images/logo-blue.svg")}
            style={styles.logo}
            contentFit="contain"
          />

          <Text style={styles.title}>Welcome Back !</Text>
          <Text style={styles.subtitle}>
            To login, enter your email address and password.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onBlur, onChange, value } }) => (
                <CustomInput
                  icon="mail-outline"
                  placeholder="Email"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              )}
            />

            <Text style={styles.label}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onBlur, onChange, value } }) => (
                <CustomInput
                  icon="lock-closed-outline"
                  placeholder="Password"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  isPassword
                  autoCapitalize="none"
                />
              )}
            />

            <TouchableOpacity
              style={styles.forgotPass}
              onPress={() => router.push("/(auth)/forgot")}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <CustomButton
              type="main"
              text={isLoading ? "Logging in..." : "Login"}
              onClick={onSubmit}
              isDisable={isLoading}
            />

            <View style={styles.dividerArea}>
              <View style={styles.line} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity
              onPress={handleGoogleLogin}
              style={[styles.googleBtn, { backgroundColor: "white" }]}
            >
              <Image
                source={require("@/assets/icons/Google.svg")}
                style={styles.googleIcon}
              />
              <Text style={styles.googleText}>Continue With Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
              <Text style={styles.linkText}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 35,
    paddingBottom: 30,
    alignItems: "center",
  },
  logo: { width: 200, height: 140, marginTop: 20, marginBottom: 10 },
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
  forgotPass: { alignSelf: "flex-end", marginBottom: 20 },
  forgotText: { color: colors.main, fontWeight: "600" },
  dividerArea: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  line: { flex: 1, height: 1, backgroundColor: "#000" },
  orText: { marginHorizontal: 10, color: "#000", fontSize: 12 },
  googleBtn: {
    flexDirection: "row",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    width: "100%",
  },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  googleText: { color: "black", fontSize: 16, fontWeight: "500" },
  footer: { flexDirection: "row", marginTop: 15, marginBottom: 15 },
  footerText: { color: "#777" },
  linkText: { color: colors.main, fontWeight: "700" },
});
