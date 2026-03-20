import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend, { type HttpBackendOptions } from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

const debug = import.meta.env.DEV;

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    fallbackLng: ["en", "tr"],
    supportedLngs: ["en", "tr"],
    load: "languageOnly",
    debug: debug,
    saveMissing: debug,
    saveMissingTo: "all",
    react: {
      useSuspense: true,
      bindI18n: "languageChanged languageChanging",
    },
    backend: {
      loadPath: "/api/parameter/translations/{{lng}}",
      addPath: "/api/parameter/translations/add/{{lng}}",
      parse: function (data: string | object) {
        return typeof data === "string" ? JSON.parse(data) : data;
      },
      parsePayload: function (
        _namespace: string,
        key: string,
        fallbackValue: string,
      ) {
        return { [key]: fallbackValue || key };
      },
      crossDomain: false,
      withCredentials: false,
      requestOptions: {
        mode: "cors",
        credentials: "same-origin",
        cache: "default",
      },
    },
    maxRetries: 3,
    retryTimeout: 350,
  });

const maintenanceHref = (): string => {
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
  return `${base}/error`.replace(/\/{2,}/g, "/") || "/error";
};

const shouldRedirectToMaintenance = (): boolean => {
  try {
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    const target = maintenanceHref().replace(/\/$/, "") || "/error";
    return path !== target;
  } catch {
    return true;
  }
};

i18n.on("failedLoading", () => {
  if (typeof window === "undefined" || !shouldRedirectToMaintenance()) return;
  window.location.replace(maintenanceHref());
});

export default i18n;
