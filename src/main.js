// main.js: connects the screens to the router and starts the app
import "./style.css";
import { startTheme } from "./ui/theme.js";
import { defineScreens, startRouter } from "./ui/router.js";
import { showWelcome } from "./ui/welcome.js";
import { showPicker } from "./ui/picker.js";
import { showSetup } from "./ui/setup.js";
import { showGame } from "./ui/game.js";
import { showEnd } from "./ui/end.js";

defineScreens({
  welcome: showWelcome,
  picker: showPicker,
  setup: showSetup,
  game: showGame,
  end: showEnd,
});

startTheme();
startRouter(document.querySelector("#app"), "welcome");