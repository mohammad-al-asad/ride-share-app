import ReviewCard from "@/components/ReviewCard";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

const feedback = () => {
  return (
    <ScrollView style={styles.container}>
      <ReviewCard />
      <ReviewCard />
    </ScrollView>
  );
};

export default feedback;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
