import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

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
          title: "Plan your ride",
        }}
      />
      <Stack.Screen
        name="map-selector"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="choose-time"
        options={{
          title: "Choose your time",
        }}
      />
      <Stack.Screen
        name="select-car"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 40,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    height: 40,
    borderRadius: "100%",
    backgroundColor: "#F4F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
});
