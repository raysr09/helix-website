/* ===========================================================
   beacon.js — The transmission beacon: about + contact.
   A pulsing signal in the galaxy; clicking it opens a short
   "incoming transmission" with who Helix is and how to reach
   them. Esc, the END button, or clicking the dark backdrop
   all close it.
   =========================================================== */
(function () {
  "use strict";

  const beacon = document.getElementById("beacon");
  const overlay = document.getElementById("transmission");
  const closeBtn = document.getElementById("transmission-close");
  if (!beacon || !overlay || !closeBtn) return;

  function open() {
    overlay.hidden = false;
    // let the CSS entry animation replay on each open
    overlay.classList.remove("open");
    void overlay.offsetWidth;
    overlay.classList.add("open");
    closeBtn.focus();
  }

  function close() {
    overlay.hidden = true;
    beacon.focus();
  }

  beacon.addEventListener("click", open);
  closeBtn.addEventListener("click", close);

  // clicking the dark space around the panel closes it
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) close();
  });
})();
