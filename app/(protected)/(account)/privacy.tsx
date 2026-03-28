import React from "react";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, useWindowDimensions } from "react-native";
import { useGetLegalContentQuery } from "@/redux/api/authApi";
import RenderHtml from "react-native-render-html";

const PrivacyPolicy = () => {
  const { width } = useWindowDimensions();
  const { data, isLoading, isError } = useGetLegalContentQuery("privacy-policy");

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !data?.data?.items?.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load Privacy Policy</Text>
      </View>
    );
  }

  const content = data.data.items[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>{content.title}</Text>
      {content.contentHtml ? (
        <RenderHtml
          contentWidth={width - 40}
          source={{ html: content.contentHtml }}
        />
      ) : (
        <Text style={styles.content}>{content.plainText}</Text>
      )}
    </ScrollView>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
});