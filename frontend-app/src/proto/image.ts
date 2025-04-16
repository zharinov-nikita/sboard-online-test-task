export interface UploadImageRequest {
  userId?: string | undefined;
  fileMetadata?: FileMetadata | undefined;
  fileChunks?: Uint8Array | undefined;
}

export interface UploadImageResponse {
  image?: Image | undefined;
  isNull?: boolean | undefined;
}

export interface FileMetadata {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
}

/** Сообщение для запроса информации о последнем изображении */
export interface GetLastImageInfoRequest {
  userId: string;
}

export interface GetLastImageInfoResponse {
  image?: Image | undefined;
  isNull?: boolean | undefined;
}

/** Сообщение для обновления статуса изображения */
export interface UpdateImageStatusRequest {
  /** ID изображения */
  imageId: string;
  /** ID пользователя, которому принадлежит изображение */
  userId: string;
  /** Новый статус обработки изображения (UPLOADED, PROCESSING, COMPLETED, FAILED) */
  processingStatus: string;
}

export interface Image {
  id: string;
  originalName: string;
  generatedNameForOriginalsImage: string;
  generatedNameForProcessedImage: string;
  originalsImagePath: string;
  processedImagePath: string;
  processingStatus: string;
  createdAt: string;
  userId: string;
  size: number;
}

export interface GetOptimizedImageRequest {
  imageId: string;
}

export interface GetOptimizedImageResponse {
  optimizedImage?: Uint8Array | undefined;
  isNull?: boolean | undefined;
}
