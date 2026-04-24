import type { IAuthStoreState } from "@noobz-cord/models";
import { create } from "zustand";

export const useAuthStore = create<IAuthStoreState>((set) => ({
  authenticated: false,
  login(info) {
    const { user, token, ...rest } = info;
    const authenticated = user && token ? true : false;
    set({
      info: authenticated ? { user, token, ...rest } : undefined,
      authenticated,
    });
  },
  logout() {
    set({ info: undefined, authenticated: false });
  },
}));
