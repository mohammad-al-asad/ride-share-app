import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AddPhotoScreen() {
  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      {/* Background Grid */}
      <AuthBackground />

      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipContainer}
        onPress={() => router.replace("/(protected)" as any) }
      >
        <Text style={styles.skipText}>SKIP</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Add your Photo</Text>
          <Text style={styles.subtitle}>
            Upload your own photo, so that driver can easily recognize you.
          </Text>

          {/* Profile Placeholder */}
          <View style={styles.imagePickerContainer}>
            <View style={styles.profileCircle}>
              <Ionicons name="person-outline" size={80} color="#000" />
            </View>
            <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.buttonWrapper}>
          <CustomButton
            type="main"
            text="Get Started"
            onClick={() => {
              router.replace("/(protected)" as any);
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  skipContainer: {
    position: "absolute",
    top: 60,
    left: 25,
    zIndex: 10,
  },
  skipText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    letterSpacing: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  content: {
    alignItems: "center",
    width: "100%",
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  imagePickerContainer: {
    position: "relative",
    marginTop: 20,
  },
  profileCircle: {
    backgroundColor: "#fff",
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#A6AFFF",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#F8F9FB",
  },
  buttonWrapper: {
    width: "100%",
  },
});
