import i18n from "@noobz-cord/i18n";
import { HTTPHEADERS } from "@noobz-cord/models";
import { useAuthStore } from "@noobz-cord/stores";
import Axios, { AxiosError, type AxiosRequestConfig } from "axios";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().info?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers.set(HTTPHEADERS.Language, i18n.language);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  return AXIOS_INSTANCE({ ...config, ...options }).then((response) => {
    return response?.data;
  });
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
