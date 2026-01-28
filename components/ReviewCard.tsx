import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const ReviewCard = () => {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: "https://placeholder.com/rider" }}
          style={styles.smallAvatar}
        />
        <View style={{ flex: 1, marginLeft: scale(10) }}>
          <Text style={styles.reviewerName}>Tuval Mor</Text>
          <Text style={styles.reviewerRole}>Rider</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#FBBF24" />
          <Text style={styles.ratingText}>4.5</Text>
        </View>
      </View>
      <Text style={styles.reviewBody}>
        Great driver! Friendly, respectful, and easy to communicate with. Would
        be happy to have them again.
      </Text>
    </View>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    padding: scale(15),
    marginBottom: verticalScale(12),
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },
  smallAvatar: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: "#E5E7EB",
  },
  reviewerName: {
    fontSize: moderateScale(14),
    fontWeight: "bold",
  },
  reviewerRole: {
    fontSize: moderateScale(12),
    color: "#9CA3AF",
  },
  reviewBody: {
    fontSize: moderateScale(13),
    color: "#4B5563",
    lineHeight: moderateScale(18),
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: scale(8),
  },
  ratingText: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginLeft: scale(2),
  },
});
