const LANGUAGE_MAP: Record<string, string> = {
  english: 'en',
  en: 'en',
  spanish: 'es',
  es: 'es',
  french: 'fr',
  fr: 'fr',
  german: 'de',
  de: 'de',
  italian: 'it',
  it: 'it',
  portuguese: 'pt',
  pt: 'pt',
  russian: 'ru',
  ru: 'ru',
  chinese: 'zh',
  zh: 'zh',
  japanese: 'ja',
  ja: 'ja',
  korean: 'ko',
  ko: 'ko',
  arabic: 'ar',
  ar: 'ar',
  hindi: 'hi',
  hi: 'hi',
  bengali: 'bn',
  bn: 'bn'
};

export function normalizeLanguageCode(language: string | null | undefined): string {
  if (!language) {
    return 'unknown';
  }

  const normalized = language.trim().toLowerCase();
  if (!normalized) {
    return 'unknown';
  }

  if (LANGUAGE_MAP[normalized]) {
    return LANGUAGE_MAP[normalized];
  }

  if (normalized.length >= 2) {
    return normalized.slice(0, 2);
  }

  return normalized;
}
