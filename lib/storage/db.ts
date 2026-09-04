import type { StoragePort, Premium, Log, CanonicalSession } from "./port";

const LOG_KEY = "jevara_log_v2";
const PREMIUM_KEY = "jevara_premium_v2";
const ACTIVE_KEY = "jevara_active_session_v2";

// legacy keys for migration (from index.html)
const LEGACY_LOG = "gym_v6";
const LEGACY_PREMIUM = "gym_iqbal_premium_v3";
const LEGACY_ACTIVE = "jevara_active_session_v099";

function safeGet(key: string): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, val: string) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, val);
  } catch {}
}

function safeRemove(key: string) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  } catch {}
}

function defaultPremium(): Premium {
  return {
    events: [],
    sessions: [],
    readiness: [],
    weights: [],
    prs: {},
    customPrograms: [],
    settings: { rest: 90, sound: true, vibrate: true, autoRest: true, showCoach: true, autoProgression: true, deloadSensitivity: "balanced" },
    profile: { weight: 0, height: 0, age: 0 },
  };
}

export function createStorage(): StoragePort {
  // migrate once
  migrateIfNeeded();

  return {
    loadLog(): Log {
      const raw = safeGet(LOG_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return {};
        }
      }
      return {};
    },
    saveLog(log: Log) {
      safeSet(LOG_KEY, JSON.stringify(log));
    },
    loadPremium(): Premium {
      const raw = safeGet(PREMIUM_KEY);
      if (raw) {
        try {
          const p = JSON.parse(raw) as Premium;
          // ensure defaults
          return {
            ...defaultPremium(),
            ...p,
            events: p.events || [],
            sessions: p.sessions || [],
            readiness: p.readiness || [],
            weights: p.weights || [],
            prs: p.prs || {},
            customPrograms: p.customPrograms || [],
            settings: { ...defaultPremium().settings, ...(p.settings || {}) },
            profile: { ...defaultPremium().profile, ...(p.profile || {}) },
          };
        } catch {
          return defaultPremium();
        }
      }
      return defaultPremium();
    },
    savePremium(p: Premium) {
      // enforce limits same as legacy: events 500, sessions 150, readiness 60
      const toSave: Premium = {
        ...p,
        events: (p.events || []).slice(0, 500),
        sessions: (p.sessions || []).slice(0, 150),
        readiness: (p.readiness || []).slice(0, 60),
        weights: (p.weights || []).slice(-180),
      };
      safeSet(PREMIUM_KEY, JSON.stringify(toSave));
    },
    loadActiveSession(): CanonicalSession | null {
      const raw = safeGet(ACTIVE_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as CanonicalSession;
      } catch {
        return null;
      }
    },
    saveActiveSession(s: CanonicalSession | null) {
      if (!s) safeRemove(ACTIVE_KEY);
      else safeSet(ACTIVE_KEY, JSON.stringify(s));
    },
    clearAll() {
      safeRemove(LOG_KEY);
      safeRemove(PREMIUM_KEY);
      safeRemove(ACTIVE_KEY);
    },
  };
}

function migrateIfNeeded() {
  // only migrate if new keys absent but legacy present
  if (safeGet(LOG_KEY) || safeGet(PREMIUM_KEY)) return;
  const legacyLog = safeGet(LEGACY_LOG);
  const legacyPremium = safeGet(LEGACY_PREMIUM);
  const legacyActive = safeGet(LEGACY_ACTIVE);
  if (legacyLog) safeSet(LOG_KEY, legacyLog);
  if (legacyPremium) safeSet(PREMIUM_KEY, legacyPremium);
  if (legacyActive) safeSet(ACTIVE_KEY, legacyActive);
}

// singleton for app
let _storage: StoragePort | null = null;
export function getStorage(): StoragePort {
  if (!_storage) _storage = createStorage();
  return _storage;
}
