import { createGame } from "./state/game.js";
import { createHistory, play } from "./state/history.js";
import { saveGame, loadGame } from "./storage/storage.js";

let h = loadGame();
if (h) {
  console.log("loaded:", h.current.sheet.banked);
} else {
  h = play(createHistory(createGame("zonk", ["Marko", "Ana"])), { type: "bank", points: 500 });
  saveGame(h);
  console.log("new game saved");
}