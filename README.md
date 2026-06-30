# HELIX — The Galaxy

A cinematic, space-themed creative portfolio. The home page is **The Galaxy**: a
solar system where each creative discipline (Film, Coding, Fashion, Painting,
Photography) is a planet you fly to. A recurring blog, **The Hitchhiker's Guide
to the Galaxy**, runs alongside it. Live visitors appear as tiny drifting ships.

No frameworks, no build step — just HTML, CSS and JavaScript.

---
Clone the repository and open `index.html` in your browser:

```bash
git clone https://github.com/raysr09/helix-website.git
cd helix-website
```

## Looking at the site on your own computer

Because the blog loads a file (`content/posts.json`), opening `index.html` by
double-clicking won't show the blog correctly. Run a tiny local server instead:

```bash
# from inside the helix_website folder
python -m http.server 8000
```

Then open **http://localhost:8000** in your browser. (The galaxy, planets and
intro work either way; this is only needed for the blog page.)

---

## Adding a new creative world (planet)

1. Open [`data/planets.js`](data/planets.js) and copy one of the blocks.
2. Change the words and colour (instructions are written in that file).
3. Create a matching page in the `pages/` folder — easiest is to copy an
   existing one like [`pages/film.html`](pages/film.html) and edit the text.

Or just ask Claude to do it for you.

---

## Writing blog posts (no coding)

Once the site is live on Netlify (below), go to **`your-site-address/admin`**,
log in with GitHub, and write posts in a normal editor. Publishing saves the
post and the live site updates within about half a minute.

---

## Going live — one-time setup

### 1. Put the site on Netlify (free)
1. Go to **https://app.netlify.com** and sign up / log in with GitHub.
2. **Add new site → Import an existing project → GitHub**, and pick the
   `helix-website` repository.
3. Leave the build settings blank (publish directory `.`) and click **Deploy**.
   You'll get a live address like `https://something.netlify.app`.

### 2. Turn on the blog editor (Netlify Identity + Git Gateway)
1. In your Netlify site: **Integrations / Identity → Enable Identity**.
2. Under **Identity → Services → Git Gateway**, click **Enable Git Gateway**.
3. Under **Identity → Registration**, set it to **Invite only** (recommended).
4. Click **Invite users** and invite your own email. Accept the email invite and
   set a password. You can now log in at `your-site-address/admin`.

### 3. Turn on live presence (Supabase, free) — optional
The drifting ships work in a simulated "demo mode" until you do this.
1. Go to **https://supabase.com**, sign up, and create a new project (free tier).
2. In the project: **Project Settings → API**. Copy the **Project URL** and the
   **`anon` `public`** key.
3. Open [`js/presence.js`](js/presence.js) and paste those two values into
   `SUPABASE_URL` and `SUPABASE_ANON_KEY` at the top. Commit the change (ask
   Claude, or edit on GitHub). That's it — real visitors now appear to each other.

> The `anon` key is safe to put in the website — it's designed to be public.

### 4. (Later) Use your own domain name
Buy a domain anywhere, then in Netlify: **Domain settings → Add a domain**, and
follow the steps. No code changes needed.

---

## Swapping in your real Helix graphic
The glowing centrepiece is a placeholder at
[`images/helix-placeholder.svg`](images/helix-placeholder.svg). Replace that file
with your own image (keep the same filename), or send your graphic to Claude and
ask to wire it in.

---

## Project structure
```
index.html          The Galaxy + warp-in intro
pages/              One page per creative discipline
blog/               The Hitchhiker's Guide (reads content/posts.json)
admin/              The no-code blog editor (Decap CMS)
content/posts.json  Your blog posts (edited via /admin)
data/planets.js     The list of planets — edit this to add worlds
css/  js/  images/  Styles, scripts, and graphics
netlify.toml        Hosting configuration
```

## Contributing
Pull requests are welcome.
Pull requests are welcome. Please open an issue first to discuss any significant changes.
