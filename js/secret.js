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

  // Two extra points (not clickable, purely decorative) used only to give
  // the blade its taper — without these the reveal is just a plus-sign.
  const SHOULDER_RIGHT = { x: 19, y: 30 };
  const SHOULDER_LEFT = { x: 13, y: 30 };

  const SVG_NS = "http://www.w3.org/2000/svg";
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

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "constellation-svg");
    svg.setAttribute("width", window.innerWidth);
    svg.setAttribute("height", window.innerHeight);
    document.body.appendChild(svg);

    const px = (pt) => [(pt.x / 100) * window.innerWidth, (pt.y / 100) * window.innerHeight];
    let delay = 0;

    // grip (pommel -> guardCenter) and crossguard (guardLeft -> guardRight)
    // are simple straight strokes, drawn first.
    [
      [byId.pommel, byId.guardCenter],
      [byId.guardLeft, byId.guardRight],
    ].forEach(([a, b]) => {
      const [x1, y1] = px(a);
      const [x2, y2] = px(b);
      const length = Math.hypot(x2 - x1, y2 - y1);

      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("class", "constellation-line");
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
      line.style.animation = `constellation-draw 0.4s ease forwards ${delay}s`;
      svg.appendChild(line);
      delay += 0.3;
    });

    // the blade itself: a tapered outline from the crossguard down to the
    // tip, through two shoulder points — this is what actually reads as
    // a dagger rather than a plus sign.
    const bladePoints = [byId.guardCenter, SHOULDER_RIGHT, byId.tip, SHOULDER_LEFT, byId.guardCenter].map(px);
    const d = bladePoints.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

    const blade = document.createElementNS(SVG_NS, "path");
    blade.setAttribute("d", d);
    blade.setAttribute("class", "constellation-line");
    svg.appendChild(blade);
    const bladeLength = blade.getTotalLength();
    blade.style.strokeDasharray = bladeLength;
    blade.style.strokeDashoffset = bladeLength;
    blade.style.animation = `constellation-draw 0.9s ease forwards ${delay}s`;
    delay += 0.9;

    setTimeout(fadeAndGo, delay * 1000 + 900);
  }

  function fadeAndGo() {
    galaxy.classList.remove("revealed"); // reuse the same fade used for planet navigation
    setTimeout(() => { window.location.href = "/admin/"; }, 700);
  }

  build();
})();
