// Central app state for BottleMark.
// Loads once from AsyncStorage, exposes derived data and all mutations, and
// persists after every change. Every mutation is defensive and never throws.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { loadAppData, saveAppData, clearAppData, normalizeAppData } from "../storage/storage";
import {
  defaultAppData,
  defaultBottles,
  defaultReminderSettings,
  defaultSettings,
  makeBottle,
  makeEntry,
  nowIso,
  DEFAULT_GOAL_ML,
  MIN_GOAL_ML,
  MAX_GOAL_ML,
  MIN_VOLUME_ML,
  MAX_VOLUME_ML,
} from "../storage/defaults";
import { amountForFraction } from "../utils/calc";
import { todayStr, nowTimeStr } from "../utils/date";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [appData, setAppData] = useState(defaultAppData());
  const [loading, setLoading] = useState(true);
  const latest = useRef(appData);
  latest.current = appData;

  // Initial load.
  useEffect(() => {
    let active = true;
    (async () => {
      const data = await loadAppData();
      if (active) {
        setAppData(data);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Apply a pure updater to current state, persist, and update React state.
  const mutate = useCallback((updater) => {
    setAppData((prev) => {
      let next;
      try {
        next = updater(prev) || prev;
      } catch (e) {
        next = prev;
      }
      const normalized = normalizeAppData(next);
      // Fire-and-forget persistence (saveAppData never throws).
      saveAppData(normalized);
      return normalized;
    });
  }, []);

  // ---- Derived helpers ----
  const activeBottle = useMemo(() => {
    const bottles = appData.bottles && appData.bottles.length ? appData.bottles : defaultBottles();
    const id = appData.settings ? appData.settings.activeBottleId : null;
    return bottles.find((b) => b && b.id === id) || bottles[0] || defaultBottles()[0];
  }, [appData]);

  // ---- Onboarding ----
  const completeOnboarding = useCallback((bottleId) => {
    mutate((prev) => {
      const bottles = prev.bottles && prev.bottles.length ? prev.bottles : defaultBottles();
      const validId = bottles.some((b) => b && b.id === bottleId)
        ? bottleId
        : prev.settings?.activeBottleId || bottles[0]?.id || null;
      return {
        ...prev,
        bottles,
        settings: { ...prev.settings, onboardingCompleted: true, activeBottleId: validId },
      };
    });
  }, [mutate]);

  const showOnboardingAgain = useCallback(() => {
    mutate((prev) => ({
      ...prev,
      settings: { ...prev.settings, onboardingCompleted: false },
    }));
  }, [mutate]);

  // ---- Bottles ----
  const setActiveBottle = useCallback((id) => {
    mutate((prev) => ({
      ...prev,
      settings: { ...prev.settings, activeBottleId: id },
    }));
  }, [mutate]);

  const addBottle = useCallback((fields) => {
    const bottle = makeBottle({ ...fields, custom: true });
    mutate((prev) => ({
      ...prev,
      bottles: [...(prev.bottles || []), bottle],
    }));
    return bottle;
  }, [mutate]);

  const updateBottle = useCallback((id, fields) => {
    mutate((prev) => ({
      ...prev,
      bottles: (prev.bottles || []).map((b) =>
        b && b.id === id
          ? {
              ...b,
              ...fields,
              name: fields.name !== undefined ? String(fields.name).slice(0, 40) : b.name,
              volumeMl:
                fields.volumeMl !== undefined
                  ? Math.max(MIN_VOLUME_ML, Math.min(MAX_VOLUME_ML, Number(fields.volumeMl) || b.volumeMl))
                  : b.volumeMl,
              updatedAt: nowIso(),
            }
          : b
      ),
    }));
  }, [mutate]);

  const toggleFavoriteBottle = useCallback((id) => {
    mutate((prev) => ({
      ...prev,
      bottles: (prev.bottles || []).map((b) =>
        b && b.id === id ? { ...b, favorite: !b.favorite, updatedAt: nowIso() } : b
      ),
    }));
  }, [mutate]);

  // Delete a bottle with safe active-bottle fallback; recreate defaults if empty.
  const deleteBottle = useCallback((id) => {
    mutate((prev) => {
      let bottles = (prev.bottles || []).filter((b) => b && b.id !== id);
      if (bottles.length === 0) {
        bottles = defaultBottles();
      }
      let activeBottleId = prev.settings?.activeBottleId;
      if (!bottles.some((b) => b.id === activeBottleId)) {
        activeBottleId = bottles[0] ? bottles[0].id : null;
      }
      return {
        ...prev,
        bottles,
        settings: { ...prev.settings, activeBottleId },
      };
    });
  }, [mutate]);

  const resetBottlesToDefault = useCallback(() => {
    mutate((prev) => {
      const bottles = defaultBottles();
      return {
        ...prev,
        bottles,
        settings: { ...prev.settings, activeBottleId: bottles[1] ? bottles[1].id : bottles[0].id },
      };
    });
  }, [mutate]);

  // ---- Entries ----
  // Add an entry for a fraction of the active (or provided) bottle.
  const addFractionEntry = useCallback((fractionKey, opts = {}) => {
    const bottle = opts.bottle || latest.current && activeBottle;
    const date = opts.date || todayStr();
    const time = opts.time || nowTimeStr();
    const useBottle = opts.bottle || activeBottle;
    const amountMl = amountForFraction(useBottle, fractionKey);
    const entry = makeEntry({
      date,
      time,
      bottle: useBottle,
      fraction: fractionKey,
      amountMl,
      label: "",
    });
    mutate((prev) => ({ ...prev, entries: [entry, ...(prev.entries || [])] }));
    return entry;
  }, [mutate, activeBottle]);

  // Add a custom ml entry.
  const addCustomEntry = useCallback(({ date, time, amountMl, label, bottle }) => {
    const useBottle = bottle || activeBottle;
    const entry = makeEntry({
      date: date || todayStr(),
      time: time || nowTimeStr(),
      bottle: useBottle,
      fraction: "custom",
      amountMl,
      label: label || "",
    });
    mutate((prev) => ({ ...prev, entries: [entry, ...(prev.entries || [])] }));
    return entry;
  }, [mutate, activeBottle]);

  const updateEntry = useCallback((id, fields) => {
    mutate((prev) => ({
      ...prev,
      entries: (prev.entries || []).map((e) =>
        e && e.id === id
          ? {
              ...e,
              ...fields,
              amountMl:
                fields.amountMl !== undefined
                  ? Math.max(0, Number(fields.amountMl) || 0)
                  : e.amountMl,
              updatedAt: nowIso(),
            }
          : e
      ),
    }));
  }, [mutate]);

  const deleteEntry = useCallback((id) => {
    mutate((prev) => ({
      ...prev,
      entries: (prev.entries || []).filter((e) => e && e.id !== id),
    }));
  }, [mutate]);

  const resetDay = useCallback((date) => {
    mutate((prev) => ({
      ...prev,
      entries: (prev.entries || []).filter((e) => e && e.date !== date),
    }));
  }, [mutate]);

  const deleteAllEntries = useCallback(() => {
    mutate((prev) => ({ ...prev, entries: [] }));
  }, [mutate]);

  // ---- Goal ----
  const setDailyGoal = useCallback((ml) => {
    const goal = Math.max(MIN_GOAL_ML, Math.min(MAX_GOAL_ML, Number(ml) || DEFAULT_GOAL_ML));
    mutate((prev) => ({ ...prev, settings: { ...prev.settings, dailyGoalMl: goal } }));
  }, [mutate]);

  const resetGoal = useCallback(() => {
    mutate((prev) => ({ ...prev, settings: { ...prev.settings, dailyGoalMl: DEFAULT_GOAL_ML } }));
  }, [mutate]);

  // ---- Reminders ----
  const setReminders = useCallback((fields) => {
    mutate((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        reminders: { ...defaultReminderSettings(), ...prev.settings?.reminders, ...fields },
      },
    }));
  }, [mutate]);

  // ---- App settings ----
  const setCompactMode = useCallback((value) => {
    mutate((prev) => ({ ...prev, settings: { ...prev.settings, compactMode: !!value } }));
  }, [mutate]);

  // ---- Reset everything ----
  const resetAllData = useCallback(async () => {
    await clearAppData();
    const fresh = defaultAppData();
    // Keep the user out of onboarding loop only if they choose; default resets to onboarding.
    setAppData(fresh);
    return fresh;
  }, []);

  const value = useMemo(
    () => ({
      appData,
      loading,
      activeBottle,
      // onboarding
      completeOnboarding,
      showOnboardingAgain,
      // bottles
      setActiveBottle,
      addBottle,
      updateBottle,
      toggleFavoriteBottle,
      deleteBottle,
      resetBottlesToDefault,
      // entries
      addFractionEntry,
      addCustomEntry,
      updateEntry,
      deleteEntry,
      resetDay,
      deleteAllEntries,
      // goal
      setDailyGoal,
      resetGoal,
      // reminders
      setReminders,
      // settings
      setCompactMode,
      resetAllData,
    }),
    [
      appData,
      loading,
      activeBottle,
      completeOnboarding,
      showOnboardingAgain,
      setActiveBottle,
      addBottle,
      updateBottle,
      toggleFavoriteBottle,
      deleteBottle,
      resetBottlesToDefault,
      addFractionEntry,
      addCustomEntry,
      updateEntry,
      deleteEntry,
      resetDay,
      deleteAllEntries,
      setDailyGoal,
      resetGoal,
      setReminders,
      setCompactMode,
      resetAllData,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return ctx;
}
