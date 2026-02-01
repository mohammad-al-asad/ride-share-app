import { colors } from "@/config/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale } from "react-native-size-matters";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="feedback"
        options={{
          header: () => (
            <View style={styles.header}>
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
              <Text style={styles.headerTitle}>Feedback</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="personal-info"
        options={{
          header: () => (
            <View style={styles.header}>
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
              <Text style={styles.headerTitle}>Personal Info</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="edit-personal"
        options={{
          header: () => (
            <View style={styles.header}>
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
              <Text style={styles.headerTitle}>Edit Personal Info</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="linked-account"
        options={{
          header: () => (
            <View style={styles.header}>
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
              <Text style={styles.headerTitle}>Linked Account</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="support"
        options={{
          header: () => (
            <View style={styles.header}>
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
              <Text style={styles.headerTitle}>Customer Support</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          header: () => (
            <View style={styles.header}>
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
              <Text style={styles.headerTitle}>Terms & Conditions</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          header: () => (
            <View style={styles.header}>
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
              <Text style={styles.headerTitle}>Privacy & Policy</Text>
            </View>
          ),
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: scale(15),
    paddingTop: scale(45),
    paddingBottom: scale(15),
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  headerTitle: {
    flex: 1,
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    marginRight: scale(36),
  },
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
