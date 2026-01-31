import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function VehicleRegistrationScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <AuthBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Take a photo of your Vehicle Registration
          </Text>
          <Text style={styles.subTitle}>
            Please make sure we can easily read all the details.
          </Text>
        </View>

        {/* Instructional Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require("@/assets/images/registration-ph.png")}
            style={styles.illustration}
            contentFit="contain"
          />
        </View>

        {/* Action Button */}
        <View style={styles.buttonWrapper}>
          <CustomButton
            text="Take Photo"
            onClick={() => {
              // Trigger camera logic
              //   router.push("/camera-view");
            }}
            type="main"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
    paddingTop: verticalScale(20),
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(30),
    flexGrow: 1,
  },
  header: {
    marginBottom: verticalScale(20),
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#1A1A1A",
    lineHeight: moderateScale(28),
  },
  subTitle: {
    fontSize: moderateScale(14),
    color: "#4B5563",
    marginTop: verticalScale(8),
  },
  illustrationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: verticalScale(20),
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    borderRadius: scale(12),
  },
  illustration: {
    width: scale(280),
    height: verticalScale(280),
  },
  buttonWrapper: {
    marginTop: "auto",
    paddingBottom: verticalScale(10),
  },
});
