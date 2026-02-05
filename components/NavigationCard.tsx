import { colors } from "@/config/colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

type Props = {
  distance: string;
  roadName: string;
  pickupLocation: string;
  maneuver: string;
  arrived: boolean;
};
export default function NavigationCard({
  distance,
  roadName,
  pickupLocation,
  maneuver,
  arrived,
}: Props) {
  const renderIcon = () => {
    switch (maneuver) {
      case "turn-left":
        return <MaterialIcons name={maneuver} size={28} color="white" />;
      case "turn-right":
        return <MaterialIcons name={maneuver} size={28} color="white" />;
      case "straight":
        return <Ionicons name="arrow-up" size={24} color="white" />;
      case "roundabout":
        return (
          <MaterialIcons name="roundabout-right" size={24} color="white" />
        );
      default:
        return <Ionicons name="arrow-up" size={24} color="white" />;
    }
  };

  if (arrived) {
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="location" size={20} color="white" />
          <View style={{ marginLeft: scale(8) }}>
            <Text style={styles.smallText}>Arrived at pickup location</Text>
            <Text style={styles.boldText}>{pickupLocation}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>{distance}</Text>
        </View>

        <View style={styles.directionRow}>
          {renderIcon()}
          <Text style={styles.roadText}>{roadName}</Text>
        </View>
      </View>
      <View style={styles.line} />
      <View style={styles.bottomRow}>
        <Ionicons name="location-outline" size={18} color="white" />
        <View style={{ marginLeft: scale(8) }}>
          <Text style={styles.smallText}>Pickup location</Text>
          <Text style={styles.boldText}>{pickupLocation}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    top: verticalScale(30),
    alignSelf: "center",
    width: "90%",
    backgroundColor: colors.main,
    padding: scale(16),
    borderRadius: scale(14),
    elevation: 6,
    height: verticalScale(130),
    zIndex: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  topRow: {
    marginBottom: scale(12),
  },

  directionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(6),
    gap: scale(8),
  },

  distanceContainer: {
    alignSelf: "flex-start",
  },

  distanceText: {
    color: "white",
    fontSize: moderateScale(14),
  },

  roadText: {
    color: "white",
    fontSize: moderateScale(18),
    fontWeight: "600",
  },

  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  smallText: {
    color: "white",
    fontSize: moderateScale(12),
    opacity: 0.8,
  },

  boldText: {
    color: "white",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  line: {
    height: 1,
    backgroundColor: "#fff",
  },
});
