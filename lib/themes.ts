export const themes = {
  dark: {
    background: "#000000",
    foreground: "#ffffff",
    primary: "#3b82f6",
    secondary: "#1f2937",
    accent: "#60a5fa",
  },
  light: {
    background: "#ffffff",
    foreground: "#000000",
    primary: "#3b82f6",
    secondary: "#f3f4f6",
    accent: "#2563eb",
  },
  forest: {
    background: "#1a2f38",
    foreground: "#e2e8f0",
    primary: "#4ade80",
    secondary: "#2d3f4a",
    accent: "#22c55e",
  },
  night: {
    background: "#0f172a",
    foreground: "#e2e8f0",
    primary: "#6366f1",
    secondary: "#1e293b",
    accent: "#818cf8",
  },
  pink: {
    background: "#fdf2f8",
    foreground: "#831843",
    primary: "#ec4899",
    secondary: "#fbcfe8",
    accent: "#db2777",
  },
}

export type ThemeName = keyof typeof themes

