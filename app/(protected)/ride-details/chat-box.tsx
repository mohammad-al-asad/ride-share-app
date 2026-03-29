import { colors } from "@/config/colors";
import {
  connectRealtimeSocket,
  getRealtimeSocket,
} from "@/config/realtime-socket";
import {
  TripChatMessage,
  TripChatUser,
  useGetTripChatHeaderQuery,
  useGetTripChatMessagesQuery,
  useMarkTripChatSeenMutation,
  useSendTripChatMessageMutation,
} from "@/redux/api/tripChatApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const resolveUserId = (user: TripChatUser | string | null | undefined) => {
  if (!user) {
    return "";
  }
  return typeof user === "string" ? user : user._id;
};

const formatMessageTime = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const mergeIncomingMessage = (
  messages: TripChatMessage[],
  incoming: TripChatMessage,
) => {
  const existingIndex = messages.findIndex((item) => item._id === incoming._id);
  const next = [...messages];

  if (existingIndex >= 0) {
    next[existingIndex] = { ...next[existingIndex], ...incoming };
  } else {
    next.push(incoming);
  }

  return next.sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
};

const markOwnMessagesAsSeen = (
  messages: TripChatMessage[],
  currentUserId: string,
  seenAt?: string,
) =>
  messages.map((item) => {
    const isMine = resolveUserId(item.senderId) === currentUserId;
    if (!isMine || item.deliveryStatus === "seen" || item.readAt) {
      return item;
    }

    return {
      ...item,
      readAt: seenAt ?? new Date().toISOString(),
      deliveryStatus: "seen" as const,
    };
  });

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<TripChatMessage> | null>(null);
  const [inputText, setInputText] = useState("");
  const keyboard = useAnimatedKeyboard();
  const animatedContainerStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboard.height.value,
  }));
  const [messages, setMessages] = useState<TripChatMessage[]>([]);

  const authToken = useAppSelector((state: RootState) => state.auth.token);
  const authUserId = useAppSelector((state: RootState) => state.auth.user?.id ?? "");
  const authRole = useAppSelector((state: RootState) => state.auth.user?.role);
  const riderTripId = useAppSelector(
    (state: RootState) => state.rideBook.activeTrip?._id,
  );
  const driverTripId = useAppSelector(
    (state: RootState) => state.driverRideStart.activeTrip?._id,
  );

  const tripId = useMemo(() => {
    if (authRole === "driver") {
      return driverTripId ?? riderTripId ?? "";
    }
    return riderTripId ?? driverTripId ?? "";
  }, [authRole, driverTripId, riderTripId]);

  const { data: headerResponse } = useGetTripChatHeaderQuery(tripId, {
    skip: !tripId,
    refetchOnMountOrArgChange: true,
  });
  const {
    data: messagesResponse,
    isFetching: isMessagesLoading,
    refetch: refetchMessages,
  } =
    useGetTripChatMessagesQuery(tripId, {
      skip: !tripId,
      refetchOnMountOrArgChange: true,
    });
  const [markSeen] = useMarkTripChatSeenMutation();
  const [sendTripChatMessage] = useSendTripChatMessageMutation();

  const markSeenNow = useCallback(() => {
    if (!tripId) {
      return;
    }

    const socket = getRealtimeSocket();
    if (socket?.connected) {
      socket.emit("chat:seen", { tripId });
    }

    markSeen(tripId).catch(() => {
      // Keep chat UX responsive even if seen-mark API fails momentarily.
    });
  }, [markSeen, tripId]);

  useEffect(() => {
    const initialMessages = messagesResponse?.data?.items;
    if (!initialMessages) {
      return;
    }

    setMessages(initialMessages);
  }, [messagesResponse?.data?.items]);

  useEffect(() => {
    if (!tripId || !messagesResponse?.data) {
      return;
    }

    markSeenNow();
  }, [markSeenNow, messagesResponse?.data, tripId]);

  useFocusEffect(
    useCallback(() => {
      if (!tripId) {
        return;
      }

      refetchMessages();
    }, [refetchMessages, tripId]),
  );

  useEffect(() => {
    if (!messages.length) {
      return;
    }

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length]);

  useEffect(() => {
    if (!tripId || !authToken) {
      return;
    }

    const socket = connectRealtimeSocket(authToken);
    if (!socket) {
      return;
    }

    const joinTripRoom = () => {
      socket.emit("chat:join", { tripId });
    };

    const handleJoined = () => {
      markSeenNow();
    };

    const handleNewMessage = (incoming: TripChatMessage) => {
      if (!incoming || String(incoming.tripId) !== String(tripId)) {
        return;
      }

      setMessages((prev) => mergeIncomingMessage(prev, incoming));

      if (resolveUserId(incoming.senderId) !== authUserId) {
        markSeenNow();
      }
    };

    const handleMessageSent = (payload: {
      tempId?: string | null;
      message?: TripChatMessage;
    }) => {
      const sentMessage = payload?.message;
      if (!sentMessage || String(sentMessage.tripId) !== String(tripId)) {
        return;
      }

      setMessages((prev) => {
        const withoutTemp = payload?.tempId
          ? prev.filter(
              (item) =>
                item.tempId !== payload.tempId && item._id !== payload.tempId,
            )
          : prev;
        return mergeIncomingMessage(withoutTemp, sentMessage);
      });
    };

    const handleSeenUpdate = (payload: {
      tripId?: string;
      seenBy?: string;
      seenAt?: string;
    }) => {
      if (!payload?.tripId || String(payload.tripId) !== String(tripId)) {
        return;
      }

      if (!authUserId || String(payload.seenBy) === String(authUserId)) {
        return;
      }

      setMessages((prev) => markOwnMessagesAsSeen(prev, authUserId, payload.seenAt));
    };

    const handleChatError = (payload: { message?: string; tempId?: string }) => {
      const tempId = payload?.tempId;
      if (tempId) {
        setMessages((prev) =>
          prev.map((item) =>
            item.tempId === tempId || item._id === tempId
              ? { ...item, deliveryStatus: "failed" }
              : item,
          ),
        );
        return;
      }

      if (payload?.message) {
        console.log("chat:error", payload.message);
      }
    };

    const handleConnect = () => {
      joinTripRoom();
    };

    socket.on("chat:joined", handleJoined);
    socket.on("chat:new", handleNewMessage);
    socket.on("chat:sent", handleMessageSent);
    socket.on("chat:seen:update", handleSeenUpdate);
    socket.on("chat:error", handleChatError);
    socket.on("connect", handleConnect);

    if (socket.connected) {
      joinTripRoom();
    }

    return () => {
      socket.emit("chat:leave", { tripId });
      socket.off("chat:joined", handleJoined);
      socket.off("chat:new", handleNewMessage);
      socket.off("chat:sent", handleMessageSent);
      socket.off("chat:seen:update", handleSeenUpdate);
      socket.off("chat:error", handleChatError);
      socket.off("connect", handleConnect);
    };
  }, [authToken, authUserId, markSeenNow, tripId]);

  const handleSendMessage = useCallback(async () => {
    const text = inputText.trim();

    if (!tripId || !authUserId || !text) {
      return;
    }

    const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const nowIso = new Date().toISOString();

    const optimisticMessage: TripChatMessage = {
      _id: tempId,
      tripId,
      senderId: authUserId,
      receiverId: "",
      text,
      readAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
      tempId,
      deliveryStatus: "sending",
    };

    setMessages((prev) => mergeIncomingMessage(prev, optimisticMessage));
    setInputText("");

    const socket = authToken ? connectRealtimeSocket(authToken) : getRealtimeSocket();
    if (socket) {
      socket.emit("chat:send", { tripId, text, tempId });
      return;
    }

    try {
      const response = await sendTripChatMessage({ tripId, text }).unwrap();
      setMessages((prev) => {
        const withoutTemp = prev.filter(
          (item) => item.tempId !== tempId && item._id !== tempId,
        );
        return mergeIncomingMessage(withoutTemp, response.data);
      });
    } catch (error: any) {
      setMessages((prev) =>
        prev.map((item) =>
          item.tempId === tempId ? { ...item, deliveryStatus: "failed" } : item,
        ),
      );

      Alert.alert(
        "Message failed",
        error?.data?.error?.message ??
          error?.data?.message ??
          "Could not send your message. Please try again.",
      );
    }
  }, [authToken, authUserId, inputText, sendTripChatMessage, tripId]);

  const renderItem = ({ item }: { item: TripChatMessage }) => {
    const isSent = resolveUserId(item.senderId) === authUserId;
    const statusIcon =
      item.deliveryStatus === "seen"
        ? "checkmark-done"
        : item.deliveryStatus === "failed"
          ? "alert-circle-outline"
          : "checkmark";
    const statusColor =
      item.deliveryStatus === "seen"
        ? "#6366F1"
        : item.deliveryStatus === "failed"
          ? "#DC2626"
          : "#808080";

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
            <Text style={styles.timeText}>{formatMessageTime(item.createdAt)}</Text>
            {isSent && (
              <Ionicons
                name={statusIcon}
                size={14}
                color={statusColor}
                style={styles.checkIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const chatHeader = headerResponse?.data;
  const otherUser = chatHeader?.otherUser;
  const avatarSource = otherUser?.profileImage
    ? { uri: otherUser.profileImage }
    : require("@/assets/images/demo-profile.png");
  const vehicleLabel = chatHeader?.vehicle
    ? `${chatHeader.vehicle.brand ?? ""} ${chatHeader.vehicle.model ?? ""} | ${chatHeader.vehicle.licensePlate ?? ""}`.trim()
    : "In trip chat";

  if (!tripId) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.driverName}>Chat unavailable</Text>
            <Text style={styles.vehicleInfo}>No active trip found</Text>
          </View>
        </View>
      </View>
    );
  }

  const chatContent = (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <Image source={avatarSource} style={styles.avatar} />

        <View style={styles.headerInfo}>
          <Text style={styles.driverName}>{otherUser?.name ?? "Trip chat"}</Text>
          <Text style={styles.vehicleInfo} numberOfLines={1}>
            {vehicleLabel || "In trip chat"}
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isMessagesLoading ? "Loading messages..." : "No messages yet"}
          </Text>
        }
        keyboardShouldPersistTaps="handled"
      />

      <View
        style={[
          styles.inputContainer,
          { paddingBottom: Math.max(insets.bottom, verticalScale(12)) },
        ]}
      >
        <TextInput
          style={styles.textInput}
          placeholder="Type here..."
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Ionicons name="send" size={20} color="#FFD700" />
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {chatContent}
    </Animated.View>
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
    paddingTop: scale(45),
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
  emptyText: {
    marginTop: verticalScale(24),
    textAlign: "center",
    color: "#6B7280",
    fontSize: moderateScale(13),
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
