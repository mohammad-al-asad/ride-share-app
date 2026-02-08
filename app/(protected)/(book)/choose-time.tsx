import CustomButton from "@/components/CustomButton";
import { colors } from "@/config/colors";
import React, { useCallback, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

// Time Picker (Paper)
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import { TimePickerModal } from "react-native-paper-dates";

// Date Picker (Community)
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.main,
    primaryContainer: "#DCE1FF",
  },
};

export default function SchedulePickupScreen() {
  // 1. Manage two separate states for Pickup and Dropoff
  const [activeTab, setActiveTab] = useState<"pickup" | "dropoff">("pickup");
  const [pickupDate, setPickupDate] = useState(new Date());
  const [dropoffDate, setDropoffDate] = useState(
    new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
  ); // Default +24h

  // Visibility States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Helper to get the current date being edited based on the active tab
  const currentActiveDate = activeTab === "pickup" ? pickupDate : dropoffDate;

  // Date Handler
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (activeTab === "pickup") setPickupDate(selectedDate);
      else setDropoffDate(selectedDate);
    }
  };

  // Time Handler
  const onConfirmTime = useCallback(
    ({ hours, minutes }: any) => {
      setShowTimePicker(false);
      const newDate = new Date(currentActiveDate);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);

      if (activeTab === "pickup") setPickupDate(newDate);
      else setDropoffDate(newDate);
    },
    [currentActiveDate, activeTab],
  );

  // Formatted Strings for the main display
  const formattedDate = currentActiveDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = currentActiveDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Formatting the summary (always showing the "other" date for context)
  const summaryLabel = activeTab === "pickup" ? "Dropoff time" : "Pickup time";
  const summaryDate = activeTab === "pickup" ? dropoffDate : pickupDate;
  const formattedSummary = `${summaryDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} | ${summaryDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        {/* Segmented Control */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "pickup" && styles.activeTab]}
            onPress={() => setActiveTab("pickup")}
          >
            <Text style={styles.tabText}>Pickup at</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "dropoff" && styles.activeTab]}
            onPress={() => setActiveTab("dropoff")}
          >
            <Text style={styles.tabText}>Dropoff by</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Display Area */}
        <View style={styles.pickerContainer}>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity onPress={() => setShowTimePicker(true)}>
            <Text style={styles.timeText}>{formattedTime}</Text>
          </TouchableOpacity>

          {/* Contextual Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryLabel}>{summaryLabel}</Text>
            <Text style={styles.summaryValue}>{formattedSummary}</Text>
          </View>
        </View>

        {/* Date Picker Component */}
        {showDatePicker && (
          <DateTimePicker
            value={currentActiveDate}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={onDateChange}
            accentColor={colors.main}
          />
        )}

        {/* Time Picker Modal */}
        <TimePickerModal
          visible={showTimePicker}
          onDismiss={() => setShowTimePicker(false)}
          onConfirm={onConfirmTime}
          hours={currentActiveDate.getHours()}
          minutes={currentActiveDate.getMinutes()}
          label={`Select ${activeTab} time`}
          cancelLabel="Cancel"
          confirmLabel="OK"
          animationType="fade"
        />

        <View style={styles.buttonWrapper}>
          <CustomButton
            type="main"
            text="Next"
            onClick={() => {
              console.log("Final Selection:", { pickupDate, dropoffDate });
              router.push("/(protected)/(book)/book-map");
            }}
          />
        </View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F2F4",
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E2E4E8",
    borderRadius: scale(12),
    padding: scale(4),
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: "center",
    borderRadius: scale(10),
  },
  activeTab: {
    backgroundColor: "white",
  },
  tabText: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#333",
  },
  pickerContainer: {
    marginTop: verticalScale(120),
    alignItems: "center",
  },
  dateText: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#1A1A1A",
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "#E0E0E0",
    marginVertical: verticalScale(8),
  },
  timeText: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: verticalScale(60),
  },
  summaryContainer: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: moderateScale(14),
    color: "#888",
    marginBottom: verticalScale(4),
  },
  summaryValue: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#333",
  },
  buttonWrapper: {
    position: "absolute",
    bottom: verticalScale(30),
    left: scale(20),
    right: scale(20),
  },
});
