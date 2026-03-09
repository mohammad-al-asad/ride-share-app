import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import {
  useRegisterMutation,
  useSendVerificationMutation,
} from "@/redux/api/authApi";
import { registerSchema, RegisterType } from "@/schemas/authSchema";
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

export default function SignUpScreen() {
  const router = useRouter();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [sendVerification, { isLoading: isSendingOtp }] =
    useSendVerificationMutation();
  const isIOS = Platform.OS === "ios";
  const isSubmitting = isRegistering || isSendingOtp;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await register({
        ...values,
        role: "driver",
      }).unwrap();
      await sendVerification({
        email: values.email,
      }).unwrap();

      router.push({
        pathname: "/(auth)/verify-otp",
        params: {
          email: values.email,
          path: "/(auth)/verify-sucess",
        },
      });
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        "Failed to continue signup. Please try again.";
      Alert.alert("Error", message);
      console.log("Registration failed:", err);
    }
  });

  return (
    <View style={styles.mainContainer}>
      {/* Background stays static while content scrolls */}
      <AuthBackground />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={isIOS ? "padding" : "height"}
        keyboardVerticalOffset={0}
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

          <Text style={styles.title}>Create an Account !</Text>
          <Text style={styles.subtitle}>
            Sign up to experience everything we have to offer.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onBlur, onChange, value } }) => (
                <CustomInput
                  icon="person-outline"
                  placeholder="Full name"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.name?.message}
                  autoCapitalize="words"
                />
              )}
            />

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

            <Text style={styles.label}>Phone</Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onBlur, onChange, value } }) => (
                <CustomInput
                  icon="call-outline"
                  placeholder="01XXXXXXXXX"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.phone?.message}
                  keyboardType="phone-pad"
                />
              )}
            />

            <View style={styles.buttonSpacer}>
              <CustomButton
                type="main"
                text={isSubmitting ? "Please wait..." : "Sign Up"}
                onClick={onSubmit}
                isDisable={isSubmitting}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text style={styles.linkText}>Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing you are agree to our{" "}
              <Text style={styles.termsLink}>Terms of Services</Text>
              {"\n"}& <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
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
  logo: {
    width: 200,
    height: 140,
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 35,
    paddingHorizontal: 10,
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginLeft: 4,
  },
  buttonSpacer: {
    marginTop: 15,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  linkText: {
    color: colors.main,
    fontWeight: "700",
    fontSize: 14,
  },
  termsContainer: {
    marginTop: 20,
    width: "100%",
  },
  termsText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  termsLink: {
    color: colors.main,
    textDecorationLine: "none", // Matches image more closely
    fontWeight: "500",
  },
});
