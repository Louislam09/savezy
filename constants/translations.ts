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

export default translations;
