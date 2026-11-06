// ui/gameMenu.js
// The menu behind the logo on every scoresheet: Rules, Theme | New game, Quit to welcome.
// It floats under the logo; tapping outside, or back, closes it.

import { clearGame } from "../storage/storage.js";
import { openOverlay, home, go } from "./router.js";
import { showDialog } from "./dialog.js";
import { el, button } from "./dom.js";
import { toggleTheme, getTheme } from "./theme.js";
import { themeSwitchPicture } from "./themeSwitch.js";
import { BOOK, HALFMOON, PLUS, EXIT, CHEVRON, BACK, BOLT } from "./icons.js";

function menuItem({ icon, title, subtitle, end, onClick, role = "menuitem" }) {
  const item = button("menu-item", { onClick });
  item.setAttribute("role", role);
  const tile = el("span", "menu-item-icon");
  tile.innerHTML = icon;
  const text = el("span", "menu-item-text");
  const sub = el("span", "menu-item-subtitle", subtitle);
  text.append(el("span", "menu-item-title", title), sub);
  item.append(tile, text);
  if (end) item.append(end);
  return { item, sub };
}

export function openGameMenu(root, game) {
  const layer = el("div", "menu-layer");
  const panel = el("div", "menu-panel");
  panel.setAttribute("role", "menu");
  panel.setAttribute("aria-label", "Game menu");
  layer.append(panel);

  const dismiss = openOverlay(() => layer.remove());
  layer.addEventListener("click", (event) => {
    if (event.target === layer) dismiss();
  });

  function showMain() {
    panel.className = "menu-panel";
    const rules = menuItem({ icon: BOOK, title: "Rules", subtitle: `How ${game.name} works`, onClick: showRules });
    const chevron = el("span", "menu-item-end");
    chevron.innerHTML = CHEVRON;
    rules.item.append(chevron);

    const theme = menuItem({
      icon: HALFMOON,
      title: "Theme",
      subtitle: getTheme() === "dark" ? "Dark" : "Light",
      end: themeSwitchPicture(),
      role: "menuitemcheckbox",
      onClick: () => {
        toggleTheme();
        theme.sub.textContent = getTheme() === "dark" ? "Dark" : "Light";
        theme.item.setAttribute("aria-checked", String(getTheme() === "dark"));
      },
    });
    theme.item.setAttribute("aria-checked", String(getTheme() === "dark"));

    const newGame = menuItem({
      icon: PLUS,
      title: "New game",
      subtitle: "Ends this game",
      onClick: () => {
        dismiss();
        showDialog(root, {
          title: "Start a new game?",
          message: `This ${game.name} game ends and can't be continued. You'll pick a game and players again.`,
          actions: [
            { label: "Keep playing", kind: "secondary" },
            { label: "New game", kind: "danger", onClick: () => { clearGame(); home(); go("picker"); } },
          ],
        });
      },
    });

    const quit = menuItem({ icon: EXIT, title: "Quit to welcome", subtitle: "Your game stays saved", onClick: () => { dismiss(); home(); } });

    panel.replaceChildren(rules.item, theme.item, el("div", "menu-divider"), newGame.item, quit.item);
    rules.item.focus();
  }

  function showRules() {
    panel.className = "menu-panel menu-panel-rules";
    const head = el("div", "menu-rules-head");
    const backButton = button("icon-button", { icon: BACK, label: "Back to menu", onClick: showMain });
    const title = el("h2", "menu-rules-title", `${game.name} rules`);
    head.append(backButton, title);

    const players = `${game.minPlayers}–${game.maxPlayers} players · ${game.dice} dice`;
    const facts = el("p", "menu-rules-facts", game.rules.extra ? `${players} · ${game.rules.extra}` : players);
    const list = el("ul", "menu-rules-list");
    for (const rule of game.rules.bullets) list.append(el("li", "", rule));
    panel.replaceChildren(head, facts, list);

    if (game.rules.tip) {
      const tip = el("p", "menu-rules-tip");
      tip.innerHTML = BOLT;
      tip.append(game.rules.tip);
      panel.append(tip);
    }
    backButton.focus();
  }

  showMain();
  root.append(layer);
}