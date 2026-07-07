/* ===========================================================
   stars.js — A vast, deep starfield for the galaxy.
   ~450 stars in three depth layers with subtle colour variety,
   gentle autonomous drift, twinkle, mouse parallax, and the
   occasional shooting star. Calm by design.
   =========================================================== */
(function () {
  "use strict";

  const canvas = document.getElementById("star-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let stars = [];
  let meteors = [];
  let w = 0, h = 0;
  let parallaxX = 0, parallaxY = 0;        // current offset
  let targetX = 0, targetY = 0;            // where the mouse wants it
  let nextMeteorAt = performance.now() + 6000;

  const STAR_COUNT = 450;

  // subtle colour palette: mostly white-blue, a few warm ones
  const TINTS = [
    [220, 230, 255],
    [220, 230, 255],
    [200, 215, 255],
    [255, 240, 220],
    [235, 235, 245],
  ];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      // depth 0.2 (far, small, dim) .. 1 (near, big, bright)
      const depth = 0.2 + Math.random() * 0.8;
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        depth,
        radius: 0.3 + depth * 1.4,
        baseAlpha: 0.2 + depth * 0.65,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.008 + Math.random() * 0.025,
        // very slow autonomous drift, so the field feels alive even
        // without the mouse moving
        vx: (Math.random() - 0.5) * 0.02 * depth,
        vy: (Math.random() - 0.5) * 0.02 * depth,
        tint: TINTS[Math.floor(Math.random() * TINTS.length)],
      });
    }
  }

  function spawnMeteor(now) {
    // start somewhere in the top half, streak diagonally down
    const fromLeft = Math.random() < 0.5;
    meteors.push({
      x: fromLeft ? Math.random() * w * 0.4 : w - Math.random() * w * 0.4,
      y: Math.random() * h * 0.35,
      vx: (fromLeft ? 1 : -1) * (4 + Math.random() * 3),
      vy: 2 + Math.random() * 2,
      life: 1,
    });
    // rare: one every 8–16 seconds
    nextMeteorAt = now + 8000 + Math.random() * 8000;
  }

  function draw(now) {
    ctx.clearRect(0, 0, w, h);

    // ease parallax toward target
    parallaxX += (targetX - parallaxX) * 0.05;
    parallaxY += (targetY - parallaxY) * 0.05;

    for (const s of stars) {
      s.twinkle += s.twinkleSpeed;
      if (!reduceMotion) {
        s.x += s.vx;
        s.y += s.vy;
        // wrap around the edges
        if (s.x < 0) s.x += w; else if (s.x > w) s.x -= w;
        if (s.y < 0) s.y += h; else if (s.y > h) s.y -= h;
      }
      const alpha = s.baseAlpha * (0.7 + 0.3 * Math.sin(s.twinkle));
      const px = s.x + parallaxX * s.depth;
      const py = s.y + parallaxY * s.depth;
      const [r, g, b] = s.tint;

      ctx.beginPath();
      ctx.arc(px, py, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fill();
    }

    // shooting stars — occasional, quick, quiet
    if (!reduceMotion) {
      if (now > nextMeteorAt && meteors.length === 0) spawnMeteor(now);
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.016;
        if (m.life <= 0 || m.x < -50 || m.x > w + 50 || m.y > h + 50) {
          meteors.splice(i, 1);
          continue;
        }
        const tailX = m.x - m.vx * 9;
        const tailY = m.y - m.vy * 9;
        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(230, 240, 255, ${0.85 * m.life})`);
        grad.addColorStop(1, "rgba(230, 240, 255, 0)");
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
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
  requestAnimationFrame(draw);
})();
