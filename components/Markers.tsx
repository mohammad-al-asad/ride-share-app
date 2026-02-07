import { colors } from "@/config/colors";
import { Entypo, Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { moderateScale, scale } from "react-native-size-matters";

export const MarkerUser = () => {
  return (
    <View style={styles.markerUser}>
      <Ionicons name="man" size={20} color="white" />
    </View>
  );
};

export const MarkerTriangle = () => {
  return (
    <View style={styles.dropoffContainer}>
      <Entypo
        style={{
          backgroundColor: "#fff",

          borderRadius: 100,
        }}
        name="triangle-down"
        size={25}
        color="#6662FF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropoffContainer: {
    padding: scale(15),
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.main,
    backgroundColor: "#4500FF52",
  },

  markerUser: {
    backgroundColor: "#6366F1",
    padding: moderateScale(8),
    borderRadius: 200,
    borderWidth: 2,
    borderColor: colors.main,
    justifyContent: "center",
    alignItems: "center",
  },
});
