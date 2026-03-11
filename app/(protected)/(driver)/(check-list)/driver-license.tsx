import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import {
  useGetDriverLicensePhotosQuery,
  useUploadDriverLicenseBackMutation,
  useUploadDriverLicenseFrontMutation,
} from "@/redux/api/onboardingApi";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImagePicker, {
  type Image as CropPickerImage,
} from "react-native-image-crop-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

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
        style={styles.uploadedImage}
        source={{ uri: image }}
        contentFit="cover"
      />
    ) : (
      <Text style={styles.uploadTitle}>{title}</Text>
    )}
    <TouchableOpacity
      style={[styles.uploadSmallButton, image ? styles.retakeButton : null]}
      onPress={onPress}
    >
      <Text style={styles.uploadButtonText}>
        {image ? "Retake photo" : "Upload photo"}
      </Text>
    </TouchableOpacity>
  </View>
);

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

export default function DriverLicenseUploadScreen() {
  const router = useRouter();
  const [frontImage, setFrontImage] = useState<CropPickerImage | null>(null);
  const [backImage, setBackImage] = useState<CropPickerImage | null>(null);
  const { data: licensePhotos, refetch: refetchLicensePhotos } =
    useGetDriverLicensePhotosQuery();
  const [uploadDriverLicenseFront, { isLoading: isUploadingFront }] =
    useUploadDriverLicenseFrontMutation();
  const [uploadDriverLicenseBack, { isLoading: isUploadingBack }] =
    useUploadDriverLicenseBackMutation();

  const existingFrontImage = licensePhotos?.data?.front?.fileUrl ?? "";
  const existingBackImage = licensePhotos?.data?.back?.fileUrl ?? "";
  const frontPreview = frontImage?.path ?? existingFrontImage;
  const backPreview = backImage?.path ?? existingBackImage;
  const isSaving = isUploadingFront || isUploadingBack;
  const isDoneEnabled = Boolean(frontPreview && backPreview);

  async function openPicker(setImage: (image: CropPickerImage) => void) {
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

      if (!Array.isArray(result) && result.mime?.startsWith("image/")) {
        setImage(result);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== "E_PICKER_CANCELLED") {
        Alert.alert("Image error", "Could not select image. Please try again.");
        console.log("Driver license image pick failed:", err);
      }
    }
  }

  const handleSave = async () => {
    if (isSaving || !frontPreview || !backPreview) return;

    try {
      const uploads: Promise<unknown>[] = [];
      if (frontImage) {
        uploads.push(
          uploadDriverLicenseFront(
            createImageFormData(frontImage, "driver-license-front"),
          ).unwrap(),
        );
      }
      if (backImage) {
        uploads.push(
          uploadDriverLicenseBack(
            createImageFormData(backImage, "driver-license-back"),
          ).unwrap(),
        );
      }

      if (uploads.length === 0) {
        router.back();
        return;
      }

      const responses = (await Promise.all(uploads)) as {
        data?: { message?: string };
      }[];
      const frontResponse = responses[0];
      const backResponse = responses[responses.length - 1];

      const message =
        backResponse?.data?.message ??
        frontResponse?.data?.message ??
        "Driver license uploaded successfully.";
      refetchLicensePhotos();
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
        "Failed to upload driver license images.";
      Alert.alert("Upload failed", message);
      console.log("Driver license upload failed:", err);
    }
  };

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

        <UploadCard
          image={frontPreview}
          title="Upload front-side"
          onPress={() => openPicker(setFrontImage)}
        />

        <UploadCard
          image={backPreview}
          title="Upload back-side"
          onPress={() => openPicker(setBackImage)}
        />

        <View style={styles.buttonWrapper}>
          <CustomButton
            text="Done"
            onClick={handleSave}
            type="main"
            isDisable={!isDoneEnabled}
            isLoading={isSaving}
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
    position: "relative",
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
    overflow: "hidden",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
  },
  uploadTitle: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: verticalScale(12),
  },
  uploadSmallButton: {
    backgroundColor: "#A6AFFF",
    paddingHorizontal: scale(25),
    paddingVertical: verticalScale(10),
    borderRadius: scale(10),
  },
  retakeButton: {
    position: "absolute",
    bottom: verticalScale(10),
  },
  uploadButtonText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: colors.main,
  },
  buttonWrapper: {
    marginTop: verticalScale(10),
  },
});
