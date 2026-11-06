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
import col_downSvg from "../assets/col-down.svg?raw";
import col_freeSvg from "../assets/col-free.svg?raw";
import col_upSvg from "../assets/col-up.svg?raw";
import col_announceSvg from "../assets/col-announce.svg?raw";
import col_handSvg from "../assets/col-hand.svg?raw";
import col_tipSvg from "../assets/col-tip.svg?raw";
import col_middleSvg from "../assets/col-middle.svg?raw";
import col_mandatorySvg from "../assets/col-mandatory.svg?raw";
import col_maximumSvg from "../assets/col-maximum.svg?raw";
import row_maxSvg from "../assets/row-max.svg?raw";
import row_minSvg from "../assets/row-min.svg?raw";
import row_straightSvg from "../assets/row-straight.svg?raw";
import row_tripleSvg from "../assets/row-triple.svg?raw";
import row_fullSvg from "../assets/row-full.svg?raw";
import row_pokerSvg from "../assets/row-poker.svg?raw";
import row_yambSvg from "../assets/row-yamb.svg?raw";
import die_1Svg from "../assets/die-1.svg?raw";
import die_2Svg from "../assets/die-2.svg?raw";
import die_3Svg from "../assets/die-3.svg?raw";
import die_4Svg from "../assets/die-4.svg?raw";
import die_5Svg from "../assets/die-5.svg?raw";
import die_6Svg from "../assets/die-6.svg?raw";
import trophySvg from "../assets/trophy.svg?raw";

export const TROPHY = trophySvg;
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
// Yamb: one icon per column and per row, keyed by the names games/yamb.js uses
export const COLUMN_ICONS = {
  down: col_downSvg, free: col_freeSvg, up: col_upSvg, announce: col_announceSvg, hand: col_handSvg,
  tip: col_tipSvg, middle: col_middleSvg, mandatory: col_mandatorySvg, maximum: col_maximumSvg,
};
export const DICE = [null, die_1Svg, die_2Svg, die_3Svg, die_4Svg, die_5Svg, die_6Svg]; // DICE[3] = three pips
export const ROW_ICONS = {
  ones: die_1Svg, twos: die_2Svg, threes: die_3Svg, fours: die_4Svg, fives: die_5Svg, sixes: die_6Svg,
  max: row_maxSvg, min: row_minSvg, straight: row_straightSvg, triple: row_tripleSvg,
  full: row_fullSvg, poker: row_pokerSvg, yamb: row_yambSvg,
};

// The app icon is often on screen more than once (header, game menu). Its clipPath
// needs a unique id per copy, or every copy would point at the first one's clip.
let iconCount = 0;
export function appIcon() {
  return appIconSvg.replaceAll("app-icon-clip", `app-icon-clip-${++iconCount}`);
}