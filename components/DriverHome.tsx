import { colors } from "@/config/colors";
import { useGetDriverHomeQuery } from "@/redux/api/driverRIdeStart";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { MarkerCircle } from "./AnimatedMarker";
import AuthBackground from "./AuthBackground";
import DriverAvailabilityButton, {
  DriverCoordinate,
} from "./DriverAvailabilityButton";
import { MarkerTriangle, MarkerUser } from "./Markers";
import RoadPolyline from "./RoadPolyline";
import RequiredActions from "./RequiredActions";

const DEFAULT_COORDINATE: DriverCoordinate = {
  latitude: 23.7806,
  longitude: 90.4071,
};

const pointToCoordinate = (
  coordinates?: [number, number] | null,
): DriverCoordinate | null => {
  if (
    !coordinates ||
    coordinates.length < 2 ||
    typeof coordinates[0] !== "number" ||
    typeof coordinates[1] !== "number"
  ) {
    return null;
  }

  return {
    latitude: coordinates[1],
    longitude: coordinates[0],
  };
};

export default function HomeScreen() {
  const user = useAppSelector((state: RootState) => state.auth.user);
  useGetDriverHomeQuery(undefined, {
    skip: !user,
  });
  const driverStatusMessage = useAppSelector(
    (state: RootState) => state.driverRideStart.message,
  );
  const isOnline = useAppSelector(
    (state: RootState) => state.driverRideStart.isOnline,
  );
  const storedDriverLocation = useAppSelector(
    (state: RootState) => state.driverRideStart.location,
  );
  const activeTrip = useAppSelector(
    (state: RootState) => state.driverRideStart.activeTrip,
  );
  const userName = user?.name?.trim() || "User";
  const initialDriverLocation = storedDriverLocation
    ? pointToCoordinate(storedDriverLocation.point.coordinates) ?? DEFAULT_COORDINATE
    : DEFAULT_COORDINATE;
  const [driverLocation, setDriverLocation] = useState<DriverCoordinate | null>(
    initialDriverLocation,
  );
  const [heading, setHeading] = useState(0);
  const mapRef = useRef<MapView | null>(null);
  const pickupCoordinate = activeTrip
    ? pointToCoordinate(activeTrip.pickup.point.coordinates)
    : null;
  const dropoffCoordinate = activeTrip
    ? pointToCoordinate(activeTrip.dropoff.point.coordinates)
    : null;
  const currentDriverCoordinate = driverLocation ?? initialDriverLocation;
  const tripPolylineCoordinates = [
    currentDriverCoordinate,
    pickupCoordinate,
    dropoffCoordinate,
  ].filter((coordinate): coordinate is DriverCoordinate => Boolean(coordinate));

  useFocusEffect(
    useCallback(() => {
      let subscription: Location.LocationSubscription | null = null;

      const startWatching = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") return;

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 5,
          },
          (location) => {
            const { latitude, longitude, heading } = location.coords;

            setDriverLocation({ latitude, longitude });
            setHeading(heading || 0);

            mapRef.current?.animateCamera({
              center: { latitude, longitude },
              zoom: 17,
            });
          },
        );
      };

      startWatching();

      return () => {
        subscription?.remove();
        subscription = null;
      };
    }, []),
  );

  useEffect(() => {
    if (storedDriverLocation) {
      setDriverLocation(pointToCoordinate(storedDriverLocation.point.coordinates));
    }
  }, [storedDriverLocation]);

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
          <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
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
              latitude: currentDriverCoordinate.latitude,
              longitude: currentDriverCoordinate.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {tripPolylineCoordinates.length > 1 && (
              <RoadPolyline
                coordinates={tripPolylineCoordinates}
                strokeColor="#6366F1"
                strokeWidth={4}
              />
            )}

            {driverLocation && (
              <MarkerCircle
                coordinate={driverLocation}
                anchor={{ x: 0.5, y: 0.5 }}
                flat
                rotation={heading}
                tracksViewChanges={true}
              />
            )}

            {pickupCoordinate && (
              <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={pickupCoordinate}>
                <MarkerUser />
              </Marker>
            )}

            {dropoffCoordinate && (
              <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={dropoffCoordinate}>
                <MarkerTriangle />
              </Marker>
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
          {activeTrip ? (
            <TouchableOpacity
              style={styles.ridingShortcut}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/(protected)/(driver)/(home)/zoomed-map",
                })
              }
            >
              <Text style={styles.ridingShortcutText}>Riding...</Text>
              <View style={styles.ridingShortcutIcon}>
                <Ionicons name="car-sport" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ) : (
            <DriverAvailabilityButton
              driverLocation={driverLocation}
              style={styles.goOnlineButton}
              onlineStyle={styles.stopButton}
              textStyle={styles.goOnlineText}
            />
          )}
          <Text style={styles.statusText}>
            {activeTrip
              ? "You have an active trip in progress"
              : driverStatusMessage ??
                (isOnline ? "Driver is now online" : "Driver is now offline")}
          </Text>
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
    fontSize: scale(20),
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
    width: scale(170),
    backgroundColor: colors.main,
    marginHorizontal: scale(20),
    marginVertical: scale(15),
    marginBottom: verticalScale(100),
    paddingVertical: scale(16),
    borderRadius: scale(18),
    justifyContent: "center",
    alignItems: "center",
    gap: scale(8),
  },
  stopButton: {
    width: scale(185),
    paddingVertical: scale(18),
  },
  goOnlineText: {
    color: colors.gold,
    fontWeight: "600",
    fontSize: moderateScale(14),
  },
  statusText: {
    color: colors.secondaryText,
    fontSize: moderateScale(13),
    marginTop: scale(-8),
  },
  ridingShortcut: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A5B4FC",
    borderRadius: 999,
    paddingLeft: scale(14),
    paddingRight: scale(4),
    paddingVertical: scale(4),
    marginHorizontal: scale(20),
    marginVertical: scale(15),
    marginBottom: verticalScale(100),
    gap: scale(8),
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  ridingShortcutText: {
    color: "#4F46E5",
    fontWeight: "600",
    fontSize: moderateScale(12),
  },
  ridingShortcutIcon: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: "#312E81",
    alignItems: "center",
    justifyContent: "center",
  },
});
