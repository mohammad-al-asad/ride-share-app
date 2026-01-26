import AuthBackground from "@/components/AuthBackground";
import { colors } from "@/config/colors";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomButton from "../../components/CustomButton";
import { CustomInput } from "../../components/CustomInput";

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = () => {
    console.log("Login pressed");
  };

  const handleGoogleLogin = () => {
    console.log("Google login pressed");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AuthBackground />
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
        <CustomInput icon="mail-outline" placeholder="Email" />

        <Text style={styles.label}>Password</Text>
        <CustomInput
          icon="lock-closed-outline"
          placeholder="Password"
          isPassword
        />

        <TouchableOpacity
          style={styles.forgotPass}
          onPress={() => router.push("/(auth)/forgot")}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Replaced with CustomButton */}
        <CustomButton type="primary" text="Login" onClick={handleLogin} />

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
            style={{ width: 20, height: 20, marginRight: 10 }}
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
  googleText: { color: "black", fontSize: 16, fontWeight: "500" },
  footer: { flexDirection: "row", marginTop: 15, marginBottom: 15 },
  footerText: { color: "#777" },
  linkText: { color: colors.main, fontWeight: "700" },
});
