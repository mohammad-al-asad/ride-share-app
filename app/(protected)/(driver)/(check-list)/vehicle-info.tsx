import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import {
  useGetVehicleInfoQuery,
  useSaveVehicleInfoMutation,
} from "@/redux/api/onboardingApi";
import {
  VehicleInfoFormValues,
  vehicleInfoSchema,
} from "@/schemas/onboardingSchema";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

type MakeOption = {
  label: string;
  value: string;
  makeId: number;
};

type ModelOption = {
  label: string;
  value: string;
  modelId: number;
};

type VehiclePriceOption = {
  label: string;
  value: "regular" | "premium";
  priceRange: number;
  minPrice: number;
  maxPrice: number | null;
};

const VEHICLE_TYPES = [
  { label: "Car", value: "car" },
  { label: "SUV", value: "suv" },
  { label: "Van", value: "van" },
];

const VEHICLE_SIZES = [
  { label: "Normal", value: "normal" },
  { label: "Compact/Midsize", value: "compact" },
  { label: "Full Size", value: "full" },
];

const VEHICLE_PRICE_RANGES: Record<string, VehiclePriceOption[]> = {
  car: [
    {
      label: "24k-32k",
      value: "regular",
      priceRange: 24000,
      minPrice: 24000,
      maxPrice: 32000,
    },
    {
      label: "35k-50k+",
      value: "premium",
      priceRange: 35000,
      minPrice: 35000,
      maxPrice: 50000,
    },
  ],
  suvnormal: [
    {
      label: "28k-38k",
      value: "regular",
      priceRange: 28000,
      minPrice: 28000,
      maxPrice: 38000,
    },
    {
      label: "40k-60k+",
      value: "premium",
      priceRange: 40000,
      minPrice: 40000,
      maxPrice: 60000,
    },
  ],
  suvcompact: [
    {
      label: "30k-45k",
      value: "regular",
      priceRange: 30000,
      minPrice: 30000,
      maxPrice: 45000,
    },
    {
      label: "50k-75k+",
      value: "premium",
      priceRange: 50000,
      minPrice: 50000,
      maxPrice: 75000,
    },
  ],
  suvfull: [
    {
      label: "45k-60k",
      value: "regular",
      priceRange: 45000,
      minPrice: 45000,
      maxPrice: 60000,
    },
    {
      label: "70k-100k+",
      value: "premium",
      priceRange: 70000,
      minPrice: 70000,
      maxPrice: 100000,
    },
  ],
  vannormal: [
    {
      label: "30k-40k",
      value: "regular",
      priceRange: 30000,
      minPrice: 30000,
      maxPrice: 40000,
    },
    {
      label: "45k-65k+",
      value: "premium",
      priceRange: 45000,
      minPrice: 45000,
      maxPrice: 65000,
    },
  ],
  vancompact: [
    {
      label: "32k-45k",
      value: "regular",
      priceRange: 32000,
      minPrice: 32000,
      maxPrice: 45000,
    },
    {
      label: "50k-70k+",
      value: "premium",
      priceRange: 50000,
      minPrice: 50000,
      maxPrice: 70000,
    },
  ],
  vanfull: [
    {
      label: "40k-55k",
      value: "regular",
      priceRange: 40000,
      minPrice: 40000,
      maxPrice: 55000,
    },
    {
      label: "60k-85k+",
      value: "premium",
      priceRange: 60000,
      minPrice: 60000,
      maxPrice: 85000,
    },
  ],
};

function getPriceOptions(type?: string, size?: string) {
  if (!type) return [];
  if (type === "car") return VEHICLE_PRICE_RANGES.car;
  if (!size) return [];

  return VEHICLE_PRICE_RANGES[`${type}${size}`] ?? [];
}

function getMatchingPriceOption(
  type?: string,
  size?: string,
  priceRange?: number,
  tier?: string,
) {
  const options = getPriceOptions(type, size);

  if (tier) {
    const tierMatch = options.find((option) => option.value === tier);
    if (tierMatch) return tierMatch;
  }

  if (priceRange == null) return null;

  return (
    options.find((option) => {
      const inRange =
        priceRange >= option.minPrice &&
        (option.maxPrice == null || priceRange <= option.maxPrice);

      return option.priceRange === priceRange || inRange;
    }) ?? null
  );
}

export default function VehicleInfoScreen() {
  const router = useRouter();
  const [makes, setMakes] = useState<MakeOption[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedMakeId, setSelectedMakeId] = useState<number | null>(null);

  const {
    data: vehicleInfo,
    error,
    isFetching: isFetchingVehicleInfo,
    refetch: refetchVehicleInfo,
  } = useGetVehicleInfoQuery();
  const [saveVehicleInfo, { isLoading: isSaving }] =
    useSaveVehicleInfoMutation();

  const apiError = error as
    | { data?: { error?: { message?: string }; message?: string } }
    | undefined;
  const errorMessage =
    apiError?.data?.error?.message ??
    apiError?.data?.message ??
    "Failed to load vehicle information.";

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<VehicleInfoFormValues>({
    resolver: zodResolver(vehicleInfoSchema),
    mode: "onChange",
    defaultValues: {
      brand: "",
      model: "",
      year: "",
      type: "",
      size: "",
      tier: "",
      seats: "",
      licensePlate: "",
    },
  });

  const selectedBrand = watch("brand");
  const selectedType = watch("type");
  const selectedSize = watch("size");

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, index) => {
      const year = (currentYear - index).toString();
      return { label: year, value: year };
    });
  }, []);

  const priceOptions = useMemo(
    () => getPriceOptions(selectedType, selectedSize),
    [selectedSize, selectedType],
  );

  const priceDisabled =
    !selectedType || (selectedType !== "car" && !selectedSize);

  const pricePlaceholder = useMemo(() => {
    if (!selectedType) return "Select Type first";
    if (selectedType !== "car" && !selectedSize) return "Select Size first";
    return "Select Price Range";
  }, [selectedSize, selectedType]);

  useEffect(() => {
    const fetchMakes = async () => {
      try {
        setLoadingMakes(true);
        const response = await fetch(
          "https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json",
        );
        const data = await response.json();
        const formatted = data.Results.map((item: any) => ({
          label: item.MakeName,
          value: item.MakeName,
          makeId: item.MakeId,
        }));
        setMakes(formatted);
      } catch (err) {
        console.log("Vehicle make fetch failed:", err);
      } finally {
        setLoadingMakes(false);
      }
    };

    fetchMakes();
  }, []);

  useEffect(() => {
    if (!selectedBrand) {
      setSelectedMakeId(null);
      setModels([]);
      return;
    }

    const matchedMake = makes.find(
      (item) => item.value.toLowerCase() === selectedBrand.toLowerCase(),
    );

    if (!matchedMake) {
      setSelectedMakeId(null);
      setModels([]);
      return;
    }
    if (matchedMake.makeId !== selectedMakeId) {
      setSelectedMakeId(matchedMake.makeId);
    }
  }, [makes, selectedBrand, selectedMakeId]);

  useEffect(() => {
    if (!selectedMakeId) return;

    const fetchModels = async () => {
      try {
        setLoadingModels(true);
        const response = await fetch(
          `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeId/${selectedMakeId}?format=json`,
        );
        const data = await response.json();
        const formatted = data.Results.map((item: any) => ({
          label: item.Model_Name,
          value: item.Model_Name,
          modelId: item.Model_ID,
        }));
        setModels(formatted);
      } catch (err) {
        console.log("Vehicle model fetch failed:", err);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, [selectedMakeId]);

  useEffect(() => {
    const existingVehicle = vehicleInfo?.data?.vehicle;
    if (!existingVehicle) return;

    const normalizedSize =
      existingVehicle.type === "car"
        ? existingVehicle.size || "normal"
        : existingVehicle.size || "";
    const matchedPriceOption = getMatchingPriceOption(
      existingVehicle.type,
      normalizedSize,
      existingVehicle.priceRange,
      existingVehicle.tier,
    );

    reset({
      brand: existingVehicle.brand ?? "",
      model: existingVehicle.model ?? "",
      year: existingVehicle.year ? String(existingVehicle.year) : "",
      type: existingVehicle.type ?? "",
      size: normalizedSize,
      tier: matchedPriceOption?.value ?? "",
      seats: existingVehicle.seats ? String(existingVehicle.seats) : "",
      licensePlate: existingVehicle.licensePlate ?? "",
    });
  }, [reset, vehicleInfo]);

  const onSave = handleSubmit(async (values) => {
    const selectedPriceOption =
      priceOptions.find((option) => option.value === values.tier) ?? null;

    if (!selectedPriceOption) {
      Alert.alert("Missing price range", "Please select a valid price range.");
      return;
    }

    const normalizedSize =
      values.type === "car"
        ? values.size?.trim() || "normal"
        : values.size?.trim();
    const payload = {
      brand: values.brand.trim(),
      model: values.model.trim(),
      year: Number(values.year),
      type: values.type.trim(),
      priceRange: selectedPriceOption.priceRange,
      size: normalizedSize,
      seats: Number(values.seats),
      licensePlate: values.licensePlate.trim(),
    };

    try {
      const response = await saveVehicleInfo(payload as any).unwrap();
      const message =
        response?.data?.message ?? "Vehicle information saved successfully.";

      reset({
        ...values,
        size: normalizedSize,
      });
      refetchVehicleInfo();
      Alert.alert("Success", message, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        "Failed to save vehicle information.";
      Alert.alert("Save failed", message);
      console.log("Vehicle info save failed:", err);
    }
  });

  return (
    <View style={styles.container}>
      <AuthBackground />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
        {isFetchingVehicleInfo ? (
          <Text style={styles.statusText}>
            Loading saved vehicle information...
          </Text>
        ) : null}
        {error ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Make</Text>
          <Controller
            control={control}
            name="brand"
            render={({ field: { onChange, value } }) => (
              <Dropdown
                style={[styles.dropdown, errors.brand && styles.inputError]}
                data={makes}
                labelField="label"
                valueField="value"
                value={value}
                placeholder={loadingMakes ? "Loading..." : "Select Make"}
                selectedTextStyle={styles.selectedTextStyle}
                placeholderStyle={styles.placeholderStyle}
                renderRightIcon={() =>
                  loadingMakes ? (
                    <ActivityIndicator size="small" color={colors.main} />
                  ) : (
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  )
                }
                onChange={(item: MakeOption) => {
                  onChange(item.value);
                  setSelectedMakeId(item.makeId);
                  setModels([]);
                  setValue("model", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
            )}
          />
          {errors.brand ? (
            <Text style={styles.errorText}>{errors.brand.message}</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Model</Text>
          <Controller
            control={control}
            name="model"
            render={({ field: { onChange, value } }) => (
              <Dropdown
                style={[styles.dropdown, errors.model && styles.inputError]}
                data={models}
                labelField="label"
                valueField="value"
                value={value}
                disable={!selectedMakeId || loadingModels}
                placeholder={
                  loadingModels
                    ? "Loading models..."
                    : selectedMakeId
                      ? "Select Model"
                      : "Select Make first"
                }
                selectedTextStyle={styles.selectedTextStyle}
                placeholderStyle={styles.placeholderStyle}
                renderRightIcon={() =>
                  loadingModels ? (
                    <ActivityIndicator size="small" color={colors.main} />
                  ) : (
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  )
                }
                onChange={(item: ModelOption) => onChange(item.value)}
              />
            )}
          />
          {errors.model ? (
            <Text style={styles.errorText}>{errors.model.message}</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Year</Text>
          <Controller
            control={control}
            name="year"
            render={({ field: { onChange, value } }) => (
              <Dropdown
                style={[styles.dropdown, errors.year && styles.inputError]}
                data={years}
                labelField="label"
                valueField="value"
                value={value}
                placeholder="Select Year"
                selectedTextStyle={styles.selectedTextStyle}
                placeholderStyle={styles.placeholderStyle}
                renderRightIcon={() => (
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                )}
                onChange={(item: { value: string }) => onChange(item.value)}
              />
            )}
          />
          {errors.year ? (
            <Text style={styles.errorText}>{errors.year.message}</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Type</Text>
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <Dropdown
                style={[styles.dropdown, errors.type && styles.inputError]}
                data={VEHICLE_TYPES}
                labelField="label"
                valueField="value"
                value={value}
                placeholder="Select Type"
                selectedTextStyle={styles.selectedTextStyle}
                placeholderStyle={styles.placeholderStyle}
                renderRightIcon={() => (
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                )}
                onChange={(item: { value: string }) => {
                  onChange(item.value);
                  setValue("tier", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  if (item.value === "car") {
                    setValue("size", "normal", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    return;
                  }

                  setValue("size", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
            )}
          />
          {errors.type ? (
            <Text style={styles.errorText}>{errors.type.message}</Text>
          ) : null}
        </View>

        {selectedType && selectedType !== "car" ? (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Size</Text>
            <Controller
              control={control}
              name="size"
              render={({ field: { onChange, value } }) => (
                <Dropdown
                  style={[styles.dropdown, errors.size && styles.inputError]}
                  data={VEHICLE_SIZES}
                  labelField="label"
                  valueField="value"
                  value={value}
                  placeholder="Select Size"
                  selectedTextStyle={styles.selectedTextStyle}
                  placeholderStyle={styles.placeholderStyle}
                  renderRightIcon={() => (
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  )}
                  onChange={(item: { value: string }) => {
                    onChange(item.value);
                    setValue("tier", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
              )}
            />
            {errors.size ? (
              <Text style={styles.errorText}>{errors.size.message}</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Price Range</Text>
          <Controller
            control={control}
            name="tier"
            render={({ field: { onChange, value } }) => (
              <Dropdown
                style={[
                  styles.dropdown,
                  priceDisabled && styles.dropdownDisabled,
                  errors.tier && styles.inputError,
                ]}
                data={priceOptions}
                labelField="label"
                valueField="value"
                value={value}
                disable={priceDisabled}
                placeholder={pricePlaceholder}
                selectedTextStyle={styles.selectedTextStyle}
                placeholderStyle={styles.placeholderStyle}
                renderRightIcon={() => (
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                )}
                onChange={(item: VehiclePriceOption) => onChange(item.value)}
              />
            )}
          />
          {errors.tier ? (
            <Text style={styles.errorText}>{errors.tier.message}</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Seats</Text>
          <Controller
            control={control}
            name="seats"
            render={({ field: { onBlur, onChange, value } }) => (
              <View
                style={[
                  styles.textInputWrapper,
                  errors.seats && styles.inputError,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="number-pad"
                  placeholder="4"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}
          />
          {errors.seats ? (
            <Text style={styles.errorText}>{errors.seats.message}</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>License Plate</Text>
          <Controller
            control={control}
            name="licensePlate"
            render={({ field: { onBlur, onChange, value } }) => (
              <View
                style={[
                  styles.textInputWrapper,
                  errors.licensePlate && styles.inputError,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="ABC 1234"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                />
              </View>
            )}
          />
          {errors.licensePlate ? (
            <Text style={styles.errorText}>{errors.licensePlate.message}</Text>
          ) : null}
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            text="Save"
            onClick={onSave}
            type="main"
            isDisable={!isValid || isSaving}
            isLoading={isSaving}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
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
  illustration: {
    width: "100%",
    height: "100%",
    borderRadius: scale(20),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: verticalScale(8),
  },
  statusText: {
    fontSize: moderateScale(12),
    color: colors.main,
    marginBottom: verticalScale(10),
  },
  errorBanner: {
    fontSize: moderateScale(12),
    color: "#DC2626",
    marginBottom: verticalScale(10),
  },
  inputGroup: {
    marginBottom: verticalScale(15),
  },
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
  dropdownDisabled: {
    opacity: 0.6,
  },
  selectedTextStyle: {
    fontSize: moderateScale(14),
    color: "#1A1A1A",
    lineHeight: moderateScale(18),
  },
  placeholderStyle: {
    fontSize: moderateScale(14),
    color: "#9CA3AF",
  },
  textInputWrapper: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#DAD6FF",
    borderRadius: scale(12),
    paddingHorizontal: scale(15),
    height: verticalScale(50),
    justifyContent: "center",
  },
  input: {
    fontSize: moderateScale(14),
    color: "#1A1A1A",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    marginTop: verticalScale(6),
    marginLeft: scale(4),
    color: "#EF4444",
    fontSize: moderateScale(12),
  },
  buttonContainer: {
    marginTop: verticalScale(10),
  },
});
