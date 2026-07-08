/* ===========================================================
   terminal.js — The coding world IS a terminal.
   Visitors type real commands: `ls` lists the projects,
   `open <name>` travels to one, `help` explains, `galaxy`
   flies home. The hint buttons run commands for anyone who
   would rather tap than type (and for phone keyboards).

   👉 TO ADD A CODING PROJECT: add one entry to PROJECTS below.
   =========================================================== */
(function () {
  "use strict";

  const PROJECTS = [
    {
      slug: "helix-website",
      title: "This Website",
      desc: "the galaxy you flew in from — built from scratch with Claude",
    },
    {
      slug: "project-two",
      title: "Project Two",
      desc: "placeholder for the next build",
    },
  ];

  const out = document.getElementById("term-out");
  const inputLine = document.getElementById("term-input-line");
  const typedEl = document.getElementById("term-typed");
  const screen = document.getElementById("term-screen");
  const hints = document.getElementById("term-hints");
  const realInput = document.getElementById("term-real-input");
  if (!out || !inputLine || !typedEl || !screen) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PROMPT = "helix@galaxy:~/coding$ ";
  let buffer = "";
  let booted = false;
  let leaving = false;

  /* ---------- output helpers ---------- */
  function println(text, cls) {
    const div = document.createElement("div");
    div.className = "term-line" + (cls ? " " + cls : "");
    div.textContent = text;
    out.appendChild(div);
    screen.scrollTop = screen.scrollHeight;
    return div;
  }

  // types a line out character by character — instant for reduced motion,
  // and instant in hidden tabs (browsers throttle timers there, which
  // would stretch the boot to a crawl)
  function typeln(text, cls, speed) {
    return new Promise((resolve) => {
      if (reduceMotion || document.hidden) { println(text, cls); resolve(); return; }
      const div = println("", cls);
      let i = 0;
      const tick = () => {
        div.textContent = text.slice(0, ++i);
        screen.scrollTop = screen.scrollHeight;
        if (i < text.length) setTimeout(tick, speed || 14);
        else resolve();
      };
      tick();
    });
  }

  /* ---------- the commands ---------- */
  const COMMANDS = {
    help() {
      println("available commands:", "dim");
      println("  ls              list the projects");
      println("  open <name>     open a project (e.g. open " + PROJECTS[0].slug + ")");
      println("  whoami          who is helix?");
      println("  clear           wipe the screen");
      println("  galaxy          fly back to the galaxy");
    },
    ls() {
      PROJECTS.forEach((p) => {
        println("  " + p.slug.padEnd(18) + "  " + p.desc, "accent");
      });
      println("open one with: open <name>", "dim");
    },
    open(arg) {
      if (!arg) { println("usage: open <name> — try 'ls' to see what's here", "dim"); return; }
      const p = PROJECTS.find((x) => x.slug === arg || x.slug.startsWith(arg));
      if (!p) { println("no project called '" + arg + "'. try 'ls'.", "dim"); return; }
      println("opening " + p.slug + " ...", "accent");
      leave("work.html?from=coding&title=" + encodeURIComponent(p.title));
    },
    whoami() {
      println("helix — maker of films, garments, paintings, photographs");
      println("and the occasional small machine like this one.");
    },
    clear() { out.innerHTML = ""; },
    galaxy() {
      println("disconnecting ...", "dim");
      leave("../index.html");
    },
    sudo() { println("nice try.", "accent"); },
  };
  COMMANDS.exit = COMMANDS.galaxy;
  COMMANDS["cd"] = (arg) => {
    if (arg === ".." || arg === "../galaxy") COMMANDS.galaxy();
    else println("this directory is deep enough already.", "dim");
  };

  function run(raw) {
    const line = raw.trim();
    println(PROMPT + line, "echo");
    if (!line) return;
    const [cmd, ...rest] = line.split(/\s+/);
    const fn = COMMANDS[cmd.toLowerCase()];
    if (fn) fn(rest.join(" "));
    else println("command not found: " + cmd + " — try 'help'", "dim");
  }

  function leave(href) {
    if (leaving) return;
    leaving = true;
    inputLine.hidden = true;
    setTimeout(() => {
      document.body.classList.add("leaving");
      setTimeout(() => { window.location.href = href; }, 480);
    }, reduceMotion ? 0 : 350);
  }

  /* ---------- input handling (keyboard + phone) ---------- */
  function render() { typedEl.textContent = buffer; }

  function submit() {
    const line = buffer;
    buffer = "";
    render();
    run(line);
    screen.scrollTop = screen.scrollHeight;
  }

  document.addEventListener("keydown", (e) => {
    if (!booted || leaving) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter") { e.preventDefault(); submit(); }
    else if (e.key === "Backspace") { e.preventDefault(); buffer = buffer.slice(0, -1); render(); }
    else if (e.key.length === 1) { e.preventDefault(); buffer += e.key; render(); }
  });

  // an offscreen input so phone keyboards can join in
  if (realInput) {
    document.getElementById("terminal").addEventListener("click", () => {
      if (booted && !leaving) realInput.focus({ preventScroll: true });
    });
    realInput.addEventListener("input", () => {
      buffer = realInput.value;
      render();
    });
    realInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        realInput.value = "";
        submit();
      }
    });
    // keep the two in sync when hardware keys were used
    document.addEventListener("keydown", () => { realInput.value = buffer; });
  }

  // tappable command hints
  if (hints) {
    hints.querySelectorAll("button[data-cmd]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!booted || leaving) return;
        buffer = "";
        render();
        run(b.dataset.cmd);
      });
    });
  }

  /* ---------- boot ---------- */
  async function boot() {
    const instant = reduceMotion || document.hidden;
    await typeln("> establishing uplink ...", "dim", 18);
    await new Promise((r) => setTimeout(r, instant ? 0 : 260));
    await typeln("> connection secured.", "dim", 18);
    await new Promise((r) => setTimeout(r, instant ? 0 : 200));
    await typeln("welcome aboard. type 'help' to begin — or tap a command below.");
    inputLine.hidden = false;
    booted = true;
  }
  boot();

  // restore cleanly if the browser brings this page back from cache
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    document.body.classList.remove("leaving");
    if (booted) inputLine.hidden = false;
  });
})();
