import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Polyline,
  type LatLng,
  type MapPolylineProps,
} from "react-native-maps";

type TravelMode = "driving" | "walking" | "bicycling" | "transit";

type RoadPolylineProps = Omit<MapPolylineProps, "coordinates"> & {
  coordinates: LatLng[];
  apiKey?: string;
  travelMode?: TravelMode;
  useRoadPath?: boolean;
  minOriginMovementMeters?: number;
  onRouteCoordinatesChange?: (coordinates: LatLng[]) => void;
};

const toFixedCoord = (value: number) => value.toFixed(6);

const toCoordinateKey = (coordinate: LatLng) =>
  `${toFixedCoord(coordinate.latitude)},${toFixedCoord(coordinate.longitude)}`;

const isLatLng = (coordinate: LatLng | null | undefined): coordinate is LatLng =>
  Boolean(
    coordinate &&
      Number.isFinite(coordinate.latitude) &&
      Number.isFinite(coordinate.longitude),
  );

const calculateDistanceMeters = (a: LatLng, b: LatLng) => {
  const earthRadius = 6371e3;
  const phi1 = (a.latitude * Math.PI) / 180;
  const phi2 = (b.latitude * Math.PI) / 180;
  const deltaPhi = ((b.latitude - a.latitude) * Math.PI) / 180;
  const deltaLambda = ((b.longitude - a.longitude) * Math.PI) / 180;

  const x =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return earthRadius * c;
};

const decodePolyline = (encoded: string): LatLng[] => {
  const output: LatLng[] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let value = 0;

    do {
      value = encoded.charCodeAt(index++) - 63;
      result |= (value & 0x1f) << shift;
      shift += 5;
    } while (value >= 0x20);

    latitude += result & 1 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;
    do {
      value = encoded.charCodeAt(index++) - 63;
      result |= (value & 0x1f) << shift;
      shift += 5;
    } while (value >= 0x20);

    longitude += result & 1 ? ~(result >> 1) : result >> 1;

    output.push({
      latitude: latitude / 1e5,
      longitude: longitude / 1e5,
    });
  }

  return output;
};

export default function RoadPolyline({
  coordinates,
  apiKey = process.env.EXPO_PUBLIC_MAP_API_KEY,
  travelMode = "driving",
  useRoadPath = true,
  minOriginMovementMeters = 0,
  onRouteCoordinatesChange,
  ...polylineProps
}: RoadPolylineProps) {
  const normalized = useMemo(() => coordinates.filter(isLatLng), [coordinates]);
  const coordinatesKey = useMemo(
    () => normalized.map(toCoordinateKey).join("|"),
    [normalized],
  );
  const [resolvedCoordinates, setResolvedCoordinates] = useState<LatLng[]>([]);
  const requestTargetRef = useRef("");
  const requestOriginRef = useRef<LatLng | null>(null);

  const fallbackCoordinates = useMemo(
    () => (normalized.length > 1 ? normalized : []),
    [normalized],
  );

  const emitResolved = (nextCoordinates: LatLng[]) => {
    setResolvedCoordinates(nextCoordinates);
    onRouteCoordinatesChange?.(nextCoordinates);
  };

  useEffect(() => {
    if (fallbackCoordinates.length < 2) {
      emitResolved([]);
      requestTargetRef.current = "";
      requestOriginRef.current = null;
      return;
    }

    if (!useRoadPath || !apiKey) {
      emitResolved(fallbackCoordinates);
      requestTargetRef.current = "";
      requestOriginRef.current = fallbackCoordinates[0];
      return;
    }

    const origin = fallbackCoordinates[0];
    const destination = fallbackCoordinates[fallbackCoordinates.length - 1];
    const waypoints = fallbackCoordinates.slice(1, -1);

    const targetSignature = [destination, ...waypoints]
      .map(toCoordinateKey)
      .join("|");

    const hasTargetChanged = requestTargetRef.current !== targetSignature;
    const movementExceedsThreshold =
      !requestOriginRef.current ||
      calculateDistanceMeters(requestOriginRef.current, origin) >
        minOriginMovementMeters;

    // Prevent excessive route requests when only the origin is drifting slightly.
    if (!hasTargetChanged && !movementExceedsThreshold) {
      return;
    }

    requestTargetRef.current = targetSignature;
    requestOriginRef.current = origin;

    let cancelled = false;

    const fetchRoadPath = async () => {
      const waypointQuery = waypoints.length
        ? `&waypoints=${waypoints
            .map((item) => `${item.latitude},${item.longitude}`)
            .join("|")}`
        : "";

      const url =
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}` +
        `&destination=${destination.latitude},${destination.longitude}` +
        `${waypointQuery}&mode=${travelMode}&key=${apiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        const points: string | undefined = data?.routes?.[0]?.overview_polyline?.points;

        if (!points) {
          if (!cancelled) {
            emitResolved(fallbackCoordinates);
          }
          return;
        }

        const decoded = decodePolyline(points);
        if (!cancelled) {
          emitResolved(decoded.length > 1 ? decoded : fallbackCoordinates);
        }
      } catch {
        if (!cancelled) {
          emitResolved(fallbackCoordinates);
        }
      }
    };

    fetchRoadPath();

    return () => {
      cancelled = true;
    };
  }, [
    apiKey,
    coordinatesKey,
    minOriginMovementMeters,
    onRouteCoordinatesChange,
    travelMode,
    useRoadPath,
  ]);

  if (resolvedCoordinates.length < 2) {
    return null;
  }

  return <Polyline coordinates={resolvedCoordinates} {...polylineProps} />;
}
