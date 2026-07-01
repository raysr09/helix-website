/* ===========================================================
   intro.js — "Warp-in" fly-through-space intro.
   Stars streak toward the viewer (accelerating), then decelerate
   and the galaxy fades in. Plays every visit; skippable.
   =========================================================== */
(function () {
  "use strict";

  const intro = document.getElementById("intro");
  const canvas = document.getElementById("warp-canvas");
  const skipBtn = document.getElementById("skip-intro");
  const galaxy = document.getElementById("galaxy");
  if (!intro || !canvas || !galaxy) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w, h, cx, cy;
  let warpStars = [];
  let speed = 0;
  let running = true;
  let startTime = null;
  const DURATION = reduceMotion ? 600 : 3400; // ms

  const STAR_COUNT = reduceMotion ? 60 : 320;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    cx = w / 2;
    cy = h / 2;
  }

  function makeStar() {
    return {
      x: (Math.random() - 0.5) * w,
      y: (Math.random() - 0.5) * h,
      z: Math.random() * w,
      pz: 0,
    };
  }

  function init() {
    resize();
    warpStars = [];
    for (let i = 0; i < STAR_COUNT; i++) warpStars.push(makeStar());
  }

  function frame(t) {
    if (!running) return;
    if (startTime === null) startTime = t;
    const elapsed = t - startTime;
    const progress = Math.min(1, elapsed / DURATION);

    // speed curve: accelerate hard, then ease down near the end
    if (progress < 0.7) {
      speed = easeInQuad(progress / 0.7) * 60 + 4;
    } else {
      speed = (1 - easeOutCubic((progress - 0.7) / 0.3)) * 60 + 2;
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)"; // motion-blur trail
    ctx.fillRect(0, 0, w, h);

    for (const s of warpStars) {
      s.pz = s.z;
      s.z -= speed;
      if (s.z < 1) {
        s.x = (Math.random() - 0.5) * w;
        s.y = (Math.random() - 0.5) * h;
        s.z = w;
        s.pz = s.z;
      }
      const sx = (s.x / s.z) * w + cx;
      const sy = (s.y / s.z) * w + cy;
      const px = (s.x / s.pz) * w + cx;
      const py = (s.y / s.pz) * w + cy;
      const size = Math.max(0.4, (1 - s.z / w) * 3);

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(sx, sy);
      ctx.strokeStyle = `rgba(190, 215, 255, ${1 - s.z / w})`;
      ctx.lineWidth = size;
      ctx.stroke();
    }

    if (progress >= 1) { finish(); return; }
    requestAnimationFrame(frame);
  }

  function easeInQuad(x)  { return x * x; }
  function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

  function finish() {
    if (!running) return;
    running = false;
    // reveal galaxy, fade out intro
    galaxy.classList.add("revealed");
    galaxy.setAttribute("aria-hidden", "false");
    intro.classList.add("done");
    setTimeout(() => intro.remove(), 1200);
  }

  skipBtn && skipBtn.addEventListener("click", finish);
  window.addEventListener("resize", resize);

  init();
  requestAnimationFrame(frame);
})();
