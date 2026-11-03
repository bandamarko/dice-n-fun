import { playMove } from "./game.js";

export function createHistory(game) {
  return { current: game, undoStack: [], redoStack: [] };
}

export function play(history, entry) {
  return {
    current: playMove(history.current, entry),
    undoStack: [...history.undoStack, history.current],
    redoStack: [],                      // a new move wipes redo
  };
}

export function undo(history) {
  if (!canUndo(history)) return history;
  return {
    current: history.undoStack.at(-1),
    undoStack: history.undoStack.slice(0, -1),
    redoStack: [...history.redoStack, history.current],
  };
}

export function redo(history) {
  if (!canRedo(history)) return history;
  return {
    current: history.redoStack.at(-1),
    undoStack: [...history.undoStack, history.current],
    redoStack: history.redoStack.slice(0, -1),
  };
}

export const canUndo = (history) => history.undoStack.length > 0;
export const canRedo = (history) => history.redoStack.length > 0;