/*
 * planets.js — THE SINGLE SOURCE OF TRUTH FOR THE GALAXY
 * =======================================================
 *
 * Every creative world in the galaxy is one entry in the WORLDS array.
 * Each appears as a glowing nebula cloud drifting in the starfield.
 *
 * 👉 TO ADD A NEW CREATIVE DISCIPLINE:
 *    1. Copy one of the blocks below (from { to }, including the comma).
 *    2. Change the values (see what each field means below).
 *    3. Create a matching page file in the /pages folder
 *       (easiest is to copy an existing one and edit the words).
 *    That's it. The galaxy rebuilds itself automatically.
 *
 * Field meanings:
 *    id       A short lowercase nickname, no spaces (e.g. "film").
 *    name     The label shown to visitors (e.g. "Film").
 *    tagline  A short poetic subtitle shown when hovering the nebula.
 *    color    The nebula's glow colour, as a hex code (e.g. "#e23b4e").
 *    x, y     Where the nebula sits, as a percentage of the screen
 *             (x: 0 = far left, 100 = far right; y: 0 = top, 100 = bottom).
 *             Keep them spread out, away from the centre (Helix lives there)
 *             and away from the top-left corner (reserved ✨).
 *    size     How big the cloud feels, in "vmin" units (try 22–34).
 *    page     The page this world links to.
 */

const WORLDS = [
  {
    id: "film",
    name: "Film",
    tagline: "Stories in Light",
    color: "#e23b4e",        // crimson
    x: 74,
    y: 25,
    size: 30,
    page: "pages/film.html",
  },
  {
    id: "painting",
    name: "Painting",
    tagline: "Worlds in Pigment",
    color: "#f0a830",        // warm amber
    x: 23,
    y: 70,
    size: 28,
    page: "pages/painting.html",
  },
  {
    id: "fashion",
    name: "Fashion",
    tagline: "Form in Motion",
    color: "#e88bb0",        // rose
    x: 81,
    y: 68,
    size: 26,
    page: "pages/fashion.html",
  },
  {
    id: "coding",
    name: "Coding",
    tagline: "Logic as Craft",
    color: "#46e6a0",        // electric green
    x: 40,
    y: 22,
    size: 24,
    page: "pages/coding.html",
  },
  {
    id: "photography",
    name: "Photography",
    tagline: "Frozen Time",
    color: "#b8c6e6",        // cool silver-blue
    x: 57,
    y: 80,
    size: 22,
    page: "pages/photography.html",
  },
];
