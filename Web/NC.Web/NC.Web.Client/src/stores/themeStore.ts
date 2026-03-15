import { create } from "zustand";

interface IThemeStoreState {
  theme?: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}

export const useThemeStore = create<IThemeStoreState>((set) => ({
  setTheme(theme) {
    set({ theme });
  },
}));
