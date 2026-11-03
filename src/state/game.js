import { getGame } from "../games/index.js";

export function createGame(gameId, players, options = {}) {
  if (players.length === 0) {
    throw new Error("A game needs at least one player");
  }

  const definition = getGame(gameId);

  return {
    gameId,
    players: [...players],
    currentPlayer: Math.floor(Math.random() * players.length),
    sheet: definition.createSheet(players, options),
  };
}

export function playMove(state, entry) {
  const definition = getGame(state.gameId);
  const player = state.currentPlayer;

  if (definition.isFinished(state.sheet)) {
    throw new Error("The game is already finished");
  }

  if (!definition.canEnter(state.sheet, player, entry)) {
    throw new Error(`Move not allowed: ${JSON.stringify(entry)}`);
  }

  const { sheet, turnEnded } = definition.applyEntry(state.sheet, player, entry);

  return {
    ...state,
    sheet,
    currentPlayer: turnEnded ? (player + 1) % state.players.length : player,
  };
}