# Dice'n'Fun: design decisions

## State
- Generic state: gameId, players, currentPlayer, sheet
- The shape of `sheet` is defined by each game; only that game's file understands it
- Totals are always calculated from the sheet, never stored

## Games
Each game definition provides: createSheet, canEnter, applyEntry, computeTotals, isFinished.
Adding a game = one new file in games/ + registering it in games/index.js.

## Undo / redo
- Snapshot-based: before each confirmed action, push a copy of the sheet onto the undo stack
- Undo moves the snapshot to the redo stack; any new action clears redo
- Zonk turn subtotal is part of the sheet (saved, undoable); the number being typed is UI-only

## Storage
- JSON in localStorage, saved after every confirmed action
- The undo stack is saved; the redo stack is not