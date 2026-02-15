import { MarkerCircle } from "@/components/AnimatedMarker";
import CarSelection from "@/components/CarSelection";
import { MarkerCar, MarkerTriangle } from "@/components/Markers";
import PaymentScreen from "@/components/PaymentCard";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { scale, verticalScale } from "react-native-size-matters";
const { height } = Dimensions.get("window");

export default function ChooseRideScreen() {
  const mapRef = useRef<MapView | null>(null);
  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const [ispayment, setIspayment] = useState(false);

  return (
    <View style={styles.mainContainer}>
      {/* Background Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        userInterfaceStyle="light"
        initialRegion={{
          latitude: 32.7807,
          longitude: -96.797,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <MarkerCircle
          anchor={{ x: 0.5, y: 0.5 }}
          coordinate={{ latitude: 32.775, longitude: -96.801 }}
        />
        <Marker
          anchor={{ x: 0.5, y: 0.5 }}
          coordinate={{ latitude: 32.785, longitude: -96.79 }}
        >
          <MarkerTriangle />
        </Marker>
        <Marker
          anchor={{ x: 0.5, y: 0.5 }}
          coordinate={{ latitude: 32.785, longitude: -96.78 }}
        >
          <MarkerCar />
        </Marker>
        <Polyline
          coordinates={[
            { latitude: 32.775, longitude: -96.801 },
            { latitude: 32.785, longitude: -96.79 },
          ]}
          strokeColor="#6366F1"
          strokeWidth={3}
        />
      </MapView>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Choose Ride Bottom Sheet */}
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
        {ispayment && <PaymentScreen />}
        {!ispayment && <CarSelection setIspayment={setIspayment} />}
      </BottomSheet>
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
