// games/zonk.js
const ENTRY_THRESHOLD = 300;
const POINT_STEP = 50; // every Zonk score is a multiple of 50
const defaultOptions = { target: 5000 };

function createSheet(players, options = {}) {
  return {
    options: { ...defaultOptions, ...options },
    banked: players.map(() => []),
    turn: { subtotal: 0, plusUsed: false },
  };
}

function canEnter(sheet, player, entry) {
  if (entry.type === "zonk") return true;
  if (entry.type !== "plus" && entry.type !== "bank") return false;
  if (!Number.isInteger(entry.points) || entry.points <= 0) return false;
  if (entry.points % POINT_STEP !== 0) return false;
  if (!sheet.turn.plusUsed) return entry.points >= ENTRY_THRESHOLD;
  return true;
}

function applyEntry(sheet, player, entry) {
  if (entry.type === "plus") {
    return {
      sheet: { ...sheet, turn: { subtotal: sheet.turn.subtotal + entry.points, plusUsed: true } },
      turnEnded: false,
    };
  }
  if (entry.type === "bank") {
    return {
      sheet: {
        ...sheet,
        banked: sheet.banked.map((turns, i) => (i === player ? [...turns, sheet.turn.subtotal + entry.points] : turns)),
        turn: { subtotal: 0, plusUsed: false },
      },
      turnEnded: true,
    };
  }
  if (entry.type === "zonk") {
    return {
      sheet: {
        ...sheet,
        banked: sheet.banked.map((turns, i) => (i === player ? [...turns, 0] : turns)),
        turn: { subtotal: 0, plusUsed: false },
      },
      turnEnded: true,
    };
  }
  throw new Error(`Unknown entry type: ${entry.type}`);
}

function computeTotals(sheet) {
  return sheet.banked.map((turns) => turns.reduce((sum, points) => sum + points, 0));
}

function isFinished(sheet) {
  return computeTotals(sheet).some((total) => total >= sheet.options.target);
}

export const zonk = {
  id: "zonk",
  name: "Zonk",
  summary: "Throw dice, bank points, be the first to reach the target.",
  rules: {
    bullets: [
      "First score of each turn must be 300+",
      "All dice scored? Press + and keep throwing",
      "Nothing scores? That's a Zonk: turn lost",
      "First to the target score wins",
    ],
  },
  minPlayers: 1,
  maxPlayers: 8,
  dice: 6,
  entryThreshold: ENTRY_THRESHOLD,
  pointStep: POINT_STEP,
  defaultOptions,
  createSheet,
  canEnter,
  applyEntry,
  computeTotals,
  isFinished,
};