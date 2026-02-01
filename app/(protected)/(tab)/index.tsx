import DriverHome from "@/components/DriverHome";
import HomeScreen from "@/components/Home";
import { StyleSheet, View } from "react-native";

export default function Home() {
  const isDriver = true;
  return isDriver ? <DriverHome /> : <HomeScreen />
}

const styles = StyleSheet.create({});
