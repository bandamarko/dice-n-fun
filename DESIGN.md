# Dice'n'Roll: design decisions

A score-tracking web app for physical dice games. The dice are thrown at the table;
the app tracks scores. Pass-and-play on one device.
(The repo/folder stays `dice-n-fun`; "Dice'n'Roll" is the display name.)

## Platform and tooling
- Plain HTML, CSS and JavaScript (no framework), built with Vite
- Will become a PWA: installable on Android and iOS from the browser, works offline
- Free to run: static files only, no backend; hosted on GitHub Pages
- Develop on localhost; `npm run dev -- --host` to test on a phone over Wi-Fi

## Project structure
```
src/
  main.js              entry point: load a saved game or show the welcome screen
  games/
    index.js           registry: getGame(id), gameList
    zonk.js            Zonk definition
    yamb.js            createYambVariant(...), exports yamb and flashYamb
  state/
    game.js            createGame, playMove
    history.js         undo/redo
  storage/
    storage.js         saveGame, loadGame, clearGame
  ui/
    welcome.js         Continue / New game, theme switch
    gamePicker.js      game cards (flip to rules)
    setup.js           player names + game options
    turnBar.js         menu (logo), current player, undo/redo
    sheets/
      zonk.js          Zonk scoresheet
      yamb.js          Yamb scoresheet (used for Yamb and Flash Yamb)
  style.css
public/                app icons + PWA manifest (later)
```

Dependency direction: `ui/` uses everything; `games/` and `state/` are pure JavaScript
(no DOM, no localStorage); `storage/` only converts state to and from JSON.

## Game state (generic, same for every game)
```js
{ gameId, players, currentPlayer, sheet }
```
- `players`: list of names, in turn order
- `currentPlayer`: index into `players`, picked at random once when the game is created
- `sheet`: shape defined by each game; only that game's file understands it
- Totals are always calculated from the sheet, never stored
- Functions never modify their input; they return new objects

## Game interface
Each game definition is an object with:
- `id`, `name`, `summary`, `minPlayers`, `maxPlayers`, `dice`, `defaultOptions`
- `createSheet(players, options)`: empty sheet in this game's shape
- `canEnter(sheet, player, entry)`: is this entry allowed?
- `applyEntry(sheet, player, entry)`: returns `{ sheet, turnEnded }`
- `computeTotals(sheet)`: list of totals per player
- `isFinished(sheet)`

Adding a game = one new definition + registering it in `games/index.js`.

`createGame(gameId, players, options)` checks `minPlayers`/`maxPlayers` and throws if outside.
`playMove(state, entry)` always plays for `currentPlayer`, throws if the game is finished
or the entry isn't allowed, and moves to the next player when `turnEnded` is true.

## Zonk (default mode)
- 1–8 players, 6 dice
- Options: `target` (default 5000; presets 3000 / 5000 / 10000 / custom)
- Sheet: `{ options, banked: [[...], [...]], turn: { subtotal, plusUsed } }`
- Entries: `{ type: "plus", points }`, `{ type: "bank", points }`, `{ type: "zonk" }`
- Before the first + in a turn, points must be ≥ 300 (applies every turn)
- After a +, any positive amount is allowed
- plus: adds points to the turn subtotal, turn continues (all dice scored)
- bank: records subtotal + points for the player, turn ends
- zonk: records 0 for the player, turn ends
- The game ends immediately when a player's total reaches the target (≥)

## Yamb
- 6 dice, 3 throws, the best 5 dice count; exactly one cell per turn
- Rows: 1–6, Sum 1, Max, Min, Difference, Straight, Triple, Full, Poker, Yamb, Sum 2
- Sum 1: 1–6 added, +30 if ≥ 60
- Max / Min: sum of the best 5 dice (5–30)
- Difference: (Max − Min) × 1s, same column, 0 if negative
- Straight: 1–5 or 2–6; the player picks 46 / 56 / 66 when entering
- Triple: 3 × face + 20 · Full: sum + 30 · Poker: 4 × face + 40 · Yamb: 5 × face + 50
- Final score: all Sum 1 + all Difference + all Sum 2
- A crossed-out cell is stored as 0 and shown as "/"
- Columns, in this order:
  - Down / Up: strictly top → bottom / bottom → top
  - Free, Hand: any order (Hand: every throw uses all 6 dice)
  - Announce: entered like any cell; sets `pendingTip` for the next player
  - Tip: the next player must play the `pendingTip` row in their Tip column on their next turn
    (no conflicts possible: tips only come from the previous player)
  - From middle: starts at Max (going up to 1s) or Min (going down to Yamb)
  - Mandatory: opens when all other columns are full, top → bottom
  - Maximum: any order; only the best possible value for the row, otherwise "/"
    (best values: 5, 10, 15, 20, 25, 30, Max 30, Min 5, Straight 66,
    Triple 38, Full 58, Poker 64, Yamb 80)
- The app does not track throws; the player calls the Announce row at the table
- `pendingTip` lives in the sheet, so it is saved and undoable
- Player limits: 2 to 8
- Tip turn: if pendingTip is set for the current player, the turn opens with a notice ("Tip from <name>: <row>") and the only playable cell is that row in
  their Tip column. Scoring it (or "/") ends the turn and clears pendingTip.

## Flash Yamb
- Same rules, rows and scoring as Yamb
- Columns (in Yamb's order): Down, Free, Up, Announce, Hand, Tip
- Built from the same code: `createYambVariant({ id, name, columns })`; `yamb` and
  `flashYamb` are two calls to it, both registered in `games/index.js`
- Own card in the game picker; rules side adds "Tip: try it with 5 dice for a harder game"
- The app never tracks dice count, so 5 vs 6 dice needs no option

## Undo / redo
- Snapshot-based, generic for all games
- Snapshot = the whole game state (sheet + currentPlayer), stored by reference
- `history = { current, undoStack, redoStack }`
- play: push current onto undoStack, clear redoStack
- undo / redo move states between the two stacks

## Storage
- JSON in localStorage, key `dice-n-fun:current-game` (prefixed because all GitHub Pages
  projects share one origin)
- Saved after every confirmed move
- Saves `version`, `current` and `undoStack`; redoStack is not saved
- Unreadable save or a different version → start fresh (log the error)
- Theme choice saved separately under `dice-n-fun:theme`

## UI
Screens: Welcome → Game picker → Setup → Scoresheet.
`main.js` holds the history and redraws the screen from the state after every change.

- Welcome: sticker logo, "Continue game" (only when a save exists) and "New game",
  day/night switch in the top right
- Game picker: one card per game (name, summary, players, dice). Tap the card to choose it;
  the Rules button flips it; tap the back to flip back. The back never starts a game.
  The list scrolls once there are more cards than fit.
- Setup: name field + Add, ✕ to remove a name, "n / max" counter, game options,
  "starting player is picked at random", Start game
- Header on picker and setup: back button, title, app icon on the right
- Turn bar on scoresheets: app icon = menu button (top left), whose turn it is, undo/redo
- Zonk sheet (top → bottom): player totals with progress bars, "This turn / Throw" panel,
  numpad (with 00 and backspace), then Zonk / + / Bank. The typed number is UI-only.
  Bank and + are disabled when `canEnter` says no; Bank shows the amount it will bank.
- Yamb sheet: icons only (no text) for rows and columns; all columns fit without scrolling.
  Player strip with totals at the top; total at the bottom.
  Cell states: playable (outlined), locked (dimmed), filled, crossed ("/"), computed sums (tinted).
- Yamb input: tapping a cell highlights it (shows its column icon) and its row/column,
  and opens a floating card with a pointer to the cell (below it for upper rows, above it
  for lower rows). The card adapts to the row:
  1–6 → how many dice (1–5); Max/Min → numpad (5–30); Straight → 66 / 56 / 46;
  Triple/Poker/Yamb → pick the face; Full → three-of + pair-of; Maximum column → confirm
  the best value or cross out. Buttons: / (cross out), Cancel, Enter (shows a preview).
  - Game menu (tap the logo on a scoresheet): Rules, Theme | New game
  (asks to confirm, ends the saved game), Quit to welcome (game stays saved).

### Theme
- Light and dark; follows the phone by default (`prefers-color-scheme`)
- The day/night switch overrides it; the last tap wins and is saved
- Colours as CSS variables, redefined for dark mode
- Light: background #EAF4FB, cards #FFFFFF, accent #1F6FC2, text #0E2A3D
- Dark: background #0B1824, cards #14273A, accent #4A9EEB, text #E6F1FA
- Zonk button stays red in both themes; yellow #FFC24B is the only warm accent (logo sparkle)
- Fonts: Bricolage Grotesque (headings, numbers), Inter (body)

## Branding
- Name: Dice'n'Roll
- Logo: "Dice'n'Roll" sticker, where the "o" is a rounded 3D die (faces 1, 2, 3),
  with a dotted bounce trail and a yellow sparkle; light and dark versions
- App icon: a small tilted die + the rounded 3D die on blue (dark version on navy)
- Icon will be exported as the PWA icons in `public/`

## Later
- Zonk option `finalRound`: after someone reaches the target, each remaining player gets
  one turn; highest total wins; a tie is decided by one more turn among the tied players
- Zonk option `exactTarget`: must hit the target exactly; going over = bust (turn scores 0)
- Game menu contents (new game, rules, theme, quit to welcome)
- PWA setup (manifest, service worker via vite-plugin-pwa) and deploy to GitHub Pages
- Save migrations when the save format changes
- Automated tests
- Multiplayer on separate devices (send moves between phones)