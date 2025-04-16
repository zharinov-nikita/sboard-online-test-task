import { useMutation } from "@tanstack/react-query";
import { RegistrationRequest, RegistrationResponse } from "../../proto/auth";
import { useUserStore } from "../../store/user.store";
import { useNavigate } from "react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { httpClient } from "../../clients/http.client";

const schema = z
  .object({
    email: z.string().email("Неверный формат email").nonempty("Email обязателен"),
    password: z
      .string()
      .min(6, "Пароль должен содержать минимум 6 символов")
      .nonempty("Пароль обязателен"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const useRegistrationPage = () => {
  const { setAuthStep } = useUserStore((s) => s);
  const userStore = useUserStore((state) => state);
  const navigate = useNavigate();

  const registration = (data: RegistrationRequest) => {
    return httpClient.post<RegistrationResponse, RegistrationRequest>("registration", data);
  };

  const { data, isError, error, isPending, isSuccess, mutate } = useMutation({
    mutationFn: registration,
  });

  // Функция, которая будет вызвана при отправке формы
  const handleRegistration = (data: RegistrationRequest) => {
    mutate(data, {
      onSuccess: (response) => {
        userStore.setUser(response);
        userStore.setAuthStep("confirm-email");
        navigate("/confirm-email");
      },
      onError: (error) => {
        console.error("Ошибка регистрации:", error);
      },
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prevState) => !prevState);
  };

  return {
    setAuthStep,
    data,
    isError,
    error,
    isPending,
    isSuccess,
    handleRegistration,
    errors,
    register,
    handleSubmit,
    showPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    showConfirmPassword,
  };
};
