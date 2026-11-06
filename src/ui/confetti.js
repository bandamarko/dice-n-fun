// ui/confetti.js
// A one-time confetti burst drawn on a <canvas> laid over the screen.
// Each piece is a small rectangle with a speed, a spin and a "tilt" that makes it
// look like a paper strip turning over as it falls.

const COUNT = 140;
const DURATION = 5000;   // ms until the canvas is removed
const FADE = 0.25;       // the last 25% of that time the pieces fade out
const GRAVITY = 0.1;     // added to the falling speed every frame (px per frame)
const DRAG = 0.975;      // speed kept every frame, so pieces float down like paper

// origin: { x, y } in screen pixels, where the burst starts
// colors: CSS colors the pieces are painted with (repeat one to make it more common)
export function burstConfetti(container, origin, colors) {
  if (!container.isConnected) return; // the screen was left before the burst started
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "confetti";
  canvas.setAttribute("aria-hidden", "true");
  container.append(canvas);

  // A sharp canvas: draw at the phone's real pixel density
  const ratio = window.devicePixelRatio || 1;
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);

  const random = (min, max) => min + Math.random() * (max - min);
  const pieces = Array.from({ length: COUNT }, () => {
    const angle = -Math.PI / 2 + random(-0.55, 0.55) * Math.PI; // mostly upwards, fanned out wide
    const speed = random(6, 15);
    return {
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      width: random(6, 11),
      height: random(9, 16),
      color: colors[Math.floor(Math.random() * colors.length)],
      spin: random(0, Math.PI * 2),
      spinSpeed: random(-0.2, 0.2),
      tilt: random(0, Math.PI * 2),
      tiltSpeed: random(0.08, 0.2),
    };
  });

  const start = performance.now();
  let last = start;

  function frame(now) {
    // Leaving the screen removes the canvas; stop drawing then
    if (!canvas.isConnected) return;
    const elapsed = now - start;
    if (elapsed >= DURATION) return canvas.remove();

    // f = how many 60 fps frames have passed, so the speed is the same on 60 Hz and 120 Hz phones
    const f = Math.min(3, (now - last) / (1000 / 60));
    last = now;
    const progress = elapsed / DURATION;
    ctx.globalAlpha = progress < 1 - FADE ? 1 : (1 - progress) / FADE;
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (const p of pieces) {
      p.vx *= DRAG ** f;
      p.vy = p.vy * DRAG ** f + GRAVITY * f;
      p.x += (p.vx + Math.sin(p.tilt) * 0.8) * f; // the sideways sway of falling paper
      p.y += p.vy * f;
      p.spin += p.spinSpeed * f;
      p.tilt += p.tiltSpeed * f;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin);
      ctx.scale(1, Math.cos(p.tilt)); // squashing to 0 and back looks like the strip turning over
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      ctx.restore();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}