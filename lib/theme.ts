import type { CSSProperties } from "react";
import type { ThemeConfig, ThemePreset } from "./types";

export const DEFAULT_THEME: ThemeConfig = {
  preset: "nebula",
  accent: "#e7a9c4",
  glass: 0.065,
  radius: 26,
  font: "serif",
  stars: true,
};

export type ThemePresetMeta = {
  id: ThemePreset;
  name: string;
  note: string;
  accent: string;
  mode: "dark" | "light";
  swatch: [string, string, string];
};

export const THEME_PRESETS: ThemePresetMeta[] = [
  {
    id: "nebula",
    name: "星夜",
    note: "深空紫与樱粉极光",
    accent: "#e7a9c4",
    mode: "dark",
    swatch: ["#0a0b1a", "#6c5ce7", "#e7a9c4"],
  },
  {
    id: "sakura",
    name: "樱雾",
    note: "梅子夜色与樱花微光",
    accent: "#f0a6c0",
    mode: "dark",
    swatch: ["#160b16", "#a34a72", "#f0a6c0"],
  },
  {
    id: "aurora",
    name: "极光",
    note: "深海青与极光绿",
    accent: "#7fe3d2",
    mode: "dark",
    swatch: ["#04110f", "#2fd4b0", "#7fe3d2"],
  },
  {
    id: "dusk",
    name: "暮色",
    note: "暖褐与琥珀灯光",
    accent: "#f0b47a",
    mode: "dark",
    swatch: ["#140d0a", "#b06a3c", "#f0b47a"],
  },
  {
    id: "daylight",
    name: "晨雾",
    note: "奶油纸感与淡粉日光",
    accent: "#c76b8a",
    mode: "light",
    swatch: ["#f4ede6", "#e8c4cf", "#c76b8a"],
  },
  {
    id: "mono",
    name: "默片",
    note: "墨黑与银白",
    accent: "#e8e8ee",
    mode: "dark",
    swatch: ["#0a0a0c", "#55555f", "#e8e8ee"],
  },
];

const PRESET_IDS = new Set<string>(THEME_PRESETS.map((preset) => preset.id));
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeTheme(input: unknown): ThemeConfig {
  const value = (input ?? {}) as Partial<ThemeConfig>;
  const preset: ThemePreset = PRESET_IDS.has(String(value.preset))
    ? (value.preset as ThemePreset)
    : DEFAULT_THEME.preset;

  return {
    preset,
    accent: HEX_COLOR.test(String(value.accent))
      ? String(value.accent)
      : DEFAULT_THEME.accent,
    glass: clamp(Number(value.glass) || DEFAULT_THEME.glass, 0.03, 0.16),
    radius: clamp(Number(value.radius) || DEFAULT_THEME.radius, 12, 36),
    font: value.font === "sans" ? "sans" : "serif",
    stars: typeof value.stars === "boolean" ? value.stars : true,
  };
}

export function parseTheme(raw: unknown): ThemeConfig {
  if (typeof raw !== "string") return { ...DEFAULT_THEME };
  try {
    return normalizeTheme(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_THEME };
  }
}

export function themeStyle(theme: ThemeConfig): CSSProperties {
  return {
    "--accent": theme.accent,
    "--glass": String(theme.glass),
    "--radius": `${theme.radius}px`,
    "--display": theme.font === "serif" ? "var(--serif)" : "var(--sans)",
    "--stars": theme.stars ? "1" : "0",
    "--glass-soft": String(Math.max(0.02, theme.glass - 0.02)),
  } as CSSProperties;
}

export function presetMeta(preset: ThemePreset): ThemePresetMeta {
  return (
    THEME_PRESETS.find((item) => item.id === preset) ?? THEME_PRESETS[0]
  );
}
