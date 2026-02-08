import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import BottomSheet from '@gorhom/bottom-sheet';
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { colors } from "@/config/colors";

export default function MapSelectionScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  // Snap points define how high the popup goes
  const snapPoints = useMemo(() => ['30%'], []);

  return (
    <View style={styles.container}>
      {/* Background Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 32.7767,
          longitude: -96.7970,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={{ latitude: 32.7767, longitude: -96.7970 }}>
           <View style={styles.customMarker} />
        </Marker>
      </MapView>

      {/* Floating Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <Ionicons name="chevron-back" size={moderateScale(24)} color="black" />
      </TouchableOpacity>

      {/* Bottom Sheet Selection Popup */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        handleIndicatorStyle={styles.sheetIndicator}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.title}>Confirm location</Text>
          
          <View style={styles.locationRow}>
            {/* The blue circle icon from design */}
            <View style={styles.blueOuterCircle}>
               <View style={styles.blueInnerCircle} />
            </View>
            <Text style={styles.addressText} numberOfLines={1}>
              Brac University Building 5
            </Text>
          </View>

          <TouchableOpacity style={styles.confirmButton}>
            <Text style={styles.confirmText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  backButton: {
    position: 'absolute',
    top: verticalScale(50),
    left: scale(20),
    backgroundColor: 'white',
    padding: scale(10),
    borderRadius: scale(25),
    elevation: 5,
  },
  sheetIndicator: {
    backgroundColor: '#CCCCCC',
    width: scale(40),
  },
  sheetContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
    alignItems: 'center',
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: verticalScale(20),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    width: '100%',
    marginBottom: verticalScale(25),
  },
  blueOuterCircle: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    backgroundColor: '#BCC8FF', // Light blue
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  blueInnerCircle: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: colors.main, // Primary purple
  },
  addressText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  confirmButton: {
    backgroundColor: colors.main, // Deep purple from UI
    width: '100%',
    height: verticalScale(50),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: 'white',
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  customMarker: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: 'rgba(36, 1, 131, 0.2)',
    borderWidth: 2,
    borderColor: colors.main,
  }
});