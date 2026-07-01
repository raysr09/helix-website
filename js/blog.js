/* ===========================================================
   blog.js — Loads posts from content/posts.json and renders
   The Hitchhiker's Guide. Posts are created/edited through the
   admin panel (/admin), which keeps posts.json up to date.
   =========================================================== */
(function () {
  "use strict";

  const container = document.getElementById("posts");
  if (!container) return;

  fetch("../content/posts.json", { cache: "no-store" })
    .then((r) => {
      if (!r.ok) throw new Error("Could not load posts");
      return r.json();
    })
    .then((data) => render(data.posts || []))
    .catch((err) => {
      console.error(err);
      container.innerHTML =
        '<p class="empty">The guide is momentarily lost in hyperspace. Please try again later.</p>';
    });

  function render(posts) {
    if (!posts.length) {
      container.innerHTML =
        '<p class="empty">No entries yet. The first chapter is being written.</p>';
      return;
    }

    // newest first
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = "";
    posts.forEach((post) => {
      const article = document.createElement("article");
      article.className = "post";

      const dateStr = formatDate(post.date);
      const bodyHtml = window.marked ? window.marked.parse(post.body || "") : escapeHtml(post.body || "");

      article.innerHTML =
        `<div class="post-date">${escapeHtml(dateStr)}</div>` +
        `<h2>${escapeHtml(post.title || "Untitled")}</h2>` +
        (post.cover ? `<img class="post-cover" src="../${stripLeadingSlash(post.cover)}" alt="" />` : "") +
        `<div class="post-body collapsed">${bodyHtml}</div>` +
        `<button class="read-more" type="button">Read more &#9656;</button>`;

      const body = article.querySelector(".post-body");
      const btn = article.querySelector(".read-more");
      const title = article.querySelector("h2");

      function toggle() {
        const collapsed = body.classList.toggle("collapsed");
        btn.innerHTML = collapsed ? "Read more &#9656;" : "Show less &#9662;";
      }
      btn.addEventListener("click", toggle);
      title.addEventListener("click", toggle);

      container.appendChild(article);
    });
  }

  function formatDate(d) {
    const date = new Date(d);
    if (isNaN(date)) return d || "";
    return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }
  function stripLeadingSlash(s) { return String(s).replace(/^\//, ""); }
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
})();
