export type Language = "en" | "es";

export const translations = {
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
    contentTypes: {
      video: "Video",
      meme: "Meme",
      news: "News",
      website: "Website",
      image: "Image",
    },
    actions: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      share: "Share",
      add: "Add",
    },
    common: {
      search: "Search saved items...",
      noItems: "No items saved yet",
      startSaving: "Start saving interesting content you find online",
      saveNew: "Save New Item",
      loading: "Loading...",
      all: "All",
      on: "On",
      off: "Off",
      addNewItem: "What would you like to save?",
      saveNewContent: "Save New Content",
    },
    alerts: {
      deleteConfirm: "Are you sure you want to delete this item?",
      yes: "Yes",
      no: "No",
    },
    home: {
      title: "Savezy",
      emptyTitle: "No items saved yet",
      emptyDescription: "Start saving interesting content you find online",
      addNewButton: "Save New Item",
    },
    profile: {
      stats: "Savezy Stats",
      totalItems: "Total Items",
      aboutTitle: "About Savezy",
      aboutText:
        "Savezy helps you save and organize interesting content you find online. Save videos, memes, news articles, websites, and images all in one place.",
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
      profile: "Perfil",
      settings: "Ajustes",
    },
    contentTypes: {
      video: "Video",
      meme: "Meme",
      news: "Noticias",
      website: "Sitio Web",
      image: "Imagen",
    },
    actions: {
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      edit: "Editar",
      share: "Compartir",
      add: "Agregar",
    },
    common: {
      search: "Buscar elementos guardados...",
      noItems: "No hay elementos guardados",
      startSaving:
        "Comienza a guardar contenido interesante que encuentres en línea",
      saveNew: "Guardar Nuevo",
      loading: "Cargando...",
      all: "Todos",
      on: "Activado",
      off: "Desactivado",
      addNewItem: "¿Qué te gustaría guardar?",
      saveNewContent: "Guardar Nuevo Contenido",
    },
    alerts: {
      deleteConfirm: "¿Estás seguro de que quieres eliminar este elemento?",
      yes: "Sí",
      no: "No",
    },
    home: {
      title: "Savezy",
      emptyTitle: "No hay elementos guardados",
      emptyDescription:
        "Comienza a guardar contenido interesante que encuentres en línea",
      addNewButton: "Guardar Nuevo Elemento",
    },
    profile: {
      stats: "Estadísticas de Savezy",
      totalItems: "Total de Elementos",
      aboutTitle: "Acerca de Savezy",
      aboutText:
        "Savezy te ayuda a guardar y organizar contenido interesante que encuentres en línea. Guarda videos, memes, noticias, sitios web e imágenes en un solo lugar.",
    },
  },
} as const;

export type TranslationKeys = typeof translations.en;

// Type helper for nested keys
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;

type DotNestedKeys<T> = (
  T extends object
    ? {
        [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<
          DotNestedKeys<T[K]>
        >}`;
      }[Exclude<keyof T, symbol>]
    : ""
) extends infer D
  ? Extract<D, string>
  : never;

export type TranslationKey = DotNestedKeys<TranslationKeys>;
