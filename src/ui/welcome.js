// ui/welcome.js
// First screen: logo, theme switch, Continue (only with a saved game) and New game.

import { getGame } from "../games/index.js";
import { loadGame } from "../storage/storage.js";
import { go } from "./router.js";
import { el } from "./dom.js";
import { themeSwitchButton } from "./themeSwitch.js";
import { LOGO_DIE } from "./icons.js";

// Sticker logo: "Dice'n'R" + the die (from assets) + "ll"
function logo() {
  const title = el("h1", "logo");
  title.setAttribute("aria-label", "Dice'n'Roll");
  const text = el("span", "logo-text");
  text.setAttribute("aria-hidden", "true");
  const start = el("span", "", "Dice");
  start.append(el("span", "logo-n", "'n'"), "R");
  text.append(start);
  text.insertAdjacentHTML("beforeend", LOGO_DIE);
  text.append(el("span", "", "ll"));
  title.append(text);
  return title;
}

// "Yamb · Marko, Ana, Luka · Ana's turn", or null if there is no usable save
function savedGameLine() {
  const saved = loadGame();
  if (!saved) return null;
  try {
    const { gameId, players, currentPlayer } = saved.current;
    return `${getGame(gameId).name} · ${players.join(", ")} · ${players[currentPlayer]}'s turn`;
  } catch {
    return null; // a save for a game that no longer exists: just offer New game
  }
}

export function showWelcome(root) {
  const screen = el("main", "welcome");

  const hero = el("div", "welcome-hero");
  hero.append(logo(), el("p", "welcome-tagline", "Score tracker for real dice"));

  const actions = el("div", "welcome-actions");
  const line = savedGameLine();
  if (line) {
    const resume = el("button", "button-primary welcome-continue");
    resume.type = "button";
    resume.append(el("span", "welcome-continue-title", "Continue game"), el("span", "welcome-continue-line", line));
    resume.addEventListener("click", () => go("game", {}, { fresh: true }));
    actions.append(resume);
  }
  const fresh = el("button", "button-outline", "New game");
  fresh.type = "button";
  fresh.addEventListener("click", () => go("picker"));
  actions.append(fresh);

  screen.append(themeSwitchButton(), hero, actions);
  root.append(screen);
}