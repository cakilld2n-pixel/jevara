export type Exercise = {
  id?: string;
  n: string;
  name?: string;
  s: number;
  sets?: number;
  r: string;
  reps?: string;
  nt?: string;
};

export type PlannedDay = {
  l: string;
  label?: string;
  cd: string;
  cardio?: string;
  ex: Exercise[];
};

export type FoundationPhase = {
  l: string;
  t: string;
  title?: string;
  w: string;
  c: string;
  color?: string;
  f: string;
  days: Record<string, PlannedDay>;
};

export type Program = {
  id: string;
  cat: string;
  c: string;
  color?: string;
  lv: string;
  dur: string;
  nd: number;
  title: string;
  goal: string;
  sc: string[];
  ss: Record<string, PlannedDay>;
};

export type SessionContext = {
  programId: string;
  title: string;
  day: string;
  label: string;
  color: string;
  cardio: string;
  exs: Exercise[];
  noteKey: string;
  expectedSets: number;
  key: (exerciseIndex: number, setIndex: number) => string;
  context: string;
};
