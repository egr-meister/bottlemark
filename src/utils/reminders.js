// In-app reminder logic. These produce gentle reminder cards shown ONLY while
// the app is open. They never schedule notifications or run in the background.
import { currentHour } from "./date";
import { safeNum } from "./calc";

// Returns a reminder object { title, message, tone } or null if none applies.
// Logic is based on today's progress and the current time of day.
export function getReminder({ totalMl, goalMl, reminders, hour }) {
  const settings = reminders || {};
  if (settings.enabled === false) return null;

  const total = Math.max(0, safeNum(totalMl, 0));
  const goal = Math.max(1, safeNum(goalMl, 2000));
  const ratio = total / goal;
  const h = Number.isFinite(hour) ? hour : currentHour();

  // Evening: goal not reached (only if evening reminders enabled).
  if (h >= 19 && settings.eveningEnabled !== false && total < goal) {
    return {
      title: "Evening check-in",
      message: "Add any bottle drinks you missed today.",
      tone: "evening",
    };
  }

  // Afternoon: progress below 50% after 16:00.
  if (h >= 16 && settings.afternoonEnabled !== false && ratio < 0.5) {
    return {
      title: "A gentle nudge",
      message: "You can add any bottle amounts you remember.",
      tone: "afternoon",
    };
  }

  // Morning/day: no water logged yet after 11:00.
  if (h >= 11 && settings.morningEnabled !== false && total === 0) {
    return {
      title: "No entries yet",
      message: "No bottle entries today. Add one if you drank water.",
      tone: "morning",
    };
  }

  return null;
}
