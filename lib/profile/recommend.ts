export type OnboardingInput = {
  goal: string;
  experience: string;
  days: number;
  equipment: string;
  focus?: string;
};

export type RecommendResult = {
  id: string;
  alternative: string;
  score: number;
  why: string[];
};

export function recommendProgram(p: OnboardingInput): RecommendResult {
  const scores: Record<string, number> = {
    foundation: 0,
    rc1: 0,
    fl1: 0,
    bu1: 0,
    st1: 0,
    hp1: 0,
  };
  const why: string[] = [];
  const goal = p.goal || "recomp";
  const exp = p.experience || "beginner";
  const days = Number(p.days) || 4;
  const equip = p.equipment || "fullgym";

  if (goal === "recomp") {
    scores.rc1 += 8;
    scores.foundation += 5;
    why.push("Tujuan utama Anda adalah rekomposisi.");
  }
  if (goal === "fatloss") {
    scores.fl1 += 8;
    scores.rc1 += 3;
    why.push("Prioritas fat loss meningkatkan porsi conditioning.");
  }
  if (goal === "muscle") {
    scores.bu1 += 7;
    scores.hp1 += 6;
    scores.foundation += 2;
    why.push("Fokus muscle gain membutuhkan volume hipertrofi yang lebih tinggi.");
  }
  if (goal === "strength") {
    scores.st1 += 9;
    scores.foundation += 3;
    why.push("Fokus strength mengarahkan program ke progressive strength work.");
  }
  if (goal === "fitness") {
    scores.foundation += 7;
    scores.rc1 += 5;
    why.push("General fitness membutuhkan struktur yang seimbang.");
  }

  if (exp === "beginner") {
    scores.rc1 += 5;
    scores.foundation += 6;
    scores.fl1 -= 3;
    scores.bu1 -= 4;
    scores.st1 -= 3;
    scores.hp1 -= 2;
    why.push("Level pemula: kompleksitas dan volume awal dibuat lebih konservatif.");
  }
  if (exp === "intermediate") {
    scores.foundation += 4;
    scores.fl1 += 2;
    scores.bu1 += 2;
    scores.st1 += 2;
    scores.hp1 += 2;
  }
  if (exp === "advanced") {
    scores.bu1 += 4;
    scores.st1 += 4;
    scores.hp1 += 4;
    scores.rc1 -= 2;
  }

  if (days <= 3) {
    scores.rc1 += 4;
    scores.foundation += 1;
    scores.fl1 -= 2;
    scores.bu1 -= 6;
    scores.hp1 -= 4;
    scores.st1 -= 1;
  }
  if (days === 4) {
    scores.rc1 += 5;
    scores.st1 += 4;
    scores.foundation += 2;
  }
  if (days === 5) {
    scores.foundation += 5;
    scores.fl1 += 5;
    scores.hp1 += 5;
  }
  if (days >= 6) scores.bu1 += 8;

  why.push(`Ketersediaan ${days} hari/minggu digunakan untuk mencocokkan frekuensi program.`);

  if (equip !== "fullgym") {
    scores.rc1 += 3;
    scores.foundation += 2;
    scores.bu1 -= 3;
    scores.st1 -= 3;
    scores.hp1 -= 2;
    why.push("Ketersediaan alat membatasi program yang terlalu bergantung pada full gym.");
  }

  if (p.focus && p.focus !== "balanced") {
    scores.hp1 += 2;
    scores.bu1 += 1;
  }

  const sorted = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  const best = sorted[0];
  const alt = sorted.filter((x) => x !== best)[0];

  return { id: best, alternative: alt, score: scores[best], why: why.slice(0, 4) };
}
