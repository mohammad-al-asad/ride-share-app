import CustomButton from "@/components/CustomButton"; // Adjust path as needed
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRidePayment } from "@/redux/slices/rideBookSlice";
import { RidePaymentFormType, ridePaymentSchema } from "@/schemas/rideBookSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { router } from "expo-router";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

countries.registerLocale(en);

const countryObj = countries.getNames("en", { select: "official" });
const countryOptions = Object.entries(countryObj).map(([code, name]) => ({
  label: name,
  value: code,
}));

const PaymentScreen = () => {
  const dispatch = useAppDispatch();
  const existingPayment = useAppSelector((state) => state.rideBook.step3.payment);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RidePaymentFormType>({
    resolver: zodResolver(ridePaymentSchema),
    defaultValues: {
      country: existingPayment?.country ?? "",
      expirationDate: existingPayment?.expirationDate ?? "",
      cvv: existingPayment?.cvv ? String(existingPayment.cvv) : "",
      cardNumber: existingPayment?.cardNumber
        ? String(existingPayment.cardNumber)
        : "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    const cardNumber = Number(values.cardNumber);
    const cvv = Number(values.cvv);

    if (!Number.isFinite(cardNumber) || !Number.isFinite(cvv)) {
      Alert.alert("Invalid payment", "Please provide valid numeric card details.");
      return;
    }

    dispatch(
      setRidePayment({
        country: values.country,
        expirationDate: values.expirationDate,
        cvv,
        cardNumber,
      }),
    );

    router.push({
      pathname: "/(protected)/(book)/confirm-pickup",
      params: { mode: "pickup" },
    } as any);
  });

  return (
    <BottomSheetView style={styles.bottomSheet}>
      <BottomSheetScrollView
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Text style={styles.headerText}>Payment screen</Text>
        <Text style={styles.subHeaderText}>
          Your card will not be charged until the trip is complete.
        </Text>

        {/* Country Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Country</Text>
          <Controller
            control={control}
            name="country"
            render={({ field: { value, onChange } }) => (
              <Dropdown
                style={styles.dropdown}
                data={countryOptions}
                labelField="label"
                valueField="value"
                value={value}
                placeholder="Choose country"
                dropdownPosition="bottom"
                containerStyle={styles.dropdownMenuContainer}
                onChange={(item) => onChange(String(item.value ?? ""))}
              />
            )}
          />
          {!!errors.country?.message && (
            <Text style={styles.errorText}>{errors.country.message}</Text>
          )}
        </View>

        {/* Row for Expiry and CVV */}
        <View style={styles.row}>
          <View
            style={[styles.inputGroup, { flex: 1, marginRight: scale(10) }]}
          >
            <Text style={styles.label}>Expiration date</Text>
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="expirationDate"
                render={({ field: { value, onChange, onBlur } }) => (
                  <BottomSheetTextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor="#999"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    maxLength={5}
                  />
                )}
              />
            </View>
            {!!errors.expirationDate?.message && (
              <Text style={styles.errorText}>{errors.expirationDate.message}</Text>
            )}
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>CVV</Text>
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="cvv"
                render={({ field: { value, onChange, onBlur } }) => (
                  <BottomSheetTextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor="#999"
                    secureTextEntry
                    maxLength={4}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    keyboardType="number-pad"
                  />
                )}
              />
            </View>
            {!!errors.cvv?.message && (
              <Text style={styles.errorText}>{errors.cvv.message}</Text>
            )}
          </View>
        </View>

        {/* Card Number Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Card number</Text>
          <View style={styles.inputWrapper}>
            <Controller
              control={control}
              name="cardNumber"
              render={({ field: { value, onChange, onBlur } }) => (
                <BottomSheetTextInput
                  style={styles.input}
                  placeholder="1111 2222 3333 4444"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  maxLength={23}
                />
              )}
            />
            <View style={styles.cardIcons}>
              <Image
                style={{ height: 60, width: 60 }}
                source={require("@/assets/icons/masterCard.svg")}
                contentFit="contain"
              />
            </View>
          </View>
          {!!errors.cardNumber?.message && (
            <Text style={styles.errorText}>{errors.cardNumber.message}</Text>
          )}
        </View>

        {/* Bottom Button */}
        <CustomButton
          text="Next confirm pickup spot"
          style={styles.confirmButton}
          onClick={onSubmit}
        />
      </BottomSheetScrollView>
    </BottomSheetView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  bottomSheet: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
  },
  formContent: {
    paddingBottom: verticalScale(120),
  },
  headerText: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
  },
  subHeaderText: {
    width: scale(240),
    fontSize: moderateScale(14),
    textAlign: "center",
    color: "#00A86B",
    marginVertical: verticalScale(2),
    lineHeight: moderateScale(20),
    marginHorizontal: "auto",
  },
  inputGroup: {
    marginTop: verticalScale(10),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#333",
    marginBottom: verticalScale(8),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#DAD6FF",
    borderRadius: scale(12),
    paddingHorizontal: scale(15),
    height: verticalScale(40),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(14),
  },
  cardIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowAlignCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  countryText: {
    fontSize: moderateScale(14),
    color: "#999",
    marginLeft: scale(10),
  },
  confirmButton: {
    marginTop: verticalScale(15),
  },
  dropdown: {
    height: verticalScale(40),
    borderColor: "#DAD6FF",
    borderWidth: 1,
    borderRadius: scale(12),
    paddingHorizontal: scale(15),
    justifyContent: "center",
  },
  dropdownMenuContainer: {
    borderRadius: scale(12),
    overflow: "hidden",
  },
  errorText: {
    color: "#D14343",
    fontSize: moderateScale(11),
    marginTop: verticalScale(4),
  },
});
