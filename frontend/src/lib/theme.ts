import { useState, useEffect } from "react";

export type Theme = "dark" | "light";

const THEME_STORAGE_KEY = "fs_theme";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (saved === "light") return "light";
    return "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    document.body?.classList.add("light");
    document.body?.classList.remove("dark");
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
    root.setAttribute("data-theme", "dark");
    document.body?.classList.add("dark");
    document.body?.classList.remove("light");
  }
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
  window.dispatchEvent(new CustomEvent("fs_theme_changed", { detail: theme }));
}

// Immediate execution on bundle load to prevent flash of wrong theme
if (typeof window !== "undefined") {
  applyTheme(getInitialTheme());
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);

    const onThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<Theme>;
      if (customEvent.detail) {
        setThemeState(customEvent.detail);
      }
    };

    window.addEventListener("fs_theme_changed", onThemeChange);
    return () => {
      window.removeEventListener("fs_theme_changed", onThemeChange);
    };
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setThemeState(nextTheme);
    applyTheme(nextTheme);
  };

  return { theme, toggleTheme, isDark: theme === "dark", isLight: theme === "light" };
}
