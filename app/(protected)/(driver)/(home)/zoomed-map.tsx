import { MarkerCircle } from "@/components/AnimatedMarker";
import DriverAvailabilityButton from "@/components/DriverAvailabilityButton";
import { MarkerTriangle, MarkerUser } from "@/components/Markers";
import RequestCard from "@/components/RequestCard";
import RiderPickupCard from "@/components/RidePickupCard";
import TopMapControlls from "@/components/TopMapControlls";
import { useAcceptRideRequestMutation } from "@/redux/api/driverRIdeStart";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import BottomSheet from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

type Coordinate = {
  latitude: number;
  longitude: number;
};

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_MAP_API_KEY;

const DEFAULT_COORDINATE: Coordinate = {
  latitude: 23.7806,
  longitude: 90.4071,
};

const DUMMY_REQUEST_ID = "69b711a3d6942c6521a53cee";

const DUMMY_REQUEST_PREVIEW = {
  rideLabel: "REGULAR CAR (NORMAL)",
  fare: 127.5,
  pickupAddress: "Brac University Building 5",
  dropoffAddress: "Hazrat Shahjalal Airport",
  driverSharePercent: 60,
};

const { height } = Dimensions.get("window");

const pointToCoordinate = ([longitude, latitude]: [number, number]): Coordinate => ({
  latitude,
  longitude,
});

const isCoordinate = (coordinate: Coordinate | null): coordinate is Coordinate =>
  Boolean(coordinate);

const getApiErrorMessage = (error: any, fallbackMessage: string) =>
  error?.data?.error?.message ?? error?.data?.message ?? fallbackMessage;

const decodePolyline = (encoded: string): Coordinate[] => {
  const coordinates: Coordinate[] = [];
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

export default function HomeScreen() {
  const mapRef = useRef<MapView | null>(null);
  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const hasFittedTripRef = useRef(false);
  const lastRouteOriginRef = useRef<Coordinate | null>(null);
  const lastRouteTargetRef = useRef("");
  const [acceptRideRequest, { isLoading: isAcceptingRideRequest }] =
    useAcceptRideRequestMutation();

  const { isOnline, location: storedDriverLocation, activeTrip } = useAppSelector(
    (state: RootState) => state.driverRideStart,
  );

  const initialDriverLocation = storedDriverLocation
    ? pointToCoordinate(storedDriverLocation.point.coordinates)
    : DEFAULT_COORDINATE;

  const [driverLocation, setDriverLocation] =
    useState<Coordinate>(initialDriverLocation);
  const [heading, setHeading] = useState(0);
  const [, setArrived] = useState(false);
  const [pendingRequestId, setPendingRequestId] = useState(DUMMY_REQUEST_ID);
  const [routePolyline, setRoutePolyline] = useState<Coordinate[]>([]);

  const pickupCoordinate = activeTrip
    ? pointToCoordinate(activeTrip.pickup.point.coordinates)
    : null;
  const dropoffCoordinate = activeTrip
    ? pointToCoordinate(activeTrip.dropoff.point.coordinates)
    : null;
  const tripCoordinates = [pickupCoordinate].filter(isCoordinate);
  const fallbackPolylineCoordinates =
    tripCoordinates.length > 0 ? [driverLocation, ...tripCoordinates] : [];
  const polylineCoordinates =
    routePolyline.length > 1 ? routePolyline : fallbackPolylineCoordinates;
  const initialRegionCenter = pickupCoordinate ?? driverLocation;

  useEffect(() => {
    if (storedDriverLocation) {
      setDriverLocation(pointToCoordinate(storedDriverLocation.point.coordinates));
    }
  }, [storedDriverLocation]);

  useEffect(() => {
    if (!pickupCoordinate) {
      lastRouteOriginRef.current = null;
      lastRouteTargetRef.current = "";
      setRoutePolyline([]);
      return;
    }

    const routeSignature = `${pickupCoordinate.latitude},${pickupCoordinate.longitude}`;
    const lastRouteOrigin = lastRouteOriginRef.current;
    const hasRouteTargetChanged = lastRouteTargetRef.current !== routeSignature;
    const hasMovedEnough =
      !lastRouteOrigin ||
      getDistance(
        lastRouteOrigin.latitude,
        lastRouteOrigin.longitude,
        driverLocation.latitude,
        driverLocation.longitude,
      ) > 50;

    if (!hasRouteTargetChanged && !hasMovedEnough) {
      return;
    }

    lastRouteOriginRef.current = driverLocation;
    lastRouteTargetRef.current = routeSignature;

    let cancelled = false;
    const fallbackCoordinates = [driverLocation, pickupCoordinate];

    const fetchRoadPolyline = async () => {
      if (!GOOGLE_MAPS_API_KEY) {
        setRoutePolyline(fallbackCoordinates);
        return;
      }

      const destination = pickupCoordinate;

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${driverLocation.latitude},${driverLocation.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`,
        );
        const data = await response.json();
        const encodedPoints: string | undefined =
          data?.routes?.[0]?.overview_polyline?.points;

        if (!encodedPoints) {
          if (!cancelled) {
            setRoutePolyline(fallbackCoordinates);
          }
          return;
        }

        const decodedRoute = decodePolyline(encodedPoints);

        if (!cancelled) {
          setRoutePolyline(
            decodedRoute.length > 1 ? decodedRoute : fallbackCoordinates,
          );
        }
      } catch (error) {
        console.log("Directions route fetch failed:", error);
        if (!cancelled) {
          setRoutePolyline(fallbackCoordinates);
        }
      }
    };

    fetchRoadPolyline();

    return () => {
      cancelled = true;
    };
  }, [
    driverLocation.latitude,
    driverLocation.longitude,
    pickupCoordinate?.latitude,
    pickupCoordinate?.longitude,
  ]);

  useEffect(() => {
    if (!activeTrip) {
      hasFittedTripRef.current = false;
      setArrived(false);
      return;
    }

    if (GOOGLE_MAPS_API_KEY && routePolyline.length === 0) {
      return;
    }

    if (hasFittedTripRef.current) {
      return;
    }

    const coordinates =
      routePolyline.length > 1
        ? routePolyline
        : [driverLocation, pickupCoordinate].filter(isCoordinate);

    if (coordinates.length < 2) {
      return;
    }

    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: {
        top: verticalScale(110),
        right: scale(50),
        bottom: verticalScale(280),
        left: scale(50),
      },
      animated: true,
    });
    hasFittedTripRef.current = true;
  }, [activeTrip, driverLocation, pickupCoordinate, routePolyline]);

  useFocusEffect(
    useCallback(() => {
      let subscription: Location.LocationSubscription | null = null;

      const startWatching = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 5,
            timeInterval: 2000,
          },
          (loc) => {
            const nextLocation = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };

            setDriverLocation(nextLocation);
            setHeading(loc.coords.heading || 0);

            if (pickupCoordinate) {
              const distanceToPickup = getDistance(
                nextLocation.latitude,
                nextLocation.longitude,
                pickupCoordinate.latitude,
                pickupCoordinate.longitude,
              );

              setArrived(distanceToPickup < 30);
              return;
            }

            setArrived(false);
          },
        );
      };

      startWatching();

      return () => {
        subscription?.remove();
        subscription = null;
      };
    }, [pickupCoordinate?.latitude, pickupCoordinate?.longitude]),
  );

  const handleAcceptRequest = useCallback(async () => {
    if (!pendingRequestId) {
      return;
    }

    try {
      await acceptRideRequest({ requestId: pendingRequestId }).unwrap();
      setPendingRequestId("");
    } catch (error: any) {
      Alert.alert(
        "Accept request failed",
        getApiErrorMessage(error, "Could not accept the ride request."),
      );
    }
  }, [acceptRideRequest, pendingRequestId]);

  return (
    <View style={styles.mainContainer}>
      <TopMapControlls driverLocation={driverLocation} />

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        userInterfaceStyle="light"
        showsUserLocation={false}
        showsMyLocationButton
        initialRegion={{
          latitude: initialRegionCenter.latitude,
          longitude: initialRegionCenter.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
      >
        {polylineCoordinates.length > 1 && (
          <Polyline
            coordinates={polylineCoordinates}
            strokeWidth={5}
            strokeColor="#6366F1"
          />
        )}

        <MarkerCircle
          tracksViewChanges
          coordinate={driverLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          flat
          rotation={heading}
        />

        {dropoffCoordinate && (
          <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={dropoffCoordinate}>
            <MarkerTriangle />
          </Marker>
        )}

        {pickupCoordinate && (
          <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={pickupCoordinate}>
            <MarkerUser />
          </Marker>
        )}
      </MapView>

      {pendingRequestId && !activeTrip && (
        <RequestCard
          onAccept={handleAcceptRequest}
          isLoading={isAcceptingRideRequest}
          rideLabel={DUMMY_REQUEST_PREVIEW.rideLabel}
          fare={DUMMY_REQUEST_PREVIEW.fare}
          pickupAddress={DUMMY_REQUEST_PREVIEW.pickupAddress}
          dropoffAddress={DUMMY_REQUEST_PREVIEW.dropoffAddress}
          driverSharePercent={DUMMY_REQUEST_PREVIEW.driverSharePercent}
        />
      )}

      {!activeTrip && !pendingRequestId && (
        <>
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
              <>
                <Text style={styles.statusHeader}>You&apos;re online</Text>
                <Text style={styles.statusSubtext}>
                  Finding your next customer...
                </Text>
                <View style={styles.statusLevelTrack}>
                  <View style={styles.statusLevelFill} />
                </View>
              </>
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
            </BottomSheet>
          )}
        </>
      )}

      {activeTrip && (
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
          <RiderPickupCard />
        </BottomSheet>
      )}
    </View>
  );
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
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
