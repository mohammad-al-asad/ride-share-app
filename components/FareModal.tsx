import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ModalProps = {
  visible: boolean;
  price: number;
  onCancel: () => void;
  onConfirm: () => void;
};

const FareModal = ({ visible, price, onCancel, onConfirm }: ModalProps) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <Text style={styles.headerText}>New Fare Based on Your Route</Text>

          {/* Price Row */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Estimated price</Text>
            <Text style={styles.priceValue}>${price.toFixed(2)}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmText}>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dims the map background
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    // Shadow for Android
    elevation: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 38,
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  priceLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginRight: 12,
  },
  cancelText: {
    color: "#4B5563",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#1E008D", // Deep indigo/purple
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FareModal;
