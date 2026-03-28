import CustomButton from "@/components/CustomButton";
import FeedbackModal from "@/components/FeedbackModal";
import { useCreateSupportTicketMutation } from "@/redux/api/authApi";
import { useAppSelector } from "@/redux/hooks";
import { supportTicketSchema, SupportTicketType } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function SupportFormScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const params = useLocalSearchParams();
  const againstUserId = params.againstUserId as string | undefined;
  const againstUserName = params.againstUserName as string | undefined;
  const againstUserRole = params.againstUserRole as string | undefined;
  const tripId = params.tripId as string | undefined;

  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role || "rider";

  const [createTicket, { isLoading }] = useCreateSupportTicketMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupportTicketType>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      title: "",
      message: "",
    },
  });

  const onSubmit = async (data: SupportTicketType) => {
    try {
      await createTicket({
        title: data.title,
        message: data.message,
        againstUserId: againstUserId || undefined,
        tripId: tripId || undefined,
        role,
      }).unwrap();

      setModalVisible(true);
      reset();
    } catch (error) {
      console.error("Failed to submit support ticket:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FeedbackModal
        visible={modalVisible}
        title="Successfully Sent"
        message="Thanks for reaching out. Your message has been delivered to our support team."
        onClose={() => {
          router.back();
          setModalVisible(false);
        }}
      />

      {/* Title Input Group */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Title</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <View
              style={[
                styles.titleInputWrapper,
                errors.title && styles.errorBorder,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Write a title of this message"
                placeholderTextColor="#9CA3AF"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            </View>
          )}
        />
        {errors.title && (
          <Text style={styles.errorText}>{errors.title.message}</Text>
        )}
      </View>

      {/* Message/Issue Input Group */}
      <View style={styles.inputGroup}>
        <Controller
          control={control}
          name="message"
          render={({ field: { onChange, onBlur, value } }) => (
            <View
              style={[
                styles.issueInputWrapper,
                errors.message && styles.errorBorder,
              ]}
            >
              {againstUserId && againstUserName && (
                <View style={styles.againstUserContainer}>
                  <Text style={styles.againstUserName}>{againstUserName}</Text>
                  <Text style={styles.againstUserRole}>
                    {againstUserRole
                      ? againstUserRole.charAt(0).toUpperCase() + againstUserRole.slice(1)
                      : "User"}
                  </Text>
                  <View style={styles.divider} />
                </View>
              )}
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  againstUserId && againstUserName ? styles.textAreaWithHeader : null,
                ]}
                placeholder="Share your issue with us..."
                placeholderTextColor="#9CA3AF"
                multiline={true}
                textAlignVertical="top"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            </View>
          )}
        />
        {errors.message && (
          <Text style={styles.errorText}>{errors.message.message}</Text>
        )}
      </View>

      {/* Send Button */}
      <CustomButton
        text={isLoading ? "Sending..." : "Send"}
        type="main"
        onClick={handleSubmit(onSubmit)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scale(20),
    paddingTop: verticalScale(15),
  },
  inputGroup: {
    marginBottom: verticalScale(20),
  },
  inputLabel: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: verticalScale(8),
  },
  titleInputWrapper: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DAD6FF",
    borderRadius: scale(12),
    paddingHorizontal: scale(15),
    height: verticalScale(45),
    justifyContent: "center",
  },
  issueInputWrapper: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DAD6FF",
    borderRadius: scale(12),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(15),
    minHeight: moderateScale(360),
  },
  input: {
    fontSize: moderateScale(14),
    color: "#1A1A1A",
  },
  textArea: {
    height: moderateScale(360),
  },
  textAreaWithHeader: {
    height: moderateScale(300),
    marginTop: verticalScale(5),
  },
  againstUserContainer: {
    marginBottom: verticalScale(10),
  },
  againstUserName: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: verticalScale(2),
  },
  againstUserRole: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginBottom: verticalScale(8),
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    width: "100%",
  },
  errorBorder: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: moderateScale(12),
    marginTop: verticalScale(4),
  },
});
