import { store } from "@/redux/store";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </GestureHandlerRootView>
    </Provider>
  );
}
