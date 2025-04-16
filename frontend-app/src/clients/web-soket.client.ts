import { io } from "socket.io-client";

export const webSocketClient = (accessToken: string) => {
  const socket = io(import.meta.env.VITE_WS_URL, {
    extraHeaders: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  return socket;
};
