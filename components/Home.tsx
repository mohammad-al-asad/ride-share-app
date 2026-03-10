import AuthBackground from "@/components/AuthBackground";
import { colors } from "@/config/colors";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";

const RECENT_LOCATIONS = [
  {
    id: "1",
    name: "Hazrat Shahjalal International Airport",
    address: "Airport - Dakshinkhan Rd, Dhaka",
  },
  {
    id: "2",
    name: "Hazrat Shahjalal International Airport",
    address: "Airport - Dakshinkhan Rd, Dhaka",
  },
];

export default function HomeScreen() {
    const user = useAppSelector((state: RootState) => state.auth.user);
    const userName = user?.name?.trim() || "User";
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
          <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
        </View>

        {/* Search Bar Section */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Get a ride"
              style={styles.input}
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.laterButton}
            onPress={() => router.push("/(protected)/(book)" as any)}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.main} />
            <Text style={styles.laterText}>Later</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Locations */}
        <Text style={styles.sectionTitle}>Recent</Text>

        <FlatList
          data={RECENT_LOCATIONS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.locationItem}>
              <View style={styles.timeIconContainer}>
                <Ionicons name="time-outline" size={20} color="#333" />
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.locationAddress} numberOfLines={1}>
                  {item.address}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
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
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    gap: 12,
  },
  smallLogo: {
    width: 50,
    height: 50,
  },
  welcomeText: {
    fontSize: scale(32),
    fontWeight: "500",
    color: "#1A1A1A",
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F2F4",
    borderRadius: 12,
    alignItems: "center",
    paddingHorizontal: 15,
    height: 60,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 10,
  },
  laterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#BCC8FF", // Light blue button background
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  laterText: {
    color: "#240183",
    fontWeight: "600",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 15,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB", // Grey background for list items
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  timeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 13,
    color: "#666",
  },
});
