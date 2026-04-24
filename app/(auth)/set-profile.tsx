import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { useUploadProfileImageMutation } from "@/redux/api/authApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { persistCredentials } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ImagePicker, {
  type Image as CropPickerImage,
} from "react-native-image-crop-picker";

function getFileName(image: CropPickerImage) {
  if (image.filename) return image.filename;
  const extension = image.mime?.split("/")[1] ?? "jpg";
  return `profile-${Date.now()}.${extension}`;
}

export default function AddPhotoScreen() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<CropPickerImage | null>(
    null,
  );
  const [uploadProfileImage, { isLoading: isUploading }] =
    useUploadProfileImageMutation();
  const dispatch = useAppDispatch();
  const existingUser = useAppSelector((state: RootState) => state.auth.user);
  const existingToken = useAppSelector((state: RootState) => state.auth.token);
  const previewUri = selectedImage?.path ?? existingUser?.profileImage;

  const takeImage = async () => {
    try {
      const result = await ImagePicker.openCamera({
        mediaType: "photo",
        cropping: true,
        width: 400,
        height: 400,
        cropperActiveWidgetColor: "#6372ff",
      });

      if (!Array.isArray(result) && result.mime?.startsWith("image/")) {
        setSelectedImage(result);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== "E_PICKER_CANCELLED") {
        Alert.alert("Camera error", "Could not capture image. Please try again.");
        console.log("Image capture failed:", err);
      }
    }
  };

  const handleGetStarted = async () => {
    if (!selectedImage) {
      router.replace("/(protected)/(tab)");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", {
        uri: selectedImage.path,
        type: selectedImage.mime,
        name: getFileName(selectedImage),
      } as any);

      const response = await uploadProfileImage(formData).unwrap();
      const profileImage = response?.data?.profileImage;

      if (profileImage && existingUser && existingToken) {
        await dispatch(
          persistCredentials({
            user: {
              ...existingUser,
              profileImage,
            },
            token: existingToken,
          }),
        ).unwrap();
      }

      router.replace("/(protected)/(tab)");
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        "Failed to upload image.";
      Alert.alert("Upload failed", message);
      console.log("Profile image upload failed:", err);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Background Grid */}
      <AuthBackground />

      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipContainer}
        onPress={() => router.replace("/(protected)/(tab)")}
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
              {previewUri ? (
                <Image
                  source={{ uri: previewUri }}
                  style={styles.profileImage}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="person-outline" size={80} color="#000" />
              )}
            </View>
            <TouchableOpacity
              style={styles.cameraButton}
              activeOpacity={0.8}
              onPress={takeImage}
              disabled={isUploading}
            >
              <Ionicons name="camera-outline" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonWrapper}>
          <CustomButton
            type="main"
            text="Get Started"
            onClick={handleGetStarted}
            isLoading={isUploading}
            isDisable={selectedImage === null}
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
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
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
