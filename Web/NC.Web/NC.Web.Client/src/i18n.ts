import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend, { type HttpBackendOptions } from "i18next-http-backend";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    fallbackLng: ["en", "tr"],
    supportedLngs: ["en", "tr"],
    load: "languageOnly",
    debug: import.meta.env.DEV,
    saveMissing: import.meta.env.DEV,
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
  });

export default i18n;
