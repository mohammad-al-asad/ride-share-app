import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { useUploadProfileImageMutation } from "@/redux/api/authApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { persistCredentials } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import ImagePicker, {
  type Image as CropPickerImage,
} from "react-native-image-crop-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const INSTRUCTIONS = [
  "Face the camera directly with your eyes and mouth clearly visible",
  "Make sure the photo is well lit, free of glare, and in focus",
  "No photos of a photo, filters, or alterations",
  "Example image is given below for better understanding",
];

function getFileName(image: CropPickerImage) {
  if (image.filename) return image.filename;
  const extension = image.mime?.split("/")[1] ?? "jpg";
  return `profile-${Date.now()}.${extension}`;
}

export default function TakeProfilePhotoScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const token = useAppSelector((state: RootState) => state.auth.token);
  const refreshToken = useAppSelector(
    (state: RootState) => state.auth.refreshToken,
  );
  const [image, setImage] = useState<CropPickerImage | null>(null);
  const [uploadProfileImage, { isLoading: isUploading }] =
    useUploadProfileImageMutation();

  const existingImage = user?.profileImage?.trim() ?? "";
  const imagePreview = image?.path ?? existingImage;
  const hasExistingImage = Boolean(existingImage);
  const hasSelectedImage = Boolean(image);

  async function openCamera() {
    try {
      const result = await ImagePicker.openCamera({
        mediaType: "photo",
        cropping: true,
        width: 400,
        height: 400,
        cropperActiveWidgetColor: "#6372ff",
      });

      if (!Array.isArray(result) && result.mime?.startsWith("image/")) {
        setImage(result);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== "E_PICKER_CANCELLED") {
        Alert.alert("Camera error", "Could not capture image. Please try again.");
        console.log("Profile image capture failed:", err);
      }
    }
  }

  async function handleSave() {
    if (!image || isUploading) return;

    try {
      const formData = new FormData();
      formData.append("image", {
        uri: image.path,
        type: image.mime ?? "image/jpeg",
        name: getFileName(image),
      } as any);

      const response = await uploadProfileImage(formData).unwrap();
      const profileImage = response?.data?.profileImage;

      if (profileImage && user) {
        await dispatch(
          persistCredentials({
            user: {
              ...user,
              profileImage,
            },
            token,
            refreshToken,
          }),
        ).unwrap();
      }

      Alert.alert("Success", "Profile photo updated successfully.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        "Failed to upload profile image.";
      Alert.alert("Upload failed", message);
      console.log("Profile image upload failed:", err);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <AuthBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Take your profile photo</Text>

        <View style={styles.instructionContainer}>
          {INSTRUCTIONS.map((text, index) => (
            <View key={index} style={styles.instructionRow}>
              <Text style={styles.bullet}>*</Text>
              <Text style={styles.instructionText}>{text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.imagePreviewContainer}>
          <Image
            source={
              imagePreview
                ? { uri: imagePreview }
                : require("@/assets/images/demo-profile.png")
            }
            style={styles.sampleImage}
            contentFit="cover"
          />
        </View>

        <View style={styles.buttonWrapper}>
          <CustomButton
            text={
              hasSelectedImage
                ? "Save"
                : hasExistingImage
                  ? "Retake Photo"
                  : "Take Photo"
            }
            onClick={hasSelectedImage ? handleSave : openCamera}
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
    height: scale(210),

  },
  sampleImage: {
    borderWidth: 1.5,
    borderColor: "#DAD6FF",
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  buttonWrapper: {
    marginTop: "auto",
  },
});
