import type { IAuthStoreState } from "@noobz-cord/models";
import { create } from "zustand";

export const useAuthStore = create<IAuthStoreState>((set) => ({
  authenticated: false,
  login(user) {
    const { name, token, ...rest } = user;
    const authenticated = name && token ? true : false;
    set({
      user: authenticated ? { name, token, ...rest } : undefined,
      authenticated,
    });
  },
  logout() {
    set({ user: undefined, authenticated: false });
  },
}));
