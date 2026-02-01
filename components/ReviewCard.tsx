import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const ReviewCard = ({ name, role, rating, comment, avatar }: any) => (
  <View style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <View style={styles.userInfo}>
        <Image source={avatar} style={styles.reviewerAvatar} />
        <View style={styles.nameContainer}>
          <Text style={styles.reviewerName}>{name}</Text>
          <Text style={styles.reviewerRole}>{role}</Text>
        </View>
      </View>
      <View style={styles.ratingBadge}>
        <Ionicons name="star" size={14} color="#FBBF24" />
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
    </View>
    <Text style={styles.commentText}>{comment}</Text>
  </View>
);

export default ReviewCard;

const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(15),
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(12),
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  reviewerAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
  },
  nameContainer: { marginLeft: scale(10) },
  reviewerName: {
    fontSize: moderateScale(14),
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  reviewerRole: { fontSize: moderateScale(12), color: "#9CA3AF" },
  ratingBadge: { flexDirection: "row", alignItems: "center" },
  ratingText: {
    fontSize: moderateScale(14),
    marginLeft: scale(4),
    color: "#1A1A1A",
  },
  commentText: {
    fontSize: moderateScale(13),
    color: "#4B5563",
    lineHeight: moderateScale(20),
  },
});
