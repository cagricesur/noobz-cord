import dayjs from "dayjs";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend, { type HttpBackendOptions } from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import { getParameter, type TranslationData } from "@noobz-cord/api";

const debug = import.meta.env.DEV;
const api = getParameter();

export const NC_COOKIE_LANGUAGE = "noobzcord-language";

const syncDayjsLocale = (lng: string) => {
  const code = lng.split(/[-_]/)[0]?.toLowerCase() ?? "en";
  dayjs.locale(code === "tr" ? "tr" : "en");
};

i18n.on("initialized", () => {
  syncDayjsLocale(i18n.language);
});

i18n.on("languageChanged", (lng) => {
  syncDayjsLocale(lng);
});

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    fallbackLng: ["en", "tr"],
    supportedLngs: ["en", "tr"],
    load: "languageOnly",
    detection: {
      order: ["cookie", "navigator", "htmlTag"],
      lookupCookie: NC_COOKIE_LANGUAGE,
      caches: ["cookie"],
      cookieMinutes: 60 * 24 * 365,
      cookieOptions: { path: "/", sameSite: "lax" },
      convertDetectedLanguage: (lng: string) => lng.split(/[-_]/)[0] ?? lng,
    },
    debug: debug,
    saveMissing: debug,
    saveMissingTo: "all",
    react: {
      useSuspense: true,
      bindI18n: "languageChanged languageChanging",
    },
    backend: {
      loadPath: "{{lng}}",
      addPath: "{{lng}}",
      parsePayload(
        _namespace: string,
        key: string,
        fallbackValue: string,
      ): Record<string, string> {
        return { [key]: fallbackValue || key };
      },
      request(_options, language, payload, callback) {
        if (payload) {
          const translations = Object.entries(payload).map((kvp) => {
            return {
              language,
              name: kvp[0],
              value: kvp[1],
            } as TranslationData;
          });
          api
            .postApiParameterAddMissingTranslations(translations)
            .then(() => {})
            .catch(() => {});
        } else {
          api
            .getApiParameterGetTranslations({ language })
            .then((data) => {
              const records: Record<string, string> = {};
              for (const row of data) {
                if (row.name) {
                  records[row.name] = row.value ?? "";
                }
              }
              callback(null, { status: 200, data: records });
            })
            .catch((err) => {
              callback(err, { status: 500, data: "" });
            });
        }
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
