/*
 * planets.js — THE SINGLE SOURCE OF TRUTH FOR THE GALAXY
 * =======================================================
 *
 * Every "planet" in the solar system is one entry in the PLANETS array below.
 *
 * 👉 TO ADD A NEW CREATIVE DISCIPLINE:
 *    1. Copy one of the blocks below (from { to }, including the comma).
 *    2. Change the values (see what each field means below).
 *    3. Create a matching page file in the /pages folder
 *       (e.g. if page is "pages/music.html", make that file —
 *        easiest is to copy an existing one and edit the words).
 *    That's it. The galaxy rebuilds itself automatically.
 *
 * Field meanings:
 *    id          A short lowercase nickname, no spaces (e.g. "film").
 *    name        The label shown to visitors (e.g. "Film").
 *    tagline     A short poetic subtitle shown when hovering the planet.
 *    color       The planet's glow colour, as a hex code (e.g. "#e23b4e").
 *    size        How big the planet looks, in pixels (try 18–40).
 *    orbitRadius How far the planet sits from Helix, in pixels.
 *                Bigger number = further out. Keep them spread apart.
 *    orbitSpeed  Seconds for one full lap. Bigger = slower.
 *    startAngle  Where on its ring the planet begins (0–360 degrees).
 *                Spread these out so planets don't start bunched together.
 *    page        The page this planet links to.
 */

const PLANETS = [
  {
    id: "film",
    name: "Film",
    tagline: "Stories in Light",
    color: "#e23b4e",        // crimson
    size: 34,
    orbitRadius: 360,
    orbitSpeed: 140,         // slowest, outermost
    startAngle: 20,
    page: "pages/film.html",
  },
  {
    id: "painting",
    name: "Painting",
    tagline: "Worlds in Pigment",
    color: "#f0a830",        // warm amber
    size: 30,
    orbitRadius: 290,
    orbitSpeed: 110,
    startAngle: 150,
    page: "pages/painting.html",
  },
  {
    id: "fashion",
    name: "Fashion",
    tagline: "Form in Motion",
    color: "#e89bb0",        // rose gold
    size: 26,
    orbitRadius: 225,
    orbitSpeed: 88,
    startAngle: 250,
    page: "pages/fashion.html",
  },
  {
    id: "coding",
    name: "Coding",
    tagline: "Logic as Craft",
    color: "#46e6a0",        // electric green
    size: 24,
    orbitRadius: 165,
    orbitSpeed: 64,
    startAngle: 60,
    page: "pages/coding.html",
  },
  {
    id: "photography",
    name: "Photography",
    tagline: "Frozen Time",
    color: "#cfd6e6",        // cool silver
    size: 20,
    orbitRadius: 110,
    orbitSpeed: 44,          // fastest, innermost
    startAngle: 300,
    page: "pages/photography.html",
  },
];
