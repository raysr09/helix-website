/* ===========================================================
   secret.js — A hidden constellation gateway to /admin.

   NOTE: this is a fun Easter egg, not real security. The actual
   protection on the admin panel is the Netlify Identity login —
   this just gives you a themed, hidden way to get there. Typing
   /admin directly always keeps working too.

   Five ordinary-looking background stars are secretly clickable.
   Click them in the right order and a dagger-shaped constellation
   draws itself, then the screen fades to the admin login.
   =========================================================== */
(function () {
  "use strict";

  const galaxy = document.getElementById("galaxy");
  const layer = document.getElementById("secret-layer");
  if (!galaxy || !layer) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Fixed points (percentage of viewport) forming a dagger silhouette.
  // Positions are intentionally tucked in the upper-left, away from the
  // title, planets, and the corner UI (Guide link, presence readout).
  const STARS = [
    { id: "pommel",     x: 16, y: 15 },
    { id: "guardLeft",  x: 11, y: 24 },
    { id: "guardRight", x: 21, y: 24 },
    { id: "guardCenter",x: 16, y: 24 },
    { id: "tip",        x: 16, y: 40 },
  ];

  // The secret click order (a visitor must click these, in this order).
  const SECRET_ORDER = ["pommel", "guardLeft", "guardRight", "guardCenter", "tip"];

  // The visual edges to draw once the sequence is completed — independent
  // of click order, so the reveal actually looks like a dagger (a blade
  // through the middle, crossed by a guard).
  const EDGES = [
    ["pommel", "guardCenter"],
    ["guardLeft", "guardRight"],
    ["guardCenter", "tip"],
  ];

  const byId = {};
  let progress = 0;

  function build() {
    STARS.forEach((s) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "secret-star";
      btn.style.left = s.x + "%";
      btn.style.top = s.y + "%";
      btn.style.setProperty("--twinkle-delay", (Math.random() * 3).toFixed(2) + "s");
      btn.setAttribute("aria-hidden", "true");
      btn.tabIndex = -1;
      btn.addEventListener("click", () => onStarClick(s.id));
      layer.appendChild(btn);
      byId[s.id] = { ...s, el: btn };
    });
  }

  function onStarClick(id) {
    if (SECRET_ORDER[progress] === id) {
      progress++;
      if (progress === SECRET_ORDER.length) reveal();
    } else {
      progress = 0; // silent reset — no feedback, keeps the mystery intact
    }
  }

  function reveal() {
    if (reduceMotion) { fadeAndGo(); return; }

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "constellation-svg");
    svg.setAttribute("width", window.innerWidth);
    svg.setAttribute("height", window.innerHeight);

    EDGES.forEach(([fromId, toId], i) => {
      const a = byId[fromId], b = byId[toId];
      const x1 = (a.x / 100) * window.innerWidth;
      const y1 = (a.y / 100) * window.innerHeight;
      const x2 = (b.x / 100) * window.innerWidth;
      const y2 = (b.y / 100) * window.innerHeight;
      const length = Math.hypot(x2 - x1, y2 - y1);

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("class", "constellation-line");
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
      line.style.animation = `constellation-draw 0.5s ease forwards ${i * 0.25}s`;
      svg.appendChild(line);
    });

    document.body.appendChild(svg);
    setTimeout(fadeAndGo, EDGES.length * 250 + 1200);
  }

  function fadeAndGo() {
    galaxy.classList.remove("revealed"); // reuse the same fade used for planet navigation
    setTimeout(() => { window.location.href = "/admin/"; }, 700);
  }

  build();
})();
