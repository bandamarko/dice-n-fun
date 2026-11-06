// main.js: connects the screens to the router and starts the app
import "./style.css";
import { startTheme } from "./ui/theme.js";
import { defineScreens, startRouter, go, home, setBackHandler, openOverlay } from "./ui/router.js";
import { showWelcome } from "./ui/welcome.js";
import { showPicker } from "./ui/picker.js";

// --- Temporary placeholders until the real screens exist ---
function button(label, onClick) {
  const b = document.createElement("button");
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
}

function title(text) {
  const h = document.createElement("h1");
  h.textContent = text;
  return h;
}

const placeholders = {
  setup: (root, params) => root.append(title(`Setup: ${params.gameId}`), button("Start", () => go("game", {}, { fresh: true }))),
  game: (root) => {
    root.append(title("Scoresheet"));
    setBackHandler(() => {
      const popup = document.createElement("div");
      const dismiss = openOverlay(() => popup.remove());
      popup.append(
        "Leave the game? It stays saved.",
        button("Keep playing", () => dismiss()),
        button("Leave", () => { dismiss(); home(); }),
      );
      root.append(popup);
    });
  },
};
// ------------------------------------------------------------

defineScreens({
  welcome: showWelcome,
  picker: showPicker,
  ...placeholders,
});

startTheme();
startRouter(document.querySelector("#app"), "welcome");