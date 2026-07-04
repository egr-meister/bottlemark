// AsyncStorage layer for BottleMark.
// Responsibilities:
//   - load app data, merging with defaults
//   - handle empty storage, missing fields, and corrupted JSON safely
//   - normalize/sanitize every record so screens never crash on bad data
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  STORAGE_KEY,
  defaultAppData,
  defaultBottles,
  defaultReminderSettings,
  defaultSettings,
  DEFAULT_GOAL_ML,
  MIN_GOAL_ML,
  MAX_GOAL_ML,
  MIN_VOLUME_ML,
  MAX_VOLUME_ML,
  makeId,
  nowIso,
} from "./defaults";

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function sanitizeBottle(raw) {
  if (!raw || typeof raw !== "object") return null;
  const iso = nowIso();
  return {
    id: raw.id || makeId("bottle"),
    name: String(raw.name || "Bottle").slice(0, 40) || "Bottle",
    volumeMl: clampNumber(raw.volumeMl, MIN_VOLUME_ML, MAX_VOLUME_ML, 500),
    colorKey: raw.colorKey || "aqua",
    favorite: !!raw.favorite,
    custom: raw.custom === undefined ? true : !!raw.custom,
    createdAt: raw.createdAt || iso,
    updatedAt: raw.updatedAt || iso,
  };
}

function sanitizeEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const iso = nowIso();
  const allowed = ["quarter", "half", "threeQuarter", "full", "custom"];
  const fraction = allowed.includes(raw.fraction) ? raw.fraction : "custom";
  return {
    id: raw.id || makeId("entry"),
    date: typeof raw.date === "string" ? raw.date : "",
    time: typeof raw.time === "string" ? raw.time : "",
    bottleId: raw.bottleId || "",
    bottleNameSnapshot: raw.bottleNameSnapshot || "Bottle",
    bottleVolumeMlSnapshot: Math.max(0, Number(raw.bottleVolumeMlSnapshot) || 0),
    fraction,
    amountMl: Math.max(0, Number(raw.amountMl) || 0),
    label: raw.label || "",
    createdAt: raw.createdAt || iso,
    updatedAt: raw.updatedAt || iso,
  };
}

function sanitizeReminders(raw) {
  const def = defaultReminderSettings();
  if (!raw || typeof raw !== "object") return def;
  return {
    enabled: raw.enabled === undefined ? def.enabled : !!raw.enabled,
    morningEnabled: raw.morningEnabled === undefined ? def.morningEnabled : !!raw.morningEnabled,
    afternoonEnabled: raw.afternoonEnabled === undefined ? def.afternoonEnabled : !!raw.afternoonEnabled,
    eveningEnabled: raw.eveningEnabled === undefined ? def.eveningEnabled : !!raw.eveningEnabled,
  };
}

function sanitizeSettings(raw, bottles) {
  const def = defaultSettings();
  const src = raw && typeof raw === "object" ? raw : {};
  const goal = clampNumber(src.dailyGoalMl, MIN_GOAL_ML, MAX_GOAL_ML, DEFAULT_GOAL_ML);
  // active bottle must reference an existing bottle; otherwise fall back.
  let activeBottleId = src.activeBottleId;
  const exists = bottles.some((b) => b && b.id === activeBottleId);
  if (!exists) {
    activeBottleId = bottles[0] ? bottles[0].id : null;
  }
  return {
    onboardingCompleted: !!src.onboardingCompleted,
    dailyGoalMl: goal,
    activeBottleId,
    compactMode: !!src.compactMode,
    reminders: sanitizeReminders(src.reminders),
  };
}

// Merge any loaded data with defaults and sanitize every record.
export function normalizeAppData(raw) {
  const data = raw && typeof raw === "object" ? raw : {};

  let bottles = Array.isArray(data.bottles)
    ? data.bottles.map(sanitizeBottle).filter(Boolean)
    : [];
  if (bottles.length === 0) {
    bottles = defaultBottles();
  }

  const entries = Array.isArray(data.entries)
    ? data.entries.map(sanitizeEntry).filter(Boolean)
    : [];

  const settings = sanitizeSettings(data.settings, bottles);

  return { bottles, entries, settings };
}

// Load from AsyncStorage. Never throws.
export async function loadAppData() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultAppData();
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      // Corrupted JSON — fall back to defaults instead of crashing.
      return defaultAppData();
    }
    return normalizeAppData(parsed);
  } catch (e) {
    return defaultAppData();
  }
}

// Persist app data. Never throws.
export async function saveAppData(data) {
  try {
    const normalized = normalizeAppData(data);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch (e) {
    return false;
  }
}

// Remove everything (reset all local data).
export async function clearAppData() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}
