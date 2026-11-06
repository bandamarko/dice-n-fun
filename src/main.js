// main.js: temporary placeholder screens to try the router; the real screens replace them
import "./style.css";
import { startTheme, toggleTheme } from "./ui/theme.js";
import { defineScreens, startRouter, go, home, setBackHandler, openOverlay } from "./ui/router.js";

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

defineScreens({
  welcome: (root) => root.append(
    title("Welcome"),
    button("Play", () => go("picker")),
    button("Switch theme", () => toggleTheme()),
  ),
  picker: (root) => root.append(title("Pick a game"), button("Yamb", () => go("setup", { gameId: "yamb" }))),
  setup: (root, params) => root.append(title(`Setup: ${params.gameId}`), button("Start", () => go("sheet", {}, { fresh: true }))),
  sheet: (root) => {
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
});

startTheme();
startRouter(document.querySelector("#app"), "welcome");