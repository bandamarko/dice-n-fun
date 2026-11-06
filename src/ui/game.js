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
import { showStarterSpinner } from "./starterSpinner.js";
import { zonkTitle, renderZonk } from "./sheets/zonk.js";
import { yambTitle, renderYamb } from "./sheets/yamb.js";

// One entry per game: how to title it and how to draw its sheet
const SHEETS = {
    zonk: { title: zonkTitle, render: renderZonk },
    yamb: { title: yambTitle, render: renderYamb },
    "flash-yamb": { title: yambTitle, render: renderYamb },
};

export function showGame(root, params = {}) {
    let history = loadGame();
    if (!history) return home(); // nothing saved (e.g. cleared in another tab)

    const game = getGame(history.current.gameId);
    const sheet = SHEETS[game.id];
    const screen = el("main", "game-screen");
    root.append(screen);

    // A sheet can have an entry that isn't a move yet (Yamb's pending entry).
    // While it does, Undo clears that entry instead of undoing the last move.
    let pendingUndo = null;
    let undoButton = null;
    let redoButton = null;

    function refreshTools() {
        undoButton.disabled = !(pendingUndo || canUndo(history));
        redoButton.disabled = Boolean(pendingUndo) || !canRedo(history);
    }

    function setPendingUndo(clear) {
        pendingUndo = clear;
        refreshTools();
    }

    function update(next) {
        history = next;
        saveGame(history);
        if (game.isFinished(history.current.sheet)) return go("end", { celebrate: true }, { fresh: true }); // this move ended it
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
        title.append(el("span", "game-title-small", sheet.title(state, game)), el("span", "game-title-turn", `${state.players[state.currentPlayer]}'s turn`));
        const tools = el("div", "game-tools");
        undoButton = button("icon-button", { icon: UNDO, label: "Undo", onClick: () => (pendingUndo ? pendingUndo() : update(undo(history))) });
        redoButton = button("icon-button", { icon: REDO, label: "Redo", onClick: () => update(redo(history)) });
        pendingUndo = null; // a fresh draw never has a pending entry
        refreshTools();
        tools.append(undoButton, redoButton);
        header.append(menu, title, tools);

        const body = el("div", "game-body");
        screen.replaceChildren(header, body); // on the page first, so the sheet can measure positions
        sheet.render(body, { state, game, play: (entry) => update(play(history, entry)), setPendingUndo });
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

    // A brand-new game (from setup) first reveals who starts. Continue skips this.
    const { players, currentPlayer } = history.current;
    if (params.intro && players.length > 1) {
        screen.classList.add("is-revealing"); // hides "<name>'s turn" so the header can't spoil the spin
        showStarterSpinner(root, { players, starter: currentPlayer, onClose: () => screen.classList.remove("is-revealing") });
    }
}