/* ===========================================================
   presence.js — Live viewers as tiny drifting ships.
   ===========================================================

   HOW THIS WORKS
   --------------
   Every person currently on the site is shown to everyone else as a
   small glowing ship drifting across the galaxy. This needs a free
   real-time service called Supabase.

   ▶ UNTIL YOU ADD YOUR SUPABASE KEYS BELOW, this file runs in
     "demo mode": it shows a few simulated ships so you can see the
     effect locally. No setup required to preview.

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
  const ships = new Map(); // id -> { el, x, y, tx, ty }

  /* ---------- shared ship rendering ---------- */
  function shipSVG() {
    return (
      '<svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M12 2 L19 20 L12 16 L5 20 Z" fill="#bcdcff"/>' +
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
    layer.appendChild(el);
    ships.set(id, { el, x, y, tx: x, ty: y });
  }

  function removeShip(id) {
    const s = ships.get(id);
    if (!s) return;
    s.el.style.opacity = "0";
    setTimeout(() => s.el.remove(), 600);
    ships.delete(id);
  }

  // gently drift every ship to a new random target periodically
  function drift() {
    ships.forEach((s) => {
      s.tx = Math.random() * window.innerWidth;
      s.ty = Math.random() * window.innerHeight;
      // point the ship toward its target
      const ang = Math.atan2(s.ty - s.y, s.tx - s.x) * (180 / Math.PI) + 90;
      s.el.style.transform = `rotate(${ang}deg)`;
      s.el.style.left = s.tx + "px";
      s.el.style.top = s.ty + "px";
      // leave a fading trail dot
      const trail = document.createElement("div");
      trail.className = "ship-trail";
      trail.style.left = s.x + "px";
      trail.style.top = s.y + "px";
      layer.appendChild(trail);
      setTimeout(() => trail.remove(), 1600);
      s.x = s.tx; s.y = s.ty;
    });
  }
  setInterval(drift, 2600);

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
    const fakeCount = 2 + Math.floor(Math.random() * 4); // 2–5 others
    for (let i = 0; i < fakeCount; i++) addShip("demo_" + i);
    updateCount(fakeCount + 1);
    drift();
    // occasionally a ship leaves and another joins, to feel alive
    setInterval(() => {
      const ids = Array.from(ships.keys());
      if (ids.length > 1 && Math.random() < 0.5) {
        removeShip(ids[Math.floor(Math.random() * ids.length)]);
      } else {
        addShip("demo_" + Math.random().toString(36).slice(2, 6));
      }
      updateCount(ships.size + 1);
    }, 9000);
  }

  // Decide which mode to run
  const hasKeys = SUPABASE_URL && SUPABASE_ANON_KEY;
  if (hasKeys && window.supabase && typeof window.supabase.createClient === "function") {
    try { startRealtime(); }
    catch (e) { console.warn("Presence: falling back to demo mode.", e); startDemo(); }
  } else {
    startDemo();
  }
})();
