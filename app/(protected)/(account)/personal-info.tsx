import { colors } from "@/config/colors";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function PersonalInfoScreen() {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const name = user?.name?.trim() || "Not set";
  const email = user?.email?.trim() || "Not set";
  const phone = user?.phone?.trim() || "Not set";
  const verifiedText = user?.emailVerifiedAt ? "Verified" : "Not verified";

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View>
            <Text style={styles.label}>NAME</Text>
            <Text style={styles.value}>{name}</Text>
          </View>

          <View style={styles.divider} />

          <View>
            <Text style={styles.label}>EMAIL</Text>
            <Text style={styles.value}>{email}</Text>
          </View>

          <View style={styles.divider} />

          <View>
            <Text style={styles.label}>PHONE</Text>
            <Text style={styles.value}>{phone}</Text>
          </View>

          <View style={styles.divider} />

          <View>
            <Text style={styles.label}>EMAIL STATUS</Text>
            <Text style={styles.value}>{verifiedText}</Text>
          </View>
        </View>

        {/* Floating Edit Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/(protected)/(account)/edit-personal")}
        >
          <Feather name="edit-3" size={20} color={colors.gold} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: scale(20),
    flex: 1,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    padding: scale(20),
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: verticalScale(10),
  },

  label: {
    fontSize: moderateScale(11),
    color: "#9CA3AF",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: verticalScale(4),
  },
  value: {
    fontSize: moderateScale(15),
    color: "#1A1A1A",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: verticalScale(8),
  },
  editButton: {
    backgroundColor: colors.main,
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    width: scale(100),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(9),
    borderRadius: scale(14),
    marginRight:scale(8),
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  editButtonText: {
    color: colors.gold,
    fontSize: moderateScale(16),
    fontWeight: "bold",
    marginLeft: scale(8),
  },
});
