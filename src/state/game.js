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