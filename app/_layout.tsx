import { useAppSelector } from "@/redux/hooks";
import { store } from "@/redux/store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StripeProvider } from "@stripe/stripe-react-native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";

SplashScreen.preventAutoHideAsync();


function StripeWrapper({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  const stripeKey =
    user?.email === "maasad11914@gmail.com" || user?.email === "blackboys11914@gmail.com"
      ? process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST
      : process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD;

  return (
    <StripeProvider publishableKey={stripeKey || ""}>{children}</StripeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StripeWrapper>
          <BottomSheetModalProvider>
            <StatusBar barStyle="dark-content" />
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </BottomSheetModalProvider>
        </StripeWrapper>
      </GestureHandlerRootView>
    </Provider>
  );
}
