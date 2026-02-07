import { colors } from "@/config/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView from "react-native-maps";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { MarkerCircle } from "./AnimatedMarker";
import AuthBackground from "./AuthBackground";
import RequiredActions from "./RequiredActions";

export default function HomeScreen() {
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [heading, setHeading] = useState<number>(0);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 0,
          distanceInterval: 0,
        },
        (location) => {
          const { latitude, longitude, heading } = location.coords;

          setDriverLocation({ latitude, longitude });
          // setDriverLocation({
          //   latitude: 32.78,
          //   longitude: -96.8,
          // });
          setHeading(heading || 0);

          mapRef.current?.animateCamera({
            center: { latitude, longitude },
            // center: {
            //   latitude: 32.78,
            //   longitude: -96.8,
            // },
            zoom: 17,
          });
        },
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <View style={styles.mainContainer}>
      <AuthBackground />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/logo-blue.svg")}
            style={styles.smallLogo}
            contentFit="contain"
          />
          <Text style={styles.welcomeText}>Welcome, Harish!</Text>
        </View>

        {/* Card */}
        <View
          style={{
            paddingHorizontal: scale(15),
          }}
        >
          <RequiredActions />
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            showsUserLocation={false}
            userInterfaceStyle="light"
            initialRegion={{
              latitude: 32.78,
              longitude: -96.8,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {driverLocation && (
              <MarkerCircle
                coordinate={driverLocation}
                anchor={{ x: 0.5, y: 0.5 }}
                flat
                rotation={heading}
                tracksViewChanges={true}
              />
            )}
          </MapView>
          <TouchableOpacity
            style={styles.maximizeBtn}
            onPress={() => {
              router.push({
                pathname: "/(protected)/(driver)/(home)/zoomed-map",
              });
            }}
          >
            <Ionicons name="expand" size={20} />
          </TouchableOpacity>
        </View>

        {/* Button */}
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity onPress={() => {}} style={styles.goOnlineButton}>
            <MaterialCommunityIcons
              name="steering"
              size={24}
              color={colors.gold}
            />
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
  maximizeBtn: {
    position: "absolute",
    top: scale(15),
    right: scale(15),
    backgroundColor: "#C3CCFF",
    padding: scale(8),
    borderRadius: scale(100),
    zIndex: 10,
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
