import ConfirmLocation from "@/components/ConfirmLocation";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

const ConfirmPickup = () => {
  const { mode } = useLocalSearchParams<{ mode?: "pickup" | "dropoff" }>();
  const parsedMode = Array.isArray(mode) ? mode[0] : mode;

  return (
    <View style={{ flex: 1 }}>
      <ConfirmLocation mode={parsedMode === "dropoff" ? "dropoff" : "pickup"} />
    </View>
  );
};

export default ConfirmPickup;

const styles = StyleSheet.create({});
