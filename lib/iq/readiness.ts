export type ReadinessInput = { energy: number; sleep: number; soreness: number };
export type ReadinessEntry = { ts: number; energy: number; sleep: number; soreness: number; dateKey: string };

export function readinessScore(r: ReadinessInput | null | undefined): number | null {
  if (!r) return null;
  const e = Number(r.energy) || 3;
  const s = Number(r.sleep) || 3;
  const so = Number(r.soreness) || 3;
  return Math.round(((e + s + (6 - so)) / 15) * 100);
}

export function readinessZone(score: number | null): { zone: string; label: string } {
  if (score === null) return { zone: "NONE", label: "Belum diisi" };
  if (score < 35) return { zone: "VERY_LOW", label: "Sangat Rendah" };
  if (score < 50) return { zone: "LOW", label: "Rendah" };
  if (score < 65) return { zone: "MODERATE", label: "Sedang" };
  if (score < 80) return { zone: "GOOD", label: "Baik" };
  return { zone: "HIGH", label: "Tinggi" };
}

export function readinessAction(score: number | null): { tone: "low" | "mid" | "good"; label: string; text: string } {
  if (score === null) return { tone: "mid", label: "Belum diisi", text: "Isi Kesiapan Hari Ini untuk memberi konteks pada sesi." };
  if (score < 45) return { tone: "low", label: "Kesiapan rendah", text: "Mulai lebih konservatif. Kenaikan beban ditunda hari ini." };
  if (score < 60) return { tone: "mid", label: "Cukup", text: "Tahan progres agresif dan evaluasi kembali setelah pemanasan." };
  if (score < 75) return { tone: "good", label: "Siap berlatih", text: "Jalankan target normal dengan teknik dan RIR yang direncanakan." };
  return { tone: "good", label: "Sangat siap", text: "Kesiapan mendukung sesi normal; progres tetap dikonfirmasi oleh performa latihan." };
}
