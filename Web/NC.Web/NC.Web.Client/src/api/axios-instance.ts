import Axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { type ProblemDetails } from "./generated/models";
import { notifications } from "@mantine/notifications";

import i18n from "@noobz-cord/i18n";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
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
  (error: AxiosError<ProblemDetails>) => {
    notifications.clean();
    notifications.show({
      position: "top-center",
      withBorder: false,
      withCloseButton: true,
      autoClose: 10000,
      message: i18n.t(error.response?.data.title ?? "SERVICE_ERROR"),
    });
  },
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  return AXIOS_INSTANCE({ ...config, ...options }).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
