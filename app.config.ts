export default {
  expo: {
    name: "MA3",
    slug: "ma3",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/icons/App-icon.png",
    scheme: "ridingapp",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription:
          "We need your location to provide pickup suggestions",
        NSPhotoLibraryUsageDescription:
          "This app requires access to your photo library to let you upload profile pictures and identity documents.",
        NSCameraUsageDescription:
          "This app requires access to your camera to let you take profile pictures and scan identity documents.",
      },
      bundleIdentifier: "co.ma3llc",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_MAP_API_KEY,
      },
    },
    android: {
      softwareKeyboardLayoutMode: "resize",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_MAP_API_KEY,
        },
      },
      adaptiveIcon: {
        backgroundColor: "#240183",
        foregroundImage: "./assets/icons/App-icon.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "co.ma3llc",
      permissions: [
        "ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      ["@stripe/stripe-react-native", {}],
      "./plugins/withStripeCardFormAndroidTheme",
      [
        "react-native-maps",
        {
          iosGoogleMapsApiKey: process.env.EXPO_PUBLIC_MAP_API_KEY,
          androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_MAP_API_KEY,
        },
      ],
      [
        "@react-native-community/datetimepicker",
        {
          android: {
            datePicker: {
              colorAccent: {
                light: "#240183",
                dark: "#240183",
              },
              textColorPrimary: {
                light: "#1A1A1A",
                dark: "#1A1A1A",
              },
            },
            timePicker: {
              background: {
                light: "#FFFFFF",
                dark: "#FFFFFF",
              },
              numbersBackgroundColor: {
                light: "#F1F2F4",
                dark: "#F1F2F4",
              },
            },
          },
        },
      ],
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash.png",
          backgroundColor: "#240183",
          hideStatusBar: true,
          imageWidth: 200,
          resizeMode: "contain",
        },
      ],
      "expo-font",
      [
        "expo-location",
        {
          isBackgroundLocationEnabled: false,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: "084efe4a-1ac4-48bd-bf97-e2a07c1d0b10",
      },
    },
  },
};
