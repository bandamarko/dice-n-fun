import { createGame } from "./state/game.js";

console.log(createGame("zonk", ["Marko"]));   // works: 1 player is allowed
createGame("zonk", []);                        // red error: "Zonk needs 1–8 players"