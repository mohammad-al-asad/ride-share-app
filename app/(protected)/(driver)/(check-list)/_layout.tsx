import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import { moderateScale, scale } from "react-native-size-matters";

export default function Layout() {
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
});
