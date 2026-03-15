export interface IAuthUser {
  userId: string;
  name: string;
  contact: string;
}

export interface IAuthStoreState {
  token: string | null;
  user: IAuthUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  setAuth: (token: string, user: IAuthUser) => void;
  logout: () => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  restoreSession: () => Promise<void>;
}

export interface IAppState {
  authState: IAuthStoreState;
}
