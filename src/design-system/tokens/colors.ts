export const semanticColors = {
  primary: "#3B82F6",
  primaryHover: "#2563EB",
  primaryForeground: "#FFFFFF",
  secondary: "#8B5CF6",
  secondaryHover: "#7C3AED",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#0EA5E9",
} as const;

export const moduleColors = {
  students: "#3B82F6",
  teachers: "#8B5CF6",
  courses: "#F59E0B",
  classes: "#0EA5E9",
  checkins: "#22C55E",
  plans: "#EAB308",
} as const;

export const themeColors = {
  light: {
    background: "#FFFFFF",
    surface: "#F8FAFC",
    surfaceHover: "#F1F5F9",
    border: "#E2E8F0",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#64748B",
  },
  dark: {
    background: "#0F172A",
    surface: "#1E293B",
    surfaceHover: "#334155",
    border: "#334155",
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
  },
} as const;
