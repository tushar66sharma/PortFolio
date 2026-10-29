import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "theme";
const THEME_COLORS = { light: "#edf2f8", dark: "#0a2a55" };

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
}

function readSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

// The initial theme is set by the pre-paint script in index.html; this hook keeps it in sync.
export function useTheme() {
  const [theme, setTheme] = useState(() =>
    typeof document !== "undefined" && document.documentElement.dataset.theme === "dark" ? "dark" : "light"
  );

  // Follow OS changes until the visitor picks a theme themselves.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => {
      if (readSaved()) return;
      const next = e.matches ? "dark" : "light";
      applyTheme(next);
      setTheme(next);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage blocked: theme still applies for this visit */
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
