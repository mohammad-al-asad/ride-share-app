import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;
let activeToken: string | null = null;
let activeUrl: string | null = null;

const resolveSocketBaseUrl = () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!apiUrl) {
    return null;
  }

  try {
    const parsed = new URL(apiUrl);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return apiUrl.replace(/\/+$/, "");
  }
};

export const connectRealtimeSocket = (token: string) => {
  const baseUrl = resolveSocketBaseUrl();

  if (!token || !baseUrl) {
    return null;
  }

  const shouldReconnect =
    !socket || !socket.connected || activeToken !== token || activeUrl !== baseUrl;

  if (shouldReconnect) {
    socket?.disconnect();

    socket = io(baseUrl, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
    });

    activeToken = token;
    activeUrl = baseUrl;
  }

  return socket;
};

export const getRealtimeSocket = () => socket;

export const disconnectRealtimeSocket = () => {
  socket?.disconnect();
  socket = null;
  activeToken = null;
  activeUrl = null;
};
