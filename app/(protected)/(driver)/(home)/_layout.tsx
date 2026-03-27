import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="zoomed-map"
        options={{
          animation: "simple_push",
        }}
      />
    </Stack>
  );
}
