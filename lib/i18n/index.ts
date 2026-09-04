export const LANG_KEY = "jevara_language_v1";
export type Lang = "id" | "en";

const I18N: Record<Lang, Record<string, string>> = {
  id: {
    home: "Home",
    workout: "Latihan",
    progress: "Progres",
    programs: "Program",
    tools: "Lainnya",
    install: "Install",
    update: "Versi baru tersedia",
    export: "Export Backup",
    import: "Import Backup",
    language: "Bahasa",
  },
  en: {
    home: "Home",
    workout: "Workout",
    progress: "Progress",
    programs: "Programs",
    tools: "Tools",
    install: "Install",
    update: "New version available",
    export: "Export Backup",
    import: "Import Backup",
    language: "Language",
  },
};

export function t(lang: Lang, key: string): string {
  return I18N[lang]?.[key] ?? I18N.id[key] ?? key;
}

export function getLang(): Lang {
  if (typeof localStorage === "undefined") return "id";
  const v = localStorage.getItem(LANG_KEY) as Lang | null;
  return v === "en" ? "en" : "id";
}

export function setLang(lang: Lang) {
  localStorage.setItem(LANG_KEY, lang);
}
