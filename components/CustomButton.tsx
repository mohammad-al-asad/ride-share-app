import { colors } from "@/config/colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  type?: string;
  text: string;
  onClick: () => void;
}

const CustomButton = ({ type="main", text, onClick }: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[
        styles.Btn,
        {
          backgroundColor:
            type === "outline"
              ? "white"
              : type === "destructive"
                ? "#BC0E01"
                : colors.main,
        },
      ]}
    >
      <Text
        style={[
          styles.Text,
          {
            color:
              type === "outline"
                ? "black"
                : type === "destructive"
                  ? "#fff"
                  : colors.gold,
          },
        ]}
      >
        {text}
      </Text>
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
