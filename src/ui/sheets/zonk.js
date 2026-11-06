// ui/sheets/zonk.js
// Zonk scoresheet: player totals with progress toward the target, this turn's points,
// a numpad for the current throw, and Zonk / + / Bank.

import { el, button } from "../dom.js";
import { BACKSPACE } from "../icons.js";

const MAX_DIGITS = 5;
const format = (n) => n.toLocaleString("en-US");

export function zonkTitle(state) {
  return `Zonk · to ${format(state.sheet.options.target)}`;
}

export function renderZonk(container, { state, game, play }) {
  const { sheet, players, currentPlayer } = state;
  const totals = game.computeTotals(sheet);
  const target = sheet.options.target;
  let typed = ""; // the throw being typed, as a string of digits

  // Players
  const list = el("ol", players.length > 4 ? "zonk-players is-compact" : "zonk-players");
  players.forEach((name, i) => {
    const row = el("li", i === currentPlayer ? "zonk-player is-current" : "zonk-player");
    if (i === currentPlayer) row.setAttribute("aria-current", "true");
    const top = el("div", "zonk-player-top");
    top.append(el("span", "zonk-player-name", name), el("span", "zonk-player-total", format(totals[i])));
    const bar = el("div", "zonk-bar");
    const fillBar = el("div", "zonk-bar-fill");
    fillBar.style.width = `${Math.min(100, (totals[i] / target) * 100)}%`; // data, not layout
    bar.append(fillBar);
    row.append(top, bar);
    list.append(row);
  });

  // This turn + the throw being typed
  const turn = el("section", "zonk-turn");
  const turnLine = el("div", "zonk-turn-line");
  const subtotal = el("span", "zonk-turn-value", format(sheet.turn.subtotal));
  if (sheet.turn.plusUsed) subtotal.append(el("span", "zonk-plus-tag", "+ used"));
  turnLine.append(el("span", "zonk-turn-label", "This turn"), subtotal);
  const throwLine = el("div", "zonk-throw-line");
  const throwValue = el("output", "zonk-throw-value");
  throwValue.setAttribute("aria-live", "polite");
  throwLine.append(el("span", "zonk-turn-label", "Throw"), throwValue);
  const hint = el("p", "zonk-hint");
  turn.append(turnLine, throwLine, hint);

  // Numpad
  const pad = el("div", "numpad");
  const press = (digits) => {
    const next = (typed + digits).replace(/^0+/, "");
    if (next.length <= MAX_DIGITS) typed = next;
    refresh();
  };
  for (const key of ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0"]) {
    pad.append(button("numpad-key", { text: key, onClick: () => press(key) }));
  }
  pad.append(button("numpad-key", { icon: BACKSPACE, label: "Backspace", onClick: () => { typed = typed.slice(0, -1); refresh(); } }));

  // Actions
  const actions = el("div", "zonk-actions");
  const zonkButton = button("zonk-action zonk-action-zonk", { text: "Zonk", onClick: () => play({ type: "zonk" }) });
  const plusButton = button("zonk-action zonk-action-plus", { text: "+", label: "Plus: all dice scored, keep throwing", onClick: () => play({ type: "plus", points: Number(typed) }) });
  const bankButton = button("zonk-action zonk-action-bank", { onClick: () => play({ type: "bank", points: Number(typed) }) });
  actions.append(zonkButton, plusButton, bankButton);

  function refresh() {
    const points = Number(typed);
    throwValue.textContent = typed ? format(points) : "–";
    const entry = (type) => ({ type, points });
    plusButton.disabled = !game.canEnter(sheet, currentPlayer, entry("plus"));
    bankButton.disabled = !game.canEnter(sheet, currentPlayer, entry("bank"));
    bankButton.textContent = `Bank ${format(sheet.turn.subtotal + points)}`;

    // Say why the buttons are off, so a typo or the 300 rule is never a mystery
    if (!typed) hint.textContent = sheet.turn.plusUsed ? "Type your next throw" : `Type your throw (first one needs ${game.entryThreshold}+)`;
    else if (points % game.pointStep !== 0) hint.textContent = `Scores go in steps of ${game.pointStep}`;
    else if (!sheet.turn.plusUsed && points < game.entryThreshold) hint.textContent = `The first throw needs ${game.entryThreshold}+`;
    else hint.textContent = "";
  }

  container.append(list, turn, pad, actions);
  refresh();
}