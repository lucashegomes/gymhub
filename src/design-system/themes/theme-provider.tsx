import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "gymhub:theme";
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") return getSystemTheme();
  return theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    return saved && ["light", "dark", "system"].includes(saved) ? saved : "dark";
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(theme));

  useEffect(() => {
    const nextResolved = resolveTheme(theme);
    setResolvedTheme(nextResolved);

    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(nextResolved);
    root.setAttribute("data-theme", nextResolved);

    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncWithSystem = () => {
      if (theme !== "system") return;
      const systemTheme = getSystemTheme();
      setResolvedTheme(systemTheme);
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(systemTheme);
      root.setAttribute("data-theme", systemTheme);
    };

    media.addEventListener("change", syncWithSystem);
    return () => media.removeEventListener("change", syncWithSystem);
  }, [theme]);

  const setTheme = (nextTheme: Theme) => setThemeState(nextTheme);
  const toggleTheme = () => {
    const current = resolveTheme(theme);
    setThemeState(current === "dark" ? "light" : "dark");
  };

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
