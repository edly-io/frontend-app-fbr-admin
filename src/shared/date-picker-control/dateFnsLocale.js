// Maps an app locale code to a date-fns locale loader, so react-datepicker can render localized
// month/day names. Dynamic imports so only the locale bundle actually needed ships.
const LOCALE_LOADERS = {
  en: () => import(/* webpackChunkName: "date-fns-locale-en" */ 'date-fns/locale/en-US/index'),
  ar: () => import(/* webpackChunkName: "date-fns-locale-ar" */ 'date-fns/locale/ar/index'),
  de: () => import(/* webpackChunkName: "date-fns-locale-de" */ 'date-fns/locale/de/index'),
  es: () => import(/* webpackChunkName: "date-fns-locale-es" */ 'date-fns/locale/es/index'),
  fr: () => import(/* webpackChunkName: "date-fns-locale-fr" */ 'date-fns/locale/fr/index'),
  'fr-ca': () => import(/* webpackChunkName: "date-fns-locale-fr-ca" */ 'date-fns/locale/fr-CA/index'),
  he: () => import(/* webpackChunkName: "date-fns-locale-he" */ 'date-fns/locale/he/index'),
  hi: () => import(/* webpackChunkName: "date-fns-locale-hi" */ 'date-fns/locale/hi/index'),
  id: () => import(/* webpackChunkName: "date-fns-locale-id" */ 'date-fns/locale/id/index'),
  it: () => import(/* webpackChunkName: "date-fns-locale-it" */ 'date-fns/locale/it/index'),
  ja: () => import(/* webpackChunkName: "date-fns-locale-ja" */ 'date-fns/locale/ja/index'),
  ko: () => import(/* webpackChunkName: "date-fns-locale-ko" */ 'date-fns/locale/ko/index'),
  nl: () => import(/* webpackChunkName: "date-fns-locale-nl" */ 'date-fns/locale/nl/index'),
  pl: () => import(/* webpackChunkName: "date-fns-locale-pl" */ 'date-fns/locale/pl/index'),
  pt: () => import(/* webpackChunkName: "date-fns-locale-pt" */ 'date-fns/locale/pt/index'),
  'pt-br': () => import(/* webpackChunkName: "date-fns-locale-pt-br" */ 'date-fns/locale/pt-BR/index'),
  ru: () => import(/* webpackChunkName: "date-fns-locale-ru" */ 'date-fns/locale/ru/index'),
  th: () => import(/* webpackChunkName: "date-fns-locale-th" */ 'date-fns/locale/th/index'),
  tr: () => import(/* webpackChunkName: "date-fns-locale-tr" */ 'date-fns/locale/tr/index'),
  uk: () => import(/* webpackChunkName: "date-fns-locale-uk" */ 'date-fns/locale/uk/index'),
  vi: () => import(/* webpackChunkName: "date-fns-locale-vi" */ 'date-fns/locale/vi/index'),
  'zh-cn': () => import(/* webpackChunkName: "date-fns-locale-zh-cn" */ 'date-fns/locale/zh-CN/index'),
  'zh-tw': () => import(/* webpackChunkName: "date-fns-locale-zh-tw" */ 'date-fns/locale/zh-TW/index'),
};

const localeCache = {};

// Resolves (and caches) the date-fns locale object for a given app locale code, falling back to
// the base language and ultimately to en-US.
export async function getDateFnsLocale(localeCode) {
  const normalized = String(localeCode || 'en').toLowerCase();

  if (localeCache[normalized]) {
    return localeCache[normalized];
  }

  const baseLanguage = normalized.split('-')[0];
  const loader = LOCALE_LOADERS[normalized] || LOCALE_LOADERS[baseLanguage] || LOCALE_LOADERS.en;

  try {
    const mod = await loader();
    const locale = mod.default || mod;
    localeCache[normalized] = locale;
    return locale;
  } catch (error) {
    return undefined;
  }
}

export default getDateFnsLocale;
