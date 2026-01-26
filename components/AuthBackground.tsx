import { ImageBackground } from "expo-image";
import React from "react";
import { StyleSheet } from "react-native";

const AuthBackground = () => {
  return (
    <ImageBackground
      source={require("../assets/images/Frame.svg")}
      style={[StyleSheet.absoluteFill]}
      contentFit="cover"
    />
  );
};

export default AuthBackground;
