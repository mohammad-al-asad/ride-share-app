import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  RideLocation,
  resetRideBook,
  setRideSchedule,
  setStep1Locations,
} from "@/redux/slices/rideBookSlice";
import { Ionicons } from "@expo/vector-icons";
import { Gps01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { ActivityIndicator } from "react-native-paper";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const pickupOptions = [
  { label: "Pickup now", value: "now", icon: "time-outline" },
  { label: "Pickup later", value: "later", icon: "calendar-outline" },
];

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_MAP_API_KEY;
type PickupKind = "now" | "later";

type PlacePrediction = {
  place_id: string;
  description?: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

type GeocodeResponse = {
  results?: {
    geometry?: {
      location?: {
        lat: number;
        lng: number;
      };
    };
  }[];
};

export default function LocationSelectionScreen() {
  const dispatch = useAppDispatch();
  const { preserve, pickupType: pickupTypeParam } = useLocalSearchParams<{
    preserve?: string;
    pickupType?: string;
  }>();
  const preserveValue = Array.isArray(preserve) ? preserve[0] : preserve;
  const pickupTypeParamValue = Array.isArray(pickupTypeParam)
    ? pickupTypeParam[0]
    : pickupTypeParam;
  const requestedPickupType: PickupKind =
    pickupTypeParamValue === "later" ? "later" : "now";
  const {
    pickup: storedPickup,
    dropoff: storedDropoff,
    schedule,
  } = useAppSelector((state) => state.rideBook.step1);

  const [pickupType, setPickupType] = useState<PickupKind>(
    pickupTypeParamValue === "now" || pickupTypeParamValue === "later"
      ? pickupTypeParamValue
      : schedule.kind,
  );
  const [searchResults, setSearchResults] = useState<PlacePrediction[]>([]);
  const [pickup, setPickup] = useState<RideLocation | null>(storedPickup);
  const [dropoff, setDropoff] = useState<RideLocation | null>(storedDropoff);
  const [pickUpText, setPickUpText] = useState(storedPickup?.address ?? "");
  const [dropOffText, setDropOffText] = useState(storedDropoff?.address ?? "");
  const [currentInput, setCurrentInput] = useState<"pickup" | "dropoff">(
    "dropoff",
  );
  const [gettingLocation, setGettingLocation] = useState(false);
  const [searchTimer, setSearchTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const hasConsumedPreserveRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (preserveValue === "1" && !hasConsumedPreserveRef.current) {
        hasConsumedPreserveRef.current = true;
        return;
      }

      hasConsumedPreserveRef.current = false;
      dispatch(resetRideBook());
      setPickupType(requestedPickupType);
      setPickup(null);
      setDropoff(null);
      setPickUpText("");
      setDropOffText("");
      setSearchResults([]);
    }, [dispatch, preserveValue, requestedPickupType]),
  );

  // Keep local state in sync when map-based selections update Redux.
  useEffect(() => {
    if (storedPickup) {
      setPickup(storedPickup);
      setPickUpText(storedPickup.address);
    } else {
      setPickup(null);
      setPickUpText("");
    }

    if (storedDropoff) {
      setDropoff(storedDropoff);
      setDropOffText(storedDropoff.address);
    } else {
      setDropoff(null);
      setDropOffText("");
    }
  }, [storedPickup, storedDropoff]);

  useEffect(() => {
    dispatch(
      setRideSchedule(
        pickupType === "later"
          ? {
              kind: "later",
              pickupAt: schedule.pickupAt ?? null,
            }
          : {
              kind: "now",
              pickupAt: null,
            },
      ),
    );
  }, [dispatch, pickupType, schedule.pickupAt]);

  useEffect(() => {
    dispatch(setStep1Locations({ pickup, dropoff }));
  }, [dispatch, pickup, dropoff]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimer) clearTimeout(searchTimer);
    };
  }, [searchTimer]);

  // Debounced Search Logic
  const debouncedSearch = (text: string) => {
    if (searchTimer) clearTimeout(searchTimer);

    if (text.length > 1) {
      const timer = setTimeout(() => {
        performSearch(text);
      }, 500); // 500ms delay
      setSearchTimer(timer as any);
    } else {
      setSearchResults([]);
    }
  };

  const performSearch = async (text: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text,
        )}&key=${GOOGLE_MAPS_API_KEY}&types=geocode`,
      );
      const json = await response.json();
      setSearchResults(json?.predictions || []);
    } catch (error) {
      console.error(error);
      setSearchResults([]);
    }
  };

  const getCoordinatesByPlaceId = async (placeId: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?place_id=${encodeURIComponent(
          placeId,
        )}&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const json = (await response.json()) as GeocodeResponse;
      const coordinate = json?.results?.[0]?.geometry?.location;
      if (!coordinate) {
        return null;
      }

      return {
        lat: coordinate.lat,
        lng: coordinate.lng,
      };
    } catch (error) {
      console.error("Failed to resolve place coordinates:", error);
      return null;
    }
  };

  const formatReverseGeocodeAddress = (
    address: Location.LocationGeocodedAddress,
  ) => {
    return [
      address.name,
      address.street,
      address.city,
      address.region,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setGettingLocation(false);
      Alert.alert(
        "Permission denied",
        "Permission to access location was denied.",
      );
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync(location.coords);
      const formattedAddress = address
        ? formatReverseGeocodeAddress(address)
        : "Current location";

      setPickup({
        address: formattedAddress,
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
      setPickUpText(formattedAddress);
    } catch (error) {
      console.error(error);
      Alert.alert("Location error", "Failed to fetch current location.");
    }
    setGettingLocation(false);
  };

  const handleLocationSelect = async (item: PlacePrediction) => {
    const mainText =
      item?.structured_formatting?.main_text || item?.description || "";
    const fullDescription = item?.description || "";
    const coordinates = await getCoordinatesByPlaceId(item.place_id);

    if (!coordinates) {
      Alert.alert("Location error", "Could not get location coordinates.");
      return;
    }

    const selectedLocation: RideLocation = {
      address: mainText,
      lat: coordinates.lat,
      lng: coordinates.lng,
    };

    if (currentInput === "pickup") {
      setPickup(selectedLocation);
      setPickUpText(fullDescription);
    } else {
      setDropoff(selectedLocation);
      setDropOffText(fullDescription);
    }
    setSearchResults([]);
  };

  const onNext = () => {
    if (!pickup || !dropoff) {
      Alert.alert("Missing location", "Please select both pickup and dropoff.");
      return;
    }

    router.push(
      pickupType === "later"
        ? "/(protected)/(book)/choose-time"
        : "/(protected)/(book)/book-map",
    );
  };

  const renderItem = (item: any) => {
    return (
      <View style={styles.itemContainer}>
        <Ionicons
          name={item.icon}
          size={moderateScale(18)}
          color={colors.main}
        />

        <Text style={styles.itemText}>{item.label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.pickupNowText}
        selectedTextStyle={styles.pickupNowText}
        data={pickupOptions}
        maxHeight={300}
        labelField="label"
        valueField="value"
        value={pickupType}
        onChange={(item: any) => setPickupType(item.value)}
        renderLeftIcon={() => (
          <Ionicons
            name={pickupType === "now" ? "time-outline" : "calendar-outline"}
            size={moderateScale(18)}
            color={colors.main}
            style={{ marginRight: scale(6) }}
          />
        )}
        renderRightIcon={() => (
          <Ionicons
            name="chevron-down"
            size={moderateScale(16)}
            color={colors.main}
            style={{ marginLeft: scale(6) }}
          />
        )}
        renderItem={renderItem}
        containerStyle={styles.dropdownListContainer}
      />

      <View style={styles.inputCard}>
        {/* Pickup Input */}
        <View style={styles.inputRow}>
          {pickup ? (
            <Image
              style={{ height: 20, width: 20 }}
              source={require("@/assets/icons/selectedAddress.svg")}
            />
          ) : (
            <Ionicons name="search-outline" size={20} color="#666" />
          )}

          <TextInput
            placeholder="Pickup Location"
            style={styles.input}
            value={pickUpText}
            onChangeText={(text: string) => {
              setCurrentInput("pickup");
              setPickUpText(text);
              if (text === "" || text.length < pickUpText.length) {
                setPickup(null);
                setSearchResults([]);
              } else {
                debouncedSearch(text);
              }
            }}
          />
        </View>

        <View style={styles.divider} />

        {/* Dropoff Input */}
        <View style={styles.inputRow}>
          {dropoff ? (
            <Image
              style={{ height: 20, width: 20 }}
              source={require("@/assets/icons/selectedAddress.svg")}
            />
          ) : (
            <Ionicons name="search-outline" size={20} color="#666" />
          )}
          <TextInput
            placeholder="Dropoff location"
            style={styles.input}
            value={dropOffText}
            onChangeText={(text: string) => {
              setCurrentInput("dropoff");
              setDropOffText(text);
              if (text === "" || text.length < dropOffText.length) {
                setDropoff(null);
                setSearchResults([]);
              } else {
                debouncedSearch(text);
              }
            }}
          />
        </View>
      </View>

      {/* Search Results List */}
      {searchResults.length > 0 && (
        <View style={styles.listWrapper}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.locationItem}
                onPress={() => handleLocationSelect(item)}
              >
                <View style={styles.timeIconContainer}>
                  <Ionicons name="location-outline" size={22} color="#333" />
                </View>

                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationName} numberOfLines={1}>
                    {item?.structured_formatting?.main_text ||
                      item?.description}
                  </Text>
                  <Text style={styles.locationAddress} numberOfLines={1}>
                    {item?.structured_formatting?.secondary_text}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={getCurrentLocation}
        disabled={gettingLocation}
      >
        {gettingLocation ? (
          <ActivityIndicator
            size="small"
            color={colors.main}
            style={{ flex: 1 }}
          />
        ) : (
          <>
            <HugeiconsIcon
              icon={Gps01Icon}
              size={moderateScale(20)}
              color={colors.main}
            />
            <Text style={styles.actionButtonText}>Current location</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() =>
          router.push({
            pathname: "/(protected)/(book)/confirm-pickup",
            params: { mode: "dropoff" },
          } as any)
        }
      >
        <Ionicons
          name="location-outline"
          size={moderateScale(20)}
          color={colors.main}
        />
        <Text style={styles.actionButtonText}>Set location on map</Text>
      </TouchableOpacity>

      <CustomButton
        text="Next"
        onClick={onNext}
        isDisable={!pickup || !dropoff}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E5E5",
    paddingHorizontal: scale(10),
    paddingTop: verticalScale(20),
  },
  dropdown: {
    backgroundColor: "#BCC8FF",
    width: scale(135),
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(10),
    borderRadius: scale(8),
    marginBottom: verticalScale(15),
  },
  dropdownListContainer: {
    borderRadius: scale(8),
    marginTop: verticalScale(2),
    overflow: "hidden",
  },

  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(10),
    gap: scale(10),
  },
  itemText: {
    fontSize: moderateScale(13),
    color: "#333",
    fontWeight: "500",
  },
  inputCard: {
    backgroundColor: "white",
    borderRadius: scale(12),
    borderWidth: 2,
    borderColor: "#dad6ffc7",
    marginBottom: verticalScale(10),
    zIndex: 5,
  },
  input: { flex: 1, fontSize: moderateScale(14) },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(15),
    minHeight: verticalScale(50),
    gap: scale(10),
  },
  divider: {
    height: 1.5,
    backgroundColor: "#DAD6FF",
    marginHorizontal: scale(15),
  },
  listWrapper: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: scale(10),
    maxHeight: verticalScale(324),
  },
  locationItem: { flexDirection: "row", alignItems: "center", padding: 15 },
  timeIconContainer: { width: 40, alignItems: "center" },
  locationTextContainer: { flex: 1 },
  locationName: { fontSize: 15, fontWeight: "600", color: "#262626" },
  locationAddress: { fontSize: 13, color: "#666" },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#BCC8FF",
    height: verticalScale(48),
    borderRadius: verticalScale(12),
    paddingHorizontal: scale(15),
    gap: scale(12),
    marginBottom: scale(10),
  },
  actionButtonText: {
    color: "#1A1A11",
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
  pickupNowText: {
    color: colors.main,
    fontWeight: "600",
    fontSize: moderateScale(13),
  },
});
