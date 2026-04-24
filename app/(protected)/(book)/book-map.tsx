import { MarkerCircle } from "@/components/AnimatedMarker";
import CarSelection from "@/components/CarSelection";
import { MarkerCar, MarkerTriangle } from "@/components/Markers";
import PaymentScreen from "@/components/PaymentCard";
import RoadPolyline from "@/components/RoadPolyline";
import { useGetNearbyDriversMutation } from "@/redux/api/rideBookApi";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { router, useFocusEffect } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BackHandler,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { scale, verticalScale } from "react-native-size-matters";
const { height } = Dimensions.get("window");

const DEFAULT_COORDINATE = {
  latitude: 23.7806,
  longitude: 90.4071,
};

export default function ChooseRideScreen() {
  const mapRef = useRef<MapView | null>(null);
  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const [ispayment, setIspayment] = useState(false);
  const [getNearbyDrivers, { data: nearbyDriversResponse }] =
    useGetNearbyDriversMutation();
  const { pickup, dropoff } = useAppSelector((state) => state.rideBook.step1);

  const handleBackPress = () => {
    router.replace("/(protected)/(book)");
  };

  const pickupCoordinate = useMemo(
    () => (pickup ? { latitude: pickup.lat, longitude: pickup.lng } : null),
    [pickup?.lat, pickup?.lng],
  );
  const dropoffCoordinate = useMemo(
    () => (dropoff ? { latitude: dropoff.lat, longitude: dropoff.lng } : null),
    [dropoff?.lat, dropoff?.lng],
  );

  const nearbyDriverCoordinates = useMemo(
    () =>
      (nearbyDriversResponse?.data?.drivers ?? [])
        .map((driver) => {
          const coordinates = driver.location?.point?.coordinates;
          if (
            !coordinates ||
            coordinates.length < 2 ||
            typeof coordinates[0] !== "number" ||
            typeof coordinates[1] !== "number"
          ) {
            return null;
          }

          return {
            driverId: driver.driverId,
            latitude: coordinates[1],
            longitude: coordinates[0],
          };
        })
        .filter(
          (
            driver,
          ): driver is {
            driverId: string;
            latitude: number;
            longitude: number;
          } => driver !== null,
        ),
    [nearbyDriversResponse?.data?.drivers],
  );

  const initialRegion = useMemo(() => {
    if (!pickupCoordinate || !dropoffCoordinate) {
      return {
        ...DEFAULT_COORDINATE,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }

    const latitudeCenter =
      (pickupCoordinate.latitude + dropoffCoordinate.latitude) / 2;
    const longitudeCenter =
      (pickupCoordinate.longitude + dropoffCoordinate.longitude) / 2;

    const latitudeDelta =
      Math.max(
        Math.abs(pickupCoordinate.latitude - dropoffCoordinate.latitude) * 1.8,
        0.01,
      ) || 0.02;
    const longitudeDelta =
      Math.max(
        Math.abs(pickupCoordinate.longitude - dropoffCoordinate.longitude) *
          1.8,
        0.01,
      ) || 0.02;

    return {
      latitude: latitudeCenter,
      longitude: longitudeCenter,
      latitudeDelta,
      longitudeDelta,
    };
  }, [dropoffCoordinate, pickupCoordinate]);

  useEffect(() => {
    const sourceCoordinate = pickupCoordinate ?? DEFAULT_COORDINATE;

    getNearbyDrivers({
      lat: sourceCoordinate.latitude,
      lng: sourceCoordinate.longitude,
    }).catch((error) => {
      console.log("Nearby drivers fetch failed:", error);
    });
  }, [
    getNearbyDrivers,
    pickupCoordinate?.latitude,
    pickupCoordinate?.longitude,
  ]);

  useEffect(() => {
    if (!pickupCoordinate || !dropoffCoordinate || !mapRef.current) {
      return;
    }

    mapRef.current.fitToCoordinates([pickupCoordinate, dropoffCoordinate], {
      edgePadding: {
        top: 80,
        right: 60,
        bottom: 320,
        left: 60,
      },
      animated: true,
    });
  }, [dropoffCoordinate, pickupCoordinate]);

  useFocusEffect(
    useCallback(() => {
      const onHardwareBackPress = () => {
        handleBackPress();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onHardwareBackPress,
      );

      return () => subscription.remove();
    }, [ispayment]),
  );

  return (
    <View style={styles.mainContainer}>
      {/* Background Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        userInterfaceStyle="light"
        initialRegion={initialRegion}
      >
        {pickupCoordinate && (
          <MarkerCircle
            anchor={{ x: 0.5, y: 0.5 }}
            coordinate={pickupCoordinate}
          />
        )}

        {dropoffCoordinate && (
          <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={dropoffCoordinate}>
            <MarkerTriangle />
          </Marker>
        )}

        {nearbyDriverCoordinates.map((driver) => (
          <Marker
            key={driver.driverId}
            anchor={{ x: 0.5, y: 0.5 }}
            coordinate={{
              latitude: driver.latitude,
              longitude: driver.longitude,
            }}
          >
            <MarkerCar />
          </Marker>
        ))}

        {pickupCoordinate && dropoffCoordinate && (
          <RoadPolyline
            coordinates={[pickupCoordinate, dropoffCoordinate]}
            strokeColor="#6366F1"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Choose Ride Bottom Sheet */}
      {ispayment && (
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={[height * 0.07, height * 0.9]}
          enableDynamicSizing={false}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          enableBlurKeyboardOnGesture
          android_keyboardInputMode="adjustResize"
          activeOffsetY={[0, 1]}
          enablePanDownToClose={false}
          handleIndicatorStyle={{
            backgroundColor: "#ccc",
            width: scale(50),
            height: 8,
            marginTop: verticalScale(4),
          }}
        >
          <PaymentScreen />
        </BottomSheet>
      )}

      {!ispayment && (
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={[height * 0.06, height * 0.6]}
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
          <CarSelection setIspayment={setIspayment} />
        </BottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F5F5F5" },
  map: { ...StyleSheet.absoluteFillObject },
  backButton: {
    position: "absolute",
    top: verticalScale(35),
    left: scale(15),
    backgroundColor: "white",
    padding: scale(8),
    borderRadius: 100,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
