// ui/dom.js
// Tiny helpers every screen uses to build its HTML.

// el("button", "name-add", "Add") → <button class="name-add">Add</button>
// Text goes in with textContent, so player names can never inject HTML.
export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// A <button type="button"> with an optional SVG icon and/or text label
export function button(className, { icon, text, label, onClick } = {}) {
  const node = el("button", className);
  node.type = "button";
  if (icon) node.innerHTML = icon;
  if (text !== undefined) node.append(text);
  if (label) node.setAttribute("aria-label", label);
  if (onClick) node.addEventListener("click", onClick);
  return node;
}