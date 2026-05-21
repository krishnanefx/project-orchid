"use client";

export type Theme = "light" | "dark";

const KEY = "orchid-theme";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const storedTheme = localStorage.getItem(KEY);
  return storedTheme === "dark" ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "");
  try { localStorage.setItem(KEY, theme); } catch { /* ignore */ }
}

export function toggleTheme(): Theme {
  const next = getStoredTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
