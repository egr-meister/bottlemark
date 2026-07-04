// Bottle-focused statistics. Everything is computed defensively from entries.
import { sumMl, totalForDate, safeNum } from "./calc";
import { lastNDates, todayStr } from "./date";
import { fractionLabel } from "../storage/defaults";

// Build a per-day summary map: { date: { total, count } }.
function dailyMap(entries) {
  const map = {};
  if (!Array.isArray(entries)) return map;
  entries.forEach((e) => {
    if (!e || typeof e.date !== "string" || !e.date) return;
    if (!map[e.date]) map[e.date] = { total: 0, count: 0 };
    map[e.date].total += Math.max(0, safeNum(e.amountMl, 0));
    map[e.date].count += 1;
  });
  return map;
}

// Total over the last N days (inclusive of today).
function totalLastN(entries, n) {
  const dates = lastNDates(n);
  return dates.reduce((sum, d) => sum + totalForDate(entries, d), 0);
}

// Count of days in the last N days that met the goal.
function goalDaysLastN(entries, n, goalMl) {
  const goal = Math.max(1, safeNum(goalMl, 2000));
  const dates = lastNDates(n);
  return dates.reduce((count, d) => (totalForDate(entries, d) >= goal ? count + 1 : count), 0);
}

// Most frequent value helper.
function topEntry(counts) {
  let bestKey = null;
  let bestVal = -1;
  Object.keys(counts).forEach((k) => {
    if (counts[k] > bestVal) {
      bestVal = counts[k];
      bestKey = k;
    }
  });
  return { key: bestKey, value: bestVal < 0 ? 0 : bestVal };
}

export function computeStats(entries, goalMl) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const goal = Math.max(1, safeNum(goalMl, 2000));
  const today = todayStr();

  const todayTotal = totalForDate(safeEntries, today);
  const total7 = totalLastN(safeEntries, 7);
  const total30 = totalLastN(safeEntries, 30);

  // Daily average over the last 7 days.
  const avg7 = Math.round(total7 / 7);

  // Best day (highest total among all recorded days).
  const map = dailyMap(safeEntries);
  let bestDate = null;
  let bestTotal = 0;
  Object.keys(map).forEach((d) => {
    if (map[d].total > bestTotal) {
      bestTotal = map[d].total;
      bestDate = d;
    }
  });

  const goalDays7 = goalDaysLastN(safeEntries, 7, goal);
  const goalDays30 = goalDaysLastN(safeEntries, 30, goal);

  // Bottle usage counts + amount by bottle (by name snapshot).
  const bottleCounts = {};
  const bottleAmounts = {};
  const fractionCounts = {};
  safeEntries.forEach((e) => {
    if (!e) return;
    const name = e.bottleNameSnapshot || "Bottle";
    bottleCounts[name] = (bottleCounts[name] || 0) + 1;
    bottleAmounts[name] = (bottleAmounts[name] || 0) + Math.max(0, safeNum(e.amountMl, 0));
    const fr = e.fraction || "custom";
    fractionCounts[fr] = (fractionCounts[fr] || 0) + 1;
  });

  const mostBottle = topEntry(bottleCounts);
  const mostFraction = topEntry(fractionCounts);

  const amountByBottle = Object.keys(bottleAmounts)
    .map((name) => ({ name, amountMl: bottleAmounts[name], count: bottleCounts[name] || 0 }))
    .sort((a, b) => b.amountMl - a.amountMl);

  // Weekly mini chart data: last 7 days oldest->newest.
  const week = lastNDates(7)
    .slice()
    .reverse()
    .map((d) => ({ date: d, total: totalForDate(safeEntries, d) }));

  return {
    todayTotal,
    total7,
    total30,
    avg7,
    bestDate,
    bestTotal,
    goalDays7,
    goalDays30,
    totalBottlesLogged: safeEntries.length,
    mostUsedBottle: mostBottle.key || "None yet",
    mostUsedBottleCount: mostBottle.value,
    mostUsedFraction: mostFraction.key ? fractionLabel(mostFraction.key) : "None yet",
    mostUsedFractionCount: mostFraction.value,
    fractionCounts,
    amountByBottle,
    week,
  };
}
