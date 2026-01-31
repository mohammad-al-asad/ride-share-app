import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const INSTRUCTIONS = [
  "Face the camera directly with your eyes and mouth clearly visible",
  "make sure the photo is well lit, free of glare, and in focus",
  "No photos of a photo, filters, or alterations",
  "Example image is given below for better understanding",
];

export default function TakeProfilePhotoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <AuthBackground />

      <View style={styles.scrollContent}>
        <Text style={styles.headerTitle}>Take your profile photo</Text>

        {/* Instructions List */}
        <View style={styles.instructionContainer}>
          {INSTRUCTIONS.map((text, index) => (
            <View key={index} style={styles.instructionRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.instructionText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Example Image Preview */}
        <View style={styles.imagePreviewContainer}>
          <Image
            source={require("@/assets/images/demo-profile.png")}
            style={styles.sampleImage}
            contentFit="contain"
          />
        </View>

        {/* Action Button */}
        <View style={styles.buttonWrapper}>
          <CustomButton
            text="Take Photo"
            onClick={() => {
              // Handle camera logic here
              //   router.push("/camera-view");
            }}
            type="main"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
    paddingTop: verticalScale(20),
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(30),
  },
  headerTitle: {
    fontSize: moderateScale(24),
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: verticalScale(15),
  },
  instructionContainer: {
    marginBottom: verticalScale(30),
  },
  instructionRow: {
    flexDirection: "row",
    marginBottom: verticalScale(8),
    paddingRight: scale(10),
  },
  bullet: {
    fontSize: moderateScale(14),
    color: "#4B5563",
    marginRight: scale(8),
    lineHeight: moderateScale(20),
  },
  instructionText: {
    fontSize: moderateScale(13),
    color: "#4B5563",
    lineHeight: moderateScale(20),
    flex: 1,
  },
  imagePreviewContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(40),
  },
  sampleImage: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    width: scale(200),
    height: scale(200),
    borderRadius: scale(4),
  },
  buttonWrapper: {
    marginTop: "auto",
  },
});
