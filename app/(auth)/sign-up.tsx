import CustomButton from "@/components/CustomButton";
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
import { CustomInput } from "../../components/CustomInput";
import AuthBackground from "@/components/AuthBackground";

export default function SignUpScreen() {
  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      {/* Background stays static while content scrolls */}
      <AuthBackground />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
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
          <CustomInput icon="person-outline" placeholder="Full name" />

          <Text style={styles.label}>Email</Text>
          <CustomInput icon="mail-outline" placeholder="Email" />

          <Text style={styles.label}>Password</Text>
          <CustomInput
            icon="lock-closed-outline"
            placeholder="Password"
            isPassword
          />

          <View style={styles.buttonSpacer}>
            <CustomButton
              type="main"
              text="Sign Up"
              onClick={() => {
                router.push({
                  pathname: "/(auth)/verify-otp",
                  params: {
                    path: "/(auth)/verify-sucess",
                  },
                });
              }}
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
    paddingHorizontal: 25,
    paddingTop: 80,
    paddingBottom: 30,
    alignItems: "center",
  },
  logo: { 
    width: 200, 
    height: 140, 
    marginTop: 20, 
    marginBottom: 10 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "700", 
    color: "#1A1A1A",
    marginBottom: 8 
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 35,
    paddingHorizontal: 10,
  },
  form: { 
    width: "100%" 
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
    alignItems: "center" 
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