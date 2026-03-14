import { MarkerCircle } from "@/components/AnimatedMarker";
import DriverAvailabilityButton from "@/components/DriverAvailabilityButton";
import { MarkerTriangle, MarkerUser } from "@/components/Markers";
import RequestCard from "@/components/RequestCard";
import RiderPickupCard from "@/components/RidePickupCard";
import TopMapControlls from "@/components/TopMapControlls";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import BottomSheet from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const routeCoordinates = [
  { latitude: 32.783, longitude: -96.804 },
  { latitude: 32.783, longitude: -96.8 },
  { latitude: 32.785, longitude: -96.8 },
  { latitude: 32.785, longitude: -96.797 },
];
const { height } = Dimensions.get("window");
const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "");

export default function HomeScreen() {
  const mapRef = useRef<MapView | null>(null);
  const bottomSheetRef = useRef<BottomSheet | null>(null);
  // Driver state
  const isOnline = useAppSelector(
    (state: RootState) => state.driverRideStart.isOnline,
  );
  const [driverLocation, setDriverLocation] = useState(routeCoordinates[0]);
  const [heading, setHeading] = useState(0);

  // Navigation steps
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [isRequest, setIsRequest] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  // Fetch directions from Google Directions API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${routeCoordinates[0].latitude},${routeCoordinates[0].longitude}&destination=${routeCoordinates[2].latitude},${routeCoordinates[2].longitude}&key=${process.env.EXPO_PUBLIC_MAP_API_KEY}`,
        );
        const data = await res.json();
        const routeSteps = data.routes[0].legs[0].steps;
        setSteps(routeSteps);
        setCurrentStepIndex(0);
      } catch (err) {
        console.log("Directions API error:", err);
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let subscription: Location.LocationSubscription | null = null;

      const startWatching = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") return;

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 5,
            timeInterval: 2000,
          },
          (loc) => {
            const newLocation = {
              latitude: routeCoordinates[0].latitude,
              longitude: routeCoordinates[0].longitude,
            };

            setDriverLocation(newLocation);
            setHeading(loc.coords.heading || 0);

            // ---- Pickup Check ----
            const pickup = routeCoordinates[2];
            const distanceToPickup = getDistance(
              newLocation.latitude,
              newLocation.longitude,
              pickup.latitude,
              pickup.longitude,
            );

            if (distanceToPickup < 30) {
              setArrived(true);
            }

            // ---- Step Progression ----
            if (steps.length) {
              const step = steps[currentStepIndex];
              const end = step.end_location;

              const distToStepEnd = getDistance(
                newLocation.latitude,
                newLocation.longitude,
                end.lat,
                end.lng,
              );

              if (distToStepEnd < 15 && currentStepIndex < steps.length - 1) {
                setCurrentStepIndex((prev) => prev + 1);
              }
            }
          },
        );
      };

      startWatching();

      return () => {
        subscription?.remove();
        subscription = null;
      };
    }, [routeCoordinates, steps, currentStepIndex]),
  );

  return (
    <View style={styles.mainContainer}>
      {/* Top Controlls */}
      <TopMapControlls driverLocation={driverLocation} />
      {/* Navigation card */}
      {/* <NavigationCard
        distance={steps[currentStepIndex]?.distance?.text || "0.0 mi"}
        roadName={
          steps[currentStepIndex]
            ? stripHtml(steps[currentStepIndex].html_instructions).replace(
                /Turn.*onto /,
                "",
              )
            : "Unknown"
        }
        pickupLocation="Gulshan 1 DNCC Market"
        maneuver={steps[currentStepIndex]?.maneuver || "straight"}
        arrived={arrived}
      /> */}
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        userInterfaceStyle="light"
        showsUserLocation={false}
        showsMyLocationButton
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

        {/* Driver marker */}
        <MarkerCircle
          tracksViewChanges={true}
          coordinate={driverLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          flat
          rotation={heading}
        />

        {/* Destination / pickup */}
        <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={routeCoordinates[3]}>
          <MarkerTriangle />
        </Marker>
        <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={routeCoordinates[2]}>
          <MarkerUser />
        </Marker>
      </MapView>
      {/* Ride Request Card */}
      {isRequest && (
        <RequestCard
          onAccept={() => {
            setIsRequest(false);
            setIsAccepted(true);
          }}
        />
      )}
      {/* Ride Request Card */}
      {/* Bottom Status Sheets */}
      {isOnline ? (
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          style={[
            styles.bottomSheet,
            { alignItems: "center", justifyContent: "center" },
          ]}
          snapPoints={[height * 0.06, height * 0.25]}
          enableDynamicSizing={false}
          activeOffsetY={[0, 1]}
          enablePanDownToClose={false}
          handleIndicatorStyle={{
            backgroundColor: "#ccc",
            width: scale(50),
            height: 8,
            marginTop: verticalScale(4),
          }}
        >
          {/* Online Sheet */}
          <>
            <Text style={styles.statusHeader}>You&apos;re online</Text>
            <Text style={styles.statusSubtext}>
              Finding your next customer...
            </Text>
            <View style={styles.statusLevelTrack}>
              <View style={styles.statusLevelFill} />
            </View>
          </>
          {/* Online Sheet */}
        </BottomSheet>
      ) : (
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          style={[
            styles.bottomSheet,
            { alignItems: "center", justifyContent: "center" },
          ]}
          snapPoints={[height * 0.06, height * 0.25]}
          enableDynamicSizing={false}
          activeOffsetY={[0, 1]}
          enablePanDownToClose={false}
          handleIndicatorStyle={{
            backgroundColor: "#ccc",
            width: scale(50),
            height: 8,
            marginTop: verticalScale(4),
          }}
        >
          {/* Online Sheet */}
          <>
            <Text style={styles.statusHeader}>You&apos;re offline</Text>
            <DriverAvailabilityButton
              driverLocation={driverLocation}
              style={{
                flexDirection: "row",
                width: scale(270),
                marginTop: verticalScale(20),
              }}
            />
          </>
          {/* Online Sheet */}
        </BottomSheet>
      )}
      {isAccepted && (
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          style={styles.bottomSheet}
          snapPoints={[height * 0.06, height * 0.43]}
          enableDynamicSizing={false}
          activeOffsetY={[0, 1]}
          enablePanDownToClose={false}
          handleIndicatorStyle={{
            backgroundColor: "#ccc",
            width: scale(50),
            height: 8,
            marginTop: verticalScale(4),
          }}
        >
          {/* Accepted Ride */}
          <RiderPickupCard />
          {/* Accepted Ride */}
        </BottomSheet>
      )}
    </View>
  );
}

// Distance function (meters)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  topControls: {
    position: "absolute",
    top: verticalScale(30),
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(20),
    zIndex: 10,
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
  bottomSheet: {
    paddingHorizontal: scale(20),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statusHeader: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    color: "#333",
    marginTop: scale(18),
    textAlign: "center",
  },
  statusSubtext: {
    fontSize: moderateScale(14),
    color: "#5B5B5B",
    marginTop: scale(8),
    marginBottom: scale(18),
    textAlign: "center",
  },
  statusLevelTrack: {
    width: scale(270),
    height: verticalScale(6),
    borderRadius: scale(999),
    backgroundColor: "#E7E7E7",
    overflow: "hidden",
  },
  statusLevelFill: {
    width: "11%",
    height: "100%",
    borderRadius: scale(999),
    backgroundColor: "#5E5CFF",
  },
});
