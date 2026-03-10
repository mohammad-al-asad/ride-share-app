import { CustomInput } from "@/components/CustomInput";
import { colors } from "@/config/colors";
import { useUpdateProfileInfoMutation } from "@/redux/api/authApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { persistCredentials } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store";
import {
  updateProfileInfoSchema,
  UpdateProfileInfoType,
} from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function EditProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [updateProfileInfo, { isLoading }] = useUpdateProfileInfoMutation();
  const initialName = (user?.name ?? "").trim();
  const initialPhone = (user?.phone ?? "").trim();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdateProfileInfoType>({
    resolver: zodResolver(updateProfileInfoSchema),
    defaultValues: {
      name: initialName,
      phone: initialPhone,
    },
  });
  const currentName = watch("name");
  const currentPhone = watch("phone");
  const hasChanges =
    currentName.trim() !== initialName || currentPhone.trim() !== initialPhone;
  const isSaveDisabled = isLoading || !hasChanges;

  const onSave = handleSubmit(async (values) => {
    try {
      const response = await updateProfileInfo(values).unwrap();
      const updatedUser = response?.data;

      await dispatch(
        persistCredentials({
          user: {
            ...user,
            name: updatedUser?.name ?? values.name,
            phone: updatedUser?.phone ?? values.phone,
          },
        }),
      ).unwrap();

      Alert.alert("Success", "Personal information updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        "Failed to update personal information.";
      Alert.alert("Update failed", message);
      console.log("Profile info update failed:", err);
    }
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Name Input Group */}
        <Text style={styles.inputLabel}>Name</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onBlur, onChange, value } }) => (
            <CustomInput
              icon="person-outline"
              placeholder="Full name"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.name?.message}
              autoCapitalize="words"
            />
          )}
        />

        {/* Phone Input Group */}
        <Text style={styles.inputLabel}>Phone Number</Text>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onBlur, onChange, value } }) => (
            <CustomInput
              icon="call-outline"
              placeholder="01XXXXXXXXX"
              keyboardType="phone-pad"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.phone?.message}
            />
          )}
        />

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            disabled={isLoading}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              isSaveDisabled && styles.saveButtonDisabled,
            ]}
            onPress={onSave}
            disabled={isSaveDisabled}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.gold} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: scale(24),
  },

  inputLabel: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: verticalScale(8),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(12),
    paddingHorizontal: scale(12),
    height: verticalScale(50),
  },
  icon: {
    marginRight: scale(10),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(14),
    color: "#1A1A1A",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: verticalScale(5),
  },
  cancelButton: {
    paddingHorizontal: scale(25),
    paddingVertical: verticalScale(12),
    backgroundColor: "#fff",
    borderRadius: scale(12),
    marginRight: scale(12),
  },
  cancelButtonText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#4B5563",
  },
  saveButton: {
    paddingHorizontal: scale(35),
    paddingVertical: verticalScale(12),
    backgroundColor: colors.main,
    borderRadius: scale(12),
  },
  saveButtonDisabled: {
    opacity: 0.55,
  },
  saveButtonText: {
    fontSize: moderateScale(14),
    fontWeight: "bold",
    color: colors.gold,
  },
});
