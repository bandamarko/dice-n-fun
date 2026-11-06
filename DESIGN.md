# Dice'n'Roll: design notes

Score tracker for physically thrown dice. Pass-and-play on one device.
Repo: bandamarko/dice-n-roll. Live at bandamarko.github.io/dice-n-roll/ (when deployed).

## Platform

- PWA built with Vite, plain HTML/CSS/JS, hosted free on GitHub Pages; also runs on localhost.
- Works in the browser on Android and iOS; installable (also on desktop via Chrome/Edge).
- Single-page app: one index.html, JS swaps screens inside <div id="app">.
- Deploy: GitHub Actions builds with Vite (base "/dice-n-roll/" in vite.config.js)
  and publishes dist/ to GitHub Pages on every push to main.

## Structure (src/)

- main.js: wires screens to the router, starts theme and router
- assets/: every SVG (logo, icons, Yamb column/row/dice icons), imported with ?raw
- games/: pure game rules, no DOM (index.js registry, zonk.js, yamb.js)
- state/: game.js (createGame, playMove, getWinners), history.js (undo/redo)
- storage/: storage.js (save/load JSON in localStorage)
- ui/: router.js, theme.js, themeSwitch.js, dom.js, icons.js, dialog.js,
  welcome.js, picker.js, setup.js, starterSpinner.js, game.js, gameMenu.js, end.js,
  sheets/zonk.js, sheets/yamb.js
- Layers: games/ and state/ never touch the DOM; ui/ uses everything.

## Game state

- { gameId, players, currentPlayer, sheet, skipped }
- The sheet shape belongs to each game. Totals are always computed, never stored.
- Everything is immutable: functions return new objects (spread, map).
- null = empty cell, 0 = crossed out (shown as "/").
- The starting player is picked at random by createGame.
- skipped: players skipped by the last move (drives the "can't play" popup).

## Game interface

- id, name, summary, rules { extra?, bullets, tip? }, minPlayers, maxPlayers, dice, defaultOptions
- createSheet(players, options)
- canEnter(sheet, player, entry): checks everything, never trusts the UI
- applyEntry(sheet, player, entry) → { sheet, turnEnded }
- computeTotals(sheet) → one total per player
- isFinished(sheet)
- hasMove(sheet, player): optional; playMove skips players with no legal move
- Registry: getGame(id) (Object.hasOwn check), gameList

## Zonk

- 1–8 players, 6 dice. Target 3000 / 5000 (default) / 10000 / Custom (1000–100000).
- Every score is a multiple of 50.
- Each turn's first set of throws must reach 300 (300 counts) before "+" is used;
  after "+", any amount.
- "+" when all dice have scored; Bank adds the turn to the total; Zonk ends the turn with 0.
- Reaching the target ends the game immediately.
- No confirm step: Bank and Zonk are already deliberate.

## Yamb

- 2–8 players, 6 dice, 3 throws, one cell per turn.
- Rows: ones–sixes, (Sum 1), Max, Min, (Difference), Straight, Triple, Full house,
  Poker, Yamb, (Sum 2).
- Sheet: { grids: [{ column: [13 cells] } per player], pendingTip: row name or null }

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

- A player with no legal move is skipped with a popup (in practice only the
  starting player, at most once per game, waiting for a tip).

## Flash Yamb

- Same rules and scoring as Yamb; only Down, Free, Up, Announce, Hand, Tip (Yamb's order).
- 2–8 players. Its own card; rules add "Tip: try it with 5 dice".
- Code: createYambVariant({ id, name, summary, rules, columns }) exports yamb and flashYamb.

## Undo / redo

- history = { current, undoStack, redoStack }; snapshots by reference (state is immutable).
- A new move clears redo. pendingTip lives in the sheet, so undo handles tips too.

## Storage

- localStorage key "dice-n-fun:current-game", SAVE_VERSION 2 (keys kept from the
  old name so existing saves survive).
- Saves { version, current, undoStack } after every move; redo isn't saved.
- Missing, broken or old-version save → start fresh.
- When a finished game's end screen is left, its save is cleared.
- Theme stored under "dice-n-fun:theme".

## UI

- Screens: welcome → picker → setup → (spinner) → scoresheet → end screen.
- The app always starts on welcome (refresh, reopen or killed app alike);
  "Continue game" shows when a save exists.
- Welcome: sticker logo, "Score tracker for real dice", theme switch, Continue game, New game.
- Picker: one card per game, all the same height. Tap the card to flip it to its
  rules (several can be flipped); a separate Play button opens setup. Coming back,
  all cards are unflipped.
- Setup: names up to 16 characters, no duplicates; reorder by the grip handle
  (drag, or arrow keys). Names stay when switching games; the player-count check
  only runs when Start is pressed. Start saves the game, then opens it.
- Starter spinner: after Start, names roll through a slot window and stop on the
  (already random) starting player. Tap skips; no re-spins; skipped for 1 player
  and on Continue. The header hides the turn name until it closes.
- Game menu (tap the logo on a scoresheet): Rules, Theme | New game (asks to
  confirm, ends the saved game), Quit to welcome (game stays saved).
- Popups use one shared dialog; back closes it.
- End screen (temporary): winner(s) and ranked totals; Done clears the save.
  Planned: "Compare sheets" to view each player's finished sheet read-only.

### Zonk sheet

- Player rows with totals and progress bars toward the target (two columns for 5–8).
- "This turn" (with "+ used"), the throw being typed, a numpad, Zonk / + / Bank N.
- A hint explains why + or Bank is disabled (steps of 50, first throw 300+).

### Yamb sheet

- Player chips at the top (scroll sideways for many players); tap another player's
  chip to view their sheet read-only ("Back to <name>'s turn", or back button).
- Grid with icons for rows and columns (names in the HTML, hidden on phones);
  rows shrink on short phones so the sheet never scrolls.
- Open cells = what canEnter allows; locked cells are grey; finished columns look the same.
- Tapping an open cell opens a floating score panel next to it (below the cell in
  the top half, above it in the bottom half) with the column's icon and a live preview:
  dice count for Ones–Sixes, numpad for Max/Min, 46/56/66 for Straight, faces for
  Triple/Poker/Yamb, two face rows for Full house; Maximum shows only its best value.
  Enter only enables for a legal value.
- Enter or "/" makes a pending entry (own color, sums and total preview); another
  cell can replace it; "Confirm turn" in the bottom bar plays it. Pending entries
  aren't saved.
- Tip turn: a notice dims the screen except the tip cell ("Tip from <name>: <row>");
  it shows every time a tip turn is drawn (new turn, undo, redo, Continue); the
  bottom bar can reopen it.
  - Undo with a pending entry only erases it (the turn stays); with nothing pending,
    Undo goes back a real move. Redo is disabled while an entry is pending.

### Back button

- Closes an open overlay first (score panel, game menu, popup, peek, spinner).
- On a scoresheet with nothing open: "Leave the game? It stays saved." [Keep playing] [Leave].
- Setup → picker → welcome; back on welcome closes the app.
- The router keeps its own screen stack and only adds history entries during a tap
  (browsers skip ones added without user interaction); it never removes them.
  Many backs in a row without touching the screen eventually leave the app;
  the game is saved, so Continue resumes it.

## Theme

- Light and dark; default follows the phone, the toggle's last tap wins.
- CSS variables in style.css, switched by data-theme on <html>; an inline
  script in index.html sets it before the first paint.
- Switching fades the color variables (@property, 0.3 s) and slides the switch;
  instant when the phone asks for reduced motion.
- New theme colors need: a light value, a dark value, an @property line and a transition line.
- Light: bg #EAF4FB, text #0E2A3D, muted #4A6578, card #FFFFFF, accent #1F6FC2.
- Dark: bg #0B1824, text #E6F1FA, muted #9DB6CA, card #14273A, accent #4A9EEB.
- Danger (Zonk button, destructive actions): #C0392B (dark #E0604F).
- SVG assets carry their light colors as attributes on the element that has the
  class, so CSS can override them per theme.

## Branding

- Name: Dice'n'Roll. Icon: 3D rounded die (faces 1, 2, 3 visible) on a blue tile.
- Logo: sticker version with a dice trail and a yellow sparkle.
- The app icon doubles as the game-menu button on scoresheets.

## Later

- Real end screen with "Compare sheets".
- PWA setup: manifest, service worker, install icons (PNG in public/).
- Desktop layout: sheet labels shown, side input panel, all sheets visible,
  keyboard (numbers, Enter, Esc, Ctrl+Z), hover states inside @media (hover: hover).
  Code keeps layout in CSS only.
- Zonk options: sudden death (others get a last turn), exact target with bust;
  a tie is decided with one more turn.
- Prefill setup with the last game's players.
- Game history: keep finished games to look back at results and sheets.
- Online / multi-device play.