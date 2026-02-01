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

export default function RootLayout() {
  const pathname = usePathname();

  const translateX = useSharedValue(0);
  const tabWidth = useSharedValue(0);

  const driver = true;

  const tabs = [
    { name: "index", href: "/", icon: "home-outline", label: "Home" },
    ...(driver
      ? [
          {
            name: "earnings",
            href: "/earnings",
            icon: "wallet-outline",
            label: "Earnings",
          },
        ]
      : []),
    {
      name: "activity",
      href: "/activity",
      icon: "document-text-outline",
      label: "Activity",
    },
    {
      name: "account",
      href: "/account",
      icon: "person-outline",
      label: "Account",
    },
  ];

  const activeIndex = tabs.findIndex((tab) => tab.href === pathname);

  useEffect(() => {
    if (tabWidth.value === 0) return;

    const singleTabWidth = tabWidth.value / tabs.length;

    translateX.value = withTiming(activeIndex * singleTabWidth, {
      duration: 300,
    });
  }, [pathname]);

  const animatedStyle = useAnimatedStyle(() => {
    const singleTabWidth = tabWidth.value / tabs.length;

    return {
      width: singleTabWidth - 20,
      transform: [{ translateX: translateX.value + 10 }],
    };
  });

  return (
    <Tabs>
      <TabSlot />

      <TabList
        style={styles.tabBar}
        onLayout={(e) => {
          tabWidth.value = e.nativeEvent.layout.width;
        }}
      >
        <Animated.View style={[styles.indicator, animatedStyle]} />

        {tabs.map((tab) => (
          <TabTrigger
            key={tab.name}
            name={tab.name}
            href={`/(protected)/(tab)${tab.href}` as any}
            asChild
          >
            <TabButton icon={tab.icon as any}>{tab.label}</TabButton>
          </TabTrigger>
        ))}
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
    paddingHorizontal: scale(0),
  },
  indicator: {
    position: "absolute",
    top: 0,
    left: 0,
    height: verticalScale(3),
    borderRadius: scale(2),
    backgroundColor: colors.main,
  },
});
