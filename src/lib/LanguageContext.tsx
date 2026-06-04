"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Locale } from "./i18n";
import { dict as dictData } from "./i18n";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  dict: Record<string, unknown>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "color-archive-locale";

function resolveAndReplace(
  key: string,
  locale: Locale,
  replacements?: Record<string, string | number>
): string {
  const keys = key.split(".");
  let current: unknown = dictData[locale];
  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = (current as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  let result = typeof current === "string" ? current : key;
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      result = result.replace(`{${k}}`, String(v));
    }
  }
  return result;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === "en" || saved === "zh") {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // silently fail
    }
  }, []);

  const t = useCallback(
    (key: string, replacements?: Record<string, string | number>) =>
      resolveAndReplace(key, locale, replacements),
    [locale]
  );

  return (
    <LanguageContext.Provider
      value={{ locale, setLocale, t, dict: dictData[locale] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}