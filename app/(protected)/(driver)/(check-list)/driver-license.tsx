import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

// Reusable Upload Card Component
const UploadCard = ({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) => (
  <View style={styles.uploadCard}>
    <Text style={styles.uploadTitle}>{title}</Text>
    <TouchableOpacity style={styles.uploadSmallButton} onPress={onPress}>
      <Text style={styles.uploadButtonText}>Upload photo</Text>
    </TouchableOpacity>
  </View>
);

export default function DriverLicenseUploadScreen() {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  const isDoneEnabled = frontImage && backImage;

  return (
    <SafeAreaView style={styles.container}>
      <AuthBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Take a photo of your Driver License
          </Text>
          <Text style={styles.subTitle}>
            Please make sure we can easily read all the details.
          </Text>
        </View>

        {/* Upload Sections */}
        <UploadCard
          title="Upload front-side"
          onPress={() => {
            /* Add Image Picker Logic */
          }}
        />

        <UploadCard
          title="Upload back-side"
          onPress={() => {
            /* Add Image Picker Logic */
          }}
        />

        {/* Action Button */}
        <View style={styles.buttonWrapper}>
          <CustomButton
            text="Done"
            onClick={() => {}}
            type="main"
            isDisable={!isDoneEnabled}
          />
        </View>
      </ScrollView>
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
  header: {
    marginBottom: verticalScale(25),
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#1A1A1A",
    lineHeight: moderateScale(28),
  },
  subTitle: {
    fontSize: moderateScale(13),
    color: "#4B5563",
    marginTop: verticalScale(8),
  },
  uploadCard: {
    height: verticalScale(140),
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderStyle: "dashed", // Dashed border as per design
    borderRadius: scale(12),
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  uploadTitle: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: verticalScale(12),
  },
  uploadSmallButton: {
    backgroundColor: "#A6AFFF", // Light purple upload button
    paddingHorizontal: scale(25),
    paddingVertical: verticalScale(10),
    borderRadius: scale(10),
  },
  uploadButtonText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: colors.main, // Using your signature purple color
  },
  buttonWrapper: {
    marginTop: verticalScale(10),
  },
});
