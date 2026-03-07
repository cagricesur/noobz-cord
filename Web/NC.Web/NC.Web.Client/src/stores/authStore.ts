import type { IAuthStoreState } from "@noobz-cord/models";
import { create } from "zustand";

export const useAuthStore = create<IAuthStoreState>((set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated: boolean) =>
    set(() => ({ isAuthenticated })),
}));
