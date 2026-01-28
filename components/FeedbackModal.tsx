import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

interface FeedbackModalProps {
  visible: boolean;
  type?: "success" | "failed";
  title?: string;
  message?: string;
  onClose: () => void;
}

export default function FeedbackModal({
  visible,
  type = "success",
  title,
  message,
  onClose,
}: FeedbackModalProps) {
  const isSuccess = type === "success";
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Icon Section */}
          <View
            style={[
              styles.iconContainer,
              isSuccess ? styles.successBg : styles.failedBg,
            ]}
          >
            {isSuccess ? (
              <Ionicons
                name="checkmark-sharp"
                size={scale(30)}
                color="#22C55E"
              />
            ) : (
              <MaterialIcons
                name="priority-high"
                size={scale(30)}
                color="#EF4444"
              />
            )}
          </View>

          {/* Text Title */}
          {title && <Text style={styles.headingText}>{title}</Text>}
          {/* Text Content */}
          {message && <Text style={styles.messageText}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: scale(300),
    backgroundColor: "white",
    borderRadius: scale(16),
    padding: scale(24),
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(10),
    borderWidth: 1,
  },
  successBg: {
    backgroundColor: "#DCFCE7",
    borderColor: "#22C55E",
  },
  failedBg: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
  },
  headingText: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
  },
  messageText: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(16),
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: moderateScale(22),
    fontWeight: "500",
  },
});
