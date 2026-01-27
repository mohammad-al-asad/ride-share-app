import { TabTriggerSlotProps } from "expo-router/ui";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  moderateScale,
  verticalScale,
} from "react-native-size-matters";
import { colors } from "@/config/colors";

export type TabButtonProps = TabTriggerSlotProps & {
  icon: keyof typeof Ionicons.glyphMap;
};

export default function TabButton({
  icon,
  children,
  isFocused,
  ...props
}: TabButtonProps) {
  const activeColor = colors.main;
  const inactiveColor = "#222";

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={icon}
          size={moderateScale(22)}
          color={isFocused ? activeColor : inactiveColor}
        />

        <Text
          style={[
            styles.label,
            { color: isFocused ? activeColor : inactiveColor },
          ]}
        >
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    marginTop: verticalScale(4),
  },

  pressed: {
    opacity: 0.7,
  },
});
