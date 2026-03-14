import { store } from "@/redux/store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StripeProvider } from "@stripe/stripe-react-native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StripeProvider
          publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""}
        >
          <BottomSheetModalProvider>
            <StatusBar barStyle="dark-content" />
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </BottomSheetModalProvider>
        </StripeProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
