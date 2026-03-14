import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import {
  useCreatePaymentSetupIntentMutation,
  useSavePaymentMethodMutation,
} from "@/redux/api/rideBookApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRidePayment } from "@/redux/slices/rideBookSlice";
import type { RidePayment } from "@/redux/slices/rideBookSlice";
import {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  CardForm,
  initStripe,
  useConfirmSetupIntent,
} from "@stripe/stripe-react-native";
import type { CardFormView } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const normalizeCardDetails = (
  paymentMethod: any,
  cardDetails: CardFormView.Details | null,
): RidePayment["card"] => {
  const sourceCard = paymentMethod?.Card ?? paymentMethod?.card ?? null;
  const brand = sourceCard?.brand ?? paymentMethod?.brand ?? cardDetails?.brand ?? null;
  const last4 = sourceCard?.last4 ?? paymentMethod?.last4 ?? cardDetails?.last4 ?? null;
  const expMonth =
    sourceCard?.expMonth ??
    sourceCard?.exp_month ??
    paymentMethod?.expMonth ??
    paymentMethod?.exp_month ??
    cardDetails?.expiryMonth ??
    null;
  const expYear =
    sourceCard?.expYear ??
    sourceCard?.exp_year ??
    paymentMethod?.expYear ??
    paymentMethod?.exp_year ??
    cardDetails?.expiryYear ??
    null;

  if (!brand && !last4 && expMonth == null && expYear == null) {
    return null;
  }

  return {
    brand: brand ? String(brand) : null,
    last4: last4 ? String(last4) : null,
    expMonth: typeof expMonth === "number" ? expMonth : null,
    expYear: typeof expYear === "number" ? expYear : null,
  };
};

const getPaymentMethodId = (
  paymentMethod: any,
  fallbackSetupIntent: {
    paymentMethod?: { id?: string | null } | null;
    paymentMethodId?: string | null;
  },
) => {
  return (
    paymentMethod?.id ??
    paymentMethod?.paymentMethodId ??
    paymentMethod?.payment_method_id ??
    fallbackSetupIntent.paymentMethod?.id ??
    fallbackSetupIntent.paymentMethodId ??
    null
  );
};

const PaymentScreen = () => {
  const dispatch = useAppDispatch();
  const existingPayment = useAppSelector((state) => state.rideBook.payment);
  const [cardDetails, setCardDetails] = React.useState<CardFormView.Details | null>(
    null,
  );
  const [createPaymentSetupIntent, { isLoading: isCreatingSetupIntent }] =
    useCreatePaymentSetupIntentMutation();
  const [savePaymentMethod, { isLoading: isSavingPaymentMethod }] =
    useSavePaymentMethodMutation();
  const { confirmSetupIntent, loading: isConfirmingSetupIntent } =
    useConfirmSetupIntent();

  const isLoading =
    isCreatingSetupIntent || isSavingPaymentMethod || isConfirmingSetupIntent;

  const handleSubmit = async () => {
    if (isLoading) {
      return;
    }

    if (existingPayment && !cardDetails?.complete) {
      router.push({
        pathname: "/(protected)/(book)/confirm-pickup",
        params: { mode: "pickup" },
      } as any);
      return;
    }

    if (!cardDetails?.complete) {
      Alert.alert("Invalid card", "Please complete your card details first.");
      return;
    }

    try {
      const setupIntentResponse = await createPaymentSetupIntent().unwrap();
      const setupIntentData = setupIntentResponse.data;

      const confirmResult = await confirmSetupIntent(setupIntentData.clientSecret, {
        paymentMethodType: "Card",
      });

      if ("error" in confirmResult && confirmResult.error) {
        Alert.alert(
          "Card setup failed",
          confirmResult.error.message || "Could not verify this card.",
        );
        return;
      }

      if (!("setupIntent" in confirmResult) || !confirmResult.setupIntent) {
        Alert.alert("Card setup failed", "Stripe did not return a setup result.");
        return;
      }

      const confirmedSetupIntent = confirmResult.setupIntent;
      if (confirmedSetupIntent.status !== "Succeeded") {
        Alert.alert(
          "Card setup incomplete",
          "Your card setup is not completed yet. Please try again.",
        );
        return;
      }

      const saveResponse = await savePaymentMethod({
        setupIntentId: confirmedSetupIntent.id || setupIntentData.setupIntentId,
      }).unwrap();

      if (!saveResponse.success) {
        Alert.alert(
          "Card save failed",
          saveResponse.message || "Could not save your payment method.",
        );
        return;
      }

      const savedPaymentMethod =
        saveResponse.data?.paymentMethod ?? confirmedSetupIntent.paymentMethod ?? null;
      const paymentMethodId = getPaymentMethodId(savedPaymentMethod, confirmedSetupIntent);

      dispatch(
        setRidePayment({
          setupIntentId: confirmedSetupIntent.id || setupIntentData.setupIntentId,
          paymentMethodId,
          customerId: saveResponse.data?.customerId ?? setupIntentData.customerId ?? null,
          defaultPaymentMethodId:
            saveResponse.data?.defaultPaymentMethodId ??
            setupIntentData.defaultPaymentMethodId ??
            paymentMethodId,
          card: normalizeCardDetails(savedPaymentMethod, cardDetails),
        }),
      );

      router.push({
        pathname: "/(protected)/(book)/confirm-pickup",
        params: { mode: "pickup" },
      } as any);
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        err?.message ??
        "Failed to save your payment method. Please try again.";

      Alert.alert("Payment method failed", message);
    }
  };

  const savedCardLabel =
    existingPayment?.card?.brand && existingPayment?.card?.last4
      ? `${existingPayment.card.brand} ending in ${existingPayment.card.last4}`
      : null;

  return (
    <BottomSheetView style={styles.bottomSheet}>
      <BottomSheetScrollView
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerText}>Payment details</Text>
        <Text style={styles.subHeaderText}>
          Your card will not be charged until the trip is complete.
        </Text>

        <View style={styles.inputGroup}>
          <View style={styles.textBlock}>
            <Text style={styles.label}>Card details</Text>
            <Text style={styles.hintText}>
              Stripe will securely save your card before you confirm pickup.
            </Text>
            {savedCardLabel ? (
              <Text style={styles.savedCardText}>
                Saved card on file: {savedCardLabel}
              </Text>
            ) : null}
          </View>

          <View style={styles.cardContainer}>
            <CardForm
              style={styles.cardForm}
              onFormComplete={setCardDetails}
              cardStyle={{
                backgroundColor: "#FFFFFF",
                borderColor: colors.main,
                borderWidth: 1,
                borderRadius: 14,
                fontSize: 16,
                placeholderColor: "#6C6C6C",
                textColor: "#1A1A1A",
              }}
              placeholders={{
                number: "4242 4242 4242 4242",
                expiration: "MM/YY",
                cvc: "CVC",
                postalCode: "ZIP",
              }}
              disabled={isLoading}
            />
          </View>
        </View>

        <CustomButton
          text={
            existingPayment
              ? cardDetails?.complete
                ? "Save new card"
                : "Continue to confirm pickup"
              : "Next confirm pickup spot"
          }
          style={styles.confirmButton}
          onClick={handleSubmit}
          isLoading={isLoading}
        />
      </BottomSheetScrollView>
    </BottomSheetView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  bottomSheet: {
    flex: 1,
    paddingHorizontal: scale(15),
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
    width: scale(260),
    fontSize: moderateScale(14),
    textAlign: "center",
    color: "#00A86B",
    marginTop: verticalScale(2),
    marginBottom: verticalScale(10),
    lineHeight: moderateScale(20),
    marginHorizontal: "auto",
  },
  inputGroup: {
    marginTop: verticalScale(12),
  },
  textBlock: {
    paddingHorizontal: scale(10),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#333",
    marginBottom: verticalScale(8),
  },
  hintText: {
    fontSize: moderateScale(12),
    color: "#6C6C6C",
    marginBottom: verticalScale(10),
  },
  savedCardText: {
    fontSize: moderateScale(12),
    color: colors.main,
    fontWeight: "600",
    marginBottom: verticalScale(8),
  },
  cardContainer: {
    borderWidth: 1,
    borderColor: "#DAD6FF",
    borderRadius: scale(18),
    padding: scale(12),
    backgroundColor: "#F7F5FF",
  },
  cardForm: {
    width: "100%",
    height: verticalScale(210),
  },
  confirmButton: {
    marginTop: verticalScale(20),
  },
});
