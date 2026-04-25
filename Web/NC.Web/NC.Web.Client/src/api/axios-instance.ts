import i18n from "@noobz-cord/i18n";
import { HTTPHEADERS } from "@noobz-cord/models";
import { useAuthStore } from "@noobz-cord/stores";
import Axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import type { RefreshTokenResponse } from "./generated/models";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

const REFRESH_TOKEN_URL = "/api/Token/RefreshJwtToken";
let refreshTokenPromise: Promise<string> | undefined;

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const setHeader = (
  config: InternalAxiosRequestConfig,
  name: string,
  value: string,
) => {
  config.headers = AxiosHeaders.from(config.headers);
  config.headers.set(name, value);
};

const isTokenExpired = (expires: string) => {
  const expiresAt = new Date(expires).getTime();
  return !Number.isFinite(expiresAt) || expiresAt <= Date.now();
};

const refreshJwtToken = () => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  const authState = useAuthStore.getState();
  const refreshToken = authState.info?.tokenData?.refreshToken;

  if (!refreshToken) {
    authState.logout();
    return Promise.reject(new Error("Missing refresh token."));
  }

  refreshTokenPromise = Axios.post<RefreshTokenResponse>(
    REFRESH_TOKEN_URL,
    { refreshToken },
    {
      headers: {
        "Content-Type": "application/json",
        [HTTPHEADERS.Language]: i18n.language,
      },
    },
  )
    .then(({ data }) => {
      const currentAuthState = useAuthStore.getState();
      const currentInfo = currentAuthState.info;
      const tokenData = data.tokenData;

      if (
        !currentInfo?.userData ||
        currentInfo.tokenData?.refreshToken !== refreshToken ||
        !tokenData
      ) {
        throw new Error("Could not refresh JWT token.");
      }

      currentAuthState.login({ ...currentInfo, tokenData });
      return tokenData.token;
    })
    .catch((error) => {
      const currentRefreshToken =
        useAuthStore.getState().info?.tokenData?.refreshToken;

      if (currentRefreshToken === refreshToken) {
        useAuthStore.getState().logout();
      }

      throw error;
    })
    .finally(() => {
      refreshTokenPromise = undefined;
    });

  return refreshTokenPromise;
};

AXIOS_INSTANCE.interceptors.request.use(
  async (config) => {
    debugger;
    const authState = useAuthStore.getState();
    let token = authState.info?.tokenData?.token;

    if (authState.info?.tokenData?.expires) {
      if (isTokenExpired(authState.info.tokenData.expires)) {
        token = await refreshJwtToken();
      }
    }

    if (token) {
      setHeader(config, "Authorization", `Bearer ${token}`);
    }

    setHeader(config, HTTPHEADERS.Language, i18n.language);
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
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | RetryableAxiosRequestConfig
      | undefined;
    const canRefreshToken =
      !!useAuthStore.getState().info?.tokenData?.refreshToken;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== REFRESH_TOKEN_URL &&
      canRefreshToken
    ) {
      originalRequest._retry = true;
      const token = await refreshJwtToken();
      setHeader(originalRequest, "Authorization", `Bearer ${token}`);

      return AXIOS_INSTANCE(originalRequest);
    }

    if (
      error.response?.status === 401 &&
      useAuthStore.getState().authenticated
    ) {
      useAuthStore.getState().logout();
    }

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
