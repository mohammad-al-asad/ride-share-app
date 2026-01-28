import { CustomInput } from "@/components/CustomInput";
import { colors } from "@/config/colors";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function EditProfileScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Name Input Group */}
        <Text style={styles.inputLabel}>Name</Text>
        <CustomInput icon="person-outline" placeholder="Full name" />

        {/* Email Input Group */}
        <Text style={styles.inputLabel}>Email</Text>
        <CustomInput icon="mail-outline" placeholder="Email" />

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              router.back();
            }}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: scale(24),
  },

  inputLabel: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: verticalScale(8),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(12),
    paddingHorizontal: scale(12),
    height: verticalScale(50),
  },
  icon: {
    marginRight: scale(10),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(14),
    color: "#1A1A1A",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: verticalScale(5),
  },
  cancelButton: {
    paddingHorizontal: scale(25),
    paddingVertical: verticalScale(12),
    backgroundColor: "#fff",
    borderRadius: scale(12),
    marginRight: scale(12),
  },
  cancelButtonText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#4B5563",
  },
  saveButton: {
    paddingHorizontal: scale(35),
    paddingVertical: verticalScale(12),
    backgroundColor: colors.main,
    borderRadius: scale(12),
  },
  saveButtonText: {
    fontSize: moderateScale(14),
    fontWeight: "bold",
    color: colors.gold,
  },
});
