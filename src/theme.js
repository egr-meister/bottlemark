// BottleMark "Bottle Fill Board" visual theme.
// Practical, calm, bottle-focused. Non-medical, non-sport, no neon.

export const colors = {
  bg: "#F7FAF9", // warm white background
  panel: "#E3F1F0", // pale aqua bottle panels
  panelAlt: "#EDF4F3",
  card: "#FFFFFF",
  text: "#2E4A54", // deep blue-gray
  textSoft: "#5B7078", // soft slate text
  textMuted: "#8AA0A6",
  teal: "#4F8F8A", // muted teal progress
  tealDark: "#3C726D",
  fill: "#7DBEE0", // clear sky blue bottle fill
  fillSoft: "#B9DCF0",
  slate: "#DCE6E6", // soft slate controls
  slateDark: "#C6D6D6",
  sand: "#F2ECDE", // light sand labels
  sandText: "#8A7B57",
  border: "#D5E2E1",
  danger: "#C46A5A",
  dangerBg: "#F6E4E0",
  success: "#4F8F8A",
  white: "#FFFFFF",
};

// Bottle color options for custom bottles (colorKey -> hex).
export const bottleColors = {
  aqua: "#7DBEE0",
  teal: "#4F8F8A",
  sky: "#6FA8DC",
  slate: "#8AA0A6",
  sand: "#D9C79B",
  mint: "#8FCBB6",
};

export const bottleColorKeys = Object.keys(bottleColors);

export function bottleColorFor(key) {
  return bottleColors[key] || bottleColors.aqua;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  pill: 999,
};

export const font = {
  title: 24,
  h1: 20,
  h2: 17,
  body: 15,
  small: 13,
  tiny: 11,
};
