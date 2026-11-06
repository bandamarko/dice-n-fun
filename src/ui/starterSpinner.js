// ui/starterSpinner.js
// Shows who goes first: names roll through a slot window, slow down and stop on the
// starter. createGame already picked the starter at random; this only reveals it.
// Tap to skip the spin. Back (or "Let's play") closes it. No re-spins.

import { openOverlay } from "./router.js";
import { el, button } from "./dom.js";

const ROW_HEIGHT = 64;   // must match .spinner-name height in style.css
const SPIN_MS = 2800;
const LAPS = 6;          // how many times the whole list rolls past before stopping

export function showStarterSpinner(root, { players, starter, onClose }) {
  const layer = el("div", "spinner-layer");
  const box = el("div", "spinner");
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Who goes first");

  const title = el("h2", "spinner-title", "Who goes first?");
  const windowBox = el("div", "spinner-window");
  const reel = el("ol", "spinner-reel");
  reel.setAttribute("aria-hidden", "true");

  // The reel: the names repeated LAPS times, ending with the starter in the middle row
  const finalIndex = LAPS * players.length + starter;
  for (let i = 0; i <= finalIndex + 1; i++) {
    reel.append(el("li", "spinner-name", players[i % players.length]));
  }
  windowBox.append(reel);

  const result = el("p", "spinner-result");
  result.setAttribute("aria-live", "polite");
  const play = button("button-primary spinner-play", { text: "Let's play" });
  play.hidden = true;
  const skipHint = el("p", "spinner-hint", "Tap to skip");

  box.append(title, windowBox, result, play, skipHint);
  layer.append(box);
  root.append(layer);

  const dismiss = openOverlay(() => {
    layer.remove();
    onClose?.();
  });
  play.addEventListener("click", () => dismiss());

  // The middle row of the 3-row window is the "winner" row
  const endY = -(finalIndex - 1) * ROW_HEIGHT;
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    reel.style.transition = "none";
    reel.style.transform = `translateY(${endY}px)`;
    reel.children[finalIndex].classList.add("is-chosen");
    result.textContent = `${players[starter]} starts!`;
    skipHint.hidden = true;
    play.hidden = false;
    play.focus();
  }

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return finish();

  // Start one row above the first name, then let CSS animate down to the end
  reel.style.transform = `translateY(${ROW_HEIGHT}px)`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      reel.style.transition = `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.7, 0.18, 1)`;
      reel.style.transform = `translateY(${endY}px)`;
    });
  });
  reel.addEventListener("transitionend", finish, { once: true });
  windowBox.addEventListener("click", finish);
  layer.addEventListener("click", (event) => {
    if (!finished && event.target !== play) finish();
  });
}