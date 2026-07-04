// Default data models and factories for BottleMark.
// Everything here is safe to use as a fallback if AsyncStorage is empty or corrupted.

export const STORAGE_KEY = "bottlemark:appData:v1";

export const DEFAULT_GOAL_ML = 2000;
export const MIN_GOAL_ML = 1;
export const MAX_GOAL_ML = 10000;
export const MIN_VOLUME_ML = 1;
export const MAX_VOLUME_ML = 5000;

// Fraction definitions used across the app.
export const FRACTIONS = [
  { key: "quarter", factor: 0.25, label: "1/4" },
  { key: "half", factor: 0.5, label: "1/2" },
  { key: "threeQuarter", factor: 0.75, label: "3/4" },
  { key: "full", factor: 1, label: "Full" },
];

export function fractionLabel(key) {
  const f = FRACTIONS.find((x) => x.key === key);
  if (f) return f.label;
  if (key === "custom") return "Custom";
  return "Bottle";
}

// Simple, collision-resistant id (no external uuid dependency).
export function makeId(prefix = "id") {
  const rand = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function nowIso() {
  try {
    return new Date().toISOString();
  } catch (e) {
    return "";
  }
}

// Factory for a bottle with safe defaults.
export function makeBottle({
  name = "Bottle",
  volumeMl = 500,
  colorKey = "aqua",
  favorite = false,
  custom = true,
  id,
} = {}) {
  const iso = nowIso();
  return {
    id: id || makeId("bottle"),
    name: String(name || "Bottle").slice(0, 40),
    volumeMl: Math.max(MIN_VOLUME_ML, Math.min(MAX_VOLUME_ML, Number(volumeMl) || 500)),
    colorKey: colorKey || "aqua",
    favorite: !!favorite,
    custom: !!custom,
    createdAt: iso,
    updatedAt: iso,
  };
}

// Preset bottles (stable ids so "reset to default" is predictable).
export function defaultBottles() {
  return [
    makeBottle({ id: "bottle_small", name: "Small Bottle", volumeMl: 330, colorKey: "sky", custom: false }),
    makeBottle({ id: "bottle_regular", name: "Regular Bottle", volumeMl: 500, colorKey: "aqua", favorite: true, custom: false }),
    makeBottle({ id: "bottle_large", name: "Large Bottle", volumeMl: 750, colorKey: "teal", custom: false }),
    makeBottle({ id: "bottle_sport", name: "Sport Bottle", volumeMl: 1000, colorKey: "mint", custom: false }),
  ];
}

export function defaultReminderSettings() {
  return {
    enabled: true,
    morningEnabled: true,
    afternoonEnabled: true,
    eveningEnabled: true,
  };
}

export function defaultSettings() {
  return {
    onboardingCompleted: false,
    dailyGoalMl: DEFAULT_GOAL_ML,
    activeBottleId: "bottle_regular",
    compactMode: false,
    reminders: defaultReminderSettings(),
  };
}

export function defaultAppData() {
  return {
    bottles: defaultBottles(),
    entries: [],
    settings: defaultSettings(),
  };
}

// Factory for a water entry, with snapshots of the bottle so history stays
// correct even if the bottle is later edited or deleted.
export function makeEntry({
  date,
  time,
  bottle,
  fraction = "full",
  amountMl,
  label,
} = {}) {
  const iso = nowIso();
  const safeBottle = bottle || {};
  const volume = Math.max(0, Number(safeBottle.volumeMl) || 0);
  return {
    id: makeId("entry"),
    date: date || "",
    time: time || "",
    bottleId: safeBottle.id || "",
    bottleNameSnapshot: safeBottle.name || "Bottle",
    bottleVolumeMlSnapshot: volume,
    fraction: fraction || "custom",
    amountMl: Math.max(0, Number(amountMl) || 0),
    label: label || "",
    createdAt: iso,
    updatedAt: iso,
  };
}
