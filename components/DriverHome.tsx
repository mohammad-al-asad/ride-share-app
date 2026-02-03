import { colors } from "@/config/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import AuthBackground from "./AuthBackground";
import { router } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function HomeScreen() {
  return (
    <View style={styles.mainContainer}>
      {/* Background Grid */}
      <AuthBackground />

      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/logo-blue.svg")}
            style={styles.smallLogo}
            contentFit="contain"
          />
          <Text style={styles.welcomeText}>Welcome, Harish!</Text>
        </View>

        {/* Required Actions Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="alert-circle" size={20} color="red" />
            <Text style={styles.cardTitle}>Required actions (1)</Text>
          </View>
          <Text style={styles.cardSubtitle}>Go online when resolved</Text>
        </View>

        {/* Map Section */}
        <View style={styles.mapContainer}>
        <MapView
        provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: 32.7767,
            longitude: -96.797,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Marker
            coordinate={{
              latitude: 32.7767,
              longitude: -96.797,
            }}
          />
        </MapView>
      </View>

        {/* Go Online Button */}
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity onPress={()=>router.push("/(protected)/ride-details/profile")} style={styles.goOnlineButton}>
            <MaterialCommunityIcons name="steering" size={24} color={colors.gold} />
            <Text style={styles.goOnlineText}>Go Online</Text>
          </TouchableOpacity>
        </View>     
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  container: {
    flex: 1,
    paddingTop: scale(60),
  },
  header: {
    paddingHorizontal: scale(20),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(25),
    gap: scale(12),
  },
  smallLogo: {
    width: scale(50),
    height: scale(50),
  },
  welcomeText: {
    fontSize: scale(32),
    fontWeight: "500",
    color: "#1A1A1A",
  },

  card: {
    backgroundColor: "white",
    marginHorizontal: scale(20),
    marginTop: scale(15),
    padding: scale(15),
    borderRadius: scale(12),
    elevation: 3,
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  cardTitle: {
    fontWeight: "600",
    marginLeft: 5,
  },

  cardSubtitle: {
    color: "#666",
    marginTop: 4,
  },

  mapContainer: {
    flex: 1,
    marginHorizontal: scale(20),
    marginTop: scale(15),
    borderRadius: scale(16),
    overflow: "hidden",
  },

  map: {
    flex: 1,
  },

  goOnlineButton: {
    flexDirection: "row",
    width: scale(150),
    backgroundColor: colors.main,
    marginHorizontal: scale(20),
    marginVertical: scale(15),
    marginBottom: verticalScale(100),
    paddingVertical: scale(14),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    gap: scale(8),
  },

  goOnlineText: {
    color: colors.gold,
    fontWeight: "600",
    fontSize: moderateScale(14),
  },
});
