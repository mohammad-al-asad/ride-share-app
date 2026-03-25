import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  isLoading?: boolean;
}

const VerifyRiderModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onVerify,
  isLoading = false,
}) => {
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (!isVisible) {
      setOtp("");
    }
  }, [isVisible]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer}>
          <Text style={styles.heading}>Verify Rider</Text>
          <Text style={styles.description}>
            Enter the OTP provided by the rider to begin the ride
          </Text>

          <OtpInput
            numberOfDigits={4}
            autoFocus={true}
            onFilled={(code) => setOtp(code)}
            focusColor={colors.main}
            theme={{
              pinCodeContainerStyle: styles.otpBox,
              containerStyle: styles.otpContainer,
            }}
          />

          <CustomButton
            type="main"
            text="GO"
            onClick={() => onVerify(otp)}
            isDisable={otp.length !== 4}
            isLoading={isLoading}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default VerifyRiderModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(20),
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#F4F5F7",
    borderRadius: scale(20),
    padding: scale(24),
    alignItems: "center",
  },
  heading: {
    fontSize: moderateScale(22),
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: verticalScale(8),
  },
  description: {
    fontSize: moderateScale(13),
    color: "#4A4A4A",
    textAlign: "center",
    marginBottom: verticalScale(25),
    paddingHorizontal: scale(10),
    lineHeight: moderateScale(18),
    width: "70%",
  },
  otpContainer: {
    marginBottom: verticalScale(25),
    gap: scale(10),
    width: "100%",
    justifyContent: "center",
  },
  otpBox: {
    width: scale(55),
    height: scale(60),
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#BDBAFF",
    borderRadius: scale(12),
  },
});
