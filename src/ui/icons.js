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

export const LOGO_DIE = logoSvg;
export const BOLT = boltSvg;
export const FLIP = flipSvg;
export const PLAY = playSvg;
export const BACK = backSvg;
export const SUN = sunSvg;
export const MOON = moonSvg;

// The app icon is often on screen more than once (header, game menu). Its clipPath
// needs a unique id per copy, or every copy would point at the first one's clip.
let iconCount = 0;
export function appIcon() {
  return appIconSvg.replaceAll("app-icon-clip", `app-icon-clip-${++iconCount}`);
}