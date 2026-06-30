/* ===========================================================
   galaxy.js — Builds the solar system from data/planets.js.
   Creates orbit rings + orbiting planets, wires up hover labels
   and click-to-navigate (with a cinematic fade-to-black).
   =========================================================== */
(function () {
  "use strict";

  const system = document.getElementById("system");
  const label = document.getElementById("planet-label");
  if (!system || typeof PLANETS === "undefined") return;

  const labelName = label.querySelector(".planet-label-name");
  const labelTag = label.querySelector(".planet-label-tagline");

  // On small screens, scale every orbit down so the system fits.
  function orbitScale() {
    const min = Math.min(window.innerWidth, window.innerHeight);
    // 820px tall+ -> full size; smaller -> shrink toward 0.5
    return Math.max(0.5, Math.min(1, min / 820));
  }

  function build() {
    // clear any previously built rings/arms (keeps sun-glow + helix)
    system.querySelectorAll(".orbit, .orbit-arm").forEach((n) => n.remove());

    const scale = orbitScale();

    PLANETS.forEach((p) => {
      const r = p.orbitRadius * scale;

      // faint visible orbit ring
      const ring = document.createElement("div");
      ring.className = "orbit";
      ring.style.width = r * 2 + "px";
      ring.style.height = r * 2 + "px";
      system.appendChild(ring);

      // rotating arm that carries the planet
      const arm = document.createElement("div");
      arm.className = "orbit-arm";
      arm.style.width = r + "px";
      arm.style.height = "0";
      arm.style.animationDuration = p.orbitSpeed + "s";
      arm.style.transform = `rotate(${p.startAngle}deg)`;
      // negative delay starts the animation partway, honouring startAngle
      arm.style.animationDelay = `-${(p.startAngle / 360) * p.orbitSpeed}s`;

      // the planet sits at the end of the arm
      const planet = document.createElement("button");
      planet.className = "planet";
      planet.type = "button";
      planet.setAttribute("aria-label", `${p.name} — ${p.tagline}`);
      planet.style.left = r + "px";
      planet.style.top = "0";
      planet.style.width = p.size + "px";
      planet.style.height = p.size + "px";
      planet.style.background = `radial-gradient(circle at 35% 35%, #fff 0%, ${p.color} 45%, ${shade(p.color)} 100%)`;
      planet.style.boxShadow = `0 0 18px ${p.color}, 0 0 40px ${p.color}55`;
      planet.style.animationDuration = p.orbitSpeed + "s";
      planet.style.animationDelay = `-${(p.startAngle / 360) * p.orbitSpeed}s`;

      // hover label follows the planet's real screen position
      planet.addEventListener("mouseenter", () => showLabel(p, planet));
      planet.addEventListener("mousemove", () => positionLabel(planet));
      planet.addEventListener("mouseleave", hideLabel);
      planet.addEventListener("focus", () => showLabel(p, planet));
      planet.addEventListener("blur", hideLabel);

      // click -> fade out -> navigate
      planet.addEventListener("click", () => navigate(p.page));

      arm.appendChild(planet);
      system.appendChild(arm);
    });
  }

  function showLabel(p, planetEl) {
    labelName.textContent = p.name;
    labelTag.textContent = p.tagline;
    label.hidden = false;
    positionLabel(planetEl);
  }
  function positionLabel(planetEl) {
    const rect = planetEl.getBoundingClientRect();
    label.style.left = rect.left + rect.width / 2 + "px";
    label.style.top = rect.top + "px";
  }
  function hideLabel() { label.hidden = true; }

  function navigate(page) {
    const galaxy = document.getElementById("galaxy");
    galaxy.classList.remove("revealed"); // triggers the opacity fade
    setTimeout(() => { window.location.href = page; }, 700);
  }

  // darken a hex colour for the planet's far edge
  function shade(hex) {
    const c = hex.replace("#", "");
    const n = parseInt(c.length === 3 ? c.replace(/(.)/g, "$1$1") : c, 16);
    const r = Math.max(0, ((n >> 16) & 255) - 90);
    const g = Math.max(0, ((n >> 8) & 255) - 90);
    const b = Math.max(0, (n & 255) - 90);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // rebuild on resize so orbit scaling stays correct
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 200);
  });

  build();
})();
