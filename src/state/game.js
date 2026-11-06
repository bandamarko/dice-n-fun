import { getGame } from "../games/index.js";

export function createGame(gameId, players, options = {}) {
    const definition = getGame(gameId);
    if (players.length < definition.minPlayers || players.length > definition.maxPlayers) {
        throw new Error(`${definition.name} needs ${definition.minPlayers}–${definition.maxPlayers} players`);
    }
    return {
        gameId,
        players: [...players],
        currentPlayer: Math.floor(Math.random() * players.length),
        sheet: definition.createSheet(players, options),
        skipped: [],
    };
}

export function playMove(state, entry) {
    const definition = getGame(state.gameId);
    const player = state.currentPlayer;

    if (definition.isFinished(state.sheet)) throw new Error("The game is already finished");
    if (!definition.canEnter(state.sheet, player, entry)) throw new Error(`Move not allowed: ${JSON.stringify(entry)}`);

    const { sheet, turnEnded } = definition.applyEntry(state.sheet, player, entry);
    if (!turnEnded) return { ...state, sheet, skipped: [] };

    // Move to the next player who can play; games without hasMove (Zonk) never skip
    const count = state.players.length;
    const skipped = [];
    let next = (player + 1) % count;
    while (definition.hasMove && !definition.isFinished(sheet) && !definition.hasMove(sheet, next)) {
        skipped.push(next);
        if (skipped.length === count) throw new Error("No player can move");
        next = (next + 1) % count;
    }

    return { ...state, sheet, currentPlayer: next, skipped };
}

export function getWinners(state) {
    const totals = getGame(state.gameId).computeTotals(state.sheet);
    const best = Math.max(...totals);
    return state.players.filter((_, i) => totals[i] === best);
}