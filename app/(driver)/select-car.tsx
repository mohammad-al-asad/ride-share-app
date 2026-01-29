import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function VehicleInfoScreen() {
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const [selectedMake, setSelectedMake] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [seats, setSeats] = useState("4");
  const [licensePlate, setLicensePlate] = useState("JBS 0342");

  // 1. Fetch Makes on mount
  useEffect(() => {
    setLoadingMakes(true);
    fetch(
      "https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json",
    )
      .then((res) => res.json())
      .then((data) => {
        const formattedMakes = data.Results.map((item: any) => ({
          label: item.MakeName,
          value: item.MakeId,
        }));
        setMakes(formattedMakes);
      })
      .finally(() => setLoadingMakes(false));
  }, []);

  // 2. Fetch Models when Make changes
  useEffect(() => {
    if (selectedMake) {
      setLoadingModels(true);
      fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeId/${selectedMake}?format=json`,
      )
        .then((res) => res.json())
        .then((data) => {
          const formattedModels = data.Results.map((item: any) => ({
            label: item.Model_Name,
            value: item.Model_ID,
          }));
          setModels(formattedModels);
        })
        .finally(() => setLoadingModels(false));
    }
  }, [selectedMake]);

  const years = Array.from({ length: 27 }, (_, i) => ({
    label: (2026 - i).toString(),
    value: (2026 - i).toString(),
  }));

  const vehicleTypes = [
    { label: "Car", value: "car" },
    { label: "SUV", value: "suv" },
    { label: "Van", value: "van" },
  ];

  const vehiclePriceRanges = {
    car: [
      { label: "24k-32k", value: "regular" },
      { label: "35k-50k+", value: "premium" },
    ],
    suv_compact: [
      { label: "30k-45k", value: "regular" },
      { label: "50k-75k+", value: "premium" },
    ],
    suv_full: [
      { label: "45k-60k", value: "regular" },
      { label: "70k-100k+", value: "premium" },
    ],
    van_compact: [
      { label: "32k-45k", value: "regular" },
      { label: "50k-70k+", value: "premium" },
    ],
    van_full: [
      { label: "40k-55k", value: "regular" },
      { label: "60k-85k+", value: "premium" },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthBackground />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/cars/multiple-car.png")}
            style={styles.illustration}
            contentFit="contain"
          />
        </View>

        <Text style={styles.headerTitle}>Enter your vehicle information</Text>

        {/* Brand Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Brand</Text>
          <Dropdown
            style={styles.dropdown}
            selectedTextStyle={styles.selectedTextStyle} // Fixes text alignment
            placeholderStyle={styles.placeholderStyle}
            data={makes}
            labelField="label"
            valueField="value"
            placeholder={loadingMakes ? "Loading..." : "Select Brand"}
            value={selectedMake}
            // Displays spinner inside the dropdown
            renderRightIcon={() =>
              loadingMakes ? (
                <ActivityIndicator size="small" color={colors.main} />
              ) : (
                <Ionicons name="chevron-down" size={20} color="#1A1A1A" />
              )
            }
            onChange={(item) => {
              setSelectedMake(item.value);
              setSelectedModel(null);
            }}
          />
        </View>

        {/* Model Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Model</Text>
          <Dropdown
            style={styles.dropdown}
            selectedTextStyle={styles.selectedTextStyle}
            placeholderStyle={styles.placeholderStyle}
            data={models}
            labelField="label"
            valueField="value"
            placeholder={
              loadingModels
                ? "Loading models..."
                : selectedMake
                  ? "Select Model"
                  : "Select Brand first"
            }
            value={selectedModel}
            renderRightIcon={() =>
              loadingMakes ? (
                <ActivityIndicator size="small" color={colors.main} />
              ) : (
                <Ionicons name="chevron-down" size={20} color="#1A1A1A" />
              )
            }
            onChange={(item) => setSelectedModel(item.value)}
            disable={!selectedMake || loadingModels}
          />
        </View>

        {/* Year Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Year</Text>
          <Dropdown
            style={styles.dropdown}
            selectedTextStyle={styles.selectedTextStyle}
            placeholderStyle={styles.placeholderStyle}
            data={years}
            labelField="label"
            valueField="value"
            placeholder="Select Year"
            value={selectedYear}
            onChange={(item) => setSelectedYear(item.value)}
          />
        </View>

        {/* Type Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Type</Text>
          <Dropdown
            style={styles.dropdown}
            selectedTextStyle={styles.selectedTextStyle}
            placeholderStyle={styles.placeholderStyle}
            data={vehicleTypes}
            labelField="label"
            valueField="value"
            placeholder="Select Type"
            value={selectedType}
            onChange={(item) => setSelectedType(item.value)}
          />
        </View>

        {/* Price Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Price Range</Text>
          <Dropdown
            style={styles.dropdown}
            selectedTextStyle={styles.selectedTextStyle}
            placeholderStyle={styles.placeholderStyle}
            data={vehiclePriceRanges[selectedType!]}
            labelField="label"
            valueField="value"
            disable={!selectedType}
            placeholder={
              selectedType ? "Select Price Range" : "Select Type first"
            }
            value={selectedPrice}
            onChange={(item) => setSelectedPrice(item.value)}
          />
        </View>

        {/* Text Inputs */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Seats</Text>
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.input}
              value={seats}
              onChangeText={setSeats}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>License plate</Text>
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.input}
              value={licensePlate}
              onChangeText={setLicensePlate}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            text="Next"
            onClick={() => {
              router.push("/(driver)/check-list");
            }}
            type="main"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FF" },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(40),
  },
  imageContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: scale(20),
    height: verticalScale(160),
    justifyContent: "center",
    alignItems: "center",
    marginVertical: verticalScale(20),
  },
  illustration: { width: "100%", height: "100%", borderRadius: scale(20) },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: verticalScale(20),
  },
  inputGroup: { marginBottom: verticalScale(15) },
  inputLabel: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: verticalScale(5),
  },
  dropdown: {
    height: verticalScale(50),
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: scale(12),
    paddingHorizontal: scale(15),
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
  },
  selectedTextStyle: {
    fontSize: moderateScale(14),
    color: "#1A1A1A",
    lineHeight: moderateScale(18), // Centers text vertically in the box
  },
  placeholderStyle: {
    fontSize: moderateScale(14),
    color: "#9CA3AF",
  },
  textInputWrapper: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(12),
    paddingHorizontal: scale(15),
    height: verticalScale(50),
    justifyContent: "center",
  },
  input: {
    fontSize: moderateScale(14),
    color: "#1A1A1A",
  },
  buttonContainer: {
    marginTop: verticalScale(10),
  },
});
