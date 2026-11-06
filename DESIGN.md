# Dice'n'Roll: design notes

Score tracker for physically thrown dice. Pass-and-play on one device.
(Repo/package name: dice-n-fun. Display name: Dice'n'Roll.)

## Platform
- PWA built with Vite, plain HTML/CSS/JS, hosted free on GitHub Pages; also runs on localhost.
- Works in the browser on Android and iOS; installable (also on desktop via Chrome/Edge).
- Single-page app: one index.html, JS swaps screens inside <div id="app">.

## Structure (src/)
- main.js: wires screens to the router, starts theme and router
- games/: pure game rules, no DOM (index.js registry, zonk.js, yamb.js)
- state/: game.js (createGame, playMove, getWinners), history.js (undo/redo)
- storage/: storage.js (save/load JSON in localStorage)
- ui/: router.js, theme.js, screens, sheets/
- Layers: games/ and state/ never touch the DOM; ui/ uses everything.

## Game state
- { gameId, players, currentPlayer, sheet, skipped }
- The sheet shape belongs to each game. Totals are always computed, never stored.
- Everything is immutable: functions return new objects (spread, map).
- null = empty cell, 0 = crossed out (shown as "/").
- The starting player is picked at random.
- skipped: players skipped by the last move (drives the "skipped" popup).

## Game interface
- id, name, summary, minPlayers, maxPlayers, dice, defaultOptions
- createSheet(players, options)
- canEnter(sheet, player, entry): checks everything, never trusts the UI
- applyEntry(sheet, player, entry) → { sheet, turnEnded }
- computeTotals(sheet) → one total per player
- isFinished(sheet)
- hasMove(sheet, player): optional; playMove skips players with no legal move
- Registry: getGame(id) (Object.hasOwn check), gameList

## Zonk
- 1–8 players, 6 dice, default target 5000.
- Each turn's first set of throws must reach 300 (300 counts) before "+" is used;
  after "+", any amount.
- "+" when all dice have scored; Bank adds the turn to the total; Zonk ends the
  turn with 0. Bank is disabled while the amount is under 300 (before "+").
- Numpad with backspace for entering points.
- Reaching the target ends the game immediately.
- Later (options when creating a game): sudden death (others get a last turn),
  exact target with bust; a tie is decided with one more turn.

## Yamb
- 2–8 players, 6 dice, 3 throws, one cell per turn.
- Rows: ones–sixes, (Sum 1), Max, Min, (Difference), Straight, Triple, Full house,
  Poker, Yamb, (Sum 2).
- Sheet: { grids: [{ column: [13 cells] } per player], pendingTip: row name or null }
  Columns are named, each holds its 13 scoring rows in order; sums aren't stored.

### Scoring
- Sum 1 = ones–sixes, +30 if 60 or more.
- Max / Min = sum of the best 5 dice (5–30).
- Difference = (Max − Min) × Ones, never below 0, same column.
- Straight = 1–5 or 2–6; the player picks 46, 56 or 66.
- Triple = 3 × face + 20. Full house = sum + 30 (two different numbers; five of a
  kind is not a Full). Poker = 4 × face + 40. Yamb = 5 × face + 50.
- Final = all Sum 1 + all Difference + all Sum 2.
- Highest total wins; equal totals share the win.
- Impossible values are refused (e.g. Full house 59).

### Columns (in this order)
- Down: top to bottom. Free: any order. Up: bottom to top.
- Announce: called on the first throw. Any entry in Announce (score or "/") sets
  pendingTip to that row for the next player.
- Hand: all dice in one throw.
- Tip: only filled from the previous player's announce. With a tip waiting, that
  Tip cell is the only legal move; without one, Tip is closed.
- From middle: from Max upward and from Min downward.
- Mandatory: opens when every other column is full, Tip included; top to bottom.
- Maximum: only the best value for the row, or "/".
  (5, 10, 15, 20, 25, 30, Max 30, Min 5, Straight 66, Triple 38, Full 58,
  Poker 64, Yamb 80)
- The app doesn't check physical things (one throw for Hand, announcing on the
  first throw, 3 throws): players' honour.

### Turns
- Tip turn: a notice at turn start ("Tip from <name>: <row>"), pointing at the cell.
- A player with no legal move is skipped with a popup (in practice only the
  starting player, at most once per game, waiting for a tip).

## Flash Yamb
- Same rules and scoring as Yamb; only Down, Free, Up, Announce, Hand, Tip (Yamb's order).
- 2–8 players. Its own card; rules add "Tip: try it with 5 dice".
- Code: createYambVariant({ id, name, summary, columns }) exports yamb and flashYamb.

## Undo / redo
- history = { current, undoStack, redoStack }; snapshots by reference (state is immutable).
- A new move clears redo. pendingTip lives in the sheet, so undo handles tips too.

## Storage
- localStorage key "dice-n-fun:current-game", SAVE_VERSION 2.
- Saves { version, current, undoStack } after every move; redo isn't saved.
- Missing, broken or old-version save → start fresh.
- Theme stored under "dice-n-fun:theme".
- When a finished game's end screen is left, its save is cleared; welcome then
  only shows New game.


## UI
- Screens: welcome → picker → setup → scoresheet → end screen.
- The app always starts on welcome (refresh, reopen or killed app alike).
  "Continue game" shows when a save exists.
- Welcome: logo, "Score tracker for real dice", theme switch, Continue game, New game.
- Picker: one card per game, all the same size. Tap the card to flip it to its
  rules; a separate Play button starts setup (avoids mis-taps).
- Setup: keeps typed names when switching games; the player-count check
  (minPlayers–maxPlayers) only runs when Start is pressed.
- Scoresheets: no scrolling; icons instead of row/column names on phones.
  Score input floats next to the selected cell and shows that column's icon.
- Game menu (tap the logo on a scoresheet): Rules, Theme | New game (asks to
  confirm, ends the saved game), Quit to welcome (game stays saved).
- End screen: winner(s) and ranked totals; optional "Compare sheets" shows each
  player's finished sheet read-only, switching between players.

### Back button
- Closes an open overlay first (score input, game menu, popup).
- On a scoresheet with nothing open: "Leave the game? It stays saved." [Leave] [Keep playing].
- Setup → picker → welcome; back on welcome closes the app.
- The router only adds history entries during a tap (browsers skip ones added
  without user interaction). Many backs in a row without touching the screen
  eventually leave the app; the game is saved, so Continue resumes it.

## Theme
- Light and dark; default follows the phone, the toggle's last tap wins.
- CSS variables in style.css, switched by data-theme on <html>; an inline
  script in index.html sets it before the first paint.
- Light: bg #EAF4FB, text #0E2A3D, muted #4A6578, card #FFFFFF, accent #1F6FC2.
- Dark: bg #0B1824, text #E6F1FA, muted #9DB6CA, card #14273A, accent #4A9EEB.
- Zonk button red: #C0392B (dark #E0604F).

## Branding
- Name: Dice'n'Roll. Icon: 3D rounded die (faces 1, 2, 3 visible) on a blue tile.
- Logo: sticker version with a dice trail and a yellow sparkle.
- The app icon doubles as the game-menu button on scoresheets.

## Later
- Desktop layout: sheet labels shown, side input panel, all sheets visible,
  keyboard (numbers, Enter, Esc, Ctrl+Z). Code keeps layout in CSS only.
- Zonk options: sudden death, exact target with bust.
- Prefill setup with the last game's players.
- Online / multi-device play.
- Game history: keep finished games to look back at results and sheets.
## Open
