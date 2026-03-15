import Axios, { type AxiosRequestConfig, type AxiosError } from "axios";

const TOKEN_KEY = "noobz_cord_token";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

AXIOS_INSTANCE.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  return AXIOS_INSTANCE({ ...config, ...options }).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
