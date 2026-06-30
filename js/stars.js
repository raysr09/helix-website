/* ===========================================================
   stars.js — Procedural animated starfield for the galaxy.
   Draws ~300 stars with gentle parallax drift on mouse move.
   Exposes nothing global except it self-starts on DOMContentLoaded.
   =========================================================== */
(function () {
  "use strict";

  const canvas = document.getElementById("star-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let stars = [];
  let w = 0, h = 0;
  let parallaxX = 0, parallaxY = 0;        // current offset
  let targetX = 0, targetY = 0;            // where the mouse wants it

  const STAR_COUNT = 300;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      // depth 0.3 (far, small, dim) .. 1 (near, big, bright)
      const depth = 0.3 + Math.random() * 0.7;
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        depth,
        radius: depth * 1.5,
        baseAlpha: 0.25 + depth * 0.6,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.01 + Math.random() * 0.03,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // ease parallax toward target
    parallaxX += (targetX - parallaxX) * 0.05;
    parallaxY += (targetY - parallaxY) * 0.05;

    for (const s of stars) {
      s.twinkle += s.twinkleSpeed;
      const alpha = s.baseAlpha * (0.7 + 0.3 * Math.sin(s.twinkle));
      const px = s.x + parallaxX * s.depth;
      const py = s.y + parallaxY * s.depth;

      ctx.beginPath();
      ctx.arc(px, py, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 230, 255, ${alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  if (!reduceMotion) {
    window.addEventListener("mousemove", (e) => {
      // map mouse position to a small parallax shift
      targetX = (e.clientX / w - 0.5) * -40;
      targetY = (e.clientY / h - 0.5) * -40;
    });
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
})();
