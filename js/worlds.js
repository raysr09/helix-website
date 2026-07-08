/* ===========================================================
   worlds.js — Shared behaviour for the world scenes.
   Every clickable object in a scene is a link with the class
   "scene-item". Clicking one plays that world's exit effect,
   then travels to the work's page.

   Film is special: choosing a reel starts the projector — the
   beam brightens and the screen flickers to life before travel.
   =========================================================== */
(function () {
  "use strict";

  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let leaving = false;

  document.querySelectorAll(".scene-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      if (leaving) return;
      leaving = true;
      const href = item.getAttribute("href");

      if (reduceMotion) { window.location.href = href; return; }

      if (body.classList.contains("world-film")) {
        // the chosen reel locks in; projector spins up; screen flickers
        item.classList.add("chosen");
        body.classList.add("projecting");
        setTimeout(() => { window.location.href = href; }, 1250);
      } else {
        body.classList.add("leaving");
        setTimeout(() => { window.location.href = href; }, 480);
      }
    });
  });

  // If the browser restores this page from its back-forward cache,
  // clear any half-played exit state so the scene is usable again.
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    body.classList.remove("leaving", "projecting");
    document.querySelectorAll(".scene-item.chosen").forEach((i) => i.classList.remove("chosen"));
  });
})();
