import { zonk } from "./zonk.js";
import { yamb, flashYamb } from "./yamb.js";

const games = {
  [zonk.id]: zonk,
  [yamb.id]: yamb,
  [flashYamb.id]: flashYamb,
};

export const gameList = Object.values(games);

export function getGame(id) {
  if (!Object.hasOwn(games, id)) throw new Error(`Unknown game id: ${id}`);
  return games[id];
}