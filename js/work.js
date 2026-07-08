/* ===========================================================
   work.js — The placeholder detail page for a single work.
   Reads ?from=<world>&title=<name> from the address and fills
   in the page, pointing the back link at the right world.
   =========================================================== */
(function () {
  "use strict";

  const WORLD_MAP = {
    film:        { name: "Film",        page: "film.html",        accent: "#c1121f" },
    photography: { name: "Photography", page: "photography.html", accent: "#c53a34" },
    fashion:     { name: "Fashion",     page: "fashion.html",     accent: "#8e2438" },
    painting:    { name: "Painting",    page: "painting.html",    accent: "#b43a26" },
    coding:      { name: "Coding",      page: "coding.html",      accent: "#46e6a0" },
  };

  const params = new URLSearchParams(window.location.search);
  const world = WORLD_MAP[params.get("from")] ||
    { name: "the Galaxy", page: "../index.html", accent: "#8fb4ff" };
  const title = (params.get("title") || "Untitled").slice(0, 80);

  // textContent keeps this safe no matter what's in the address bar
  document.getElementById("work-title").textContent = title;
  document.title = title + " — HELIX";

  const back = document.getElementById("back-link");
  back.setAttribute("href", world.page);
  back.textContent = "◂  Back to " + world.name;

  document.body.style.setProperty("--accent", world.accent);
})();
