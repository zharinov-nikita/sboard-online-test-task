import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { AuthorizationRequest, AuthorizationResponse } from "../../proto/auth";
import { useUserStore } from "../../store/user.store";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { httpClient } from "../../clients/http.client";

const schema = z.object({
  email: z.string().email("Неверный формат email").nonempty("Email обязателен"),
  password: z
    .string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .nonempty("Пароль обязателен"),
});

export const useAuthorizationPage = () => {
  const navigate = useNavigate();
  const { setAuthStep, setUser, setAccessToken } = useUserStore((s) => s);

  const authorization = (data: AuthorizationRequest) => {
    return httpClient.post<AuthorizationResponse, AuthorizationRequest>("authorization", data);
  };

  const { data, isError, error, isPending, isSuccess, mutate } = useMutation({
    mutationFn: authorization,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  function onSubmit(data: AuthorizationRequest) {
    mutate(data, {
      onSuccess: (response) => {
        if (response.user) {
          if (response.user.isConfirmEmail && response.accessToken) {
            setUser(response.user);
            setAccessToken(response.accessToken);
            setAuthStep("completed");
            navigate("/upload-image");
          } else {
            setUser(response.user);
            setAuthStep("confirm-email");
            navigate("/confirm-email");
          }
        }
      },
      onError: (error) => {
        console.error("Ошибка регистрации:", error);
      },
    });
  }

  return {
    setAuthStep,
    data,
    isError,
    error,
    isPending,
    isSuccess,

    register,
    errors,
    showPassword,
    togglePasswordVisibility,
    handleSubmit,
    onSubmit,
  };
};
