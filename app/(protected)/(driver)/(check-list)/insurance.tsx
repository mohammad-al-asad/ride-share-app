import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { Image } from "expo-image";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function VehicleInsurancePaperScreen() {
  const [image, setImage] = useState<string>();
  async function openCamera() {
    try {
      const result = await ImagePicker.openCamera({
        width: scale(300),
        height: verticalScale(350),
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

  return (
    <SafeAreaView style={styles.container}>
      <AuthBackground />

      <View style={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Take a photo of your Vehicle Insurance Paper
          </Text>
          <Text style={styles.subTitle}>
            Please make sure we can easily read all the details.
          </Text>
        </View>

        {/* Instructional Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={
              image
                ? { uri: image }
                : require("@/assets/images/registration-ph.png")
            }
            style={styles.illustration}
            contentFit="contain"
          />
        </View>

        {/* Action Button */}
        <View style={styles.buttonWrapper}>
          <CustomButton text="Take Photo" onClick={openCamera} type="main" />
        </View>
      </View>
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
    flexGrow: 1,
  },
  header: {
    marginBottom: verticalScale(20),
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#1A1A1A",
    lineHeight: moderateScale(28),
  },
  subTitle: {
    fontSize: moderateScale(14),
    color: "#4B5563",
    marginTop: verticalScale(8),
  },
  illustrationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: verticalScale(20),
  },
  illustration: {
    width: scale(300),
    height: verticalScale(350),
    borderWidth: 1.5,
    borderColor: "#DAD6FF",
    borderStyle: "dashed",
  },
  buttonWrapper: {
    marginTop: "auto",
    paddingBottom: verticalScale(10),
  },
});
