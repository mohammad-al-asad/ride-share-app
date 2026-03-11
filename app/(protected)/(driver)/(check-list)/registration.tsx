import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import {
  useGetVehicleRegistrationQuery,
  useUploadVehicleRegistrationMutation,
} from "@/redux/api/onboardingApi";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import ImagePicker, {
  type Image as CropPickerImage,
} from "react-native-image-crop-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

function getFileName(image: CropPickerImage, prefix: string) {
  if (image.filename) return image.filename;
  const extension = image.mime?.split("/")[1] ?? "jpg";
  return `${prefix}-${Date.now()}.${extension}`;
}

function createImageFormData(image: CropPickerImage, prefix: string) {
  const formData = new FormData();
  formData.append("image", {
    uri: image.path,
    type: image.mime ?? "image/jpeg",
    name: getFileName(image, prefix),
  } as any);
  return formData;
}

export default function VehicleRegistrationScreen() {
  const router = useRouter();
  const [image, setImage] = useState<CropPickerImage | null>(null);
  const { data: vehicleRegistration, refetch: refetchVehicleRegistration } =
    useGetVehicleRegistrationQuery();
  const [uploadVehicleRegistration, { isLoading: isUploading }] =
    useUploadVehicleRegistrationMutation();

  const existingImage =
    vehicleRegistration?.data?.vehicleRegistration?.fileUrl ?? "";
  const imagePreview = image?.path ?? existingImage;
  const hasExistingImage = Boolean(existingImage);
  const hasSelectedImage = Boolean(image);

  async function openPicker() {
    try {
      const result = await ImagePicker.openPicker({
        width: scale(300),
        height: verticalScale(350),
        cropping: true,
        freeStyleCropEnabled: true,
        mediaType: "photo",
        cropperToolbarTitle: "Adjust Document",
        cropperActiveWidgetColor: "#6372ff",
      });

      if (!Array.isArray(result) && result.mime?.startsWith("image/")) {
        setImage(result);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== "E_PICKER_CANCELLED") {
        Alert.alert("Image error", "Could not select image. Please try again.");
        console.log("Vehicle registration image pick failed:", err);
      }
    }
  }

  async function handleSave() {
    if (isUploading || !imagePreview) return;

    if (!image) {
      router.back();
      return;
    }

    try {
      const response = await uploadVehicleRegistration(
        createImageFormData(image, "vehicle-registration"),
      ).unwrap();
      const message =
        response?.data?.message ?? "Vehicle registration uploaded successfully.";

      refetchVehicleRegistration();
      Alert.alert("Success", message, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        "Failed to upload vehicle registration.";
      Alert.alert("Upload failed", message);
      console.log("Vehicle registration upload failed:", err);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <AuthBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Take a photo of your Vehicle Registration
          </Text>
          <Text style={styles.subTitle}>
            Please make sure we can easily read all the details.
          </Text>
        </View>

        <View style={styles.illustrationContainer}>
          <Image
            source={
              imagePreview
                ? { uri: imagePreview }
                : require("@/assets/images/registration-ph.png")
            }
            style={styles.illustration}
            contentFit="contain"
          />
        </View>

        <View style={styles.buttonWrapper}>
          <CustomButton
            text={
              hasSelectedImage
                ? "Save"
                : hasExistingImage
                  ? "Retake Photo"
                  : "Upload Photo"
            }
            onClick={hasSelectedImage ? handleSave : openPicker}
            type="main"
            isLoading={isUploading}
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
    borderWidth: 1.5,
    borderColor: "#DAD6FF",
    borderStyle: "dashed",
    width: scale(300),
    height: verticalScale(350),
  },
  buttonWrapper: {
    marginTop: "auto",
    paddingBottom: verticalScale(10),
  },
});
