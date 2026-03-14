import { MarkerCircle } from "@/components/AnimatedMarker";
import CarSelection from "@/components/CarSelection";
import { MarkerCar, MarkerTriangle } from "@/components/Markers";
import PaymentScreen from "@/components/PaymentCard";
import { useAppSelector } from "@/redux/hooks";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { scale, verticalScale } from "react-native-size-matters";
const { height } = Dimensions.get("window");
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_MAP_API_KEY;

const DEFAULT_COORDINATE = {
  latitude: 23.7806,
  longitude: 90.4071,
};

type MapCoordinate = {
  latitude: number;
  longitude: number;
};

const decodePolyline = (encoded: string): MapCoordinate[] => {
  const coordinates: MapCoordinate[] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    latitude += deltaLat;

    result = 0;
    shift = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    longitude += deltaLng;

    coordinates.push({
      latitude: latitude / 1e5,
      longitude: longitude / 1e5,
    });
  }

  return coordinates;
};

export default function ChooseRideScreen() {
  const mapRef = useRef<MapView | null>(null);
  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const [ispayment, setIspayment] = useState(false);
  const { pickup, dropoff } = useAppSelector((state) => state.rideBook.step1);
  const [routePolyline, setRoutePolyline] = useState<MapCoordinate[]>([]);

  const handleBackPress = useCallback(() => {
    if (ispayment) {
      setIspayment(false);
      return;
    }

    router.back();
  }, [ispayment]);

  const pickupCoordinate = useMemo(
    () => (pickup ? { latitude: pickup.lat, longitude: pickup.lng } : null),
    [pickup?.lat, pickup?.lng],
  );
  const dropoffCoordinate = useMemo(
    () => (dropoff ? { latitude: dropoff.lat, longitude: dropoff.lng } : null),
    [dropoff?.lat, dropoff?.lng],
  );

  const carCoordinate = useMemo(() => {
    if (!pickupCoordinate || !dropoffCoordinate) {
      return null;
    }

    return {
      latitude: (pickupCoordinate.latitude + dropoffCoordinate.latitude) / 2,
      longitude: (pickupCoordinate.longitude + dropoffCoordinate.longitude) / 2,
    };
  }, [dropoffCoordinate, pickupCoordinate]);

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
    let cancelled = false;

    const fetchRoadPolyline = async () => {
      if (!pickupCoordinate || !dropoffCoordinate) {
        setRoutePolyline([]);
        return;
      }

      if (!GOOGLE_MAPS_API_KEY) {
        setRoutePolyline([pickupCoordinate, dropoffCoordinate]);
        return;
      }

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${pickupCoordinate.latitude},${pickupCoordinate.longitude}&destination=${dropoffCoordinate.latitude},${dropoffCoordinate.longitude}&key=${GOOGLE_MAPS_API_KEY}`,
        );
        const data = await response.json();
        const encodedPoints: string | undefined =
          data?.routes?.[0]?.overview_polyline?.points;

        if (!encodedPoints) {
          if (!cancelled) {
            setRoutePolyline([pickupCoordinate, dropoffCoordinate]);
          }
          return;
        }

        const decodedRoute = decodePolyline(encodedPoints);
        if (!cancelled) {
          setRoutePolyline(
            decodedRoute.length > 1
              ? decodedRoute
              : [pickupCoordinate, dropoffCoordinate],
          );
        }
      } catch (error) {
        console.log("Directions route fetch failed:", error);
        if (!cancelled) {
          setRoutePolyline([pickupCoordinate, dropoffCoordinate]);
        }
      }
    };

    fetchRoadPolyline();

    return () => {
      cancelled = true;
    };
  }, [
    dropoffCoordinate?.latitude,
    dropoffCoordinate?.longitude,
    pickupCoordinate?.latitude,
    pickupCoordinate?.longitude,
  ]);

  useEffect(() => {
    if (!pickupCoordinate || !dropoffCoordinate || !mapRef.current) {
      return;
    }

    const coordinatesToFit =
      routePolyline.length > 1
        ? routePolyline
        : [pickupCoordinate, dropoffCoordinate];

    mapRef.current.fitToCoordinates(coordinatesToFit, {
      edgePadding: {
        top: 80,
        right: 60,
        bottom: 320,
        left: 60,
      },
      animated: true,
    });
  }, [dropoffCoordinate, pickupCoordinate, routePolyline]);

  useFocusEffect(
    useCallback(() => {
      const onHardwareBackPress = () => {
        if (ispayment) {
          setIspayment(false);
          return true;
        }
        return false;
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

        {carCoordinate && (
          <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={carCoordinate}>
            <MarkerCar />
          </Marker>
        )}

        {pickupCoordinate && dropoffCoordinate && routePolyline.length > 0 && (
          <Polyline
            coordinates={routePolyline}
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
          snapPoints={[height * 0.07, height * 0.78]}
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
