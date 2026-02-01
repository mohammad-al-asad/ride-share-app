import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useState } from "react";
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
  const [makes, setMakes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const [selectedMake, setSelectedMake] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  const [seats, setSeats] = useState("4");
  const [licensePlate, setLicensePlate] = useState("JBS 0342");

  /* ---------------- FETCH MAKES ---------------- */
  useEffect(() => {
    const fetchMakes = async () => {
      try {
        setLoadingMakes(true);
        const res = await fetch(
          "https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json",
        );
        const data = await res.json();
        const formatted = data.Results.map((item: any) => ({
          label: item.MakeName,
          value: item.MakeId,
        }));
        setMakes(formatted);
      } finally {
        setLoadingMakes(false);
      }
    };

    fetchMakes();
  }, []);

  /* ---------------- FETCH MODELS ---------------- */
  useEffect(() => {
    if (!selectedMake) return;

    const fetchModels = async () => {
      try {
        setLoadingModels(true);
        const res = await fetch(
          `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeId/${selectedMake}?format=json`,
        );
        const data = await res.json();
        const formatted = data.Results.map((item: any) => ({
          label: item.Model_Name,
          value: item.Model_ID,
        }));
        setModels(formatted);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, [selectedMake]);

  /* ---------------- STATIC DATA ---------------- */

  const years = useMemo(
    () =>
      Array.from({ length: 27 }, (_, i) => {
        const year = (2026 - i).toString();
        return { label: year, value: year };
      }),
    [],
  );

  const vehicleTypes = [
    { label: "Car", value: "car" },
    { label: "SUV", value: "suv" },
    { label: "Van", value: "van" },
  ];

  // ✅ Added Normal
  const vehicleSizes = [
    { label: "Normal", value: "normal" },
    { label: "Compact/Midsize", value: "compact" },
    { label: "Full Size", value: "full" },
  ];

  const vehiclePriceRanges: Record<string, any[]> = {
    car: [
      { label: "24k-32k", value: "regular" },
      { label: "35k-50k+", value: "premium" },
    ],

    // SUV
    suvnormal: [
      { label: "28k-38k", value: "regular" },
      { label: "40k-60k+", value: "premium" },
    ],
    suvcompact: [
      { label: "30k-45k", value: "regular" },
      { label: "50k-75k+", value: "premium" },
    ],
    suvfull: [
      { label: "45k-60k", value: "regular" },
      { label: "70k-100k+", value: "premium" },
    ],

    // VAN
    vannormal: [
      { label: "30k-40k", value: "regular" },
      { label: "45k-65k+", value: "premium" },
    ],
    vancompact: [
      { label: "32k-45k", value: "regular" },
      { label: "50k-70k+", value: "premium" },
    ],
    vanfull: [
      { label: "40k-55k", value: "regular" },
      { label: "60k-85k+", value: "premium" },
    ],
  };

  /* ---------------- DERIVED PRICE OPTIONS ---------------- */

  const priceOptions = useMemo(() => {
    if (!selectedType) return [];

    if (selectedType === "car") {
      return vehiclePriceRanges.car;
    }

    if (!selectedSize) return [];

    const key = `${selectedType}${selectedSize}`;
    return vehiclePriceRanges[key] ?? [];
  }, [selectedType, selectedSize]);

  const priceDisabled =
    !selectedType || (selectedType !== "car" && !selectedSize);

  const pricePlaceholder = useMemo(() => {
    if (!selectedType) return "Select Type first";
    if (selectedType !== "car" && !selectedSize) return "Select Size first";
    return "Select Price Range";
  }, [selectedType, selectedSize]);

  /* ---------------- UI ---------------- */

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

        {/* Brand */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Brand</Text>
          <Dropdown
            style={styles.dropdown}
            data={makes}
            labelField="label"
            valueField="value"
            value={selectedMake}
            placeholder={loadingMakes ? "Loading..." : "Select Brand"}
            renderRightIcon={() =>
              loadingMakes ? (
                <ActivityIndicator size="small" color={colors.main} />
              ) : (
                <Ionicons name="chevron-down" size={20} />
              )
            }
            onChange={(item) => {
              setSelectedMake(item.value);
              setSelectedModel(null);
            }}
          />
        </View>

        {/* Model */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Model</Text>
          <Dropdown
            style={styles.dropdown}
            data={models}
            labelField="label"
            valueField="value"
            value={selectedModel}
            disable={!selectedMake || loadingModels}
            placeholder={
              loadingModels
                ? "Loading models..."
                : selectedMake
                  ? "Select Model"
                  : "Select Brand first"
            }
            renderRightIcon={() =>
              loadingModels ? (
                <ActivityIndicator size="small" color={colors.main} />
              ) : (
                <Ionicons name="chevron-down" size={20} />
              )
            }
            onChange={(item) => setSelectedModel(item.value)}
          />
        </View>

        {/* Year */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Year</Text>
          <Dropdown
            style={styles.dropdown}
            data={years}
            labelField="label"
            valueField="value"
            value={selectedYear}
            placeholder="Select Year"
            onChange={(item) => setSelectedYear(item.value)}
          />
        </View>

        {/* Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Type</Text>
          <Dropdown
            style={styles.dropdown}
            data={vehicleTypes}
            labelField="label"
            valueField="value"
            value={selectedType}
            placeholder="Select Type"
            onChange={(item) => {
              setSelectedType(item.value);
              setSelectedSize(null);
              setSelectedPrice(null);
            }}
          />
        </View>

        {/* Size (Not for car) */}
        {selectedType && selectedType !== "car" && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Size</Text>
            <Dropdown
              style={styles.dropdown}
              data={vehicleSizes}
              labelField="label"
              valueField="value"
              value={selectedSize}
              placeholder="Select Size"
              onChange={(item) => {
                setSelectedSize(item.value);
                setSelectedPrice(null);
              }}
            />
          </View>
        )}

        {/* Price */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Price Range</Text>
          <Dropdown
            style={styles.dropdown}
            data={priceOptions}
            labelField="label"
            valueField="value"
            value={selectedPrice}
            disable={priceDisabled}
            placeholder={pricePlaceholder}
            onChange={(item) => setSelectedPrice(item.value)}
          />
        </View>

        {/* Seats */}
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

        {/* License */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>License Plate</Text>
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.input}
              value={licensePlate}
              onChangeText={setLicensePlate}
            />  
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton text="Next" onClick={() => {}} type="main" />
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
    backgroundColor: "#F4F4F6",
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
    borderColor: "#DAD6FF",
    borderWidth: 1,
    borderRadius: scale(12),
    paddingHorizontal: scale(15),
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
  },
  selectedTextStyle: {
    fontSize: moderateScale(14),
    color: "#1A1A1A",
    lineHeight: moderateScale(18),
  },
  placeholderStyle: { fontSize: moderateScale(14), color: "#9CA3AF" },
  textInputWrapper: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#DAD6FF",
    borderRadius: scale(12),
    paddingHorizontal: scale(15),
    height: verticalScale(50),
    justifyContent: "center",
  },
  input: { fontSize: moderateScale(14), color: "#1A1A1A" },
  buttonContainer: { marginTop: verticalScale(10) },
});
