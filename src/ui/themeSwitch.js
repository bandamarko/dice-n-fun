// ui/themeSwitch.js
// The day/night switch. Used as a button on welcome, and as a picture inside
// the game menu's Theme row (where the whole row is the button).

import { getTheme, toggleTheme } from "./theme.js";
import { el } from "./dom.js";
import { SUN, MOON } from "./icons.js";

function fill(node) {
  const sun = el("span", "switch-knob switch-sun");
  sun.innerHTML = SUN;
  const moon = el("span", "switch-knob switch-moon");
  moon.innerHTML = MOON;
  node.append(sun, moon);
  return node;
}

export function themeLabel() {
  return getTheme() === "dark" ? "Switch to light mode" : "Switch to dark mode";
}

export function themeSwitchButton() {
  const node = fill(el("button", "theme-switch"));
  node.type = "button";
  node.setAttribute("aria-label", themeLabel());
  node.addEventListener("click", () => {
    toggleTheme();
    node.setAttribute("aria-label", themeLabel());
  });
  return node;
}

export function themeSwitchPicture() {
  const node = fill(el("span", "theme-switch"));
  node.setAttribute("aria-hidden", "true");
  return node;
}