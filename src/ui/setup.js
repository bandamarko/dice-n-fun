// ui/setup.js
// Game setup: player names (add, remove, drag to reorder), game options, Start.
// Names live in a module variable, so they survive going back to change the game.

import { getGame } from "../games/index.js";
import { createGame } from "../state/game.js";
import { createHistory } from "../state/history.js";
import { saveGame } from "../storage/storage.js";
import { go, back } from "./router.js";
import { showDialog } from "./dialog.js";
import { appIcon, BACK, GRIP, CLOSE } from "./icons.js";

const MAX_NAME_LENGTH = 16;
const ZONK_TARGETS = [3000, 5000, 10000];

let names = [];                 // shared by every game's setup while the app is open
const optionsByGame = {};       // e.g. { zonk: { target: 5000 } }, also kept while the app is open

// "Play again" from the end screen: start the next setup with the same players
// (same order) and the same options, e.g. the same Zonk target.
export function prepareSetup(gameId, players, options) {
  names = [...players];
  if (options) optionsByGame[gameId] = { ...options };
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function showSetup(root, { gameId }) {
  const game = getGame(gameId);
  const options = (optionsByGame[gameId] ??= { ...game.defaultOptions });

  const screen = el("main", "setup");

  // Header
  const header = el("header", "screen-header");
  const backButton = el("button", "icon-button");
  backButton.type = "button";
  backButton.setAttribute("aria-label", "Back");
  backButton.innerHTML = BACK;
  backButton.addEventListener("click", back);
  const logo = el("span", "header-logo");
  logo.innerHTML = appIcon();
  header.append(backButton, el("h1", "screen-title", game.name), logo);

  // Players
  const players = el("section", "setup-card");
  const playersHead = el("div", "setup-card-head");
  const count = el("span", "setup-count");
  playersHead.append(el("h2", "setup-heading", "Players"), count);

  const form = el("form", "name-form");
  const input = el("input", "name-input");
  input.type = "text";
  input.placeholder = "Player name";
  input.maxLength = MAX_NAME_LENGTH;
  input.autocomplete = "off";
  input.enterKeyHint = "done";
  input.setAttribute("aria-label", "Player name");
  const add = el("button", "name-add", "Add");
  add.type = "submit";
  form.append(input, add);
  const hint = el("p", "name-hint");
  hint.setAttribute("aria-live", "polite");

  const list = el("ol", "name-list");
  players.append(playersHead, form, hint, list);

  function renderNames(focusIndex = null) {
    count.textContent = `${names.length} / ${game.maxPlayers}`;
    const full = names.length >= game.maxPlayers;
    input.disabled = full;
    add.disabled = full;
    input.placeholder = full ? `${game.maxPlayers} players is the most` : "Player name";

    list.replaceChildren(...names.map((name, i) => nameRow(name, i)));
    if (focusIndex !== null) list.children[focusIndex]?.querySelector(".name-grip")?.focus();
  }

  function nameRow(name, index) {
    const row = el("li", "name-row");
    const grip = el("button", "name-grip");
    grip.type = "button";
    grip.innerHTML = GRIP;
    grip.setAttribute("aria-label", `Move ${name}. Drag, or use the arrow keys`);
    const remove = el("button", "name-remove");
    remove.type = "button";
    remove.innerHTML = CLOSE;
    remove.setAttribute("aria-label", `Remove ${name}`);
    remove.addEventListener("click", () => {
      names = names.filter((_, i) => i !== index);
      renderNames();
      input.focus();
    });

    // Keyboard: arrow keys move the player one place
    grip.addEventListener("keydown", (event) => {
      const step = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
      if (!step) return;
      event.preventDefault();
      const to = index + step;
      if (to < 0 || to >= names.length) return;
      names = moveItem(names, index, to);
      renderNames(to);
    });

    grip.addEventListener("pointerdown", (event) => startDrag(event, row, index));
    row.append(grip, el("span", "name-text", name), remove);
    return row;
  }

  // Drag: the held row follows the finger; the others slide aside to show where it will land
  function startDrag(event, row, from) {
    if (event.button !== 0) return;
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);

    const rows = [...list.children];
    const slot = row.offsetHeight + parseFloat(getComputedStyle(list).rowGap || 0);
    const startY = event.clientY;
    let to = from;
    row.classList.add("is-dragging");

    function onMove(moveEvent) {
      const dy = moveEvent.clientY - startY;
      row.style.transform = `translateY(${dy}px)`;
      to = Math.max(0, Math.min(names.length - 1, from + Math.round(dy / slot)));
      rows.forEach((other, i) => {
        if (i === from) return;
        let shift = 0;
        if (from < to && i > from && i <= to) shift = -slot;
        if (from > to && i < from && i >= to) shift = slot;
        other.style.transform = shift ? `translateY(${shift}px)` : "";
      });
    }

    function onEnd() {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onEnd);
      handle.removeEventListener("pointercancel", onEnd);
      if (to !== from) names = moveItem(names, from, to);
      renderNames(to);
    }

    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onEnd);
    handle.addEventListener("pointercancel", onEnd);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = input.value.trim().replace(/\s+/g, " ");
    hint.textContent = "";
    if (!name) return;
    if (names.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
      hint.textContent = `${name} is already playing. Use a different name.`;
      return;
    }
    names = [...names, name];
    input.value = "";
    renderNames();
    input.focus();
  });

  screen.append(header, players);

  // Game options (only Zonk has any for now)
  if (gameId === "zonk") screen.append(zonkOptions(options));

  // Start
  const footer = el("div", "setup-footer");
  const start = el("button", "button-primary setup-start", "Start game");
  start.type = "button";
  start.addEventListener("click", () => {
    if (names.length < game.minPlayers || names.length > game.maxPlayers) {
      const range = game.minPlayers === game.maxPlayers ? `${game.minPlayers}` : `${game.minPlayers}–${game.maxPlayers}`;
      showDialog(root, {
        title: `${game.name} needs ${range} players`,
        message: names.length === 0 ? "Add the players' names first." : `You have ${names.length}. Add ${game.minPlayers - names.length} more to start.`,
        actions: [{ label: "OK", kind: "primary", onClick: () => input.focus() }],
      });
      return;
    }
    const history = createHistory(createGame(gameId, names, options));
    saveGame(history);
    go("game", { intro: true }, { fresh: true });
  });
  footer.append(el("p", "setup-note", "The starting player is picked at random"), start);
  screen.append(footer);

  root.append(screen);
  renderNames();
}

function moveItem(list, from, to) {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function zonkOptions(options) {
  const card = el("section", "setup-card");
  card.append(el("h2", "setup-heading", "Target score"));

  const chips = el("div", "chip-row");
  chips.setAttribute("role", "group");
  chips.setAttribute("aria-label", "Target score");
  const custom = el("input", "custom-target");
  custom.type = "number";
  custom.inputMode = "numeric";
  custom.min = "1000";
  custom.max = "100000";
  custom.step = "50";
  custom.placeholder = "e.g. 7500";
  custom.setAttribute("aria-label", "Custom target score");

  const isCustom = () => !ZONK_TARGETS.includes(options.target);
  const buttons = [...ZONK_TARGETS, "Custom"].map((value) => {
    const chip = el("button", "chip", value === "Custom" ? "Custom" : value.toLocaleString("en-US"));
    chip.type = "button";
    chip.addEventListener("click", () => {
      if (value === "Custom") {
        custom.hidden = false;
        custom.focus();
        if (Number(custom.value) >= 1000) options.target = Number(custom.value);
      } else {
        options.target = value;
        custom.hidden = true;
      }
      refresh();
    });
    return { chip, value };
  });

  function refresh() {
    for (const { chip, value } of buttons) {
      const on = value === "Custom" ? !custom.hidden : options.target === value && custom.hidden;
      chip.setAttribute("aria-pressed", String(on));
    }
  }

  custom.addEventListener("input", () => {
    const value = Math.round(Number(custom.value));
    if (value >= 1000 && value <= 100000) options.target = value;
  });

  custom.hidden = !isCustom();
  if (isCustom()) custom.value = String(options.target);
  chips.append(...buttons.map((b) => b.chip));
  card.append(chips, custom);
  refresh();
  return card;
}