import ReviewCard from "@/components/ReviewCard";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppSelector } from "@/redux/hooks";
import { useGetMyReviewsQuery } from "@/redux/api/rideBookApi";
import { useGetMyDriverReviewsQuery } from "@/redux/api/driverRIdeStart";

const Feedback = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isDriver = user?.role === "driver";

  const { data: riderData, isLoading: isRiderLoading, isError: isRiderError } = useGetMyReviewsQuery(undefined, { skip: isDriver });
  const { data: driverData, isLoading: isDriverLoading, isError: isDriverError } = useGetMyDriverReviewsQuery(undefined, { skip: !isDriver });

  const isLoading = isDriver ? isDriverLoading : isRiderLoading;
  const isError = isDriver ? isDriverError : isRiderError;
  const reviews = isDriver ? driverData?.data?.reviews : riderData?.data?.reviews;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Failed to load reviews</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {reviews && reviews.length > 0 ? (
        reviews.map((review) => (
          <ReviewCard
            key={review._id}
            name={review.reviewer?.name ?? "Anonymous User"}
            role={
              review.reviewer?.role === "driver" ? "Driver" : "Rider"
            }
            rating={Number(review.stars ?? 0).toFixed(1)}
            comment={review.comment || "No comment provided."}
            avatar={
              review.reviewer?.profileImage
                ? { uri: review.reviewer.profileImage }
                : require("@/assets/images/demo-profile.png")
            }
          />
        ))
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No reviews yet.</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default Feedback;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
