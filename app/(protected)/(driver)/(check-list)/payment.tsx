import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { CustomInput } from "@/components/CustomInput";
import { colors } from "@/config/colors";
import {
  useConnectStripeMutation,
  useGetStripeInfoQuery,
} from "@/redux/api/onboardingApi";
import {
  stripeAccountSchema,
  StripeAccountFormValues,
} from "@/schemas/onboardingSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const Payment = () => {
  const router = useRouter();
  const {
    data: stripeInfo,
    error,
    isFetching,
    refetch: refetchStripeInfo,
  } = useGetStripeInfoQuery();
  const [connectStripe, { isLoading: isSaving }] = useConnectStripeMutation();

  const initialStripeId = (stripeInfo?.data?.stripeAccountId ?? "").trim();
  const isConnected = Boolean(stripeInfo?.data?.stripeConnected);
  const apiError = error as
    | { data?: { error?: { message?: string }; message?: string } }
    | undefined;
  const errorMessage =
    apiError?.data?.error?.message ??
    apiError?.data?.message ??
    "Failed to load Stripe information.";

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<StripeAccountFormValues>({
    resolver: zodResolver(stripeAccountSchema),
    defaultValues: {
      stripeAccountId: "",
    },
  });

  useEffect(() => {
    reset({
      stripeAccountId: initialStripeId,
    });
  }, [initialStripeId, reset]);

  const currentStripeId = watch("stripeAccountId").trim();
  const hasStripeId = currentStripeId.length > 0;
  const hasChanges = currentStripeId !== initialStripeId;
  const isDoneDisabled = isSaving || !hasStripeId;

  const onSave = handleSubmit(async (values) => {
    try {
      const payload = {
        stripeAccountId: values.stripeAccountId.trim(),
      };
      const response = await connectStripe(payload).unwrap();
      const message =
        response?.data?.message ?? "Stripe connected successfully.";

      reset(payload);
      refetchStripeInfo();
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
        "Failed to connect Stripe.";
      Alert.alert("Save failed", message);
      console.log("Stripe connect failed:", err);
    }
  });

  const handleDone = () => {
    if (!hasChanges && initialStripeId) {
      router.back();
      return;
    }

    onSave();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <AuthBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Enter your Stripe ID</Text>
            <Text style={styles.subTitle}>
              Open a Stripe account, copy the account ID, and paste it here.
            </Text>
            <Text
              style={[
                styles.statusText,
                isConnected ? styles.connectedText : styles.pendingText,
              ]}
            >
              {isFetching
                ? "Checking Stripe connection..."
                : isConnected
                  ? "Stripe status: Connected"
                  : "Stripe status: Not connected"}
            </Text>
            {error ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Stripe Account ID</Text>
            <Controller
              control={control}
              name="stripeAccountId"
              render={({ field: { onBlur, onChange, value } }) => (
                <CustomInput
                  placeholder="acct_..."
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.stripeAccountId?.message}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />
          </View>

          <CustomButton
            type="main"
            text={hasChanges || !initialStripeId ? "Save" : "Done"}
            onClick={handleDone}
            isDisable={isDoneDisabled}
            isLoading={isSaving}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Payment;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: verticalScale(20),
  },
  container: {
    backgroundColor: "#FFF",
    paddingHorizontal: verticalScale(20),
    paddingVertical: verticalScale(20),
    justifyContent: "center",
    margin: scale(20),
    marginTop: 0,
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: "#DAD6FF",
  },
  header: {
    marginBottom: verticalScale(10),
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#1A1A1A",
    lineHeight: moderateScale(28),
  },
  subTitle: {
    fontSize: moderateScale(13),
    color: "#4B5563",
    marginTop: verticalScale(6),
  },
  statusText: {
    fontSize: moderateScale(12),
    marginTop: verticalScale(8),
    fontWeight: "600",
  },
  connectedText: {
    color: "#059669",
  },
  pendingText: {
    color: colors.main,
  },
  errorMessage: {
    marginTop: verticalScale(8),
    color: "#DC2626",
    fontSize: moderateScale(12),
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#444",
    marginBottom: verticalScale(8),
    marginLeft: scale(2),
  },
});
