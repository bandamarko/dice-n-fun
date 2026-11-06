// ui/end.js
// The end screen: the trophy card (winner or tie), the ranking with score bars,
// and Play again / Done. The game stays saved until you leave this screen,
// so a refresh here still shows the results.

import { getGame } from "../games/index.js";
import { getWinners } from "../state/game.js";
import { loadGame, clearGame } from "../storage/storage.js";
import { go, home, setBackHandler } from "./router.js";
import { prepareSetup } from "./setup.js";
import { el, button } from "./dom.js";
import { TROPHY } from "./icons.js";
import { burstConfetti } from "./confetti.js";

const number = (n) => n.toLocaleString("en-US");

// ["Ana"] → "Ana", ["Ana", "Marko"] → "Ana & Marko", three → "Ana, Marko & Luka"
function joinNames(list) {
  return list.length < 2 ? list.join("") : `${list.slice(0, -1).join(", ")} & ${list.at(-1)}`;
}

export function showEnd(root, params = {}) {
  const saved = loadGame();
  if (!saved) return home();
  const state = saved.current;
  const game = getGame(state.gameId);
  const totals = game.computeTotals(state.sheet);
  const winners = getWinners(state);
  const best = Math.max(...totals);

  // Highest first. Tied players share a rank and the next rank is skipped: 1, 1, 3, 4
  const ranking = state.players
    .map((name, i) => ({ name, total: totals[i] }))
    .sort((a, b) => b.total - a.total)
    .map((player, _, all) => ({ ...player, rank: 1 + all.filter((other) => other.total > player.total).length }));

  const done = () => {
    clearGame();
    home();
  };
  const playAgain = () => {
    clearGame();
    prepareSetup(game.id, state.players, state.sheet.options);
    go("setup", { gameId: game.id }, { fresh: true });
  };
  setBackHandler(done); // back leaves the results, just like Done

  const screen = el("main", "end-screen");
  screen.append(
    el("p", "end-game", `${game.name} · game over`),
    trophyCard(ranking, winners, best),
    rankingList(ranking, best),
    actions({ playAgain, done }),
  );
    root.append(screen);

  // Only when the last move just ended the game (not after Continue or a refresh)
  if (params.celebrate) celebrate(screen);
}

// The trophy pops in (CSS), and as it lands the confetti bursts out from behind it
function celebrate(screen) {
  screen.classList.add("is-celebrating");
  const trophy = screen.querySelector(".end-trophy").getBoundingClientRect();
  const origin = { x: trophy.left + trophy.width / 2, y: trophy.top + trophy.height / 2 };
  const css = getComputedStyle(document.documentElement);
  const color = (name) => css.getPropertyValue(name).trim();
  const colors = [color("--bar"), color("--die-top"), color("--die-side"), color("--gold"), color("--gold")]; // gold twice: more of it
  setTimeout(() => burstConfetti(screen, origin, colors), 350);
}

function trophyCard(ranking, winners, best) {
  const card = el("section", "end-card");
  const badge = el("div", "end-trophy");
  badge.innerHTML = TROPHY;

  let title, line;
  if (ranking.length === 1) {
    title = `Well done, ${winners[0]}!`;
    line = "points";
  } else if (winners.length > 1) {
    title = "It's a tie!";
    line = `points each · ${joinNames(winners)} share the win`;
  } else {
    const second = ranking[1].total;
    const runnersUp = ranking.filter((p) => p.total === second).map((p) => p.name);
    title = `${winners[0]} wins!`;
    line = `points · ${number(best - second)} ahead of ${joinNames(runnersUp)}`;
  }

  card.append(badge, el("h1", "end-title", title), el("span", "end-score", number(best)), el("span", "end-line", line));
  return card;
}

function rankingList(ranking, best) {
  const list = el("ol", "end-ranking");
  for (const { name, total, rank } of ranking) {
    const won = rank === 1;
    const row = el("li", won ? "end-row is-winner" : "end-row");

    const medal = el("span", `end-rank rank-${Math.min(rank, 4)}`, String(rank));
    const info = el("div", "end-info");
    const top = el("div", "end-top");
    const right = el("span", "end-right");
    if (!won) right.append(el("span", "end-behind", `−${number(best - total)}`)); // a real minus sign
    right.append(el("span", "end-total", number(total)));
    top.append(el("span", "end-name", name), right);

    const track = el("div", "end-bar");
    const fill = el("div", "end-bar-fill");
    const share = best > 0 ? total / best : 1;
    fill.style.width = `${Math.max(0, Math.min(1, share)) * 100}%`;
    track.append(fill);

    info.append(top, track);
    row.append(medal, info);
    list.append(row);
  }
  return list;
}

// Yamb's "Compare sheets" joins Play again in the top row in the next step
function actions({ playAgain, done }) {
  const box = el("div", "end-actions");
  const row = el("div", "end-actions-row");
  row.append(button("button-primary", { text: "Play again", onClick: playAgain }));
  box.append(row, button("end-done", { text: "Done", onClick: done }));
  return box;
}