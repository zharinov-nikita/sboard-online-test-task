import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import {
  ConfirmEmailRequest,
  AuthorizationResponse,
  ResendConfirmEmailTokenRequest,
  ResendConfirmEmailTokenResponse,
} from "../../proto/auth";
import { z } from "zod";
import { useUserStore } from "../../store/user.store";
import { useEffect, useCallback } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { httpClient } from "../../clients/http.client";

const schema = z.object({
  confirmEmail: z.string().email({ message: "Неверный email" }),
  confirmEmailToken: z.string().uuid({ message: "Неверный код" }),
});
export const useConfirmEmailPage = () => {
  const { user, setAuthStep, setUser, setAccessToken } = useUserStore((s) => s);
  const [expiryTime, setExpiryTime] = useLocalStorage("expiryTime", 0);
  const [canResend, setCanResend] = useLocalStorage("canResend", false);
  const [timer, setTimer] = useLocalStorage("timer", 0);

  useEffect(() => {
    let interval: number;
    const now = Date.now();

    if (expiryTime > now) {
      setTimer(Math.ceil((expiryTime - now) / 1000));
      setCanResend(false);

      interval = setInterval(() => {
        const currentTime = Date.now();
        if (currentTime >= expiryTime) {
          setTimer(0);
          setCanResend(true);
          clearInterval(interval);
        } else {
          setTimer(Math.ceil((expiryTime - currentTime) / 1000));
        }
      }, 1000);
    } else {
      setTimer(0);
      setCanResend(true);
    }

    return () => {
      clearInterval(interval);
    };
  }, [expiryTime, setTimer, setCanResend]);

  const confirmEmail = (data: ConfirmEmailRequest) => {
    return httpClient.post<AuthorizationResponse, ConfirmEmailRequest>("confirm-email", data);
  };

  const resendConfirmEmailToken = (data: ResendConfirmEmailTokenRequest) => {
    return httpClient.post<ResendConfirmEmailTokenResponse, ResendConfirmEmailTokenRequest>(
      "resend-confirm-email-token",
      data
    );
  };

  const resendConfirmEmailTokenMutation = useMutation({
    mutationFn: resendConfirmEmailToken,
    onSuccess: () => {
      const newExpiryTime = Date.now() + 60000; // 60 seconds from now
      setExpiryTime(newExpiryTime);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const navigate = useNavigate();

  const confirmEmailMutation = useMutation({
    mutationFn: confirmEmail,
    onSuccess: (response) => {
      if (response.user && response.accessToken) {
        setUser(response.user);
        setAccessToken(response.accessToken);
        setAuthStep("completed");
        navigate("/upload-image");
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      confirmEmail: user?.email,
    },
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = (data: ConfirmEmailRequest) => {
    confirmEmailMutation.mutate(data);
  };

  const handleResendEmail = useCallback(() => {
    if (user && canResend && timer === 0) {
      resendConfirmEmailTokenMutation.mutate({
        confirmEmail: user.email,
      });
    }
  }, [canResend, resendConfirmEmailTokenMutation, timer, user]);

  return {
    resendConfirmEmailTokenMutation,
    confirmEmailMutation,
    user,
    register,
    handleSubmit,
    errors,
    onSubmit,
    timer,
    canResend,
    handleResendEmail,
  };
};
