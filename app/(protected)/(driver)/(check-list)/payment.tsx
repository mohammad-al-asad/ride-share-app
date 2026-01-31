import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { CustomInput } from "@/components/CustomInput";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";

const Payment = () => {
  const [address, setaddress] = useState("");
  return (
    <View style={styles.container}>
      <AuthBackground />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Enter your Stripe ID</Text>
        <Text style={styles.subTitle}>
          Open a stripe account. Copy the id and paste it here.
        </Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Stripe Account ID</Text>
        <CustomInput
          placeholder="4"
          value={address}
          onChangeText={setaddress}
        />
      </View>
      <CustomButton
        type="main"
        text="Done"
        onClick={() => {}}
        isDisable={!address}
      />
    </View>
  );
};

export default Payment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
    paddingHorizontal: verticalScale(20),
    justifyContent: "center",
  },
  header: {
    marginBottom: verticalScale(20),
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
    marginTop: verticalScale(6),
  },
  form: { width: "100%" },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    marginLeft: 2,
  },
});
