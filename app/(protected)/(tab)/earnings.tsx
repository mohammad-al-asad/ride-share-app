import { colors } from "@/config/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown"; //
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const StatCard = ({ icon, value, label, iconColor }: any) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <Ionicons name={icon} size={18} color={iconColor} />
      <Text style={styles.statValue}>{value}</Text>
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function EarningsScreen() {
  // State for the selected value of each dropdown
  const [selectedWeek, setSelectedWeek] = useState("1");
  const [selectedMonth, setSelectedMonth] = useState();
  const [selectedYear, setSelectedYear] = useState();

  // Generate dynamic data for the last 4 timelines
  const weekData = [
    { label: "1 week", value: "1" },
    { label: "2 week", value: "2" },
    { label: "3 week", value: "3" },
    { label: "4 week", value: "4" },
  ];
  // Get current date
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Generate last 4 years dynamically
  const yearData = Array.from({ length: 4 }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year.toString() };
  });

  const monthNames = [
    { label: "Jan", value: "Jan" },
    { label: "Feb", value: "Feb" },
    { label: "Mar", value: "Mar" },
    { label: "Apr", value: "Apr" },
    { label: "May", value: "May" },
    { label: "Jun", value: "Jun" },
    { label: "Jul", value: "Jul" },
    { label: "Aug", value: "Aug" },
    { label: "Sep", value: "Sep" },
    { label: "Oct", value: "Oct" },
    { label: "Nov", value: "Nov" },
    { label: "Dec", value: "Dec" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Earnings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.dateText}>Mon, Jan 19, 2026</Text>
          <Text style={styles.totalEarnings}>USD 55.00</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon="time-outline"
            value="36min"
            label="ONLINE"
            iconColor="#10B981"
          />
          <StatCard
            icon="star"
            value="0.0"
            label="RATING"
            iconColor="#FBBF24"
          />
          <StatCard
            icon="people-outline"
            value="2"
            label="TRIPS"
            iconColor="#9CA3AF"
          />
        </View>

        <View style={styles.mainEarningsCard}>
          <View style={styles.filterRow}>
            {/* Weekly Dropdown */}
            <Dropdown
              style={styles.filterDropdown}
              selectedTextStyle={styles.filterTabText}
              data={weekData}
              labelField="label"
              valueField="value"
              placeholder="Week"
              placeholderStyle={styles.filterTabText}
              value={selectedWeek}
              onChange={(item) => setSelectedWeek(item.value)}
              renderRightIcon={() => (
                <Ionicons name="chevron-down" size={14} color={colors.main} />
              )}
            />

            {/* Month Dropdown */}
            <Dropdown
              style={styles.filterDropdown}
              selectedTextStyle={styles.filterTabText}
              data={monthNames}
              labelField="label"
              valueField="value"
              placeholder="Month"
              placeholderStyle={styles.filterTabText}
              value={selectedMonth}
              onChange={(item) => setSelectedMonth(item.value)}
              renderRightIcon={() => (
                <Ionicons name="chevron-down" size={14} color={colors.main} />
              )}
            />

            {/* Year Dropdown */}
            <Dropdown
              style={styles.filterDropdown}
              selectedTextStyle={styles.filterTabText}
              data={yearData}
              labelField="label"
              valueField="value"
              placeholder="Year"
              placeholderStyle={styles.filterTabText}
              value={selectedYear}
              onChange={(item) => setSelectedYear(item.value)}
              renderRightIcon={() => (
                <Ionicons name="chevron-down" size={14} color={colors.main} />
              )}
            />
          </View>

          <View>
            <Text style={styles.earningsLabel}>Earnings</Text>
            <Text style={styles.earningsValueText}>USD 55.00</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FF" },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(100),
    paddingTop: scale(20),
  },
  headerContainer: {
    backgroundColor: "#FFF",
    paddingTop: scale(45),
    paddingBottom: scale(15),
    elevation: 3,
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    textAlign: "center",
  },
  dateText: { fontSize: moderateScale(14), color: "#4B5563" },
  totalEarnings: { fontSize: moderateScale(32), fontWeight: "bold" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: verticalScale(20),
  },
  statCard: {
    backgroundColor: "#FFF",
    width: "31%",
    padding: scale(12),
    borderRadius: scale(12),
    alignItems: "center",
    elevation: 1,
  },
  statHeader: { flexDirection: "row", alignItems: "center" },
  statValue: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    marginLeft: scale(4),
  },
  statLabel: { fontSize: moderateScale(10), color: "#9CA3AF" },
  mainEarningsCard: {
    backgroundColor: "#FFF",
    borderRadius: scale(16),
    padding: scale(16),
    elevation: 2,
  },
  filterRow: {
    flexDirection: "row",
    gap: scale(8),
    marginBottom: verticalScale(15),
  },

  // Custom style for the small pill dropdowns
  filterDropdown: {
    backgroundColor: "#A6AFFF",
    paddingHorizontal: scale(16),
    height: verticalScale(30),
    borderRadius: scale(20),
    width: "32%",
    alignSelf: "center",
  },
  filterTabText: {
    fontSize: moderateScale(12),
    color: colors.main,
    fontWeight: "600",
  },
  earningsLabel: { fontSize: moderateScale(14), color: "#4B5563" },
  earningsValueText: {
    fontSize: moderateScale(28),
    fontWeight: "bold",
    marginTop: verticalScale(5),
  },
});
