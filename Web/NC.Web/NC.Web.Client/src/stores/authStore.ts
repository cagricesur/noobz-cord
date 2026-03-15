import type { IAuthStoreState, IAuthUser } from "@noobz-cord/models";
import { create } from "zustand";
import { getNoobzCordAPI } from "@noobz-cord/api";

const TOKEN_KEY = "noobz_cord_token";
const USER_KEY = "noobz_cord_user";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser(): IAuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IAuthUser;
  } catch {
    return null;
  }
}

function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function setStoredAuth(token: string, user: IAuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function toAuthUser(data: { userId?: string; name?: string; contact?: string }): IAuthUser {
  return {
    userId: data.userId ?? "",
    name: data.name ?? "",
    contact: data.contact ?? "",
  };
}

const storedToken = getStoredToken();
const storedUser = getStoredUser();

export const useAuthStore = create<IAuthStoreState>((set, get) => ({
  token: storedToken,
  user: storedUser,
  isAuthenticated: !!(storedToken && storedUser),
  authLoading: !!storedToken,
  authError: null,

  setAuth: (token: string, user: IAuthUser) => {
    setStoredAuth(token, user);
    set({ token, user, isAuthenticated: true, authError: null });
  },

  logout: () => {
    clearStoredAuth();
    set({ token: null, user: null, isAuthenticated: false, authError: null });
  },

  setAuthLoading: (authLoading: boolean) => set({ authLoading }),
  setAuthError: (authError: string | null) => set({ authError }),

  restoreSession: async () => {
    const token = get().token ?? getStoredToken();
    if (!token) return;
    set({ authLoading: true, authError: null });
    const api = getNoobzCordAPI();
    try {
      const data = await api.me();
      const user = toAuthUser(data);
      setStoredAuth(token, user);
      set({ user, isAuthenticated: true, authLoading: false });
    } catch {
      clearStoredAuth();
      set({ token: null, user: null, isAuthenticated: false, authLoading: false });
    }
  },
}));
