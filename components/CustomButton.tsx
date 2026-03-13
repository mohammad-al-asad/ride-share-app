import { colors } from "@/config/colors";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  type?: string;
  text: string;
  onClick: () => void;
  style?: any;
  textStyle?: any;
  isDisable?: boolean;
  isLoading?: boolean;
}

const CustomButton = ({
  type = "main",
  text,
  onClick,
  style,
  textStyle,
  isDisable,
  isLoading = false,
  ...props
}: ButtonProps) => {
  const isDisabled = Boolean(isDisable || isLoading);

  const backgroundColor = isDisable
    ? "#ccc"
    : type === "outline"
      ? "white"
      : type === "destructive"
        ? "#BC0E01"
        : colors.main;

  const textColor = isDisable
    ? "#9CA3AF"
    : type === "outline"
      ? "#000"
      : type === "destructive"
        ? "#fff"
        : colors.gold;

  const loadingColor =
    type === "outline" ? colors.main : type === "destructive" ? "#fff" : colors.gold;

  return (
    <TouchableOpacity
      {...props}
      onPress={onClick}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.7}
      style={[
        styles.Btn,
        { backgroundColor, opacity: isLoading ? 0.85 : 1 },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={loadingColor} />
      ) : (
        <Text
          style={[
            styles.Text,
            { color: textColor },
            textStyle,
          ]}
        >
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  Btn: {
    backgroundColor: colors.main,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
    borderColor: "#E5E5E5",
    borderWidth: 1,
  },
  Text: {
    color: colors.gold,
    fontSize: 16,
  },
});
