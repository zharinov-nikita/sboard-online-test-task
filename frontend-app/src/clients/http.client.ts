import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { useUserStore } from "../store/user.store";

type URL =
  | "registration"
  | "authorization"
  | "refresh-token"
  | "reset-password"
  | "upload-image"
  | "get-last-image-info"
  | "get-optimized-image"
  | "confirm-email"
  | "resend-confirm-email-token"
  | "logout";

class HttpClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Для работы с cookies
    });

    // Добавляем интерцептор запросов для установки актуального токена
    this.axiosInstance.interceptors.request.use((config) => {
      const token = useUserStore.getState().accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // ошибка с accessToken
        if (error.response.data.error === "Unauthorized" && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const res = await this.axiosInstance.post(
              "refresh-token",
              {},
              {
                withCredentials: true,
              }
            );

            if (res.data.user && res.data.accessToken) {
              localStorage.clear();
              useUserStore.getState().setAccessToken(res.data.accessToken);
              useUserStore.getState().setUser(res.data.user);

              // Обновляем заголовок Authorization для повторного запроса
              originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            }

            return this.axiosInstance(originalRequest);
          } catch (error) {
            await this.axiosInstance.post("logout", {}, { withCredentials: true });

            localStorage.clear();
            useUserStore.getState().resetStore();
            return Promise.reject(error);
          }
        }

        // Обработка других ошибок
        if (error.response) {
          return Promise.reject(new Error(error.response.data.message || "Произошла ошибка"));
        } else {
          return Promise.reject(new Error(error.message));
        }
      }
    );
  }

  // Метод GET
  public get<Response>(url: URL, config?: AxiosRequestConfig): Promise<Response> {
    return this.axiosInstance.get(url, config).then((response) => response.data);
  }

  // Метод POST
  public post<Response, Request>(
    url: URL,
    data: Request,
    config?: AxiosRequestConfig
  ): Promise<Response> {
    return this.axiosInstance.post(url, data, config).then((response) => response.data);
  }

  // Метод PUT
  public put<Response, Request>(
    url: URL,
    data: Request,
    config?: AxiosRequestConfig
  ): Promise<Response> {
    return this.axiosInstance.put(url, data, config).then((response) => response.data);
  }

  // Метод DELETE
  public delete<Response>(url: URL, config?: AxiosRequestConfig): Promise<Response> {
    return this.axiosInstance.delete(url, config).then((response) => response.data);
  }
}

export const httpClient = new HttpClient(import.meta.env.VITE_API_URL);
