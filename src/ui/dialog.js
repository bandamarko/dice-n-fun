// ui/dialog.js
// A small popup with a title, a message and buttons. Back closes it like "Cancel".
// Reused for "needs 2–8 players", "Leave the game?", "Start a new game?" and so on.

import { openOverlay } from "./router.js";

// actions: [{ label, kind: "primary" | "secondary" | "danger", onClick }]
// Every button closes the dialog first, then runs its onClick.
export function showDialog(root, { title, message, actions }) {
  const layer = document.createElement("div");
  layer.className = "dialog-layer";

  const box = document.createElement("div");
  box.className = "dialog";
  box.setAttribute("role", "alertdialog");
  box.setAttribute("aria-modal", "true");

  const heading = document.createElement("h2");
  heading.className = "dialog-title";
  heading.id = `dialog-title-${Date.now()}`;
  heading.textContent = title;
  box.setAttribute("aria-labelledby", heading.id);
  box.append(heading);

  if (message) {
    const text = document.createElement("p");
    text.className = "dialog-message";
    text.textContent = message;
    box.append(text);
  }

  const dismiss = openOverlay(() => layer.remove());

  const buttons = document.createElement("div");
  buttons.className = "dialog-actions";
  for (const action of actions) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `dialog-button dialog-${action.kind ?? "secondary"}`;
    button.textContent = action.label;
    button.addEventListener("click", () => {
      dismiss();
      action.onClick?.();
    });
    buttons.append(button);
  }
  box.append(buttons);

  // Tapping the dimmed area outside the box counts as Cancel
  layer.addEventListener("click", (event) => {
    if (event.target === layer) dismiss();
  });

  layer.append(box);
  root.append(layer);
  buttons.querySelector("button")?.focus();
}