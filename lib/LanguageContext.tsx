import React, { createContext, useContext, useState } from "react";

export type Language = "en" | "es";

type Translations = {
  [key in Language]: {
    settings: {
      title: string;
      language: string;
      theme: string;
      notifications: string;
      about: string;
      version: string;
      darkMode: string;
      selectLanguage: string;
    };
    languages: {
      en: string;
      es: string;
    };
    tabs: {
      home: string;
      profile: string;
      settings: string;
    };
  };
};

const translations: Translations = {
  en: {
    settings: {
      title: "Settings",
      language: "Language",
      theme: "Theme",
      notifications: "Notifications",
      about: "About",
      version: "Version",
      darkMode: "Dark Mode",
      selectLanguage: "Select Language",
    },
    languages: {
      en: "English",
      es: "Spanish",
    },
    tabs: {
      home: "Home",
      profile: "Profile",
      settings: "Settings",
    },
  },
  es: {
    settings: {
      title: "Configuración",
      language: "Idioma",
      theme: "Tema",
      notifications: "Notificaciones",
      about: "Acerca de",
      version: "Versión",
      darkMode: "Modo Oscuro",
      selectLanguage: "Seleccionar Idioma",
    },
    languages: {
      en: "Inglés",
      es: "Español",
    },
    tabs: {
      home: "Inicio",
      profile: "Guardado",
      settings: "Ajustes",
    },
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (path: string) => {
    const keys = path.split(".");
    let current: any = translations[language];

    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Translation missing for key: ${path}`);
        return path;
      }
      current = current[key];
    }

    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
