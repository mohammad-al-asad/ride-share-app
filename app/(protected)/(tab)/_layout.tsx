import TabButton from "@/components/TabButton";
import { colors } from "@/config/colors";
import { usePathname } from "expo-router";
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import React, { useEffect } from "react";
import { StatusBar, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scale, verticalScale } from "react-native-size-matters";

const TAB_WIDTH = scale(100); // approximate tab width

export default function RootLayout() {
  const pathname = usePathname();

  const translateX = useSharedValue(0);

  // Map route to index
  useEffect(() => {
    let index = 0;

    if (pathname === "/activity") index = 1;
    if (pathname === "/account") index = 2;

    translateX.value = withTiming(index * TAB_WIDTH, {
      duration: 350,
    });
  }, [pathname]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Tabs options={{ initialRouteName: "index" }}>
      <StatusBar barStyle="dark-content" />
      <TabSlot />

      <TabList style={styles.tabBar}>
        {/* Sliding Indicator */}
        <Animated.View style={[styles.indicator, animatedStyle]} />

        <TabTrigger name="index" href="/" asChild>
          <TabButton icon="home-outline">Home</TabButton>
        </TabTrigger>

        <TabTrigger name="activity" href="/activity" asChild>
          <TabButton icon="document-text-outline">Activity</TabButton>
        </TabTrigger>

        <TabTrigger name="account" href="/account" asChild>
          <TabButton icon="person-outline">Account</TabButton>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    position: "absolute",
    bottom: verticalScale(30),
    left: scale(20),
    right: scale(20),
    height: verticalScale(58),
    backgroundColor: "#FFFFFF",
    borderRadius: scale(35),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: scale(10),
  },
  indicator: {
    position: "absolute",
    top: 0,
    left: scale(15),
    width: TAB_WIDTH - scale(20),
    height: verticalScale(3),
    borderRadius: scale(2),
    backgroundColor: colors.main,
  },
});
