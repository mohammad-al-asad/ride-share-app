import ReviewCard from "@/components/ReviewCard";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

const feedback = () => {
  return (
    <ScrollView style={styles.container}>
      <ReviewCard
        name="Tuval Mor"
        role="Rider"
        rating="5.0"
        comment="Great driver! Friendly, respectful, and easy to communicate with. Would be happy to have them again."
        avatar={require("@/assets/images/demo-profile.png")}
      />
      <ReviewCard
        name="Tuval Mor"
        role="Rider"
        rating="5.0"
        comment="Great driver! Friendly, respectful, and easy to communicate with. Would be happy to have them again."
        avatar={require("@/assets/images/demo-profile.png")}
      />
    </ScrollView>
  );
};

export default feedback;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
