export const LANG_KEY = "jevara_language_v1";
export type Lang = "id" | "en";

// Ported 1:1 from deploy/public/index.html I18N dictionary.
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
    performance: "HARI INI",
    startWorkout: "MULAI LATIHAN",
    restTimer: "Waktu Istirahat",
    readiness: "Kesiapan Hari Ini",
    energy: "Energi",
    sleep: "Kualitas Tidur",
    soreness: "Kelelahan Otot",
    saveReadiness: "Simpan / Perbarui Kesiapan",
    why: "MENGAPA?",
    nextDirection: "ARAH BERIKUTNYA",
    lastWorkout: "Latihan terakhir",
    viewProgress: "Lihat progres",
    indonesian: "Indonesia",
    english: "English",
    stable: "Stabil",
    today: "Hari ini",
    profile: "Profil",
    updateProfile: "Perbarui Profil",
    trainingToolkit: "Peralatan Latihan",
    settings: "Pengaturan Latihan",
    history: "Riwayat Latihan",
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
    performance: "TODAY",
    startWorkout: "START WORKOUT",
    restTimer: "Rest Timer",
    readiness: "Daily Readiness",
    energy: "Energy",
    sleep: "Sleep",
    soreness: "Soreness",
    saveReadiness: "Save / Update Readiness",
    why: "WHY?",
    nextDirection: "NEXT DIRECTION",
    lastWorkout: "Last workout",
    viewProgress: "View progress",
    indonesian: "Indonesian",
    english: "English",
    stable: "Stable",
    today: "Today",
    profile: "Profile",
    updateProfile: "Update Profile",
    trainingToolkit: "Training Toolkit",
    settings: "Workout Settings",
    history: "Workout History",
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
