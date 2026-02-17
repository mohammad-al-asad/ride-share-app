import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCameraPermissions } from "expo-camera";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale } from "react-native-size-matters";

export default function Layout() {
  const [permission, requestPermission] = useCameraPermissions();

  
  useEffect(() => {
    (async () => {
      await requestPermission();
    })();
  }, []);
  
  if (!permission) {
    return <View />;
  }
  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.requestContainer}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerLeft: () => (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color="#262626"
            />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Documents",
        }}
      />
      <Stack.Screen
        name="profile-picture"
        options={{
          title: "Profile Picture",
        }}
      />
      <Stack.Screen
        name="driver-license"
        options={{
          title: "Driver License",
        }}
      />
      <Stack.Screen
        name="registration"
        options={{
          title: "Driver Registration",
        }}
      />
      <Stack.Screen
        name="insurance"
        options={{
          title: "Vehicle Insurance Paper",
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          title: "Payment Information",
        }}
      />
      <Stack.Screen
        name="vehicle-info"
        options={{
          title: "Vehicle Information",
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: moderateScale(40),
    borderWidth: 1,
    borderColor: "#E5E5E5",
    height: moderateScale(40),
    borderRadius: "100%",
    backgroundColor: "#F4F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: scale(12),
  },
  requestContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
});
