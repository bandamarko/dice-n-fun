import { zonk } from "./zonk.js";

const games = {
  [zonk.id]: zonk,
};

export const gameList = Object.values(games);

export function getGame(id) {
    const game = games[id];
    if (!Object.hasOwn(games, id)) {
        throw new Error(`Unknown game id: ${id}`);
    }
    return game;
}