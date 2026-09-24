import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations, Translations } from "./translations";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations | string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: "pt",
  setLanguage: () => {},
  t: (key, def) => def || String(key),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLangState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem("libertapp_language");
      if (stored === "en" || stored === "es" || stored === "pt") {
        return stored;
      }
    } catch {}
    return "pt";
  });

  const setLanguage = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("libertapp_language", newLang);
      window.dispatchEvent(new CustomEvent("libertapp_language_changed", { detail: { language: newLang } }));
    } catch {}
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "libertapp_language" && (e.newValue === "pt" || e.newValue === "en" || e.newValue === "es")) {
        setLangState(e.newValue as Language);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const t = (key: keyof Translations | string, defaultText?: string): string => {
    const currentDict = translations[language] as Record<string, string>;
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    const ptDict = translations.pt as Record<string, string>;
    if (ptDict && ptDict[key]) {
      return ptDict[key];
    }
    return defaultText || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
