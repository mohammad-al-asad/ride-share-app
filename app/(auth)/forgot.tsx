import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CustomInput } from "../../components/CustomInput";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      {/* Background Grid */}
      <AuthBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Forgot Password !</Text>
          <Text style={styles.subtitle}>
            Enter your email to reset password.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <CustomInput icon="mail-outline" placeholder="Email" />

            <View style={styles.buttonSpacer}>
              <CustomButton
                type="main"
                text="Next"
                onClick={() => {
                  router.push({
                    pathname: "/(auth)/verify-otp",
                    params: {
                      path: "/(auth)/change-password",
                    },
                  });
                }}
              />
            </View>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={20} color={colors.main} />
              <Text style={styles.backText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  content: {
    alignItems: "center",
    width: "100%",
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
    marginTop: 10,
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
