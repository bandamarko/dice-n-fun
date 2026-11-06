// ui/game.js
// The game screen: loads the saved game, draws the header (menu, title, undo/redo)
// and the right scoresheet, and saves after every move.

import { getGame } from "../games/index.js";
import { play, undo, redo, canUndo, canRedo } from "../state/history.js";
import { loadGame, saveGame } from "../storage/storage.js";
import { go, home, setBackHandler } from "./router.js";
import { showDialog } from "./dialog.js";
import { el, button } from "./dom.js";
import { appIcon, UNDO, REDO } from "./icons.js";
import { openGameMenu } from "./gameMenu.js";
import { zonkTitle, renderZonk } from "./sheets/zonk.js";
import { showStarterSpinner } from "./starterSpinner.js";

// One entry per game: how to title it and how to draw its sheet
const SHEETS = {
  zonk: { title: zonkTitle, render: renderZonk },
};

export function showGame(root, params = {}) {
  let history = loadGame();
  if (!history) return home(); // nothing saved (e.g. cleared in another tab)

  const game = getGame(history.current.gameId);
  const sheet = SHEETS[game.id] ?? placeholderSheet(game);
  const screen = el("main", "game-screen");
  root.append(screen);

  function update(next) {
    history = next;
    saveGame(history);
    if (game.isFinished(history.current.sheet)) return go("end", {}, { fresh: true });
    draw();
    const skipped = history.current.skipped ?? [];
    if (skipped.length) {
      const names = skipped.map((i) => history.current.players[i]).join(", ");
      showDialog(root, {
        title: `${names} can't play right now`,
        message: `No cell is open yet, so the turn passes to ${history.current.players[history.current.currentPlayer]}.`,
        actions: [{ label: "OK", kind: "primary" }],
      });
    }
  }

  function draw() {
    const state = history.current;
    const header = el("header", "game-header");
    const menu = button("game-menu-button", { label: "Game menu", onClick: () => openGameMenu(root, game) });
    menu.innerHTML = appIcon();
    const title = el("div", "game-title");
    title.append(el("span", "game-title-small", sheet.title(state)), el("span", "game-title-turn", `${state.players[state.currentPlayer]}'s turn`));
    const tools = el("div", "game-tools");
    const undoButton = button("icon-button", { icon: UNDO, label: "Undo", onClick: () => update(undo(history)) });
    const redoButton = button("icon-button", { icon: REDO, label: "Redo", onClick: () => update(redo(history)) });
    undoButton.disabled = !canUndo(history);
    redoButton.disabled = !canRedo(history);
    tools.append(undoButton, redoButton);
    header.append(menu, title, tools);

    const body = el("div", "game-body");
    sheet.render(body, { state, game, play: (entry) => update(play(history, entry)) });
    screen.replaceChildren(header, body);
  }

    // A brand-new game (from setup) first reveals who starts. Continue skips this.
  const { players, currentPlayer } = history.current;
  if (params.intro && players.length > 1) {
    screen.classList.add("is-revealing"); // hides "<name>'s turn" so the header can't spoil the spin
    showStarterSpinner(root, { players, starter: currentPlayer, onClose: () => screen.classList.remove("is-revealing") });
  }

  if (game.isFinished(history.current.sheet)) return go("end", {}, { fresh: true });

  setBackHandler(() =>
    showDialog(root, {
      title: "Leave the game?",
      message: "It stays saved, so you can continue it from the home screen.",
      actions: [
        { label: "Keep playing", kind: "secondary" },
        { label: "Leave", kind: "primary", onClick: home },
      ],
    }),
  );
  draw();
}

// Until the Yamb sheets exist
function placeholderSheet(game) {
  return {
    title: () => game.name,
    render: (body) => body.append(el("p", "game-placeholder", `The ${game.name} sheet comes next.`)),
  };
}