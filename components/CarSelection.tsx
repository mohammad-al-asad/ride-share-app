import CustomButton from "@/components/CustomButton";
import { useAppDispatch } from "@/redux/hooks";
import { RidePreference, setRidePreference } from "@/redux/slices/rideBookSlice";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetFlatList, BottomSheetView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

type RideSectionItem = {
  id: string;
  type: "section";
  title: string;
};

type RideOptionItem = {
  id: string;
  type: "ride";
  name: string;
  passengers: number;
  image: any;
  category: "Regular" | "Premium";
  preference: RidePreference;
};

type RideItem = RideSectionItem | RideOptionItem;

const RIDE_DATA: RideItem[] = [
  { id: "header1", type: "section", title: "Regular" },

  {
    id: "car_regular",
    type: "ride",
    name: "Car",
    passengers: 4,
    image: require("@/assets/images/cars/car.png"),
    category: "Regular",
    preference: { vehicleType: "car", tier: "regular", seats: 4 },
  },

  {
    id: "suv_4_regular",
    type: "ride",
    name: "SUV",
    passengers: 4,
    image: require("@/assets/images/cars/suv.png"),
    category: "Regular",
    preference: { vehicleType: "suv", tier: "regular", seats: 4 },
  },

  {
    id: "suv_5_regular",
    type: "ride",
    name: "SUV",
    passengers: 5,
    image: require("@/assets/images/cars/suv.png"),
    category: "Regular",
    preference: { vehicleType: "suv", tier: "regular", seats: 5 },
  },

  { id: "header2", type: "section", title: "Premium" },

  {
    id: "car_premium",
    type: "ride",
    name: "Car",
    passengers: 4,
    image: require("@/assets/images/cars/car.png"),
    category: "Premium",
    preference: { vehicleType: "car", tier: "premium", seats: 4 },
  },

  {
    id: "suv_4_premium",
    type: "ride",
    name: "SUV",
    passengers: 4,
    image: require("@/assets/images/cars/suv.png"),
    category: "Premium",
    preference: { vehicleType: "suv", tier: "premium", seats: 4 },
  },

  {
    id: "suv_5_premium",
    type: "ride",
    name: "SUV",
    passengers: 5,
    image: require("@/assets/images/cars/suv.png"),
    category: "Premium",
    preference: { vehicleType: "suv", tier: "premium", seats: 5 },
  },

  {
    id: "van_6_premium",
    type: "ride",
    name: "Van",
    passengers: 6,
    image: require("@/assets/images/cars/van.png"),
    category: "Premium",
    preference: { vehicleType: "van", tier: "premium", seats: 6 },
  },

  {
    id: "van_8_premium",
    type: "ride",
    name: "Van",
    passengers: 8,
    image: require("@/assets/images/cars/van.png"),
    category: "Premium",
    preference: { vehicleType: "van", tier: "premium", seats: 8 },
  },

  {
    id: "van_10_premium",
    type: "ride",
    name: "Van",
    passengers: 10,
    image: require("@/assets/images/cars/van.png"),
    category: "Premium",
    preference: { vehicleType: "van", tier: "premium", seats: 10 },
  },

  {
    id: "van_12_premium",
    type: "ride",
    name: "Van",
    passengers: 12,
    image: require("@/assets/images/cars/van.png"),
    category: "Premium",
    preference: { vehicleType: "van", tier: "premium", seats: 12 },
  },
];

const SelectedRideCard = ({
  item,
  onClear,
}: {
  item: RideOptionItem;
  onClear: () => void;
}) => {
  return (
    <View style={styles.selectedContainer}>
      <TouchableOpacity style={styles.clearSelection} onPress={onClear}>
        <Ionicons name="close-circle" size={24} color="#6366F1" />
      </TouchableOpacity>
      {/* Centered Image */}
      <Image
        source={item.image}
        style={styles.selectedCarImage}
        contentFit="contain"
      />

      <View style={styles.selectedDetailsRow}>
        <View>
          {/* Header Tag (e.g., Premium) */}
          <Text style={styles.selectedCategoryText}>{item.category}</Text>
          <View style={styles.rowAlignCenter}>
            <Text style={styles.selectedRideName}>{item.name} </Text>
            <View style={[styles.rowAlignCenter, { marginLeft: scale(8) }]}>
              <Ionicons name="people" size={14} color="#666" />
              <Text style={styles.passengerText}> {item.passengers}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const CarSelection = ({ setIspayment }: { setIspayment: any }) => {
  const dispatch = useAppDispatch();

  const [focused, setFocused] = useState<RideOptionItem | null>(null);
  const [selected, setSelected] = useState<RideOptionItem | null>(null);

  const renderItem = ({ item }: { item: RideItem }) => {
    if (item.type === "section") {
      return <Text style={styles.sectionHeader}>{item.title}</Text>;
    }
    const isSelected = focused ? item.id === focused?.id : false;

    return (
      <TouchableOpacity
        style={[styles.rideItem, isSelected && styles.selectedRide]}
        onPress={() => setFocused(item)}
      >
        <View style={styles.rideInfoLeft}>
          <Image
            source={item.image}
            style={styles.carImage}
            contentFit="contain"
          />
          <View>
            <View style={styles.rowAlignCenter}>
              <Text style={styles.rideName}>{item.name} </Text>
            </View>
            <View style={styles.rowAlignCenter}>
              <Ionicons name="people" size={14} color="#666" />
              <Text style={styles.passengerText}> {item.passengers}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Text style={styles.sheetTitle}>
        {selected ? "Confirm details" : "Choose a ride"}
      </Text>
      {selected ? (
        <BottomSheetView style={styles.bottomSheet}>
          <SelectedRideCard item={selected} onClear={() => setSelected(null)} />
          <CustomButton
            style={{ marginTop: verticalScale(10) }}
            text={`Choose ${selected.category} ${selected.name}`}
            onClick={() => {
              if (selected.preference) {
                dispatch(setRidePreference(selected.preference));
              }
              setIspayment(true);
            }}
          />
        </BottomSheetView>
      ) : (
        <>
          <BottomSheetFlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={RIDE_DATA}
            keyExtractor={(item: RideItem) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
          <View style={{ paddingHorizontal: verticalScale(15)}}>
            <CustomButton
              style={{
                marginTop: verticalScale(10),
                marginBottom: verticalScale(20),
              }}
              text={`Select ${focused ? focused.name : ""}`}
              onClick={() => {
                if (focused) setSelected(focused);
              }}
              isDisable={!focused}
            />
          </View>
        </>
      )}
    </>
  );
};

export default CarSelection;

const styles = StyleSheet.create({
  bottomSheet: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(40),
  },
  sheetTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    textAlign: "center",
    marginVertical: scale(14),
    marginBottom: 0,
  },
  sectionHeader: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#333",
    marginTop: scale(10),
    marginBottom: scale(10),
  },
  rideItem: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: scale(12),
    paddingHorizontal: scale(10),
    borderRadius: scale(12),
  },
  selectedRide: {
    backgroundColor: "#F0F1FF",
    borderWidth: 1,
    borderColor: "#6366F1",
  },
  rideInfoLeft: { flexDirection: "row", alignItems: "center", gap: scale(15) },
  carImage: { width: scale(60), height: scale(40) },
  rideName: { fontSize: moderateScale(14), fontWeight: "700" },
  passengerText: { fontSize: moderateScale(12), color: "#666" },
  rowAlignCenter: { flexDirection: "row", alignItems: "center" },

  // --- New Styles for the Selected Card ---
  selectedContainer: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#ADC1FF", // Light blue/purple border from your image
    borderRadius: scale(20),
    padding: scale(15),
    alignItems: "center",
    position: "relative",
    height: verticalScale(160),
    justifyContent: "space-between",
    marginTop: verticalScale(10),
  },
  clearSelection: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  selectedCarImage: {
    width: "80%",
    height: verticalScale(80),
    marginTop: scale(10),
  },
  selectedDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  selectedCategoryText: {
    fontSize: moderateScale(14),
    color: "#888",
    marginBottom: 2,
  },
  selectedRideName: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#333",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(60),
  },
});
