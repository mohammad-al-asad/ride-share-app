import { MarkerCircle, MarkerTriangle, MarkerUser } from "@/components/Markers";
import RequiredActions from "@/components/RequiredActions";
import RiderPickupCard from "@/components/RidePickupCard";
import { colors } from "@/config/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const routeCoordinates = [
  { latitude: 32.783, longitude: -96.804 },
  { latitude: 32.783, longitude: -96.8 },
  { latitude: 32.785, longitude: -96.8 },
  { latitude: 32.785, longitude: -96.797 },
];

export default function HomeScreen() {
  const [driverLocation, setDriverLocation] = useState<any>({
    latitude: 32.78,
    longitude: -96.8,
  });
  const [heading, setHeading] = useState<number>(0);
  const [isEyeOpened, setIsEyeOpened] = useState(true);
  const mapRef = useRef<MapView | null>(null);
  const [isOffline, setisOffline] = useState(true);
  const [isRequest, setIsRequest] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  // Reanimated shared value
  const eyeValue = useSharedValue(1);

  const toggleEye = () => {
    eyeValue.value = isEyeOpened ? 0 : 1;
    setIsEyeOpened(!isEyeOpened);
  };

  // Animated pill style
  const pillStyle = useAnimatedStyle(() => {
    return {
      paddingHorizontal: withSpring(eyeValue.value ? 8 : 16, {
        duration: 500,
      }),
      borderRadius: withTiming(eyeValue.value ? 30 : 100, {
        duration: 200,
      }),
    };
  });

  return (
    <View style={styles.mainContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={false}
        showsMyLocationButton={true}
        initialRegion={{
          latitude: 32.78,
          longitude: -96.8,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Polyline
          coordinates={routeCoordinates}
          strokeWidth={5}
          strokeColor="#6366F1"
        />
        {driverLocation && (
          <Marker
            coordinate={routeCoordinates[0]}
            anchor={{ x: 0.5, y: 0.5 }}
            flat
            rotation={heading}
          >
            <MarkerCircle />
          </Marker>
        )}

        <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={routeCoordinates[3]}>
          <MarkerTriangle />
        </Marker>
        <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={routeCoordinates[2]}>
          <MarkerUser />
        </Marker>
      </MapView>

      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.replace("/(protected)/(tab)")}
        >
          <Image
            source={require("@/assets/icons/home.svg")}
            style={{ width: scale(24), height: scale(24) }}
            contentFit="contain"
          />
        </TouchableOpacity>

        {/* Reanimated Wallet Pill */}
        <Animated.View style={[styles.walletPill, pillStyle]}>
          {!isEyeOpened && (
            <View style={[{ flexDirection: "row", alignItems: "center" }]}>
              <Text style={styles.walletText} numberOfLines={1}>
                <Text style={{ color: "#FFD283" }}>USD</Text> 0.00
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.walletIconCircle}
            onPress={toggleEye}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isEyeOpened ? "eye-off" : "eye"}
              size={scale(16)}
              color="#FFD700"
            />
          </TouchableOpacity>
        </Animated.View>

        <View style={{ width: scale(40) }} />
      </View>

      {/* Center Floating "Go Online" Button */}
      <View style={styles.onlineButtonWrapper}>
        <TouchableOpacity
          style={styles.goOnlineButton}
          onPress={() => {
            setisOffline(false);
            setIsRequest(true);
          }}
        >
          <MaterialCommunityIcons
            name="steering"
            size={scale(20)}
            color={colors.gold}
          />
          <Text style={styles.goOnlineText}>Go Online</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Status Sheets */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        {/* Offline Sheet */}
        {isOffline && (
          <>
            <Text style={styles.statusHeader}>Your&apos;re offline</Text>
            <RequiredActions />
          </>
        )}
        {/* Offline Sheet */}

        {/* Ride Request Card */}
        {isRequest && (
          <View style={styles.requestCard}>
            <TouchableOpacity style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.serviceType}>PREMIUM VAN (COMPACT)</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>$5.54</Text>
            </View>

            <View style={styles.ratingBadge}>
              <Ionicons name="person-circle" size={20} color="#CCC" />
              <View style={styles.starBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>4.5</Text>
              </View>
            </View>

            <View style={styles.locationContainer}>
              <View style={styles.locationRow}>
                <Ionicons name="radio-button-on" size={20} color="#6366F1" />
                <View style={styles.locationInfo}>
                  <Text style={styles.distanceText}>
                    Pickup location 1.2 mi away
                  </Text>
                  <Text style={styles.addressText}>
                    Brac University Building 5
                  </Text>
                </View>
              </View>

              <View style={styles.dashLine} />

              <View style={styles.locationRow}>
                <Ionicons name="location" size={20} color="#6366F1" />
                <View style={styles.locationInfo}>
                  <Text style={styles.distanceText}>
                    Dropoff location 2.1 mi away
                  </Text>
                  <Text style={styles.addressText}>Gulshan 1 DNCC Market</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="alert-circle-outline" size={18} color="#10B981" />
              <Text style={styles.infoText}>
                You will get 60% of the total fare.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => {
                setIsRequest(false);
                setIsAccepted(true);
              }}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Ride Request Card  */}
        {/* Accepted Ride */}
        {isAccepted && <RiderPickupCard />}
        {/* Accepted Ride */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  topControls: {
    position: "absolute",
    top: verticalScale(50),
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(20),
  },
  iconButton: {
    backgroundColor: "white",
    padding: scale(10),
    borderRadius: scale(100),
    elevation: 4,
  },
  walletPill: {
    backgroundColor: "#6366F1",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 30,
    minHeight: scale(40),
    overflow: "hidden",
    gap: scale(8),
  },
  walletText: {
    color: "white",
    fontWeight: "700",
    fontSize: moderateScale(16),
    marginRight: scale(10),
  },
  walletIconCircle: {
    backgroundColor: "#2E1A47",
    borderRadius: 100,
    padding: scale(6),
    justifyContent: "center",
    alignItems: "center",
  },
  onlineButtonWrapper: {
    position: "absolute",
    bottom: moderateScale(220),
    width: "100%",
    alignItems: "center",
  },
  goOnlineButton: {
    flexDirection: "row",
    backgroundColor: colors.main,
    paddingVertical: scale(12),
    paddingHorizontal: scale(25),
    borderRadius: scale(15),
    alignItems: "center",
    gap: scale(10),
    elevation: 5,
  },
  goOnlineText: {
    color: colors.gold,
    fontWeight: "600",
    fontSize: moderateScale(16),
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: scale(25),
    borderTopRightRadius: scale(25),
    paddingBottom: verticalScale(40),
    paddingHorizontal: scale(20),
    alignItems: "center",
  },
  handle: {
    width: scale(40),
    height: scale(5),
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    marginTop: scale(10),
    marginBottom: scale(20),
  },
  statusHeader: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    color: "#333",
    marginBottom: scale(15),
  },

  // Request Card Styles
  requestCard: {
    position: "absolute",
    bottom: scale(20),
    left: scale(15),
    right: scale(15),
    backgroundColor: "white",
    borderRadius: scale(20),
    padding: scale(20),
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    padding: 5,
  },
  serviceType: {
    fontSize: moderateScale(12),
    color: "#666",
    fontWeight: "600",
  },
  priceRow: {
    paddingVertical: 5,
  },
  priceText: { fontSize: moderateScale(32), fontWeight: "800", color: "#111" },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  starBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  ratingText: { fontWeight: "700", fontSize: 12 },

  locationContainer: {
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  locationRow: { flexDirection: "row", gap: 12 },
  locationInfo: { flex: 1 },
  distanceText: { fontSize: 11, color: "#9CA3AF" },
  addressText: { fontSize: 13, fontWeight: "700", color: "#374151" },
  dashLine: {
    height: 20,
    width: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#DDD",
    marginLeft: 10,
    marginVertical: 2,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  infoText: { color: "#10B981", fontSize: 13, fontWeight: "500" },
  acceptButton: {
    backgroundColor: "#1E0078",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  acceptButtonText: { color: "white", fontWeight: "700", fontSize: 18 },
});
