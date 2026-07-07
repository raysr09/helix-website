/* ===========================================================
   presence.js — Live viewers as little drifting spaceships.
   ===========================================================

   HOW THIS WORKS
   --------------
   Every person currently on the site is shown to everyone else as a
   small spaceship drifting through the galaxy. This needs a free
   real-time service called Supabase.

   ▶ UNTIL YOU ADD YOUR SUPABASE KEYS BELOW, this file runs in
     "demo mode": it shows a few simulated ships so you can see the
     effect locally. No setup required to preview.
     (In demo mode the Supabase library isn't even downloaded, so
     the page stays fast.)

   ▶ TO MAKE IT REAL (other actual visitors), follow the steps in
     README.md under "Live presence setup", then paste your two
     values here:
*/
const SUPABASE_URL = "";       // e.g. "https://abcd1234.supabase.co"
const SUPABASE_ANON_KEY = "";  // the long "anon public" key

/* =========================================================== */

(function () {
  "use strict";

  const layer = document.getElementById("ship-layer");
  const countEl = document.getElementById("presence-count");
  if (!layer) return;

  const myId = "v_" + Math.random().toString(36).slice(2, 10);
  const ships = new Map(); // id -> { el, x, y }

  /* ---------- ship rendering ---------- */
  // A small side-view spacecraft: hull, cockpit, fins, and a
  // pulsing engine glow. Drawn pointing up; rotated in flight.
  function shipSVG() {
    return (
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
      // engine glow (animated via CSS .engine)
      '<ellipse class="engine" cx="12" cy="20.5" rx="2.2" ry="3.2" fill="#7fd4ff" opacity="0.8"/>' +
      // side fins
      '<path d="M8.6 12 L5.2 17.5 L8.8 16 Z" fill="#7688b8"/>' +
      '<path d="M15.4 12 L18.8 17.5 L15.2 16 Z" fill="#7688b8"/>' +
      // hull
      '<path d="M12 2.4 C 14.4 5.2, 15 9, 14.6 12.6 C 14.4 14.6, 13.8 16.4, 12 17.6 C 10.2 16.4, 9.6 14.6, 9.4 12.6 C 9 9, 9.6 5.2, 12 2.4 Z" fill="#aebcdd"/>' +
      // hull shading line
      '<path d="M12 2.4 C 13 5.2, 13.3 9, 13.1 12.6 C 13 14.6, 12.7 16.4, 12 17.6" fill="none" stroke="#8fa0c8" stroke-width="0.6"/>' +
      // cockpit window
      '<circle cx="12" cy="8" r="1.6" fill="#dff2ff" stroke="#5f7aa8" stroke-width="0.5"/>' +
      '</svg>'
    );
  }

  function addShip(id) {
    if (ships.has(id) || id === myId) return;
    const el = document.createElement("div");
    el.className = "ship";
    el.innerHTML = shipSVG();
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.opacity = "0";
    layer.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = "1"; });
    ships.set(id, { el, x, y });
  }

  function removeShip(id) {
    const s = ships.get(id);
    if (!s) return;
    s.el.style.opacity = "0";
    setTimeout(() => s.el.remove(), 700);
    ships.delete(id);
  }

  // A calm cruise: each ship glides to a nearby point (not across the
  // whole screen), so the movement reads as slow wandering.
  function drift() {
    const reach = Math.min(window.innerWidth, window.innerHeight) * 0.22;
    ships.forEach((s) => {
      const tx = clamp(s.x + (Math.random() - 0.5) * 2 * reach, 30, window.innerWidth - 30);
      const ty = clamp(s.y + (Math.random() - 0.5) * 2 * reach, 30, window.innerHeight - 30);
      // point the ship along its heading
      const ang = Math.atan2(ty - s.y, tx - s.x) * (180 / Math.PI) + 90;
      s.el.style.transform = `rotate(${ang}deg)`;
      s.el.style.left = tx + "px";
      s.el.style.top = ty + "px";
      s.x = tx; s.y = ty;
    });
  }
  setInterval(drift, 9500);
  setTimeout(drift, 600); // first gentle move soon after load

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function updateCount(n) {
    if (countEl) countEl.textContent = String(Math.max(1, n));
  }

  /* ---------- REAL mode: Supabase presence ---------- */
  function startRealtime() {
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const channel = client.channel("galaxy-presence", {
      config: { presence: { key: myId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const ids = Object.keys(state);
        // add ships for everyone new, remove those who left
        ids.forEach(addShip);
        ships.forEach((_, id) => { if (!ids.includes(id)) removeShip(id); });
        updateCount(ids.length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ at: Date.now() });
        }
      });

    window.addEventListener("beforeunload", () => { channel.untrack(); });
  }

  /* ---------- DEMO mode: simulated ships ---------- */
  function startDemo() {
    const fakeCount = 2 + Math.floor(Math.random() * 3); // 2–4 others
    for (let i = 0; i < fakeCount; i++) addShip("demo_" + i);
    updateCount(fakeCount + 1);
    // occasionally a ship leaves and another arrives, to feel alive
    setInterval(() => {
      const ids = Array.from(ships.keys());
      if (ids.length > 1 && Math.random() < 0.5) {
        removeShip(ids[Math.floor(Math.random() * ids.length)]);
      } else {
        addShip("demo_" + Math.random().toString(36).slice(2, 6));
      }
      updateCount(ships.size + 1);
    }, 20000);
  }

  /* ---------- pick a mode ---------- */
  // Only download the Supabase library once real keys exist; until
  // then, demo mode runs with zero extra network cost.
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const lib = document.createElement("script");
    lib.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    lib.onload = () => {
      try { startRealtime(); }
      catch (e) { console.warn("Presence: falling back to demo mode.", e); startDemo(); }
    };
    lib.onerror = () => startDemo();
    document.head.appendChild(lib);
  } else {
    startDemo();
  }
})();
