// Ported from deploy/public/index.html (MUSCLE_MAP + JE095_META + fallbacks).

const MUSCLE_MAP: Record<string, string> = {
  bench: "Chest",
  pec: "Chest",
  fly: "Chest",
  "push-up": "Chest",
  incline: "Chest",
  pulldown: "Back",
  "pull-up": "Back",
  row: "Back",
  deadlift: "Back",
  "straight arm": "Back",
  squat: "Quads",
  "leg press": "Quads",
  lunge: "Quads",
  "leg extension": "Quads",
  romanian: "Hamstrings",
  stiff: "Hamstrings",
  "leg curl": "Hamstrings",
  "hip thrust": "Glutes",
  shoulder: "Shoulders",
  military: "Shoulders",
  lateral: "Shoulders",
  "front raise": "Shoulders",
  "rear delt": "Shoulders",
  curl: "Biceps",
  tricep: "Triceps",
  "close-grip": "Triceps",
  dips: "Triceps",
  calf: "Calves",
  crunch: "Core",
  plank: "Core",
  "leg raise": "Core",
  "sit-up": "Core",
  "ab wheel": "Core",
  pallof: "Core",
};

export function muscleFor(name: string): string {
  const n = String(name || "").toLowerCase();
  for (const k of Object.keys(MUSCLE_MAP)) if (n.includes(k)) return MUSCLE_MAP[k];
  return "Other";
}

export type TechniqueMeta = {
  muscle: string;
  pattern: string;
  setup: string;
  cue: string;
  mistake: string;
  subs: string[];
};

const CURATED: Record<string, TechniqueMeta> = {
  "Barbell Bench Press": { muscle: "Chest", pattern: "Horizontal Push", setup: "Mata kira-kira sejajar dengan bar; kaki stabil; scapula ditarik ke belakang dan bawah.", cue: "Turunkan bar terkontrol, pergelangan tetap stacked, dorong sambil menjaga upper back stabil.", mistake: "Hindari bouncing bar, bokong terangkat, atau pergelangan terlalu menekuk.", subs: ["DB Bench Press", "Machine Chest Press", "Push-Up weighted"] },
  "Bench Press heavy": { muscle: "Chest", pattern: "Horizontal Push", setup: "Gunakan setup bench yang konsisten dan safety pin/spotter bila tersedia.", cue: "Brace, touch point konsisten, tekan dengan jalur bar yang stabil.", mistake: "Jangan mengejar beban jika bar path atau kontrol memburuk.", subs: ["Barbell Bench Press", "DB Bench Press", "Machine Chest Press"] },
  "Goblet/BB Squat": { muscle: "Quads", pattern: "Squat", setup: "Kaki stabil, brace sebelum turun, lutut mengikuti arah jari kaki.", cue: "Turun dengan kontrol dan pertahankan tekanan kaki menyeluruh.", mistake: "Hindari kehilangan brace atau lutut kolaps ke dalam.", subs: ["Goblet Squat", "Leg Press", "Hack Squat"] },
  "BB Back Squat": { muscle: "Quads", pattern: "Squat", setup: "Bar stabil di punggung, stance konsisten, brace sebelum unrack.", cue: "Duduk di antara pinggul, jaga mid-foot balance.", mistake: "Jangan memaksa depth jika posisi pelvis/lumbar hilang kontrol.", subs: ["Hack Squat", "Leg Press", "Front Squat"] },
  Deadlift: { muscle: "Posterior Chain", pattern: "Hinge", setup: "Bar dekat tulang kering, brace, bahu sedikit di depan bar, lats aktif.", cue: "Dorong lantai dan bawa pinggul serta dada naik bersama.", mistake: "Hindari menarik dengan punggung membulat atau bar menjauh dari tubuh.", subs: ["Romanian Deadlift", "Trap Bar Deadlift", "Rack Pull"] },
  "Romanian Deadlift": { muscle: "Hamstrings", pattern: "Hinge", setup: "Lutut sedikit fleksi, tulang belakang netral, bar dekat paha.", cue: "Dorong pinggul ke belakang sampai hamstring teregang lalu kembali berdiri.", mistake: "Jangan mengejar kedalaman dengan membulatkan punggung.", subs: ["DB Romanian Deadlift", "Leg Curl", "Hip Thrust BB"] },
  "Romanian Deadlift DB": { muscle: "Hamstrings", pattern: "Hinge", setup: "Dumbbell dekat paha, lutut sedikit fleksi.", cue: "Hip hinge, bukan squat; rasakan hamstring meregang.", mistake: "Hindari dumbbell menjauh dari tubuh.", subs: ["Romanian Deadlift", "Leg Curl", "Hip Thrust BB"] },
  "Lat Pulldown": { muscle: "Back", pattern: "Vertical Pull", setup: "Dada terangkat ringan, grip nyaman, bahu tidak shrug.", cue: "Tarik siku ke bawah menuju sisi tubuh.", mistake: "Hindari momentum berlebihan dan menarik bar di belakang leher.", subs: ["Assisted Pull-Up", "Pull-Up BW", "Straight Arm PD"] },
  "Seated Cable Row": { muscle: "Back", pattern: "Horizontal Pull", setup: "Torso stabil dan bahu rileks.", cue: "Tarik siku ke belakang tanpa mengayun torso.", mistake: "Jangan mengubah row menjadi gerakan pinggang.", subs: ["DB Row 1 lengan", "Barbell Row", "Cable Row narrow"] },
  "DB Overhead Press": { muscle: "Shoulders", pattern: "Vertical Push", setup: "Brace, kaki stabil, dumbbell mulai di posisi nyaman.", cue: "Tekan ke atas tanpa overextending pinggang.", mistake: "Hindari arch lumbar berlebihan.", subs: ["Barbell OHP", "Machine Shoulder Press", "Push Press BB"] },
  "Lateral Raise": { muscle: "Shoulders", pattern: "Isolation", setup: "Beban ringan-menengah dan bahu rileks.", cue: "Angkat lengan terkontrol sampai sekitar garis bahu.", mistake: "Hindari shrug dan momentum besar.", subs: ["Cable Lateral Raise", "Machine Lateral Raise", "Lateral Raise SS"] },
  "DB Bench Press": { muscle: "Chest", pattern: "Horizontal Push", setup: "Atur dumbbell dan posisi bahu agar stabil sebelum mulai.", cue: "Turunkan dumbbell terkontrol lalu press dengan lintasan yang nyaman.", mistake: "Hindari ROM dipaksakan, bahu kehilangan posisi, atau dumbbell jatuh tanpa kontrol.", subs: ["Machine Chest Press", "Barbell Bench Press", "Cable Chest Press"] },
  "Machine Chest Press": { muscle: "Chest", pattern: "Horizontal Push", setup: "Atur seat agar handle berada pada posisi nyaman terhadap dada dan bahu.", cue: "Dorong mulus tanpa kehilangan posisi torso lalu kembali terkontrol.", mistake: "Hindari seat yang salah, bahu maju berlebihan, dan membanting weight stack.", subs: ["DB Bench Press", "Barbell Bench Press", "Cable Chest Press"] },
  "Assisted Pull-Up": { muscle: "Back", pattern: "Vertical Pull", setup: "Atur bantuan agar Anda dapat memulai dari posisi stabil.", cue: "Tarik melalui siku ke bawah; bantuan lebih kecil berarti lebih sulit.", mistake: "Hindari kip/ayunan besar dan menganggap angka bantuan sebagai beban biasa.", subs: ["Lat Pulldown", "Pull-Up BW", "Neutral-Grip Lat Pulldown"] },
  "Pull-Up BW": { muscle: "Back", pattern: "Vertical Pull", setup: "Mulai dari hang yang dapat dikontrol dan torso stabil.", cue: "Tarik siku ke bawah tanpa kip berlebihan.", mistake: "Hindari ayunan besar dan reps parsial karena kelelahan.", subs: ["Assisted Pull-Up", "Lat Pulldown", "Neutral-Grip Lat Pulldown"] },
  "Leg Press": { muscle: "Quads", pattern: "Squat", setup: "Atur seat dan posisi kaki agar pelvis stabil.", cue: "Turunkan sled dengan kontrol lalu dorong merata.", mistake: "Hindari bouncing, ROM dipaksakan, atau lutut dikunci agresif.", subs: ["Goblet Squat", "Hack Squat", "BB Back Squat"] },
  "Leg Curl": { muscle: "Hamstrings", pattern: "Knee Flexion", setup: "Atur pivot/pad agar lutut dan tubuh stabil.", cue: "Curl mulus lalu kembali perlahan.", mistake: "Hindari momentum dan mengangkat pinggul dari posisi.", subs: ["Seated Leg Curl", "Lying Leg Curl", "Romanian Deadlift DB"] },
  "Hip Thrust BB": { muscle: "Glutes", pattern: "Hip Extension", setup: "Upper back dan kaki stabil.", cue: "Drive pinggul terkontrol lalu turun tanpa bouncing.", mistake: "Hindari overextension dan menggunakan punggung bawah untuk menyelesaikan rep.", subs: ["Smith Hip Thrust", "Glute Drive", "DB Hip Thrust"] },
};

export function techniqueMeta(name: string): TechniqueMeta {
  const hit = CURATED[name];
  if (hit) return hit;
  const low = String(name || "").toLowerCase();
  const fb: TechniqueMeta = {
    muscle: muscleFor(name),
    pattern: "Strength Training",
    setup: "Gunakan posisi awal stabil dan range of motion yang dapat dikontrol.",
    cue: "Prioritaskan teknik yang konsisten sebelum menambah beban.",
    mistake: "Hentikan set bila teknik memburuk atau muncul nyeri tajam.",
    subs: [],
  };
  if (/bench|chest|press/.test(low) && !/shoulder|overhead/.test(low)) { fb.pattern = "Horizontal Push"; fb.muscle = "Chest"; fb.subs = ["DB Bench Press", "Machine Chest Press", "Push-Up"]; }
  else if (/pulldown|pull.?up/.test(low)) { fb.pattern = "Vertical Pull"; fb.muscle = "Back"; fb.subs = ["Lat Pulldown", "Assisted Pull-Up", "Pull-Up BW"]; }
  else if (/row/.test(low)) { fb.pattern = "Horizontal Pull"; fb.muscle = "Back"; fb.subs = ["Seated Cable Row", "DB Row 1 lengan", "Machine Row"]; }
  else if (/shoulder|overhead|ohp/.test(low)) { fb.pattern = "Vertical Push"; fb.muscle = "Shoulders"; fb.subs = ["DB Overhead Press", "Machine Shoulder Press", "Barbell OHP"]; }
  else if (/lateral|raise/.test(low)) { fb.pattern = "Isolation"; fb.muscle = "Shoulders"; fb.subs = ["Lateral Raise", "Cable Lateral Raise", "Machine Lateral Raise"]; }
  else if (/curl/.test(low)) { fb.pattern = "Elbow Flexion"; fb.muscle = "Biceps"; fb.subs = ["DB Curl", "Cable Curl", "Hammer Curl"]; }
  else if (/tricep|pushdown|skull/.test(low)) { fb.pattern = "Elbow Extension"; fb.muscle = "Triceps"; fb.subs = ["Rope Triceps Pushdown", "Straight-Bar Pushdown", "Triceps Extension Machine"]; }
  else if (/squat|leg press|hack/.test(low)) { fb.pattern = "Squat"; fb.muscle = "Quads"; fb.subs = ["Goblet Squat", "Leg Press", "Hack Squat"]; }
  else if (/rdl|deadlift|hinge/.test(low)) { fb.pattern = "Hip Hinge"; fb.muscle = "Hamstrings"; fb.subs = ["Romanian Deadlift", "Romanian Deadlift DB", "Leg Curl"]; }
  else if (/hip thrust|glute/.test(low)) { fb.pattern = "Hip Extension"; fb.muscle = "Glutes"; fb.subs = ["Hip Thrust BB", "Smith Hip Thrust", "Glute Drive"]; }
  return fb;
}

export function swapReasonText(original: string, sub: string, index: number, lang: "id" | "en"): string {
  const id = lang === "id";
  const o = original.toLowerCase();
  if (/tricep|pushdown|extension/.test(o))
    return index === 0
      ? id ? "Pola ekstensi siku paling mirip dengan latihan awal dan tetap menargetkan trisep." : "Closest elbow-extension pattern to the original while keeping triceps as the main target."
      : index === 1
        ? id ? "Target otot dan pola gerak tetap sama dengan variasi grip/peralatan berbeda." : "Keeps the same target muscle and movement pattern with a different grip or setup."
        : id ? "Alternatif lebih stabil ketika cable atau attachment utama tidak tersedia." : "A more stable option when the primary cable or attachment is unavailable.";
  if (/bench|chest|press/.test(o) && !/shoulder|overhead/.test(o))
    return id ? "Pertahankan pola dorong dan target dada; mulai konservatif karena beban antar alat tidak setara 1:1." : "Keeps the pressing pattern and chest target; start conservatively because loads are not equivalent across equipment.";
  if (/row/.test(o)) return id ? "Pertahankan pola tarik horizontal dan target punggung dengan torso tetap stabil." : "Keeps the horizontal-pull pattern and back target with a stable torso.";
  if (/pulldown|pull.?up/.test(o)) return id ? "Pertahankan pola tarik vertikal dan target lat/punggung." : "Keeps the vertical-pull pattern and lat/back target.";
  if (/raise/.test(o)) return id ? "Pertahankan target deltoid dan kontrol gerak; jangan menyalin beban latihan lama." : "Keeps the deltoid target and movement control; do not copy the previous exercise load.";
  return id ? "Alternatif dipilih karena target gerak/ototnya serupa. Mulai dengan kalibrasi beban baru." : "This alternative was selected for a similar movement/muscle target. Start with a new load calibration.";
}
