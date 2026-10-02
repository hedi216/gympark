import config from "../../../../config/gym-park.json" with { type: "json" };
export const color = {
  graphite: config.primaryColor,
  surface: "#151819",
  white: "#F5F6F2",
  muted: "#A9AFB0",
  line: "#343D36",
  accent: config.accentColor,
} as const;
export const font = {
  display: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  body: "'Inter', sans-serif",
} as const;
export const space = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96] as const;
