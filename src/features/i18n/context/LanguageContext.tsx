import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Language, TranslationKey } from '../types/i18n.types';
import { translations } from '../data/translations';
import { productNamesHindi } from '../data/productNamesHindi';

export interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  productName: (name: string) => string;
}

const STORAGE_KEY = 'sweetshop-language';

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'hi' ? 'hi' : 'en';
    } catch {
      return 'en';
    }
  });

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: (next: Language) => {
        setLanguageState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch (error) {
          console.warn('[LanguageContext] Failed to persist language:', error);
        }
      },
      t: (key: TranslationKey) => translations[language]?.[key] ?? translations.en[key] ?? key,
      productName: (name: string) =>
        language === 'hi' ? productNamesHindi[name] ?? name : name,
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

