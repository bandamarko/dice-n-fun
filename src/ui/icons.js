// ui/icons.js
// One place for every SVG the screens use. The files live in src/assets/;
// "?raw" makes Vite import a file's contents as a string, so the SVG ends up
// inline in the page and CSS (theme colors) can style it.

import logoSvg from "../assets/logo.svg?raw";
import appIconSvg from "../assets/app-icon.svg?raw";
import boltSvg from "../assets/bolt.svg?raw";
import flipSvg from "../assets/flip.svg?raw";
import playSvg from "../assets/play.svg?raw";
import backSvg from "../assets/back.svg?raw";
import sunSvg from "../assets/sun.svg?raw";
import moonSvg from "../assets/moon.svg?raw";
import gripSvg from "../assets/grip.svg?raw";
import closeSvg from "../assets/close.svg?raw";
import undoSvg from "../assets/undo.svg?raw";
import redoSvg from "../assets/redo.svg?raw";
import backspaceSvg from "../assets/backspace.svg?raw";
import bookSvg from "../assets/book.svg?raw";
import plusSvg from "../assets/plus.svg?raw";
import exitSvg from "../assets/exit.svg?raw";
import chevronSvg from "../assets/chevron.svg?raw";
import halfmoonSvg from "../assets/halfmoon.svg?raw";

export const LOGO_DIE = logoSvg;
export const BOLT = boltSvg;
export const FLIP = flipSvg;
export const PLAY = playSvg;
export const BACK = backSvg;
export const SUN = sunSvg;
export const MOON = moonSvg;
export const GRIP = gripSvg;
export const CLOSE = closeSvg;
export const UNDO = undoSvg;
export const REDO = redoSvg;
export const BACKSPACE = backspaceSvg;
export const BOOK = bookSvg;
export const PLUS = plusSvg;
export const EXIT = exitSvg;
export const CHEVRON = chevronSvg;
export const HALFMOON = halfmoonSvg;

// The app icon is often on screen more than once (header, game menu). Its clipPath
// needs a unique id per copy, or every copy would point at the first one's clip.
let iconCount = 0;
export function appIcon() {
  return appIconSvg.replaceAll("app-icon-clip", `app-icon-clip-${++iconCount}`);
}