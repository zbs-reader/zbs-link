import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en } from '../locales/en';
import { ru } from '../locales/ru';
import { getMessage, interpolate, type Locale, type Messages } from '../locales/messages';

interface LanguageContextValue {
  language: Locale;
  setLanguage: (language: Locale) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  messages: Messages;
}

const STORAGE_KEY = 'zbs-link-language';
const dictionaries: Record<Locale, Messages> = {
  ru,
  en
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getInitialLanguage(): Locale {
  if (typeof window === 'undefined') {
    return 'ru';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'ru' || stored === 'en') {
    return stored;
  }

  const browserLanguage = window.navigator.language.toLowerCase();
  return browserLanguage.startsWith('ru') ? 'ru' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Locale>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const messages = dictionaries[language];

    return {
      language,
      setLanguage,
      toggleLanguage: () => setLanguage((current) => (current === 'ru' ? 'en' : 'ru')),
      messages,
      t: (key, params) => {
        const message = getMessage(messages, key);
        if (typeof message !== 'string') {
          return key;
        }

        return interpolate(message, params);
      }
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider.');
  }

  return context;
}