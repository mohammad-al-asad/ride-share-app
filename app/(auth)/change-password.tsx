import AuthBackground from "@/components/AuthBackground";
import { colors } from "@/config/colors";
import { Ionicons } from "@expo/vector-icons";
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

export default function SetPasswordFormScreen() {
  const router = useRouter();

  const setPassword = () => {
    router.replace({
      pathname: "/(auth)/login",
    });
  };

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
        <CustomInput
          icon="lock-closed-outline"
          placeholder="Password"
          isPassword
        />
        <Text style={styles.label}>New Password</Text>
        <CustomInput
          icon="lock-closed-outline"
          placeholder="Password"
          isPassword
        />
        <Text style={styles.label}>Confirm Password</Text>
        <CustomInput
          icon="lock-closed-outline"
          placeholder="Password"
          isPassword
        />

        {/* Replaced with CustomButton */}
        <CustomButton type="primary" text="Next" onClick={setPassword} />
        <TouchableOpacity
          style={styles.backButton}
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
