import type { IAuthStoreState } from "@noobz-cord/models";
import { create } from "zustand";

export const useAuthStore = create<IAuthStoreState>((set) => ({
  authenticated: false,
  login(info) {
    debugger;
    const { userData, tokenData, ...rest } = info;
    const authenticated = userData && tokenData ? true : false;
    set({
      info: authenticated ? { userData, tokenData, ...rest } : undefined,
      authenticated,
    });
  },
  logout() {
    set({ info: undefined, authenticated: false });
  },
}));
