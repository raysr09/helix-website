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
    // every secret star flares when touched — correct or not, so the
    // feedback never gives the order away
    flare(byId[id].el);
    if (SECRET_ORDER[progress] === id) {
      progress++;
      if (progress === SECRET_ORDER.length) reveal();
    } else {
      progress = 0; // wrong star: progress resets, the flare tells nothing
    }
  }

  function flare(el) {
    el.classList.remove("flare");
    void el.offsetWidth; // restart the animation on rapid re-clicks
    el.classList.add("flare");
    setTimeout(() => el.classList.remove("flare"), 620);
  }

  // A full fantasy-dagger silhouette, traced as one continuous outline:
  // diamond pommel -> tapered grip -> flared crossguard wings -> widening
  // ricasso -> blade tapering to a sharp point.
  //
  // Each point is defined parametrically as { t, w }: `t` is how far along
  // the pommel-to-tip spine it sits (0 = pommel, 1 = tip), and `w` is how
  // far out from the spine it sits, as a multiple of the guard's own
  // half-width (negative = left side). Deriving every point this way from
  // the *actual measured* positions of the pommel/guard/tip stars — rather
  // than from raw percentage-of-viewport coordinates — means the shape
  // keeps its proportions no matter the window size or aspect ratio.
  const OUTLINE_SPEC = [
    { t: 0,     w: 0     },  // pommel tip
    { t: 0.072, w: 0.32  },  // pommel, right bulge
    { t: 0.18,  w: 0.12  },  // grip neck, right
    { t: 0.32,  w: 0.20  },  // grip meets guard, right
    { t: 0.36,  w: 1.0   },  // guard wing tip, right
    { t: 0.42,  w: 0.50  },  // ricasso, right
    { t: 0.50,  w: 0.36  },  // blade shoulder, right
    { t: 0.68,  w: 0.20  },  // blade edge, right
    { t: 0.88,  w: 0.08  },  // blade edge near tip, right
    { t: 1.0,   w: 0     },  // blade point
    { t: 0.88,  w: -0.08 },  // blade edge near tip, left
    { t: 0.68,  w: -0.20 },  // blade edge, left
    { t: 0.50,  w: -0.36 },  // blade shoulder, left
    { t: 0.42,  w: -0.50 },  // ricasso, left
    { t: 0.36,  w: -1.0  },  // guard wing tip, left
    { t: 0.32,  w: -0.20 },  // grip meets guard, left
    { t: 0.18,  w: -0.12 },  // grip neck, left
    { t: 0.072, w: -0.32 },  // pommel, left bulge
  ];

  function center(el) {
    const r = el.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  }

  function reveal() {
    if (reduceMotion) { fadeAndGo(); return; }

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "constellation-svg");
    svg.setAttribute("width", window.innerWidth);
    svg.setAttribute("height", window.innerHeight);
    document.body.appendChild(svg);

    // Real, on-screen positions of the anchor stars.
    const P = center(byId.pommel.el);
    const L = center(byId.guardLeft.el);
    const R = center(byId.guardRight.el);
    const T = center(byId.tip.el);

    // a steel gradient running the length of the blade
    const defs = document.createElementNS(SVG_NS, "defs");
    const grad = document.createElementNS(SVG_NS, "linearGradient");
    grad.setAttribute("id", "dagger-steel");
    grad.setAttribute("gradientUnits", "userSpaceOnUse");
    grad.setAttribute("x1", P[0]); grad.setAttribute("y1", P[1]);
    grad.setAttribute("x2", T[0]); grad.setAttribute("y2", T[1]);
    [["0", "#ffffff"], ["0.45", "#cfe4ff"], ["1", "#7f9dc4"]].forEach(([o, c]) => {
      const stop = document.createElementNS(SVG_NS, "stop");
      stop.setAttribute("offset", o);
      stop.setAttribute("stop-color", c);
      grad.appendChild(stop);
    });
    defs.appendChild(grad);
    svg.appendChild(defs);

    // Unit vector along the spine (pommel -> tip) and a perpendicular unit
    // vector for width — both derived from real geometry, so the shape's
    // proportions can't be stretched by viewport width/height separately.
    const axisX = T[0] - P[0], axisY = T[1] - P[1];
    const axisLen = Math.hypot(axisX, axisY);
    const ux = axisX / axisLen, uy = axisY / axisLen;
    const perpX = -uy, perpY = ux;
    const guardHalfWidth = Math.hypot(R[0] - L[0], R[1] - L[1]) / 2;

    const pointAt = ({ t, w }) => [
      P[0] + ux * axisLen * t + perpX * guardHalfWidth * w,
      P[1] + uy * axisLen * t + perpY * guardHalfWidth * w,
    ];

    // the dagger's outline, drawn as one continuous stroke
    const d = OUTLINE_SPEC
      .map((spec, i) => {
        const [x, y] = pointAt(spec);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ") + " Z";

    const blade = document.createElementNS(SVG_NS, "path");
    blade.setAttribute("d", d);
    blade.setAttribute("class", "constellation-line");
    blade.style.stroke = "url(#dagger-steel)"; // inline so it beats the class colour
    svg.appendChild(blade);
    const outlineLength = blade.getTotalLength();
    blade.style.strokeDasharray = outlineLength;
    blade.style.strokeDashoffset = outlineLength;
    const outlineDuration = 1.4;
    blade.style.animation = `constellation-draw ${outlineDuration}s ease forwards 0s`;

    // a thin fuller (centre ridge line) down the blade, drawn as a flourish
    // right after the outline finishes
    const [cx1, cy1] = pointAt({ t: 0.36, w: 0 }); // level with the guard
    const [cx2, cy2] = T;
    const fullerLength = Math.hypot(cx2 - cx1, cy2 - cy1);
    const fullerDelay = outlineDuration + 0.1;
    const fullerDuration = 0.5;

    const fuller = document.createElementNS(SVG_NS, "line");
    fuller.setAttribute("x1", cx1);
    fuller.setAttribute("y1", cy1);
    fuller.setAttribute("x2", cx2);
    fuller.setAttribute("y2", cy2);
    fuller.setAttribute("class", "constellation-line constellation-fuller");
    fuller.style.stroke = "url(#dagger-steel)";
    fuller.style.strokeDasharray = fullerLength;
    fuller.style.strokeDashoffset = fullerLength;
    fuller.style.animation = `constellation-draw ${fullerDuration}s ease forwards ${fullerDelay}s`;
    svg.appendChild(fuller);

    // once drawn, a gleam sweeps down the blade...
    const gleam = document.createElementNS(SVG_NS, "line");
    gleam.setAttribute("x1", cx1);
    gleam.setAttribute("y1", cy1);
    gleam.setAttribute("x2", cx2);
    gleam.setAttribute("y2", cy2);
    gleam.setAttribute("class", "constellation-gleam");
    gleam.style.strokeDasharray = `46 ${fullerLength + 46}`;
    gleam.style.strokeDashoffset = fullerLength + 46;
    svg.appendChild(gleam);
    const gleamStart = (fullerDelay + fullerDuration + 0.05) * 1000;
    gleam.animate(
      [{ strokeDashoffset: fullerLength + 46 }, { strokeDashoffset: -46 }],
      { duration: 620, delay: gleamStart, easing: "cubic-bezier(0.6, 0, 0.4, 1)", fill: "forwards" }
    );

    // ...and then the dagger strikes: a slash opens the way to the door
    setTimeout(() => {
      const slash = document.createElement("div");
      slash.className = "slash-overlay";
      document.body.appendChild(slash);
      setTimeout(() => { window.location.href = "/admin/"; }, 850);
    }, gleamStart + 650);
  }

  function fadeAndGo() {
    galaxy.classList.remove("revealed"); // reuse the same fade used for planet navigation
    setTimeout(() => { window.location.href = "/admin/"; }, 700);
  }

  build();
})();
