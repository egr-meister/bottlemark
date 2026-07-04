// Bottle math + daily progress helpers. All inputs are treated defensively.
import { FRACTIONS } from "../storage/defaults";

// Safe positive number with fallback.
export function safeNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// Volume of an active bottle. Falls back to 500 ml for missing/invalid bottles
// (note: Number(null) is 0, so we check for a positive finite value explicitly).
export function bottleVolume(bottle) {
  const n = Number(bottle && bottle.volumeMl);
  return Number.isFinite(n) && n > 0 ? n : 500;
}

// Amount (whole ml) for a fraction of a bottle. Rounds to nearest ml.
export function amountForFraction(bottle, fractionKey) {
  const volume = bottleVolume(bottle);
  const f = FRACTIONS.find((x) => x.key === fractionKey);
  const factor = f ? f.factor : 1;
  return Math.round(volume * factor);
}

// Sum amountMl across a list of entries.
export function sumMl(entries) {
  if (!Array.isArray(entries)) return 0;
  return entries.reduce((sum, e) => sum + Math.max(0, safeNum(e && e.amountMl, 0)), 0);
}

// Entries for a given date.
export function entriesForDate(entries, date) {
  if (!Array.isArray(entries)) return [];
  return entries.filter((e) => e && e.date === date);
}

// Daily total for a date.
export function totalForDate(entries, date) {
  return sumMl(entriesForDate(entries, date));
}

// Progress ratio 0..1 (capped), plus real percentage (uncapped).
export function progress(totalMl, goalMl) {
  const goal = Math.max(1, safeNum(goalMl, 2000));
  const total = Math.max(0, safeNum(totalMl, 0));
  const ratioRaw = total / goal;
  return {
    ratio: Math.min(1, ratioRaw),
    percent: Math.round(ratioRaw * 100),
    reached: total >= goal,
    remaining: Math.max(0, goal - total),
  };
}

// Format ml with a thousands separator, e.g. 1,450 ml.
export function formatMl(value) {
  const n = Math.round(Math.max(0, safeNum(value, 0)));
  return `${n.toLocaleString("en-US")} ml`;
}

// Short remaining-amount message relative to the active bottle.
export function remainingMessage(remainingMl, bottle) {
  const remaining = Math.max(0, safeNum(remainingMl, 0));
  if (remaining <= 0) return "Goal reached";
  const vol = bottleVolume(bottle);
  const bottles = remaining / vol;
  if (bottles <= 0.3) return `${formatMl(remaining)} left`;
  if (bottles <= 1.2) return `About one ${bottle && bottle.name ? bottle.name.toLowerCase() : "bottle"} left`;
  return `${formatMl(remaining)} left`;
}
