import { baseApi } from "./baseApi";

export type TripChatUser = {
  _id: string;
  name?: string;
  profileImage?: string | null;
  role?: string | null;
};

export type TripChatVehicle = {
  brand?: string;
  model?: string;
  licensePlate?: string;
  type?: string;
  size?: string;
} | null;

export type TripChatMessage = {
  _id: string;
  tripId: string;
  senderId: TripChatUser | string;
  receiverId: TripChatUser | string;
  text: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  deliveryStatus?: "sending" | "sent" | "seen" | "failed";
  tempId?: string | null;
};

type TripChatHeaderResponse = {
  success: boolean;
  message: string;
  data: {
    tripId: string;
    otherUser: TripChatUser;
    vehicle: TripChatVehicle;
  };
};

type TripChatMessagesResponse = {
  success: boolean;
  message: string;
  data: {
    items: TripChatMessage[];
  };
};

type TripChatSendResponse = {
  success: boolean;
  message: string;
  data: TripChatMessage;
};

type TripChatSeenResponse = {
  success: boolean;
  message: string;
  data: {
    tripId: string;
    seenAt: string;
    lastSeenMessageId: string | null;
  };
};

type TripChatUnreadCountResponse = {
  success: boolean;
  message: string;
  data: {
    count: number;
  };
};

export const tripChatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTripChatHeader: builder.query<TripChatHeaderResponse, string>({
      query: (tripId) => ({
        url: `chat/trips/${tripId}/chat/header`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
    }),
    getTripChatMessages: builder.query<TripChatMessagesResponse, string>({
      query: (tripId) => ({
        url: `chat/trips/${tripId}/chat/messages`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
    }),
    sendTripChatMessage: builder.mutation<
      TripChatSendResponse,
      { tripId: string; text: string }
    >({
      query: ({ tripId, text }) => ({
        url: `chat/trips/${tripId}/chat/messages`,
        method: "POST",
        body: { text },
      }),
    }),
    markTripChatSeen: builder.mutation<TripChatSeenResponse, string>({
      query: (tripId) => ({
        url: `chat/trips/${tripId}/chat/seen`,
        method: "PATCH",
      }),
    }),
    getTripChatUnreadCount: builder.query<TripChatUnreadCountResponse, string>({
      query: (tripId) => ({
        url: `chat/trips/${tripId}/chat/unread-count`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetTripChatHeaderQuery,
  useGetTripChatMessagesQuery,
  useSendTripChatMessageMutation,
  useMarkTripChatSeenMutation,
  useGetTripChatUnreadCountQuery,
} = tripChatApi;
