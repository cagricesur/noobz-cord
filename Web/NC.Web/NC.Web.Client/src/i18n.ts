import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import LanguageDetector from "i18next-browser-languagedetector";
import Backend, { type HttpBackendOptions } from "i18next-http-backend";
// don't want to use this?
// have a look at the Quick start guide
// for passing in lng and translations on init

// init i18next
// for all options read: https://www.i18next.com/overview/configuration-options
i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  // want your translations to be loaded from a professional CDN? => https://github.com/locize/react-tutorial#step-2---use-the-locize-cdn
  .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    fallbackLng: "en",
    debug: true,
    backend: {
      // path where resources get loaded from, or a function
      // returning a path:
      // function(lngs, namespaces) { return customPath; }
      // the returned path will interpolate lng, ns if provided like giving a static path
      // the function might return a promise
      // returning falsy will abort the download
      //
      // If not used with i18next-multiload-backend-adapter, lngs and namespaces will have only one element each,
      // If used with i18next-multiload-backend-adapter, lngs and namespaces can have multiple elements
      //   and also your server needs to support multiloading
      //      /locales/resources.json?lng=de+en&ns=ns1+ns2
      //   Adapter is needed to enable MultiLoading https://github.com/i18next/i18next-multiload-backend-adapter
      //   Returned JSON structure in this case is
      //   {
      //    lang : {
      //     namespaceA: {},
      //     namespaceB: {},
      //     ...etc
      //    }
      //   }
      loadPath: "/locales/{{lng}}/{{ns}}.json",

      // path to post missing resources, or a function
      // function(lng, namespace) { return customPath; }
      // the returned path will interpolate lng, ns if provided like giving a static path
      //
      // note that this only works when initialized with { saveMissing: true }
      // (see https://www.i18next.com/overview/configuration-options)
      addPath: "/locales/add/{{lng}}/{{ns}}",

      // parse data after it has been fetched
      // in example use https://www.npmjs.com/package/json5 or https://www.npmjs.com/package/jsonc-parser
      // here it removes the letter a from the json (bad idea)
      parse: function (data) {
        return data.replace(/a/g, "");
      },

      // parse data before it has been sent by addPath
      parsePayload: function (namespace, key, fallbackValue) {
        return { key: fallbackValue || "" };
      },

      // parse data before it has been sent by loadPath
      // if value returned it will send a POST request
      parseLoadPayload: function (languages, namespaces) {
        return undefined;
      },

      // allow cross domain requests => used for XmlHttpRequest
      crossDomain: false,

      // allow credentials on cross domain requests => used for XmlHttpRequest
      withCredentials: false,

      // overrideMimeType sets request.overrideMimeType("application/json") => used for XmlHttpRequest
      overrideMimeType: false,

      // custom request headers sets request.setRequestHeader(key, value)
      customHeaders: {
        authorization: "foo",
        // ...
      },
      // can also be a function, that returns the headers
      customHeaders: () => ({
        authorization: "foo",
        // ...
      }),

      requestOptions: {
        // used for fetch, can also be a function (payload) => ({ method: 'GET' })
        mode: "cors",
        credentials: "same-origin",
        cache: "default",
      },

      // define a custom request function
      // can be used to support XDomainRequest in IE 8 and 9
      //
      // 'options' will be this entire options object
      // 'url' will be passed the value of 'loadPath'
      // 'payload' will be a key:value object used when saving missing translations
      // 'callback' is a function that takes two parameters, 'err' and 'res'.
      //            'err' should be an error
      //            'res' should be an object with a 'status' property and a 'data' property containing a stringified object instance beeing the key:value translation pairs for the
      //            requested language and namespace, or null in case of an error.
      request: function (options, url, payload, callback) {},

      // adds parameters to resource URL. 'example.com' -> 'example.com?v=1.3.5'
      queryStringParams: { v: "1.3.5" },

      reloadInterval: false, // can be used to reload resources in a specific interval (milliseconds) (useful in server environments)
    },
  });

export default i18n;
