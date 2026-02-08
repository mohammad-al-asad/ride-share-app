import CustomButton from "@/components/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

// Mock Data for the Ride List
const RIDE_DATA = [
  { id: "header1", type: "section", title: "Regular" },

  {
    id: "1",
    name: "Car",
    passengers: 4,
    price: "$5.00",
    image: require("@/assets/images/cars/car.png"),
    type: "Regular",
  },

  {
    id: "2",
    name: "SUV",
    sub: "(Compact)",
    passengers: 5,
    price: "$5.00",
    image: require("@/assets/images/cars/suv.png"),
    type: "Regular",
  },

  {
    id: "3",
    name: "SUV",
    sub: "(Full)",
    passengers: 8,
    price: "$5.00",
    image: require("@/assets/images/cars/suv.png"),
    type: "Regular",
  },

  {
    id: "4",
    name: "Van",
    sub: "(Compact)",
    passengers: 8,
    price: "$5.00",
    image: require("@/assets/images/cars/van.png"),
    type: "Regular",
  },

  {
    id: "5",
    name: "Van",
    sub: "(Full)",
    passengers: 15,
    price: "$5.00",
    image: require("@/assets/images/cars/van.png"),
    type: "Regular",
  },

  { id: "header2", type: "section", title: "Premium" },

  {
    id: "6",
    name: "Car",
    passengers: 4,
    price: "$5.00",
    image: require("@/assets/images/cars/car.png"),
    type: "Premium",
  },

  {
    id: "7",
    name: "SUV",
    sub: "(Compact)",
    passengers: 5,
    price: "$5.00",
    image: require("@/assets/images/cars/suv.png"),
    type: "Premium",
  },
  {
    id: "8",
    name: "SUV",
    sub: "(Full)",
    passengers: 8,
    price: "$5.00",
    image: require("@/assets/images/cars/suv.png"),
    type: "Premium",
  },

  {
    id: "9",
    name: "Van",
    sub: "(Compact)",
    passengers: 8,
    price: "$5.00",
    image: require("@/assets/images/cars/van.png"),
    type: "Premium",
  },

  {
    id: "10",
    name: "Van",
    sub: "(Full)",
    passengers: 15,
    price: "$5.00",
    image: require("@/assets/images/cars/van.png"),
    type: "Premium",
  },
];

const SelectedRideCard = ({
  item,
  onClear,
}: {
  item: any;
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
          <Text style={styles.selectedCategoryText}>{item.type}</Text>
          <View style={styles.rowAlignCenter}>
            <Text style={styles.selectedRideName}>{item.name} </Text>
            {item.sub && <Text style={styles.selectedRideSub}>{item.sub}</Text>}
            <View style={[styles.rowAlignCenter, { marginLeft: scale(8) }]}>
              <Ionicons name="people" size={14} color="#666" />
              <Text style={styles.passengerText}> {item.passengers}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.selectedPriceText}>{item.price}</Text>
      </View>
    </View>
  );
};

const CarSelection = () => {
  const [focused, setFocused] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);

  const renderItem = ({ item }: any) => {
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
        <Text style={styles.priceText}>{item.price}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Text style={styles.sheetTitle}>
        {selected ? "Confirm details" : "Choose a ride"}
      </Text>
      {selected ? (
        <View style={{ paddingVertical: verticalScale(10) }}>
          <SelectedRideCard item={selected} onClear={() => setSelected(null)} />
          <CustomButton
            style={{ marginTop: verticalScale(20) }}
            text={`Choose ${selected.type} ${selected.name} ${
              selected?.sub ? selected.sub : ""
            }`}
            onClick={() => console.log("Confirmed")}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={RIDE_DATA}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
          <CustomButton
            style={{ marginTop: verticalScale(10) }}
            text={`Select ${focused ? focused.name + " " + (focused?.sub ? focused.sub : "") : ""}`}
            onClick={() => {
              if (focused) setSelected(focused);
            }}
          />
        </>
      )}
    </>
  );
};

export default CarSelection;

const styles = StyleSheet.create({
  sheetTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    textAlign: "center",
    marginBottom: scale(5),
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
    justifyContent: "space-between",
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
  priceText: { fontSize: moderateScale(14), fontWeight: "700" },
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
    justifyContent: "space-between",
    alignItems: "flex-end",
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
  selectedPriceText: {
    fontSize: moderateScale(18),
    fontWeight: "800",
    color: "#1A1A1A",
  },
});
