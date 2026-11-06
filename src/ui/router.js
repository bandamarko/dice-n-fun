// ui/router.js
// One page, many screens. A screen is a function show(root, params) that builds
// its content inside root. The router also owns the phone's back button: spare
// history entries ("catchers") sit on top of the app's own entry, so pressing back
// lands in onBack instead of leaving the app.
//
// Browsers ignore history entries a page adds without the user touching it
// (Chrome's back button skips them, to stop sites from trapping people). So catchers
// are only added while a tap or key press is being handled, never inside onBack.
// Each tap tops them up to as many as back could need from that moment.

const screens = {};
const stack = [];        // screens you can walk back through; stack[0] is the first screen
const overlays = [];     // close functions of open overlays; the last one is on top
let root = null;
let backHandler = null;  // a screen can take over back (the scoresheet asks "Leave the game?")
let catchers = 0;        // spare history entries currently above the app's own entry
let ignorePops = 0;      // pops we caused ourselves while removing spare entries
let tapping = false;     // true while a tap or key press is being handled
let handlingBack = false;

export function defineScreens(map) {
    Object.assign(screens, map);
}

export function startRouter(container, first) {
    if (!container) throw new Error('startRouter: container not found (is <div id="app"> in index.html?)');
    root = container;
    history.replaceState({ dicenroll: "base" }, "");
    window.addEventListener("popstate", onBack);
    for (const type of ["click", "keydown"]) window.addEventListener(type, onTap, true);
    stack.push({ name: first, params: {} });
    render();
}

// Open a screen on top of the current one.
// { fresh: true } puts it right above the first screen (used when a game starts).
export function go(name, params = {}, { fresh = false } = {}) {
    if (fresh) stack.length = 1;
    stack.push({ name, params });
    render();
}

export function home() {
    stack.length = 1;
    render();
}

// For on-screen back arrows: behaves exactly like the phone's back button
export function back() {
    history.back();
}

export function setBackHandler(handler) {
    backHandler = handler;
    sync();
}

// Call when an overlay opens, with a function that removes it.
// Returns dismiss(): call it when the overlay closes itself (Cancel, Enter, ...).
export function openOverlay(close) {
    overlays.push(close);
    sync();
    return function dismiss() {
        const i = overlays.indexOf(close);
        if (i === -1) return;
        overlays.splice(i, 1);
        close();
        sync();
    };
}

// Runs first for every click and key press (capture phase), before the button's own handler
function onTap() {
    tapping = true;
    setTimeout(() => { tapping = false; }, 0); // after this event has been fully handled
    sync();
}

// How many back presses should stay inside the app from here.
// The leave guard counts twice: one back opens its popup, the next closes it.
function needed() {
    return overlays.length + (backHandler ? 2 : 0) + (stack.length - 1);
}

function sync() {
    const want = needed();
    if (catchers > want) {
        ignorePops++;
        history.go(want - catchers); // drop the spare entries we no longer need
        catchers = want;
    } else if (catchers < want && tapping && !handlingBack) {
        while (catchers < want) {
            history.pushState({ dicenroll: "catch" }, "");
            catchers++;
        }
    }
}

function render() {
    overlays.length = 0; // overlays live inside root and disappear with the old screen
    backHandler = null;
    const { name, params } = stack.at(-1);
    root.replaceChildren();
    screens[name](root, params);
    sync();
}

function onBack() {
    tapping = false; // a back press is never part of a tap, even one that just happened
    if (ignorePops > 0) {
        ignorePops--;
        return;
    }
    catchers = Math.max(0, catchers - 1); // the browser just stepped back one entry

    if (overlays.length === 0 && !backHandler && stack.length === 1) {
        history.back(); // nothing to do in the app: keep going back and leave
        return;         // (this also skips entries left over from before a reload)
    }

    handlingBack = true;
    if (overlays.length > 0) overlays.pop()();     // 1. close the top overlay
    else if (backHandler) backHandler();           // 2. let the screen decide (the leave popup)
    else { stack.pop(); render(); }                // 3. previous screen
    handlingBack = false;
    sync(); // may drop spare entries; new ones wait for the next tap
}