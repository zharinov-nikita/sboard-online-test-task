import { memo } from "react";
import { useImageProcessing } from "./image-processing.hook";
import { useLastImageInfo } from "./last-image-info.hook";

export const LastImageInfoComponent = memo(() => {
  const { imageProcessingData, imageProcessingMap } = useImageProcessing();
  const hook = useLastImageInfo({ processingStatus: imageProcessingData?.processingStatus });

  if (hook.isLoading) {
    return (
      <div className="animate-pulse flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
        <div className="w-[240px] h-[240px] bg-gray-200 rounded"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (hook.isError) {
    return (
      <div className="text-red-500 font-medium flex items-center justify-center">
        Ошибка загрузки информации
      </div>
    );
  }

  if (hook.data?.isNull) {
    return (
      <div className="font-medium flex items-center justify-center">
        Нет загруженных изображений
      </div>
    );
  }

  const renderStatus = (status: string) => {
    const statusMap = {
      uploaded: {
        text: "Загружено",
        nextStatus: "processing",
        nextStatusText: "Далее: Обработка",
        color: "bg-blue-500",
        animation: "",
      },
      processing: {
        text: "Обработка...",
        nextStatus: "completed",
        nextStatusText: "Далее: Готово",
        color: "bg-yellow-500",
        animation: "animate-pulse",
      },
      completed: {
        text: "Готово",
        nextStatus: null,
        nextStatusText: "",
        color: "bg-green-500",
        animation: "",
      },
      failed: {
        text: "Ошибка",
        nextStatus: null,
        nextStatusText: "",
        color: "bg-red-500",
        animation: "",
      },
    };

    if (!status) return null;

    const currentStatus = statusMap[status as keyof typeof statusMap];

    return (
      <div className="flex flex-col">
        <div className={`flex items-center gap-2 ${currentStatus.animation}`}>
          <span
            className={`${
              currentStatus.color
            } text-white rounded-full w-6 h-6 flex items-center justify-center transition-all duration-300 ${
              status === "processing" ? "animate-spin" : ""
            }`}
          ></span>
          <span className="font-medium">{currentStatus.text}</span>
        </div>
        {currentStatus.nextStatus && (
          <div className="text-sm text-gray-500 ml-8">{currentStatus.nextStatusText}</div>
        )}
      </div>
    );
  };

  const renderQueueItem = (item: {
    imageId: string;
    imageOriginalName: string;
    processingStatus: string;
  }) => (
    <div key={item.imageId} className="flex items-center justify-between p-2">
      <div className="flex items-center gap-3">
        <span className="font-medium truncate max-w-[120px]">{item.imageOriginalName}</span>
        {renderStatus(item.processingStatus)}
      </div>
    </div>
  );
  return (
    <div className="flex items-center justify-center">
      <div className="p-4 bg-white rounded max-w-96 min-w-96">
        <h2 className="text-lg font-bold mb-4">Последнее изображение</h2>

        {hook.data?.image ? (
          <div className="flex flex-col gap-4">
            <div className="relative">
              <img
                src={hook.data.image.originalsImagePath}
                alt={hook.data.image.originalName}
                className="w-full h-auto max-h-60 object-contain rounded"
              />
              <div className="bg-white rounded p-2 absolute top-2 right-2">
                {renderStatus(
                  imageProcessingData?.processingStatus || hook.data?.image?.processingStatus
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              {hook.data.image.originalName && (
                <div>
                  <p className="text-gray-500">Название:</p>
                  <p className="font-medium truncate">{hook.data.image.originalName}</p>
                </div>
              )}
              {hook.data.image.size && (
                <div>
                  <p className="text-gray-500">Размер:</p>
                  <p className="font-medium truncate">
                    {(hook.data.image.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}
              {hook.data.image.originalName && (
                <div>
                  <p className="text-gray-500">Тип:</p>
                  <p className="font-medium truncate">
                    {hook.data.image.originalName.split(".").pop()}
                  </p>
                </div>
              )}
              {hook.data.image.createdAt && (
                <div>
                  <p className="text-gray-500">Дата:</p>
                  <p className="font-medium truncate">
                    {new Date(hook.data.image.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              {hook.data.image.originalsImagePath && (
                <div>
                  <p className="text-gray-500">Оригинальное изображение:</p>
                  <a
                    target="_blank"
                    className="bg-blue-100 text-blue-500 rounded"
                    href={hook.data.image.originalsImagePath}
                  >
                    Смотреть
                  </a>
                </div>
              )}
              {hook.data.image.processedImagePath && (
                <div>
                  <p className="text-gray-500">Обработанное изображение:</p>
                  <a
                    target="_blank"
                    className="bg-blue-100 text-blue-500 rounded"
                    href={hook.data.image.processedImagePath}
                  >
                    Смотреть
                  </a>
                </div>
              )}
            </div>

            {/* Очередь обработки */}
            {imageProcessingMap.size > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Очередь обработки</h3>
                <div>
                  {Array.from(imageProcessingMap.values())
                    .filter((item) => item.imageId !== hook.data?.image?.id)
                    .map(renderQueueItem)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center py-8">
            {imageProcessingData && renderStatus(imageProcessingData.processingStatus)}
          </div>
        )}
      </div>
    </div>
  );
});
