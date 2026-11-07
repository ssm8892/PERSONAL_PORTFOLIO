import type { SiteConfig } from "./types";

/* SITE SETTINGS — edit me. */
export const site: SiteConfig = {
  name: "Saish",
  tagline: "Half engineer, half artist.",

  // Your GitHub username. Shows live stars and a "More on GitHub" list on the
  // Developer page. Set to "" to turn that off.
  githubUser: "ssm8892",

  // Shown on the Developer page. Leave any of them "" to hide it.
  links: {
    github: "https://github.com/ssm8892",
    email: "",    // e.g. "mailto:you@example.com"
    linkedin: "", // e.g. "https://www.linkedin.com/in/you"
    resume: "",   // e.g. "/resume.pdf" (put the file in public/)
  },

  developer: {
    headline: "Things I’ve built and written.",
    intro: "Software projects, research papers and experiments. Most of it lives on GitHub.",
  },

  artist: {
    headline: "Drawings, paintings & sketchbooks.",
    intro: "Finished pieces in the gallery. Rough, honest pages in the sketchbooks.",
  },
};
