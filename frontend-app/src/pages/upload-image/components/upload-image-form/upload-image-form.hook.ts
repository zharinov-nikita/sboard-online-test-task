import { useMutation } from "@tanstack/react-query";
import { useState, useRef, ChangeEvent } from "react";
import { useUserStore } from "../../../../store/user.store";
import { queryClient } from "../../../../main";
import { QueryKeysEnum } from "../../../../enums/query-keys.enum";
import { useUploadImageStore } from "../../upload-image.store";
import { UploadImageResponse } from "../../../../proto/image";
import { httpClient } from "../../../../clients/http.client";

export const useUploadImageForm = () => {
  const { user } = useUserStore((s) => s);
  const { setActiveImageId } = useUploadImageStore((s) => s);
  const uploadImageService = (data: FormData) => {
    return httpClient.post<UploadImageResponse, unknown>("upload-image", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: {
        userId: user?.id,
      },
    });
  };

  const { mutate: mutateUploadImage } = useMutation({
    mutationFn: uploadImageService,
    onSuccess: (data) => {
      if (data.image) {
        setUploadStatus("success");
        setIsUploading(false);
        setImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        queryClient.invalidateQueries({ queryKey: [QueryKeysEnum.LAST_IMAGE_INFO] });
        setActiveImageId(data.image.id);
      }
    },
    onError: () => {
      setUploadStatus("error");
      setIsUploading(false);
    },
  });
  const [image, setImage] = useState<{
    preview: string;
    file: File | null;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"success" | "error" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const preview = await readFileAsDataURL(file);
      setImage({ preview, file });
      setUploadStatus(null);
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const preview = await readFileAsDataURL(file);
      setImage({ preview, file });
      setUploadStatus(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImage(null);
    setUploadStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async () => {
    if (!image?.file || !user) {
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("image", image.file);
      mutateUploadImage(formData);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      setUploadStatus("error");
      setIsUploading(false);
    }
  };

  return {
    image,
    setImage,
    isDragging,
    isUploading,
    uploadStatus,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    triggerFileInput,
    removeImage,
    uploadImage,
    fileInputRef,
  };
};
