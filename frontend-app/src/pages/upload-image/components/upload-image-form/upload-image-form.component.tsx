import { memo } from "react";
import { useUploadImageForm } from "./upload-image-form.hook";

export const UploadImageForm = memo(() => {
  const hook = useUploadImageForm();
  return (
    <div className="flex flex-col items-center justify-center p-4 cursor-pointer">
      <div
        className={`min-w-96 max-w-96 border-2 border-dashed rounded p-6 text-center ${
          hook.isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={hook.handleDragOver}
        onDragLeave={hook.handleDragLeave}
        onDrop={hook.handleDrop}
        onClick={hook.triggerFileInput}
      >
        <input
          type="file"
          ref={hook.fileInputRef}
          onChange={hook.handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {hook.image ? (
          <div className="relative">
            <img
              src={hook.image.preview}
              alt="Uploaded preview"
              className="max-h-64 mx-auto rounded-md"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                hook.removeImage();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              {hook.isDragging
                ? "Отпустите изображение для загрузки"
                : "Перетащите изображение сюда или нажмите для выбора"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Поддерживаются форматы: JPG, PNG, GIF</p>
          </>
        )}
      </div>

      {hook.image && (
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={hook.uploadImage}
            disabled={hook.isUploading}
            className={`w-full py-2 px-4 rounded-md text-white transition ${
              hook.isUploading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {hook.isUploading ? "Загрузка..." : "Загрузить на сервер"}
          </button>

          {hook.uploadStatus === "success" && (
            <div className="p-2 bg-green-100 text-green-800 rounded-md text-center">
              Изображение успешно загружено!
            </div>
          )}

          {hook.uploadStatus === "error" && (
            <div className="p-2 bg-red-100 text-red-800 rounded-md text-center">
              Ошибка загрузки. Попробуйте снова.
            </div>
          )}
        </div>
      )}
    </div>
  );
});
