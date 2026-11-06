// ui/end.js
// TEMPORARY end screen: winner(s) and totals, so a whole game can be tested.
// The real one (with "Compare sheets") replaces it later.

import { getGame } from "../games/index.js";
import { getWinners } from "../state/game.js";
import { loadGame, clearGame } from "../storage/storage.js";
import { home, setBackHandler } from "./router.js";
import { el, button } from "./dom.js";

export function showEnd(root) {
  const saved = loadGame();
  if (!saved) return home();
  const state = saved.current;
  const game = getGame(state.gameId);
  const totals = game.computeTotals(state.sheet);
  const winners = getWinners(state);

  const done = () => {
    clearGame(); // a finished game isn't kept
    home();
  };
  setBackHandler(done);

  const screen = el("main", "end-screen");
  const title = winners.length > 1 ? `${winners.join(" & ")} share the win!` : `${winners[0]} wins!`;
  const ranking = el("ol", "end-ranking");
  state.players
    .map((name, i) => ({ name, total: totals[i] }))
    .sort((a, b) => b.total - a.total)
    .forEach(({ name, total }) => {
      const row = el("li", "end-row");
      row.append(el("span", "", name), el("span", "end-total", total.toLocaleString("en-US")));
      ranking.append(row);
    });

  screen.append(el("p", "end-game", game.name), el("h1", "end-title", title), ranking, button("button-primary", { text: "Done", onClick: done }));
  root.append(screen);
}