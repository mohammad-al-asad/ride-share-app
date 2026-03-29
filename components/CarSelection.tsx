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
  sub?: string;
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
    preference: { vehicleType: "car", tier: "regular", size: "normal" },
  },

  {
    id: "suv_compact_regular",
    type: "ride",
    name: "SUV",
    sub: "(Compact)",
    passengers: 5,
    image: require("@/assets/images/cars/suv.png"),
    category: "Regular",
    preference: { vehicleType: "suv", tier: "regular", size: "compact" },
  },

  {
    id: "suv_full_regular",
    type: "ride",
    name: "SUV",
    sub: "(Full)",
    passengers: 8,
    image: require("@/assets/images/cars/suv.png"),
    category: "Regular",
    preference: { vehicleType: "suv", tier: "regular", size: "full" },
  },

  {
    id: "van_compact_regular",
    type: "ride",
    name: "Van",
    sub: "(Compact)",
    passengers: 8,
    image: require("@/assets/images/cars/van.png"),
    category: "Regular",
    preference: { vehicleType: "van", tier: "regular", size: "compact" },
  },

  {
    id: "van_full_regular",
    type: "ride",
    name: "Van",
    sub: "(Full)",
    passengers: 15,
    image: require("@/assets/images/cars/van.png"),
    category: "Regular",
    preference: { vehicleType: "van", tier: "regular", size: "full" },
  },

  { id: "header2", type: "section", title: "Premium" },

  {
    id: "car_premium",
    type: "ride",
    name: "Car",
    passengers: 4,
    image: require("@/assets/images/cars/car.png"),
    category: "Premium",
    preference: { vehicleType: "car", tier: "premium", size: "normal" },
  },

  {
    id: "suv_compact_premium",
    type: "ride",
    name: "SUV",
    sub: "(Compact)",
    passengers: 5,
    image: require("@/assets/images/cars/suv.png"),
    category: "Premium",
    preference: { vehicleType: "suv", tier: "premium", size: "compact" },
  },
  {
    id: "suv_full_premium",
    type: "ride",
    name: "SUV",
    sub: "(Full)",
    passengers: 8,
    image: require("@/assets/images/cars/suv.png"),
    category: "Premium",
    preference: { vehicleType: "suv", tier: "premium", size: "full" },
  },

  {
    id: "van_compact_premium",
    type: "ride",
    name: "Van",
    sub: "(Compact)",
    passengers: 8,
    image: require("@/assets/images/cars/van.png"),
    category: "Premium",
    preference: { vehicleType: "van", tier: "premium", size: "compact" },
  },

  {
    id: "van_full_premium",
    type: "ride",
    name: "Van",
    sub: "(Full)",
    passengers: 15,
    image: require("@/assets/images/cars/van.png"),
    category: "Premium",
    preference: { vehicleType: "van", tier: "premium", size: "full" },
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
            {item.sub && <Text style={styles.selectedRideSub}>{item.sub}</Text>}
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
              {item.sub && <Text style={styles.rideSub}>{item.sub}</Text>}
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
            text={`Choose ${selected.category} ${selected.name} ${
              selected?.sub ? selected.sub : ""
            }`}
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
              text={`Select ${focused ? focused.name + " " + (focused?.sub ? focused.sub : "") : ""}`}
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
  rideSub: { fontSize: moderateScale(12), color: "#666" },
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
  selectedRideSub: {
    fontSize: moderateScale(14),
    color: "#888",
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
