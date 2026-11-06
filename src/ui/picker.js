// ui/picker.js
// "Pick a game": one card per game. Tapping a card flips it to its rules and back;
// only the Play button opens setup, so a stray tap never starts anything.

import { gameList } from "../games/index.js";
import { go, back } from "./router.js";
import { appIcon, BOLT, FLIP, PLAY, BACK } from "./icons.js";

// Small per-game decorations; the rules themselves come from the game definitions
const TITLE_ICONS = { "flash-yamb": BOLT };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function playButton(game) {
  const play = el("button", "card-play");
  play.type = "button";
  play.innerHTML = PLAY;
  play.append("Play");
  play.setAttribute("aria-label", `Play ${game.name}`);
  play.addEventListener("click", () => go("setup", { gameId: game.id }));
  return play;
}

function cardTitle(game, text, className) {
  const title = el("span", className, text);
  if (TITLE_ICONS[game.id]) title.insertAdjacentHTML("beforeend", TITLE_ICONS[game.id]);
  return title;
}

function gameCard(game) {
  const players = `${game.minPlayers}–${game.maxPlayers} players · ${game.dice} dice`;
  const card = el("section", "game-card");
  card.setAttribute("aria-label", game.name);
  const inner = el("div", "game-card-inner");

  // Front: name, summary, play
  const front = el("div", "game-card-face game-card-front");
  const flipToRules = el("button", "card-flip");
  flipToRules.type = "button";
  flipToRules.setAttribute("aria-label", `Show ${game.name} rules`);
  const hint = el("span", "card-hint");
  hint.innerHTML = FLIP;
  hint.append("Tap for rules");
  flipToRules.append(cardTitle(game, game.name, "card-title"), el("span", "card-summary", game.summary), hint);
  const frontBottom = el("div", "card-bottom");
  frontBottom.append(el("span", "card-players", players), playButton(game));
  front.append(flipToRules, frontBottom);

  // Back: rules, play
  const backFace = el("div", "game-card-face game-card-back");
  const flipToFront = el("button", "card-flip");
  flipToFront.type = "button";
  flipToFront.setAttribute("aria-label", `${game.name} rules, tap to flip back`);
  const head = el("span", "card-rules-head");
  const flipBack = el("span", "card-hint");
  flipBack.innerHTML = FLIP;
  flipBack.append("Flip back");
  head.append(cardTitle(game, `${game.name} rules`, "card-rules-title"), flipBack);
  const facts = el("span", "card-facts", game.rules.extra ? `${players} · ${game.rules.extra}` : players);
  const list = el("ul", "card-rules");
  for (const rule of game.rules.bullets) list.append(el("li", "", rule));
  flipToFront.append(head, facts, list);
  const backBottom = el("div", "card-bottom");
  if (game.rules.tip) {
    const tip = el("span", "card-tip");
    tip.innerHTML = BOLT;
    tip.append(game.rules.tip);
    backBottom.append(tip);
  }
  backBottom.append(playButton(game));
  backFace.append(flipToFront, backBottom);

  // Flipping: the hidden side is made inert, so its buttons can't be tapped or focused
  const setFlipped = (flipped) => {
    card.classList.toggle("is-flipped", flipped);
    front.inert = flipped;
    backFace.inert = !flipped;
  };
  flipToRules.addEventListener("click", () => setFlipped(true));
  flipToFront.addEventListener("click", () => setFlipped(false));
  setFlipped(false);

  inner.append(front, backFace);
  card.append(inner);
  return card;
}

export function showPicker(root) {
  const screen = el("main", "picker");

  const header = el("header", "screen-header");
  const backButton = el("button", "icon-button");
  backButton.type = "button";
  backButton.setAttribute("aria-label", "Back");
  backButton.innerHTML = BACK;
  backButton.addEventListener("click", back);
  const logo = el("span", "header-logo");
  logo.innerHTML = appIcon();
  header.append(backButton, el("h1", "screen-title", "Pick a game"), logo);

  // A grid with equal rows keeps every card the height of the tallest one
  const cards = el("div", "card-list");
  cards.append(...gameList.map(gameCard));

  screen.append(header, cards);
  root.append(screen);
}