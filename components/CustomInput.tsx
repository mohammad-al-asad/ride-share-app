import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface CustomInputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  isPassword?: boolean;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const CustomInput = ({
  icon,
  isPassword,
  error,
  containerStyle,
  inputStyle,
  style,
  ...props
}: CustomInputProps) => {
  const [isSecure, setIsSecure] = useState(Boolean(isPassword));
  const hasError = Boolean(error);

  useEffect(() => {
    setIsSecure(Boolean(isPassword));
  }, [isPassword]);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.inputContainer,
          hasError && styles.inputContainerError,
          containerStyle,
        ]}
      >
        {icon && (
          <Ionicons name={icon} size={20} color="#000" style={styles.icon} />
        )}
        <TextInput
          style={[styles.input, inputStyle, style]}
          secureTextEntry={Boolean(isPassword) && isSecure}
          placeholderTextColor="#999"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setIsSecure((prev) => !prev)}>
            <Ionicons
              name={isSecure ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#000"
            />
          </TouchableOpacity>
        )}
      </View>
      {hasError && (
        <Text style={styles.errorText} numberOfLines={2}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: "#DAD6FF",
  },
  inputContainerError: {
    borderColor: "#EF4444",
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: "#333", fontSize: 16 },
  errorText: {
    marginTop: 6,
    marginLeft: 4,
    color: "#EF4444",
    fontSize: 12,
  },
});
