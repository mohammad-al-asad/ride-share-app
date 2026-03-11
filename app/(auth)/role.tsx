import AuthBackground from "@/components/AuthBackground";
import CustomButton from "@/components/CustomButton";
import { useUpdateRoleMutation } from "@/redux/api/authApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { persistCredentials } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function ChooseRoleScreen() {
  const [selectedRole, setSelectedRole] = useState<"rider" | "driver" | null>(
    null,
  );
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const emailFromParams = Array.isArray(email) ? email[0] : email;
  const dispatch = useAppDispatch();
  const [updateRole, { isLoading }] = useUpdateRoleMutation();
  const existingUser = useAppSelector((state: RootState) => state.auth.user);
  const existingToken = useAppSelector((state: RootState) => state.auth.token);
  const existingRefreshToken = useAppSelector(
    (state: RootState) => state.auth.refreshToken,
  );
  const emailValue = emailFromParams ?? existingUser?.email;

  const onNext = async () => {
    if (!selectedRole) {
      Alert.alert("Role required", "Please select a role first.");
      return;
    }
    if (!emailValue) {
      Alert.alert("Missing email", "Email is required to set your role.");
      return;
    }

    try {
      const response = await updateRole({
        role: selectedRole,
        email: emailValue,
      }).unwrap();

      await dispatch(
        persistCredentials({
          user: {
            ...(existingUser ?? {}),
            email: emailValue,
            role: selectedRole,
          },
          token: existingToken ?? undefined,
          refreshToken: existingRefreshToken ?? undefined,
        }),
      ).unwrap();

      if (selectedRole === "rider") {
        if (existingUser?.profileImage) {
          router.replace("/(protected)/(tab)");
          return;
        } else {
          router.replace("/(auth)/set-profile");
        }
      } else {
        router.replace("/(protected)/(driver)");
      }
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        "Failed to update role.";
      Alert.alert("Error", message);
      console.log("Update role failed:", err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background with Grid */}
      <AuthBackground />

      <View style={styles.content}>
        <Text style={styles.title}>Choose Role</Text>
        <Text style={styles.subtitle}>
          Once you choose your role, you cannot change it.
        </Text>

        <View style={styles.cardContainer}>
          {/* Customer Card */}
          <RoleCard
            title="Customer"
            image={require("../../assets/images/roleCustomer.svg")}
            isSelected={selectedRole === "rider"}
            onPress={() => setSelectedRole("rider")}
          />

          {/* Driver Card */}
          <RoleCard
            title="Driver"
            image={require("../../assets/images/roleDriver.svg")}
            isSelected={selectedRole === "driver"}
            onPress={() => setSelectedRole("driver")}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <CustomButton
            type="main"
            text={isLoading ? "Please wait..." : "Next"}
            onClick={onNext}
            isLoading={isLoading}
          />
        </View>
      </View>
    </View>
  );
}

// Reusable Role Card Component
const RoleCard = ({ title, image, isSelected, onPress }: any) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[
      styles.card,
      {
        backgroundColor: isSelected ? "#D1D9FF" : "#F1F2F4",
        borderColor: isSelected ? "#240183" : "transparent",
      },
    ]}
  >
    <View style={styles.imageWrapper}>
      <Image source={image} style={styles.cardImage} contentFit="contain" />
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 15,
    marginBottom: 40,
  },
  card: {
    flex: 1,
    height: width * 0.45,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    // Subtle shadow for cards
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageWrapper: {
    width: "100%",
    height: "70%",
    marginBottom: 10,
  },
  cardImage: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  buttonWrapper: {
    width: "100%",
  },
});
