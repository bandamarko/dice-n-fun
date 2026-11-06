// games/yamb.js
// Yamb and Flash Yamb: same rows and scoring, different columns.
// Sheet shape: { grids: [ { columnName: [13 cells] } per player ], pendingTip: rowName | null }
// A cell is null (empty), 0 (crossed out, shown as "/") or its score.

export const ROWS = ["ones", "twos", "threes", "fours", "fives", "sixes",
                     "max", "min", "straight", "triple", "full", "poker", "yamb"];

const row = (name) => ROWS.indexOf(name);
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const FACES = range(1, 6);

// ---------- Values ----------

// Every score a row can hold (besides 0 for "/")
function possibleValues(name) {
  const i = row(name);
  if (i < 6) return range(1, 5).map((count) => count * (i + 1)); // ones..sixes, best 5 dice
  switch (name) {
    case "max":
    case "min": return range(5, 30);
    case "straight": return [46, 56, 66];
    case "triple": return FACES.map((f) => 3 * f + 20);
    case "full": return FACES.flatMap((a) => FACES.filter((b) => b !== a).map((b) => 3 * a + 2 * b + 30));
    case "poker": return FACES.map((f) => 4 * f + 40);
    case "yamb": return FACES.map((f) => 5 * f + 50);
  }
}

const VALID = Object.fromEntries(ROWS.map((name) => [name, new Set(possibleValues(name))]));
const BEST = Object.fromEntries(ROWS.map((name) => {
  const values = [...VALID[name]];
  return [name, name === "min" ? Math.min(...values) : Math.max(...values)];
}));

// ---------- Column rules ----------

const MIDDLE_UP = ["max", "sixes", "fives", "fours", "threes", "twos", "ones"].map(row);
const MIDDLE_DOWN = ["min", "straight", "triple", "full", "poker", "yamb"].map(row);
const nextEmpty = (cells, order) => order.find((r) => cells[r] === null);

// Mandatory opens once every other column is full, Tip included
function othersFull(grid) {
  return Object.entries(grid).every(([column, cells]) =>
    column === "mandatory" || !cells.includes(null));
}

function followsColumnRule(grid, column, r) {
  const cells = grid[column];
  switch (column) {
    case "down": return cells.indexOf(null) === r;      // first empty from the top
    case "up": return cells.lastIndexOf(null) === r;     // first empty from the bottom
    case "middle": return nextEmpty(cells, MIDDLE_UP) === r || nextEmpty(cells, MIDDLE_DOWN) === r;
    case "mandatory": return othersFull(grid) && cells.indexOf(null) === r;
    default: return true;                                // free, announce, hand, tip, maximum
  }
}

// ---------- Scoring ----------

// Sum 1, Difference and Sum 2 for one column; null means "nothing to show yet"
export function columnSums(cells) {
  const filled = (part) => part.filter((v) => v !== null);
  const add = (part) => part.reduce((a, b) => a + b, 0);

  const upper = filled(cells.slice(0, 6));
  const sum1 = upper.length ? add(upper) + (add(upper) >= 60 ? 30 : 0) : null;

  const max = cells[row("max")], min = cells[row("min")], ones = cells[row("ones")];
  const difference = max !== null && min !== null && ones !== null ? Math.max(0, (max - min) * ones) : null;

  const lower = filled(cells.slice(row("straight")));
  const sum2 = lower.length ? add(lower) : null;

  return { sum1, difference, sum2 };
}

// ---------- The game ----------

export function createYambVariant({ id, name, summary, columns }) {
  function createSheet(players) {
    const emptyGrid = () =>
      Object.fromEntries(columns.map((column) => [column, Array(ROWS.length).fill(null)]));

    return {
      grids: players.map(() => emptyGrid()),
      pendingTip: null,
    };
  }

  function canEnter(sheet, player, { column, row: rowName, value }) {
    const r = row(rowName);
    if (!columns.includes(column) || r === -1) return false;

    // 1. A waiting tip is the only legal move; without one, Tip is closed
    if (sheet.pendingTip !== null) {
      if (column !== "tip" || rowName !== sheet.pendingTip) return false;
    } else if (column === "tip") {
      return false;
    }

    const grid = sheet.grids[player];
    if (grid[column][r] !== null) return false;            // 2. cell must be empty
    if (!followsColumnRule(grid, column, r)) return false; // 3. column rule

    if (value === 0) return true;                          // 4. "/" is always allowed
    if (column === "maximum") return value === BEST[rowName];
    return VALID[rowName].has(value);
  }

  function applyEntry(sheet, player, { column, row: rowName, value }) {
    const r = row(rowName);
    const grids = sheet.grids.map((grid, i) =>
      i !== player ? grid : { ...grid, [column]: grid[column].map((cell, j) => (j === r ? value : cell)) });

    // Announce (score or "/") hands the same row to the next player; any other move clears the tip
    const pendingTip = column === "announce" ? rowName : null;

    return { sheet: { ...sheet, grids, pendingTip }, turnEnded: true };
  }

  function computeTotals(sheet) {
    return sheet.grids.map((grid) =>
      Object.values(grid).reduce((total, cells) => {
        const { sum1, difference, sum2 } = columnSums(cells);
        return total + (sum1 ?? 0) + (difference ?? 0) + (sum2 ?? 0);
      }, 0));
  }

  function isFinished(sheet) {
    return sheet.grids.every((grid) => Object.values(grid).every((cells) => !cells.includes(null)));
  }

  function hasMove(sheet, player) {
    return columns.some((column) =>
      ROWS.some((rowName) => canEnter(sheet, player, { column, row: rowName, value: 0 })));
  }

  return {
    id, name, summary,
    minPlayers: 2, maxPlayers: 8, dice: 6,
    defaultOptions: {},
    columns,
    createSheet, canEnter, applyEntry, computeTotals, isFinished, hasMove,
  };
}

export const yamb = createYambVariant({
  id: "yamb",
  name: "Yamb",
  summary: "Fill a 9-column scoresheet, one cell per turn, for the highest total.",
  columns: ["down", "free", "up", "announce", "hand", "tip", "middle", "mandatory", "maximum"],
});

export const flashYamb = createYambVariant({
  id: "flash-yamb",
  name: "Flash Yamb",
  summary: "Yamb with six columns, for a quicker game.",
  columns: ["down", "free", "up", "announce", "hand", "tip"],
});