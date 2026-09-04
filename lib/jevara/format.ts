import type { Lang } from "@/lib/i18n";

export function fmt(n: number): string {
  return (Math.round(Number(n) * 10) / 10).toLocaleString("id-ID");
}

export function fmtDur(sec: number): string {
  const m = Math.floor(sec / 60);
  const ss = Math.floor(sec % 60);
  return String(m).padStart(2, "0") + ":" + String(ss).padStart(2, "0");
}

export function localDate(ts: number): string {
  return new Date(ts).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

export function localTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function greeting(lang: Lang, firstName: string): string {
  const h = new Date().getHours();
  let base: string;
  if (lang === "en") base = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  else base = h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 19 ? "Selamat sore" : "Selamat malam";
  return base + (firstName ? ", " + firstName : "");
}

export function firstNameOf(name: string | undefined): string {
  if (!name) return "";
  return String(name).trim().split(/\s+/)[0] || "";
}

export function authMaskEmail(v: string): string {
  const s = String(v || "");
  const p = s.split("@");
  return p.length === 2 ? p[0].slice(0, 2) + "•••@" + p[1] : s;
}
