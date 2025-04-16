import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { useUserStore } from "../../../../store/user.store";
import { useUploadImageStore } from "../../upload-image.store";
import { webSocketClient } from "../../../../clients/web-soket.client";
import { httpClient } from "../../../../clients/http.client";
import { ProcessingStatusEnum } from "../../../../enums/processing-status.enum";

interface ImageProcessingData {
  imageId: string;
  userId: string;
  processingStatus: ProcessingStatusEnum;
  imageOriginalName: string;
  createdAt?: string;
}

export const useImageProcessing = () => {
  const { activeImageId } = useUploadImageStore();
  const { accessToken, resetStore } = useUserStore();
  const [imageProcessingMap, setImageProcessingMap] = useState<Map<string, ImageProcessingData>>(
    new Map()
  );
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const socket = webSocketClient(accessToken);

    socket.on("image-processing", (data: ImageProcessingData) => {
      setImageProcessingMap((prev) => new Map(prev).set(data.imageId, data));
    });

    socket.on("connect_error", (err) => {
      console.error("WebSocket error:", err);
      socket.disconnect();

      httpClient.post("logout", {}).finally(() => {
        localStorage.clear();
        resetStore();
        window.location.reload();
      });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [accessToken]);

  return {
    imageProcessingData: activeImageId ? imageProcessingMap.get(activeImageId) ?? null : null,
    imageProcessingMap,
  };
};
