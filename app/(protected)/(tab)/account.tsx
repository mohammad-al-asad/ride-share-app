import AuthBackground from "@/components/AuthBackground";
import ConfirmationModal from "@/components/ConfirmationModal";
import { colors } from "@/config/colors";
import {
  useDeleteAccountMutation,
  useUploadProfileImageMutation,
} from "@/redux/api/authApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { performLogout, persistCredentials } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

function getFileName(image: CropPickerImage) {
  if (image.filename) return image.filename;
  const extension = image.mime?.split("/")[1] ?? "jpg";
  return `profile-${Date.now()}.${extension}`;
}

export default function ProfileScreen() {
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const token = useAppSelector((state: RootState) => state.auth.token);
  const refreshToken = useAppSelector(
    (state: RootState) => state.auth.refreshToken,
  );
  const isDriver = user?.role === "driver";
  const userName = user?.name?.trim() || "User";
  const userEmail = user?.email?.trim();
  const roleLabel =
    user?.role && user.role.length > 0
      ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}`
      : null;
  const dispatch = useAppDispatch();
  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();
  const [uploadProfileImage, { isLoading: isUploading }] =
    useUploadProfileImageMutation();

  const handleDelteAccount = async () => {
    try {
      await deleteAccount(undefined).unwrap();
      dispatch(performLogout());
      router.replace("/(auth)/login");
    } catch (err: any) {
      Alert.alert("Error", err.data.error.message);
      console.log("Deletion failed:", err);
    }
  };

  const uploadImage = async (image: CropPickerImage) => {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: image.path,
        type: image.mime,
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
            token: token,
            refreshToken: refreshToken,
          }),
        ).unwrap();
      }
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        "Failed to upload profile image.";
      Alert.alert("Upload failed", message);
      console.log("Account image upload failed:", err);
    }
  };

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
        await uploadImage(result);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== "E_PICKER_CANCELLED") {
        Alert.alert("Camera error", "Could not capture image. Please try again.");
        console.log("Image capture failed:", err);
      }
    }
  };

  return (
    <View style={styles.container}>
      <AuthBackground />
      {/* Header taken from your requested code */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Ionicons
                  name="person-outline"
                  size={scale(40)}
                  color="#6B7280"
                />
              )}
            </View>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={
                user?.role === "rider"
                  ? takeImage
                  : () =>
                      router.push(
                        "/(protected)/(driver)/(check-list)/profile-picture",
                      )
              }
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={scale(14)} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{userName}</Text>
            {roleLabel ? (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{roleLabel}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        {/* Settings Group */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.card}>
          <SettingItem
            icon="person-outline"
            label="Personal Info"
            onPress={() => {
              router.push("/(protected)/(account)/personal-info");
            }}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => {
              router.push("/(auth)/change-password");
            }}
          />
          {/* <View style={styles.divider} />
          <SettingItem
            icon="checkmark-circle-outline"
            label="Linked account"
            onPress={() => {
              router.push("/(protected)/(account)/linked-account");
            }}
          /> */}
        </View>

        {/* Ratings Group */}
        <Text style={styles.sectionTitle}>My Ratings & Reviews</Text>
        <View style={styles.card}>
          <SettingItem
            icon="star-outline"
            label="Feedback"
            onPress={() => {
              router.push("/(protected)/(account)/feedback");
            }}
          />
          {isDriver && (
            <>
              <View style={styles.divider} />
              <SettingItem
                icon="document-text-outline"
                label="Documents"
                onPress={() => {
                  router.push("/(protected)/(driver)/(check-list)");
                }}
              />
            </>
          )}
        </View>

        {/* Support Group */}
        <Text style={styles.sectionTitle}>Support & Policies</Text>
        <View style={styles.card}>
          <SettingItem
            icon="headset-outline"
            label="Customer Support"
            onPress={() => {
              router.push("/(protected)/(account)/support");
            }}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="document-text-outline"
            label="Terms & Conditions"
            onPress={() => {
              router.push("/(protected)/(account)/terms");
            }}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="shield-checkmark-outline"
            label="Privacy & Policy"
            onPress={() => {
              router.push("/(protected)/(account)/privacy");
            }}
          />
        </View>

        {/* Account Actions Group */}
        <View style={[styles.card, { marginTop: verticalScale(20) }]}>
          <SettingItem
            icon="log-out-outline"
            label="Logout"
            onPress={() => {
              dispatch(performLogout());
              router.replace("/(auth)/login");
            }}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="trash-outline"
            label="Delete Account"
            labelStyle={{ color: "#EF4444" }}
            iconColor="#EF4444"
            onPress={() => setDeleteConfirmation(true)}
          />
        </View>
      </ScrollView>
      <ConfirmationModal
        onClose={() => setDeleteConfirmation(false)}
        onConfirm={() => handleDelteAccount()}
        visible={deleteConfirmation}
        isLoading={isLoading}
        title="Are you sure you want to delete?"
        message="This action is permanent, and you will lose all your data and history. If you proceed, you won’t be able to recover your account."
      />
    </View>
  );
}

// Sub-component for individual setting rows
const SettingItem = ({
  icon,
  label,
  labelStyle,
  iconColor = "#1A1A1A",
  onPress,
}: any) => {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={22} color={iconColor} />
        <Text style={[styles.settingLabel, labelStyle]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
  headerContainer: {
    backgroundColor: colors.white,
    padding: scale(15),
    paddingTop: scale(45),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
  },
  scrollContent: {
    paddingTop: scale(20),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(120),
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: verticalScale(5),
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: verticalScale(12),
  },
  avatarCircle: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#A6AFFF",
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F8F9FF",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: scale(8),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(3),
    borderRadius: scale(999),
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#D7DEFF",
  },
  roleText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: colors.main,
  },
  userEmail: {
    marginTop: verticalScale(4),
    fontSize: moderateScale(13),
    color: "#6B7280",
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: verticalScale(10),
    marginTop: verticalScale(15),
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: scale(16),
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#374151",
    marginLeft: scale(12),
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: scale(16),
  },
});
