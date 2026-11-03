# Dice'n'Fun: design decisions

A score-tracking web app for physical dice games (dice are thrown at the table,
the app tracks scores). Pass-and-play on one device.

## Platform and tooling
- Plain HTML, CSS and JavaScript (no framework), built with Vite
- Will become a PWA: installable on Android and iOS from the browser, works offline
- Free to run: static files only, no backend; to be hosted on GitHub Pages
- Develop on localhost; `npm run dev -- --host` to test on a phone over Wi-Fi

## Project structure
```
src/
  main.js              entry point: load a saved game or show setup
  games/
    index.js           registry: getGame(id), gameList
    zonk.js            Zonk definition
    yamb.js            Yamb definition (not written yet)
  state/
    game.js            createGame, playMove
    history.js         undo/redo
  storage/
    storage.js         saveGame, loadGame, clearGame
  ui/
    setup.js           new game screen
    turnBar.js         current player, undo/redo buttons
    sheets/
      zonk.js          Zonk scoresheet UI
      yamb.js          Yamb scoresheet UI
  style.css
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
- `id`, `name`, `defaultOptions`
- `createSheet(players, options)`: empty sheet in this game's shape
- `canEnter(sheet, player, entry)`: is this entry allowed?
- `applyEntry(sheet, player, entry)`: returns `{ sheet, turnEnded }`
- `computeTotals(sheet)`: list of totals per player
- `isFinished(sheet)`

Adding a game = one new file in `games/` + registering it in `games/index.js`.

`playMove(state, entry)` always plays for `currentPlayer`, throws if the game is finished
or the entry isn't allowed, and moves to the next player when `turnEnded` is true.

## Zonk (default mode)
- Options: `target` (default 5000), chosen at setup
- Sheet: `{ options, banked: [[...], [...]], turn: { subtotal, plusUsed } }`
- Entries: `{ type: "plus", points }`, `{ type: "bank", points }`, `{ type: "zonk" }`
- Before the first + in a turn, points must be ≥ 300 (applies every turn)
- After a +, any positive amount is allowed
- plus: adds points to the turn subtotal, turn continues (all dice scored)
- bank: records subtotal + points for the player, turn ends
- zonk: records 0 for the player, turn ends
- The game ends immediately when a player's total reaches the target (≥)
- UI: numpad + backspace for typing; the typed number is UI-only (not saved, not undoable).
  Bank and + are disabled when `canEnter` says no.

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

## Later
- Zonk option `finalRound`: after someone reaches the target, each remaining player gets
  one turn; highest total wins; a tie is decided by one more turn among the tied players
- Zonk option `exactTarget`: must hit the target exactly; going over = bust (turn scores 0)
- Yamb: own rules and scoring values
- PWA setup (manifest, service worker via vite-plugin-pwa) and deploy to GitHub Pages
- Save migrations when the save format changes
- Automated tests
- Multiplayer on separate devices (send moves between phones)