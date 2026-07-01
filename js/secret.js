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

  // A full fantasy-dagger silhouette, traced as one continuous outline:
  // diamond pommel -> tapered grip -> flared crossguard wings (through the
  // guardLeft/guardRight stars) -> widening ricasso -> blade tapering to a
  // sharp point (the tip star). All extra points here are purely decorative
  // (not clickable) — they exist only to make the outline actually read as
  // a dagger instead of a stick-figure cross.
  function outlinePoints() {
    return [
      byId.pommel,                    // pommel tip
      { x: 17.6, y: 16.8 },           // pommel, right bulge
      { x: 16.6, y: 19.5 },           // grip neck, right
      { x: 17,   y: 23 },             // grip meets guard, right
      byId.guardRight,                // guard wing tip, right
      { x: 18.5, y: 25.5 },           // ricasso, right
      { x: 17.8, y: 27.5 },           // blade shoulder, right
      { x: 17,   y: 32 },             // blade edge, right
      { x: 16.4, y: 37 },             // blade edge near tip, right
      byId.tip,                       // blade point
      { x: 15.6, y: 37 },             // blade edge near tip, left
      { x: 15,   y: 32 },             // blade edge, left
      { x: 14.2, y: 27.5 },           // blade shoulder, left
      { x: 13.5, y: 25.5 },           // ricasso, left
      byId.guardLeft,                 // guard wing tip, left
      { x: 15,   y: 23 },             // grip meets guard, left
      { x: 15.4, y: 19.5 },           // grip neck, left
      { x: 14.4, y: 16.8 },           // pommel, left bulge
    ];
  }

  function reveal() {
    if (reduceMotion) { fadeAndGo(); return; }

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "constellation-svg");
    svg.setAttribute("width", window.innerWidth);
    svg.setAttribute("height", window.innerHeight);
    document.body.appendChild(svg);

    const px = (pt) => [(pt.x / 100) * window.innerWidth, (pt.y / 100) * window.innerHeight];

    // the dagger's outline, drawn as one continuous stroke
    const d = outlinePoints()
      .map((pt, i) => {
        const [x, y] = px(pt);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ") + " Z";

    const blade = document.createElementNS(SVG_NS, "path");
    blade.setAttribute("d", d);
    blade.setAttribute("class", "constellation-line");
    svg.appendChild(blade);
    const outlineLength = blade.getTotalLength();
    blade.style.strokeDasharray = outlineLength;
    blade.style.strokeDashoffset = outlineLength;
    const outlineDuration = 1.4;
    blade.style.animation = `constellation-draw ${outlineDuration}s ease forwards 0s`;

    // a thin fuller (centre ridge line) down the blade, drawn as a flourish
    // right after the outline finishes
    const [cx1, cy1] = px(byId.guardCenter);
    const [cx2, cy2] = px(byId.tip);
    const fullerLength = Math.hypot(cx2 - cx1, cy2 - cy1);
    const fullerDelay = outlineDuration + 0.1;
    const fullerDuration = 0.5;

    const fuller = document.createElementNS(SVG_NS, "line");
    fuller.setAttribute("x1", cx1);
    fuller.setAttribute("y1", cy1);
    fuller.setAttribute("x2", cx2);
    fuller.setAttribute("y2", cy2);
    fuller.setAttribute("class", "constellation-line constellation-fuller");
    fuller.style.strokeDasharray = fullerLength;
    fuller.style.strokeDashoffset = fullerLength;
    fuller.style.animation = `constellation-draw ${fullerDuration}s ease forwards ${fullerDelay}s`;
    svg.appendChild(fuller);

    const totalDrawTime = fullerDelay + fullerDuration;
    setTimeout(fadeAndGo, totalDrawTime * 1000 + 900);
  }

  function fadeAndGo() {
    galaxy.classList.remove("revealed"); // reuse the same fade used for planet navigation
    setTimeout(() => { window.location.href = "/admin/"; }, 700);
  }

  build();
})();
