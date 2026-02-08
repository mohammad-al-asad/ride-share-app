import CustomButton from "@/components/CustomButton"; // Adjust path as needed
import { Image } from "expo-image";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
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
  const [selectedCountry, setSelectedCountry] = useState("");
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header Section */}
      <Text style={styles.headerText}>Payment screen</Text>
      <Text style={styles.subHeaderText}>
        Your card will not be charged until the trip is complete.
      </Text>

      {/* Country Selector */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Country</Text>
        <Dropdown
          style={styles.dropdown}
          data={countryOptions}
          labelField="label"
          valueField="value"
          value={selectedCountry}
          placeholder="Choose country"
          onChange={(item) => setSelectedCountry(item.value)}
        />
      </View>

      {/* Row for Expiry and CVV */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: scale(10) }]}>
          <Text style={styles.label}>Expiration date</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>CVV</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="123"
              placeholderTextColor="#999"
              secureTextEntry
              maxLength={4}
            />
          </View>
        </View>
      </View>

      {/* Card Number Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Card number</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="1111 2222 3333 4444"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
          <View style={styles.cardIcons}>
            <Image
              style={{ height: 60, width: 60 }}
              source={require("@/assets/icons/masterCard.svg")}
              contentFit="contain"
            />
          </View>
        </View>
      </View>

      {/* Bottom Button */}
      <CustomButton
        text="Next confirm pickup spot"
        style={styles.confirmButton}
        onClick={() => console.log("Confirming...")}
      />
    </KeyboardAvoidingView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
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
});
