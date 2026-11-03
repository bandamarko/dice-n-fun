import { zonk } from "./games/zonk.js";

let sheet = zonk.createSheet(["Marko", "Ana"]);
const before = sheet;

sheet = zonk.applyEntry(sheet, 0, { type: "plus", points: 300 }).sheet;
sheet = zonk.applyEntry(sheet, 0, { type: "bank", points: 150 }).sheet;
sheet = zonk.applyEntry(sheet, 1, { type: "zonk" }).sheet;

console.log(zonk.computeTotals(sheet));   // expect [450, 0]
console.log(zonk.computeTotals(before));  // expect [0, 0]
console.log(sheet.banked);                // expect [[450], [0]]