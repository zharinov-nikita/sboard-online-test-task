import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UploadImageStore {
  activeImageId: string | null;
  setActiveImageId: (activeImageId: string) => void;
}
export const useUploadImageStore = create<UploadImageStore>()(
  persist(
    (set) => ({
      activeImageId: null,
      setActiveImageId: (activeImageId) => set({ activeImageId }),
    }),
    {
      name: "upload-image-storage",
    }
  )
);
