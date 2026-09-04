const REST_KEY = "jevara_rest_v2";

export type RestState = {
  end: number; // timestamp ms
  base: number; // seconds
};

export function saveRest(state: RestState | null) {
  try {
    if (!state) localStorage.removeItem(REST_KEY);
    else localStorage.setItem(REST_KEY, JSON.stringify(state));
  } catch {}
}

export function loadRest(): RestState | null {
  try {
    const raw = localStorage.getItem(REST_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as RestState;
    if (s.end && s.end > Date.now()) return s;
    localStorage.removeItem(REST_KEY);
    return null;
  } catch {
    return null;
  }
}

export function startRest(seconds: number): RestState {
  const s: RestState = { end: Date.now() + seconds * 1000, base: seconds };
  saveRest(s);
  return s;
}

export function adjustRest(state: RestState, deltaSec: number): RestState {
  const next = { ...state, end: state.end + deltaSec * 1000 };
  if (next.end < Date.now()) next.end = Date.now();
  saveRest(next);
  return next;
}

export function finishRest() {
  saveRest(null);
}

export function getLeftSec(state: RestState | null): number {
  if (!state) return 0;
  return Math.max(0, Math.ceil((state.end - Date.now()) / 1000));
}
