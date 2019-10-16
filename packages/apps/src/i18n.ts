import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-xhr-backend';
import { initReactI18next } from 'react-i18next';

i18n
  .use(Backend)
  
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    detection:{
      // order and from where user language should be detected
      order: ['cookie', 'localStorage','browser', 'navigator', 'path', 'subdomain'],

      // keys or params to lookup language from
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,

      // cache user language on
      caches: ['localStorage', 'cookie'],

      // optional htmlTag with lang attribute, the default is:
  },

    backend: {
      loadPath: 'locales/{{lng}}/{{ns}}.json'
    },
    debug: false,
    // defaultNS: 'ui',
    fallbackLng: ['en'],
    saveMissing: false,
    interpolation: {
      escapeValue: false
    },
    // lng: 'zh',
    ns: [
      'app-123code',
      'app-accounts',
      'app-address-book',
      'app-contracts',
      'app-dashboard',
      'app-democracy',
      'app-explorer',
      'app-extrinsics',
      'app-js',
      'app-settings',
      'app-staking',
      'app-storage',
      'app-sudo',
      'apps',
      'ui-signer',
      'app-toolbox',
      'ui-app',

      'app-claims',
      'app-council',
      'app-treasury',
      'apps-routing',
     
      'ui-params'
      // 'react-api',
      // 'react-components',
      // 'react-params',
      // 'react-query',
      // 'react-signer'
    ],
    keySeparator: false,
    nsSeparator: false,
    react: {
      wait: true
    }
  })
  .catch((error: Error): void =>
    console.log('i18n: failure', error)
  );

export default i18n;