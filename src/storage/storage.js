const STORAGE_KEY = "dice-n-fun:current-game";
const SAVE_VERSION = 1;

export function saveGame(history) {
  const data = {
    version: SAVE_VERSION,
    current: history.current,
    undoStack: history.undoStack,   // redo is deliberately not saved
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Could not save the game:", error);
  }
}

export function loadGame() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (!text) return null;                          // nothing saved yet

    const data = JSON.parse(text);
    if (data.version !== SAVE_VERSION) return null;  // old format: start fresh for now

    return { current: data.current, undoStack: data.undoStack ?? [], redoStack: [] };
  } catch (error) {
    console.error("Saved game could not be read, starting fresh:", error);
    return null;
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Could not clear the saved game:", error);
  }
}