import type { LoginResponse } from "@noobz-cord/api";

export * from "./constants";

export interface IAuthStoreState {
  info?: LoginResponse;
  authenticated: boolean;
  login: (info: LoginResponse) => void;
  logout: () => void;
}

export interface IAppState {
  authState: IAuthStoreState;
}
