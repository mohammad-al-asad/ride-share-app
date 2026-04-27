import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale } from "react-native-size-matters";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";

const RequiredActions = () => {
  const requiredActionsCount = useAppSelector(
    (state: RootState) => state.driverRideStart.requiredActionsCount,
  );
  const hasRequiredActions = requiredActionsCount > 0;
  if(!hasRequiredActions) return null;
  return (
    <View style={[styles.alertCard]}>
      <View style={styles.alertIconBg}>
        <Ionicons name="alert-circle" size={scale(20)} color="white" />
      </View>
      <View style={styles.alertTextContainer}>
        <Text style={styles.alertTitle}>
          Required actions ({requiredActionsCount})
        </Text>
        <Text style={styles.alertSubtitle}>
          Go online when resolved
        </Text>
      </View>
    </View>
  );
};

export default RequiredActions;

const styles = StyleSheet.create({
  alertCard: {
    backgroundColor: "#E0E0E0",
    width: "100%",
    flexDirection: "row",
    padding: scale(15),
    borderRadius: scale(15),
    alignItems: "center",
  },
  alertIconBg: {
    backgroundColor: "#D32F2F",
    borderRadius: 100,
    padding: 4,
    marginRight: scale(12),
  },
  alertTextContainer: { flex: 1 },
  alertTitle: { fontWeight: "700", fontSize: moderateScale(14), color: "#333" },
  alertSubtitle: { fontSize: moderateScale(12), color: "#666" },
});
