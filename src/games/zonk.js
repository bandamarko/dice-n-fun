const ENTRY_THRESHOLD = 300;

const defaultOptions = {
  target: 5000,
};

function createSheet(players, options = {}) {
  return {
    options: { ...defaultOptions, ...options },
    banked: players.map(() => []),       // per player: list of banked turn scores
    turn: { subtotal: 0, plusUsed: false }, // the turn in progress
  };
}



function canEnter(sheet, player, entry) {
  // zonk is never against the rules
  if (entry.type === "zonk") return true;

  // anything that isn't plus or bank is not a valid Zonk entry
  if (entry.type !== "plus" && entry.type !== "bank") return false;

  // points must be a positive whole number
  if (!Number.isInteger(entry.points) || entry.points <= 0) return false;

  // before the first + this turn, the 300 rule applies
  if (!sheet.turn.plusUsed) return entry.points >= ENTRY_THRESHOLD;

  // after a +, any positive amount is fine
  return true;
}

function applyEntry(sheet, player, entry) {
  // TODO: return { sheet: newSheet, turnEnded: true or false }
}

function computeTotals(sheet) {
  return sheet.banked.map(turns => turns.reduce((sum, points) => sum + points, 0));
}

function isFinished(sheet) {
  return computeTotals(sheet).some(total => total >= sheet.options.target);
}

export const zonk = {
  id: "zonk",
  name: "Zonk",
  defaultOptions,
  createSheet,
  canEnter,
  applyEntry,
  computeTotals,
  isFinished,
};