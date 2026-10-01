"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ThemeProviderContext, type Theme } from "@/components/theme-context";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "webmcp-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  // Stable callback — never changes identity (rerender-functional-setstate)
  const handleSetTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setTheme(newTheme);
  }, [storageKey]);

  // Memoized context value — only changes when theme actually changes
  // Without this, every ThemeProvider render creates a new object,
  // forcing ALL useTheme() consumers in the entire app to re-render
  const value = useMemo(() => ({
    theme,
    setTheme: handleSetTheme,
  }), [theme, handleSetTheme]);

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
