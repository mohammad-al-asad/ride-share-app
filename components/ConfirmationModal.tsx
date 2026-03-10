import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  visible,
  title,
  message,
  confirmLabel = "Delete",
  onClose,
  onConfirm,
  cancelLabel = "Cancel",
  isLoading = false,
}: ConfirmationModalProps) {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Red Alert Icon */}
          <View style={styles.iconContainer}>
            <MaterialIcons
              name="priority-high"
              size={scale(24)}
              color="#FFFFFF"
            />
          </View>

          {/* Dynamic Title */}
          <Text style={styles.titleText}>{title}</Text>

          {/* Dynamic Message */}
          <Text style={styles.messageText}>{message}</Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
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
    padding: scale(20),
  },
  modalContainer: {
    width: "100%",
    maxWidth: scale(340),
    backgroundColor: "white",
    borderRadius: scale(20),
    padding: scale(24),
    alignItems: "center",
  },
  iconContainer: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: "#C21107", // Deep red from design
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  titleText: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: verticalScale(12),
  },
  messageText: {
    fontSize: moderateScale(14),
    color: "#6B7280",
    textAlign: "center",
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(24),
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    height: verticalScale(45),
    backgroundColor: "#F3F4F6", // Light gray background
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(10),
  },
  cancelButtonText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#4B5563",
  },
  confirmButton: {
    flex: 1,
    height: verticalScale(45),
    backgroundColor: "#C21107", // Matching red
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: scale(10),
  },
  confirmButtonText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
