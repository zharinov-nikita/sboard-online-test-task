import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../proto/auth";

type AuthStep = "registration" | "authorization" | "confirm-email" | "completed";

export interface UserStore {
  authStep: AuthStep;
  setAuthStep: (authStep: AuthStep) => void;

  user: User | null;
  accessToken: string | null;

  setUser: (user: User) => void;
  setAccessToken: (accessToken: string) => void;

  resetStore: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      authStep: "registration",
      setAuthStep: (authStep) => set({ authStep }),

      user: null,
      accessToken: null,
      setUser: (user: User) => set({ user }),
      setAccessToken: (accessToken: string) => set({ accessToken }),
      resetStore: () => {
        set((store) => ({ ...store, authStep: "registration", user: null, accessToken: null }));
      },
    }),
    {
      name: "user-store",
      partialize: (state) => ({
        authStep: state.authStep,
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
