import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CustomInputProps {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  isPassword?: boolean;
}

export const CustomInput = ({ icon, placeholder, isPassword }: CustomInputProps) => {
  const [isSecure, setIsSecure] = useState(isPassword);

  return (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color="#000" style={styles.icon} />
      <TextInput
        placeholder={placeholder}
        style={styles.input}
        secureTextEntry={isSecure}
        placeholderTextColor="#999"
      />
      {isPassword && (
        <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
          <Ionicons name={isSecure ? "eye-off-outline" : "eye-outline"} size={20} color="#000" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DAD6FF",
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: "#333", fontSize: 16 },
});