// ui/theme.js
// The theme is one attribute on <html>: data-theme="light" or "dark".
// Default follows the phone's setting; once the player taps the switch, their choice is saved and wins.

const THEME_KEY = "dice-n-fun:theme";
const systemDark = matchMedia("(prefers-color-scheme: dark)");

function savedTheme() {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    return theme === "light" || theme === "dark" ? theme : null;
  } catch {
    return null; // storage blocked (private window): just follow the phone
  }
}

function apply(theme) {
  document.documentElement.dataset.theme = theme;
}

export function getTheme() {
  return document.documentElement.dataset.theme;
}

export function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  apply(next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // not saved, but it still switches for this visit
  }
  return next;
}

export function startTheme() {
  apply(savedTheme() ?? (systemDark.matches ? "dark" : "light"));
  // Until the player picks a theme, follow the phone if its setting changes (e.g. at sunset)
  systemDark.addEventListener("change", (event) => {
    if (!savedTheme()) apply(event.matches ? "dark" : "light");
  });
}