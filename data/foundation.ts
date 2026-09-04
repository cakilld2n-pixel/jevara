import type { FoundationPhase } from "./types";

export const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"] as const;
export type DayName = (typeof DAYS)[number];

export const FOUNDATION: Record<number, FoundationPhase> = {
  1: {
    l: "Fase 1",
    t: "Fondasi",
    w: "Minggu 1-4",
    c: "#3b82f6",
    f: "Adaptasi & teknik dasar",
    days: {
      Senin: {
        l: "Push",
        cd: "10 mnt LISS sepeda",
        ex: [
          { id: "bp", n: "Barbell Bench Press", s: 4, r: "10-12", nt: "ROM penuh" },
          { id: "idp", n: "Incline DB Press", s: 3, r: "12" },
          { id: "pec", n: "Pec Deck/Cable Fly", s: 3, r: "15", nt: "Squeeze" },
          { id: "ohp", n: "DB Overhead Press", s: 3, r: "12" },
          { id: "lr", n: "Lateral Raise", s: 3, r: "15" },
          { id: "tpd", n: "Tricep Pushdown", s: 3, r: "15" },
        ],
      },
      Selasa: {
        l: "Pull",
        cd: "10 mnt LISS treadmill",
        ex: [
          { id: "lpd", n: "Lat Pulldown", s: 4, r: "10-12" },
          { id: "scr", n: "Seated Cable Row", s: 3, r: "12", nt: "Tarik ke perut" },
          { id: "dbr", n: "DB Row 1 lengan", s: 3, r: "12/s" },
          { id: "fp", n: "Face Pull", s: 3, r: "15" },
          { id: "bbc", n: "Barbell Curl", s: 3, r: "12" },
          { id: "hc", n: "Hammer Curl", s: 2, r: "12" },
        ],
      },
      Rabu: {
        l: "Legs+Core",
        cd: "15 mnt LISS incline",
        ex: [
          { id: "sq", n: "Goblet/BB Squat", s: 4, r: "10", nt: "Form dulu" },
          { id: "lp", n: "Leg Press", s: 3, r: "15" },
          { id: "rdl", n: "Romanian Deadlift DB", s: 3, r: "12" },
          { id: "le", n: "Leg Extension", s: 3, r: "15" },
          { id: "lc", n: "Leg Curl", s: 3, r: "15" },
          { id: "plk", n: "Plank", s: 3, r: "45dtk" },
          { id: "knr", n: "Hanging Knee Raise", s: 3, r: "12" },
        ],
      },
      Kamis: {
        l: "Upper",
        cd: "12 mnt HIIT 30/60",
        ex: [
          { id: "pu", n: "Assisted Pull-Up", s: 4, r: "6-10", nt: "Target BW" },
          { id: "dsp", n: "DB Shoulder Press", s: 3, r: "12" },
          { id: "cnr", n: "Cable Row narrow", s: 3, r: "12" },
          { id: "psh", n: "Push-Up weighted", s: 3, r: "max" },
          { id: "ezc", n: "EZ-Bar Curl", s: 3, r: "12" },
          { id: "skc", n: "Skull Crusher", s: 3, r: "12" },
        ],
      },
      Jumat: {
        l: "Lower+HIIT",
        cd: "20 mnt HIIT 40/80x8",
        ex: [
          { id: "dl", n: "Deadlift", s: 4, r: "8", nt: "Queen of lifts" },
          { id: "bss", n: "Bulgarian Split Squat", s: 3, r: "10/k" },
          { id: "ht", n: "Hip Thrust BB", s: 3, r: "15", nt: "Aktifkan glute" },
          { id: "cr", n: "Calf Raise", s: 3, r: "20" },
          { id: "abw", n: "Ab Wheel", s: 3, r: "12" },
        ],
      },
    },
  },
  2: {
    l: "Fase 2",
    t: "Hipertrofi",
    w: "Minggu 5-8",
    c: "#f97316",
    f: "Volume tinggi & superset",
    days: {
      Senin: {
        l: "Push+",
        cd: "15 mnt LISS",
        ex: [
          { id: "bbp2", n: "Barbell Bench Press", s: 5, r: "8-10", nt: "Naik beban" },
          { id: "idp2", n: "Incline DB Press", s: 4, r: "10", nt: "Drop set" },
          { id: "dbfl", n: "DB Fly+Cable SS", s: 3, r: "12+15" },
          { id: "bbop", n: "Barbell OHP", s: 4, r: "8-10" },
          { id: "lr2", n: "Lateral Raise SS", s: 4, r: "15" },
          { id: "toe", n: "Tricep Overhead", s: 3, r: "12" },
          { id: "tpd2", n: "Tricep Pushdown", s: 2, r: "20", nt: "Finisher" },
        ],
      },
      Selasa: {
        l: "Pull+",
        cd: "15 mnt LISS",
        ex: [
          { id: "wpu", n: "Weighted Pull-Up", s: 4, r: "8-10" },
          { id: "bbo", n: "Barbell Row", s: 4, r: "10" },
          { id: "crw", n: "Cable Row wide", s: 3, r: "12" },
          { id: "sap", n: "Straight Arm PD", s: 3, r: "15" },
          { id: "idc", n: "Incline DB Curl", s: 3, r: "12" },
          { id: "coc", n: "Concentration Curl", s: 2, r: "15" },
          { id: "rdf", n: "Rear Delt Fly", s: 3, r: "15" },
        ],
      },
      Rabu: {
        l: "Legs+",
        cd: "20 mnt LISS",
        ex: [
          { id: "bbs2", n: "BB Back Squat", s: 5, r: "8", nt: "Progressive" },
          { id: "lp2", n: "Leg Press variasi", s: 4, r: "12" },
          { id: "rdl2", n: "Romanian Deadlift", s: 4, r: "10" },
          { id: "wl", n: "Walking Lunge DB", s: 3, r: "12/k" },
          { id: "lcu", n: "Leg Curl unilateral", s: 3, r: "12/k" },
          { id: "df", n: "Dragon Flag", s: 3, r: "10" },
          { id: "pp", n: "Pallof Press", s: 3, r: "12/s" },
        ],
      },
      Kamis: {
        l: "Power",
        cd: "15 mnt HIIT sprint",
        ex: [
          { id: "pc", n: "Power Clean", s: 4, r: "5", nt: "Explosif" },
          { id: "ibp", n: "Incline Bench BB", s: 4, r: "8" },
          { id: "sdl", n: "Sumo Deadlift", s: 3, r: "8" },
          { id: "pu2", n: "Pull-Up BW", s: 3, r: "max" },
          { id: "dps", n: "Dips", s: 3, r: "12" },
          { id: "fw", n: "Farmer Walk", s: 3, r: "40m" },
        ],
      },
      Jumat: {
        l: "Metabolic",
        cd: "25 mnt HIIT+finisher",
        ex: [
          { id: "dl2", n: "Deadlift naik", s: 5, r: "5", nt: "Mendekati 1RM" },
          { id: "fsq", n: "Front Squat", s: 3, r: "10" },
          { id: "ht2", n: "Hip Thrust berat", s: 4, r: "10" },
          { id: "bxj", n: "Box Jump", s: 3, r: "10" },
          { id: "cr2", n: "Calf Raise", s: 4, r: "20" },
        ],
      },
    },
  },
  3: {
    l: "Fase 3",
    t: "Kekuatan+Definisi",
    w: "Minggu 9-12",
    c: "#10b981",
    f: "Heavy compound + kardio tinggi",
    days: {
      Senin: {
        l: "Strength Push",
        cd: "20 mnt LISS",
        ex: [
          { id: "bbp3", n: "Bench Press heavy", s: 5, r: "5", nt: "80-85% 1RM" },
          { id: "idp3", n: "Incline DB Press", s: 4, r: "8" },
          { id: "pec3", n: "Cable Fly", s: 3, r: "12" },
          { id: "mip", n: "Military Press BB", s: 4, r: "6-8" },
          { id: "lr3", n: "Lateral+Front SS", s: 3, r: "12+10" },
          { id: "cgt", n: "Close-Grip Bench", s: 3, r: "8" },
          { id: "tpd3", n: "Tricep Pushdown", s: 2, r: "20" },
        ],
      },
      Selasa: {
        l: "Strength Pull",
        cd: "20 mnt LISS",
        ex: [
          { id: "wpu3", n: "Weighted Pull-Up", s: 5, r: "5", nt: "Terberat" },
          { id: "bbo3", n: "Pendlay Row", s: 4, r: "6-8" },
          { id: "tbar", n: "T-Bar Row", s: 3, r: "10" },
          { id: "sap3", n: "Straight Arm PD", s: 3, r: "15" },
          { id: "pcr", n: "Preacher Curl", s: 3, r: "10" },
          { id: "rchm", n: "Reverse Curl", s: 2, r: "15" },
          { id: "rdf3", n: "Rear Delt Fly", s: 3, r: "12" },
        ],
      },
      Rabu: {
        l: "Heavy Legs",
        cd: "25 mnt LISS",
        ex: [
          { id: "bbs3", n: "BB Squat heavy", s: 5, r: "5", nt: "80-85% 1RM" },
          { id: "lpx", n: "Leg Press max", s: 4, r: "10" },
          { id: "stiff", n: "Stiff-Leg Deadlift", s: 4, r: "8" },
          { id: "lng3", n: "Reverse Lunge BB", s: 3, r: "10/k" },
          { id: "lcu3", n: "Leg Curl drop", s: 3, r: "10+10+10" },
          { id: "situ", n: "Decline Sit-Up", s: 3, r: "15" },
          { id: "lrs", n: "Leg Raise Hanging", s: 3, r: "15" },
        ],
      },
      Kamis: {
        l: "Olympic",
        cd: "20 mnt HIIT",
        ex: [
          { id: "hpc", n: "Hang Power Clean", s: 5, r: "3", nt: "Explosif" },
          { id: "ps", n: "Push Press BB", s: 4, r: "5" },
          { id: "rdl3", n: "Romanian DL heavy", s: 4, r: "6" },
          { id: "mpu", n: "Muscle-Up/Pull-Up", s: 3, r: "max" },
          { id: "fw3", n: "Farmer Walk heavy", s: 4, r: "50m" },
          { id: "bj", n: "Broad Jump", s: 3, r: "5" },
        ],
      },
      Jumat: {
        l: "Full Burn",
        cd: "30 mnt HIIT circuit",
        ex: [
          { id: "dl3", n: "Deadlift peak", s: 5, r: "3", nt: "Tertinggi program" },
          { id: "bbs3f", n: "BB Squat", s: 3, r: "8" },
          { id: "ht3", n: "Hip Thrust max", s: 4, r: "8" },
          { id: "kbs", n: "KB Swing", s: 4, r: "20" },
          { id: "bat", n: "Battle Rope", s: 3, r: "30dtk" },
          { id: "cr3", n: "Box Jump+Calf SS", s: 3, r: "8+15" },
        ],
      },
    },
  },
};

export const CATS = [
  "Semua",
  "Rekomposisi",
  "Fat Loss",
  "Bulking",
  "Kekuatan",
  "Hipertrofi",
  "Maintenance",
] as const;
