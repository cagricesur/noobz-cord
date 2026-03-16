import i18n from "@noobz-cord/i18n";
import { create } from "zustand";

interface ILocalizationStoreState {
  language: "en" | "tr";
  toggleLanguage: () => void;
}

export const useLocalizationStore = create<ILocalizationStoreState>((set) => ({
  language: i18n.language === "en" ? "en" : "tr",
  toggleLanguage() {
    const language = i18n.language === "en" ? "tr" : "en";
    set({ language });
    i18n.changeLanguage(language);
  },
}));
