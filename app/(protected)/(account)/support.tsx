import CustomButton from "@/components/CustomButton";
import FeedbackModal from "@/components/FeedbackModal";
import React, { useState } from "react";
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
  const [title, setTitle] = useState("");
  const [issue, setIssue] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FeedbackModal
        visible={modalVisible}
        title="Successfully Sent"
        message="Thanks for reaching out. Your message has been delivered to our support team."
        onClose={() => setModalVisible(false)}
      />
      {/* Title Input Group */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Title</Text>
        <View style={styles.titleInputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Write a title of this message"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />
        </View>
      </View>

      {/* Message/Issue Input Group */}
      <View style={styles.inputGroup}>
        <View style={styles.issueInputWrapper}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Share your issue with us..."
            placeholderTextColor="#9CA3AF"
            multiline={true}
            textAlignVertical="top"
            value={issue}
            onChangeText={setIssue}
          />
        </View>
      </View>

      {/* Send Button */}
      <CustomButton
        text="Send"
        type="main"
        onClick={() => {
          setModalVisible(true);
        }}
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
    borderColor: "#E5E7EB",
    borderRadius: scale(12),
    paddingHorizontal: scale(15),
    height: verticalScale(45),
    justifyContent: "center",
  },
  issueInputWrapper: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
});
