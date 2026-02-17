import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

// Reusable Upload Card Component
const UploadCard = ({
  title,
  onPress,
  image,
}: {
  title: string;
  onPress: () => void;
  image: string;
}) => (
  <View style={styles.uploadCard}>
    {image ? (
      <Image
        style={{ width: "100%", height: "100%" }}
        source={{ uri: image }}
      />
    ) : (
      <>
        <Text style={styles.uploadTitle}>{title}</Text>
        <TouchableOpacity style={styles.uploadSmallButton} onPress={onPress}>
          <Text style={styles.uploadButtonText}>Upload photo</Text>
        </TouchableOpacity>
      </>
    )}
  </View>
);

export default function DriverLicenseUploadScreen() {
  const [frontImage, setFrontImage] = useState<string>("");
  const [backImage, setBackImage] = useState<string>("");
  async function openCamera(setImage: any) {
    try {
      const result = await ImagePicker.openPicker({
        height: verticalScale(155),
        width: scale(305),
        cropping: true,
        freeStyleCropEnabled: true,
        mediaType: "photo",
        cropperToolbarTitle: "Adjust Document",
        cropperActiveWidgetColor: "#6372ff",
      });
      setImage(result.path);
    } catch (e) {
      console.log(e);
    }
  }

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
          image={frontImage}
          title="Upload front-side"
          onPress={() => openCamera(setFrontImage)}
        />

        <UploadCard
          image={backImage}
          title="Upload back-side"
          onPress={() => openCamera(setBackImage)}
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
    height: verticalScale(155),
    width: scale(305),
    marginHorizontal: "auto",
    borderWidth: 1.5,
    borderColor: "#DAD6FF",
    borderStyle: "dashed", 
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
