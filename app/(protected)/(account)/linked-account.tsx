import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function LinkedAccountsScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Login Option</Text>

        {/* Google Link Card */}
        <View style={styles.linkCard}>
          <View style={styles.cardLeft}>
            {/* Using a standard Google icon style */}
            <View style={styles.iconCircle}>
              <Image
                source={require("@/assets/icons/Google.svg")}
                style={styles.googleIcon}
                contentFit="contain"
              />
            </View>
            <Text style={styles.providerName}>Google</Text>
          </View>

          <TouchableOpacity onPress={() => console.log("Link Google")}>
            <Text style={styles.linkActionText}>Link</Text>
          </TouchableOpacity>
        </View>

        {/* Description Text */}
        <Text style={styles.description}>
          Linking a social account allows you to sign in to MA3 without putting
          your email manually. We will not use your social account for anything
          else without your permission.
        </Text>
      </View>
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
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: verticalScale(15),
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    paddingHorizontal: scale(25),
    paddingVertical: verticalScale(10),
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: verticalScale(20),
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(8),
  },
  googleIcon: {
    width: scale(24),
    height: scale(24),
  },
  providerName: {
    fontSize: moderateScale(16),
    fontWeight: "500",
    color: "#1A1A1A",
  },
  linkActionText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#10B981",
  },
  description: {
    fontSize: moderateScale(13),
    color: "#808080",
    lineHeight: moderateScale(20),
    paddingHorizontal: scale(4),
  },
});
