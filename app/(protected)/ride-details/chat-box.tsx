import { colors } from "@/config/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const MESSAGES = [
  { id: "1", text: "Hey, where are you now?", time: "9:46 AM", type: "sent" },
  { id: "2", text: "I am almost there.", time: "9:46 AM", type: "received" },
  { id: "3", text: "I am in rush.", time: "9:46 AM", type: "sent" },
  { id: "4", text: "so, make it quick.", time: "9:46 AM", type: "sent" },
];

export default function ChatScreen() {
  const renderItem = ({ item }: { item: (typeof MESSAGES)[0] }) => {
    const isSent = item.type === "sent";
    return (
      <View
        style={[
          styles.messageWrapper,
          isSent ? styles.sentWrapper : styles.receivedWrapper,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isSent ? styles.sentBubble : styles.receivedBubble,
          ]}
        >
          <Text style={styles.messageText}>{item.text}</Text>
          <View style={styles.messageFooter}>
            <Text style={styles.timeText}>{item.time}</Text>
            {/* Double check icon for sent messages */}
            <Ionicons
              name="checkmark-done"
              size={14}
              color={isSent ? "#6366F1" : "#808080"}
              style={styles.checkIcon}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Driver Info */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <Image
          source={require("@/assets/images/demo-profile.png")}
          style={styles.avatar}
        />

        <View style={styles.headerInfo}>
          <Text style={styles.driverName}>Eleanor Pena</Text>
          <Text style={styles.vehicleInfo}>Toyota Sienna LE | JBS 0144</Text>
        </View>
      </View>

      {/* Chat History */}
      <FlatList
        data={MESSAGES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={verticalScale(10)}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type here..."
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    paddingTop: scale(35),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  backButton: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  avatar: { width: scale(45), height: scale(45), borderRadius: scale(22.5) },
  headerInfo: { marginLeft: scale(12) },
  driverName: {
    fontSize: moderateScale(15),
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  vehicleInfo: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginTop: verticalScale(2),
  },

  chatList: { padding: scale(20), paddingBottom: verticalScale(20) },
  messageWrapper: { marginBottom: verticalScale(16), width: "100%" },
  sentWrapper: { alignItems: "flex-end" },
  receivedWrapper: { alignItems: "flex-start" },

  messageBubble: {
    maxWidth: "75%",
    padding: scale(12),
    borderRadius: scale(4),
    elevation: 1,
  },
  sentBubble: {
    backgroundColor: "#D1D5FF", // Light purple for sent bubbles
    borderBottomRightRadius: scale(2),
  },
  receivedBubble: {
    backgroundColor: "#FFFFFF", // White for received bubbles
    borderBottomLeftRadius: scale(2),
  },
  messageText: {
    fontSize: moderateScale(13),
    color: "#000",
    lineHeight: moderateScale(18),
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: verticalScale(4),
  },
  timeText: {
    fontSize: moderateScale(10),
    color: "#808080",
    marginRight: scale(4),
  },
  checkIcon: { marginTop: verticalScale(1) },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: "#F8F9FF",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    height: verticalScale(45),
    borderRadius: scale(12),
    paddingHorizontal: scale(15),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: scale(12),
  },
  sendButton: {
    width: scale(45),
    height: scale(45),
    backgroundColor: colors.main, // Deep purple from your theme
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
  },
});
