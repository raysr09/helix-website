/* ===========================================================
   galaxy.js — Builds the galaxy from data/planets.js.
   Each creative world is a glowing nebula cloud drifting in the
   starfield. Clicking a nebula opens a wormhole (a short tunnel
   effect in that world's colour) and travels to its page.
   =========================================================== */
(function () {
  "use strict";

  const galaxy = document.getElementById("galaxy");
  const layer = document.getElementById("nebula-layer");
  if (!galaxy || !layer || typeof WORLDS === "undefined") return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let travelling = false;

  function build() {
    WORLDS.forEach((world, i) => {
      const nebula = document.createElement("div");
      nebula.className = "nebula";
      nebula.style.left = world.x + "%";
      nebula.style.top = world.y + "%";
      nebula.style.setProperty("--color", world.color);
      nebula.style.setProperty("--size", world.size + "vmin");
      nebula.style.setProperty("--drift-delay", -(i * 7) + "s");

      // the soft cloud (visual only — clicks pass through it)
      const cloud = document.createElement("div");
      cloud.className = "nebula-cloud";
      nebula.appendChild(cloud);

      // the bright core is the actual click target
      const core = document.createElement("button");
      core.type = "button";
      core.className = "nebula-core";
      core.setAttribute("aria-label", `${world.name} — ${world.tagline}`);
      core.addEventListener("click", () => enter(world));
      nebula.appendChild(core);

      // always-visible name, tagline appears on hover/focus
      const label = document.createElement("div");
      label.className = "nebula-label";
      label.innerHTML =
        `<span class="nebula-name">${world.name}</span>` +
        `<span class="nebula-tagline">${world.tagline}</span>`;
      nebula.appendChild(label);

      layer.appendChild(nebula);
    });
  }

  /* ---------- the wormhole ---------- */

  function enter(world) {
    if (travelling) return;
    travelling = true;

    if (reduceMotion) {
      galaxy.classList.remove("revealed");
      setTimeout(() => { window.location.href = world.page; }, 500);
      return;
    }
    wormhole(world.color, () => { window.location.href = world.page; });
  }

  // A short tunnel effect: coloured streaks rush outward from the centre
  // as if diving into the nebula, ending in a bright flash.
  function wormhole(color, done) {
    const canvas = document.createElement("canvas");
    canvas.className = "wormhole-canvas";
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const cx = w / 2, cy = h / 2;

    // parse the world colour so streaks can carry it
    const n = parseInt(color.replace("#", ""), 16);
    const cr = (n >> 16) & 255, cg = (n >> 8) & 255, cb = n & 255;

    const streaks = [];
    for (let i = 0; i < 220; i++) {
      streaks.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * Math.max(w, h) * 0.5,
        speed: 2 + Math.random() * 4,
        white: Math.random() < 0.4, // mix of white and world-coloured streaks
      });
    }

    const DURATION = 1000;
    const start = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - start) / DURATION);
      const accel = 1 + t * t * 14; // streaks accelerate hard toward the end

      ctx.fillStyle = "rgba(0, 0, 5, 0.32)";
      ctx.fillRect(0, 0, w, h);

      for (const s of streaks) {
        s.dist += s.speed * accel;
        const inner = Math.max(1, s.dist * 0.72);
        const x1 = cx + Math.cos(s.angle) * inner;
        const y1 = cy + Math.sin(s.angle) * inner;
        const x2 = cx + Math.cos(s.angle) * s.dist;
        const y2 = cy + Math.sin(s.angle) * s.dist;
        const alpha = Math.min(1, s.dist / 220) * 0.9;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = s.white
          ? `rgba(235, 242, 255, ${alpha})`
          : `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        if (s.dist > Math.max(w, h)) s.dist = Math.random() * 60;
      }

      // bright core flash grows through the journey
      const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90 + t * t * 500);
      flash.addColorStop(0, `rgba(255, 255, 255, ${0.25 + t * 0.75})`);
      flash.addColorStop(0.4, `rgba(${cr}, ${cg}, ${cb}, ${t * 0.5})`);
      flash.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = flash;
      ctx.fillRect(0, 0, w, h);

      if (t < 1) { requestAnimationFrame(frame); } else { done(); }
    }
    requestAnimationFrame(frame);
  }

  build();
})();
