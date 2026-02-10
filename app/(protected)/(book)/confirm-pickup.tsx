import ConfirmLocation from "@/components/ConfirmLocation";
import React from "react";
import { StyleSheet, View } from "react-native";

const ConfirmPickup = () => {
  return (
    <View style={{ flex: 1 }}>
      <ConfirmLocation />
    </View>
  );
};

export default ConfirmPickup;

const styles = StyleSheet.create({});
