import { colors } from "@/config/colors";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

interface ButtonProps {
  type?: string;
  text: string;
  onClick: () => void;
  style?: any;
  textStyle?: any;
  isDisable?: boolean;
}

const CustomButton = ({
  type = "main",
  text,
  onClick,
  style,
  textStyle,
  isDisable,
  ...props
}: ButtonProps) => {
  return (
    <TouchableOpacity
      {...props}
      onPress={onClick}
      style={[
        styles.Btn,
        {
          backgroundColor: isDisable
            ? "#E5E7EB"
            : type === "outline"
              ? "white"
              : type === "destructive"
                ? "#BC0E01"
                : colors.main,
        },
        style,
      ]}
    >
      {!isDisable ? (
        <Text
          style={[
            styles.Text,
            {
              color:
                type === "outline"
                  ? "#000"
                  : type === "destructive"
                    ? "#fff"
                    : colors.gold,
            },
            textStyle,
            ...[
              isDisable && {
                color: "#9CA3AF",
              },
            ],
          ]}
        >
          {text}
        </Text>
      ) : (
        <ActivityIndicator size="small" color={colors.main} />
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
