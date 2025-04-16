import { useMutation } from "@tanstack/react-query";
import { useUserStore } from "../../store/user.store";
import { httpClient } from "../../clients/http.client";

export const useHeader = () => {
  const { authStep, setAuthStep, user, resetStore } = useUserStore((s) => s);

  const logout = () => httpClient.post("logout", {});
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.clear();
      resetStore();
    },
    onError: (error) => {
      console.error("Logout error:", error);
      localStorage.clear();
      resetStore();
    },
  });

  function handleLogout() {
    logoutMutation.mutate();
  }

  function handleRegistration() {
    setAuthStep("registration");
  }

  function handleAuthorization() {
    setAuthStep("authorization");
  }

  return {
    authStep,
    user,
    handleLogout,
    handleRegistration,
    handleAuthorization,
  };
};
