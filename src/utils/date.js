// Simple, defensive date/time helpers. Dates are "YYYY-MM-DD", times are "HH:mm".

function pad2(n) {
  return String(n).padStart(2, "0");
}

// Today's local date as YYYY-MM-DD.
export function todayStr(d = new Date()) {
  try {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  } catch (e) {
    return "1970-01-01";
  }
}

// Current time as HH:mm.
export function nowTimeStr(d = new Date()) {
  try {
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  } catch (e) {
    return "00:00";
  }
}

// Validate a YYYY-MM-DD string (and that it's a real calendar date).
export function isValidDateStr(value) {
  if (typeof value !== "string") return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const da = Number(m[3]);
  if (mo < 1 || mo > 12 || da < 1 || da > 31) return false;
  const dt = new Date(y, mo - 1, da);
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === mo - 1 &&
    dt.getDate() === da
  );
}

// Validate an HH:mm string.
export function isValidTimeStr(value) {
  if (typeof value !== "string") return false;
  const m = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!m) return false;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  return h >= 0 && h <= 23 && mi >= 0 && mi <= 59;
}

// Current hour (0-23), safe.
export function currentHour(d = new Date()) {
  try {
    return d.getHours();
  } catch (e) {
    return 12;
  }
}

// Add days to a YYYY-MM-DD string, returning a new YYYY-MM-DD string.
export function addDays(dateStr, delta) {
  if (!isValidDateStr(dateStr)) return todayStr();
  const [y, mo, da] = dateStr.split("-").map(Number);
  const dt = new Date(y, mo - 1, da);
  dt.setDate(dt.getDate() + Number(delta || 0));
  return todayStr(dt);
}

// Human-friendly label for a date string.
export function prettyDate(dateStr) {
  if (!isValidDateStr(dateStr)) return "Unknown date";
  const [y, mo, da] = dateStr.split("-").map(Number);
  const dt = new Date(y, mo - 1, da);
  const today = todayStr();
  const yesterday = addDays(today, -1);
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${weekdays[dt.getDay()]}, ${months[dt.getMonth()]} ${da}`;
}

// List the last N dates ending today (most recent first).
export function lastNDates(n, endDate) {
  const end = isValidDateStr(endDate) ? endDate : todayStr();
  const out = [];
  for (let i = 0; i < n; i += 1) {
    out.push(addDays(end, -i));
  }
  return out;
}
