import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import {
  useCreateStripeOnboardingLinkMutation,
  useGetStripeInfoQuery,
} from "@/redux/api/onboardingApi";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useFocusEffect, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { WebView } from "react-native-webview";
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
  const [createStripeOnboardingLink, { isLoading: isSaving }] =
    useCreateStripeOnboardingLinkMutation();
  const [stripeUrl, setStripeUrl] = React.useState<string | null>(null);
  const [isWebViewLoading, setIsWebViewLoading] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refetchStripeInfo();
    }, [refetchStripeInfo]),
  );

  const initialStripeId = (stripeInfo?.data?.stripeAccountId ?? "").trim();
  const isConnected = stripeInfo?.data?.payoutsEnabled === true;
  const payoutMethod = stripeInfo?.data?.defaultPayoutMethod;
  const payoutMethodLabel = payoutMethod?.type
    ? `${payoutMethod.type === "card" ? "Debit card" : "Bank account"}${
        payoutMethod.last4 ? ` ending in ${payoutMethod.last4}` : ""
      }`
    : null;
  const apiError = error as
    | { data?: { error?: { message?: string }; message?: string } }
    | undefined;
  const errorMessage =
    apiError?.data?.error?.message ??
    apiError?.data?.message ??
    "Failed to load Stripe information.";

  const openPayoutOnboarding = async () => {
    try {
      const returnUrl = Linking.createURL("payment");
      const response = await createStripeOnboardingLink({ returnUrl }).unwrap();
      const onboardingUrl = response.data.url;
      const linkMode = response.data.mode ?? "onboarding";
      const browserReturnUrl = response.data.returnUrl ?? returnUrl;

      if (!onboardingUrl) {
        Alert.alert("Setup failed", "Stripe did not return an onboarding link.");
        return;
      }

      setStripeUrl(onboardingUrl);
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        err?.message ??
        "Failed to start Stripe payout setup.";
      Alert.alert("Setup failed", message);
      console.log("Stripe payout setup failed:", err);
    }
  };

  const handleDone = () => {
    router.back();
  };

  const handleWebViewNavigationStateChange = (newNavState: any) => {
    const { url } = newNavState;
    if (!url) return;

    // Detect if we've been redirected back to the app's return URL
    // Stripe onboarding links usually contain the return URL when finished
    if (url.includes("payment") || url.includes("onboarding-complete")) {
      setStripeUrl(null);
      refetchStripeInfo();
    }
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
          <View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Set up payouts</Text>
              <Text style={styles.subTitle}>
                Add a bank account or eligible debit card securely through Stripe.
              </Text>

              <View style={styles.statusBadgeContainer}>
                {isFetching ? (
                  <View style={[styles.statusBadge, styles.fetchingBadge]}>
                    <Text style={styles.statusBadgeText}>Checking status...</Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.statusBadge,
                      isConnected ? styles.readyBadge : styles.neededBadge,
                    ]}
                  >
                    <Ionicons
                      name={isConnected ? "checkmark-circle" : "alert-circle"}
                      size={scale(16)}
                      color="#FFFFFF"
                    />
                    <Text style={styles.statusBadgeText}>
                      {isConnected ? "Payout status: Ready" : "Setup needed"}
                    </Text>
                  </View>
                )}
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={scale(16)} color="#DC2626" />
                  <Text style={styles.errorMessage}>{errorMessage}</Text>
                </View>
              ) : null}
            </View>

            <LinearGradient
              colors={["#FFFFFF", "#F9FAFB"]}
              style={styles.payoutCard}
            >
              <View style={styles.payoutIconContainer}>
                <Ionicons
                  name={payoutMethod?.type === "card" ? "card-outline" : "business-outline"}
                  size={scale(32)}
                  color={colors.main}
                />
              </View>
              <View style={styles.payoutDetails}>
                <Text style={styles.payoutTitle}>Stripe payout account</Text>
                <Text style={styles.payoutText}>
                  {payoutMethodLabel ??
                    "Stripe will collect and verify your payout details. Your details are never stored on our servers."}
                </Text>
                {initialStripeId ? (
                  <View style={styles.accountIdBadge}>
                    <Text style={styles.accountText}>ID: {initialStripeId}</Text>
                  </View>
                ) : null}
              </View>
            </LinearGradient>

            <View style={styles.securitySection}>
              <View style={styles.securityItem}>
                <Ionicons name="shield-checkmark-outline" size={scale(18)} color="#059669" />
                <Text style={styles.securityText}>Secure encryption with Stripe</Text>
              </View>
              <View style={styles.securityItem}>
                <Ionicons name="information-circle-outline" size={scale(18)} color="#6B7280" />
                <Text style={styles.securityText}>Instant payouts available</Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <CustomButton
              type="main"
              text={isConnected ? "Manage Payouts & Balance" : "Set up bank or card payout"}
              onClick={openPayoutOnboarding}
              isDisable={isSaving}
              isLoading={isSaving}
            />
            <CustomButton
              type="outline"
              text={isConnected ? "Done" : "Set up later"}
              onClick={handleDone}
              isDisable={isSaving}
            />
            
            <View style={styles.stripeBranding}>
              <Text style={styles.stripeText}>Powered by </Text>
              <View style={styles.stripeLogoPlaceholder}>
                <Text style={styles.stripeLogoText}>stripe</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={!!stripeUrl}
        animationType="slide"
        onRequestClose={() => setStripeUrl(null)}
      >
        <SafeAreaView style={styles.webViewContainer}>

          <View style={styles.webViewWrapper}>
            <WebView
              source={{ uri: stripeUrl || "" }}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              onLoadStart={() => setIsWebViewLoading(true)}
              onLoadEnd={() => setIsWebViewLoading(false)}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webViewLoader}>
                  <ActivityIndicator size="large" color={colors.main} />
                </View>
              )}
              // Stripe sometimes needs specific UA or features
              domStorageEnabled={true}
              javaScriptEnabled={true}
            />
          </View>
        </SafeAreaView>
      </Modal>
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
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(24),
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    width: "100%",
  },
  header: {
    marginBottom: verticalScale(24),
  },
  headerTitle: {
    fontSize: moderateScale(26),
    fontWeight: "800",
    color: colors.main,
    lineHeight: moderateScale(32),
  },
  subTitle: {
    fontSize: moderateScale(14),
    color: "#4B5563",
    marginTop: verticalScale(8),
    lineHeight: moderateScale(20),
  },
  statusBadgeContainer: {
    flexDirection: "row",
    marginTop: verticalScale(16),
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(100),
    gap: scale(6),
  },
  statusBadgeText: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  readyBadge: {
    backgroundColor: "#059669",
  },
  neededBadge: {
    backgroundColor: colors.main,
  },
  fetchingBadge: {
    backgroundColor: "#9CA3AF",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(12),
    gap: scale(6),
    backgroundColor: "#FEF2F2",
    padding: scale(10),
    borderRadius: scale(8),
  },
  errorMessage: {
    color: "#DC2626",
    fontSize: moderateScale(12),
    flex: 1,
  },
  payoutCard: {
    flexDirection: "row",
    padding: scale(20),
    borderRadius: scale(20),
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  payoutIconContainer: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(16),
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(16),
  },
  payoutDetails: {
    flex: 1,
  },
  payoutTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: verticalScale(4),
  },
  payoutText: {
    color: "#4B5563",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(20),
  },
  accountIdBadge: {
    backgroundColor: "#F3F4F6",
    alignSelf: "flex-start",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: scale(4),
    marginTop: verticalScale(8),
  },
  accountText: {
    color: "#6B7280",
    fontSize: moderateScale(11),
    fontWeight: "600",
  },
  securitySection: {
    marginTop: verticalScale(10),
    gap: verticalScale(12),
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  securityText: {
    color: "#4B5563",
    fontSize: moderateScale(13),
    fontWeight: "500",
  },
  actions: {
    paddingTop: verticalScale(32),
  },
  stripeBranding: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(16),
    opacity: 0.6,
  },
  stripeText: {
    fontSize: moderateScale(12),
    color: "#6B7280",
  },
  stripeLogoPlaceholder: {
    backgroundColor: "#6366F1",
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: scale(4),
  },
  stripeLogoText: {
    color: "#FFFFFF",
    fontSize: moderateScale(10),
    fontWeight: "900",
    textTransform: "lowercase",
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  webViewWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  webViewLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
