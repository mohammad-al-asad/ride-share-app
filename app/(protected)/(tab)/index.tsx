import DriverHome from "@/components/DriverHome";
import HomeScreen from "@/components/Home";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { StyleSheet } from "react-native";

export default function Home() {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const isDriver = user?.role === "driver";
  return isDriver ? <DriverHome /> : <HomeScreen />;
}

const styles = StyleSheet.create({});
