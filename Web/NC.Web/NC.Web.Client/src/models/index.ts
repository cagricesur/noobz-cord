import type { LoginResponse } from "@noobz-cord/api";

export interface IAuthStoreState {
  user?: LoginResponse;
  authenticated: boolean;
  login: (user: LoginResponse) => void;
  logout: () => void;
}

export interface IAppState {
  authState: IAuthStoreState;
}
