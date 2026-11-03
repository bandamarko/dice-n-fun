import { createGame, playMove } from "./state/game.js";

let game = createGame("zonk", ["Marko", "Ana"]);
console.log("starts:", game.currentPlayer);

game = playMove(game, { type: "plus", points: 300 });
console.log("after plus:", game.currentPlayer);   // same player

game = playMove(game, { type: "bank", points: 100 });
console.log("after bank:", game.currentPlayer);   // the other player
console.log(game.sheet.banked);