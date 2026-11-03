import { zonk } from "./games/zonk.js";

const sheet = zonk.createSheet(["Marko", "Ana"]);
console.log(zonk.canEnter(sheet, 0, { type: "bank", points: 200 })); // false
console.log(zonk.canEnter(sheet, 0, { type: "bank", points: 300 })); // true
console.log(zonk.canEnter(sheet, 0, { type: "zonk" }));              // true