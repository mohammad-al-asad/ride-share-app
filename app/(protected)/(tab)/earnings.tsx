import { colors } from "@/config/colors";
import { useGetDriverEarningsSummaryQuery } from "@/redux/api/driverRIdeStart";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

type DropdownOption = {
  label: string;
  value: string;
};

const StatCard = ({ icon, value, label, iconColor }: any) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <Ionicons name={icon} size={18} color={iconColor} />
      <Text style={styles.statValue}>{value}</Text>
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const getApiErrorMessage = (error: any, fallback: string) =>
  error?.data?.error?.message ?? error?.data?.message ?? fallback;

const formatCurrency = (currency: string, amount: number | undefined) => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    return "--";
  }

  if (currency.toUpperCase() === "USD") {
    return `USD ${numericAmount.toFixed(2)}`;
  }

  return `${currency.toUpperCase()} ${numericAmount.toFixed(2)}`;
};

const formatDateRange = (startAt?: string, endAt?: string) => {
  if (!startAt || !endAt) {
    return "--";
  }

  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "--";
  }

  const startText = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endText = end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startText} - ${endText}`;
};

export default function EarningsScreen() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [selectedWeek, setSelectedWeek] = useState("1");
  const [selectedMonth, setSelectedMonth] = useState(String(currentMonth));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  const weekData: DropdownOption[] = [
    { label: "1 week", value: "1" },
    { label: "2 week", value: "2" },
    { label: "3 week", value: "3" },
    { label: "4 week", value: "4" },
  ];

  const yearData: DropdownOption[] = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => {
        const year = currentYear - i;
        return { label: year.toString(), value: year.toString() };
      }),
    [currentYear],
  );

  const monthData: DropdownOption[] = [
    { label: "Jan", value: "1" },
    { label: "Feb", value: "2" },
    { label: "Mar", value: "3" },
    { label: "Apr", value: "4" },
    { label: "May", value: "5" },
    { label: "Jun", value: "6" },
    { label: "Jul", value: "7" },
    { label: "Aug", value: "8" },
    { label: "Sep", value: "9" },
    { label: "Oct", value: "10" },
    { label: "Nov", value: "11" },
    { label: "Dec", value: "12" },
  ];

  const queryArgs = useMemo(
    () => ({
      period: "week" as const,
      year: Number(selectedYear),
      month: Number(selectedMonth),
      week: Number(selectedWeek),
    }),
    [selectedMonth, selectedWeek, selectedYear],
  );

  const hasValidFilter =
    Number.isFinite(queryArgs.year) &&
    queryArgs.year > 0 &&
    Number.isFinite(queryArgs.month) &&
    queryArgs.month > 0 &&
    Number.isFinite(queryArgs.week) &&
    queryArgs.week > 0;

  const { data, isFetching, isError, error } = useGetDriverEarningsSummaryQuery(
    queryArgs,
    {
      skip: !hasValidFilter,
    },
  );

  const summary = data?.data?.summary;
  const filter = data?.data?.filter;
  const currency = data?.data?.currency ?? "USD";

  const totalEarningsText = formatCurrency(currency, summary?.earnings);
  const onlineTimeText = summary?.onlineTime?.human ?? "--";
  const ratingValue = Number(summary?.rating?.periodAverage ?? 0).toFixed(1);
  const tripsValue = Number.isFinite(Number(summary?.trips))
    ? String(summary?.trips)
    : "--";
  const dateText = formatDateRange(filter?.startAt, filter?.endAt);
  const errorText = isError
    ? getApiErrorMessage(error, "Could not load earnings summary.")
    : "";

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
          <Text style={styles.dateText}>{dateText}</Text>
          <Text style={styles.totalEarnings}>{totalEarningsText}</Text>
          {isFetching && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.main} />
              <Text style={styles.loadingText}>Updating earnings...</Text>
            </View>
          )}
          {Boolean(errorText) && <Text style={styles.errorText}>{errorText}</Text>}
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon="time-outline"
            value={onlineTimeText}
            label="ONLINE"
            iconColor="#10B981"
          />
          <StatCard
            icon="star"
            value={ratingValue}
            label="RATING"
            iconColor="#FBBF24"
          />
          <StatCard
            icon="people-outline"
            value={tripsValue}
            label="TRIPS"
            iconColor="#9CA3AF"
          />
        </View>

        <View style={styles.mainEarningsCard}>
          <View style={styles.filterRow}>
            <Dropdown
              style={styles.filterDropdown}
              selectedTextStyle={styles.filterTabText}
              data={weekData}
              labelField="label"
              valueField="value"
              placeholder="Week"
              placeholderStyle={styles.filterTabText}
              value={selectedWeek}
              onChange={(item: DropdownOption) => setSelectedWeek(item.value)}
              renderRightIcon={() => (
                <Ionicons name="chevron-down" size={14} color={colors.main} />
              )}
            />

            <Dropdown
              style={styles.filterDropdown}
              selectedTextStyle={styles.filterTabText}
              data={monthData}
              labelField="label"
              valueField="value"
              placeholder="Month"
              placeholderStyle={styles.filterTabText}
              value={selectedMonth}
              onChange={(item: DropdownOption) => setSelectedMonth(item.value)}
              renderRightIcon={() => (
                <Ionicons name="chevron-down" size={14} color={colors.main} />
              )}
            />

            <Dropdown
              style={styles.filterDropdown}
              selectedTextStyle={styles.filterTabText}
              data={yearData}
              labelField="label"
              valueField="value"
              placeholder="Year"
              placeholderStyle={styles.filterTabText}
              value={selectedYear}
              onChange={(item: DropdownOption) => setSelectedYear(item.value)}
              renderRightIcon={() => (
                <Ionicons name="chevron-down" size={14} color={colors.main} />
              )}
            />
          </View>

          <View>
            <Text style={styles.earningsLabel}>Earnings</Text>
            <Text style={styles.earningsValueText}>{totalEarningsText}</Text>
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
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginTop: verticalScale(6),
  },
  loadingText: {
    fontSize: moderateScale(12),
    color: colors.main,
    fontWeight: "500",
  },
  errorText: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(12),
    color: "#B91C1C",
    fontWeight: "500",
  },
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
