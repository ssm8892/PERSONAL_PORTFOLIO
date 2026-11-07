import type { DevItem } from "./types";

/* DEVELOPER ITEMS — projects, papers, talks. See content/types.ts for every field. */
export const devItems: DevItem[] = [
  {
    type: "project",
    title: "Personal Portfolio",
    description:
      "This site. Next.js, with a reaction-diffusion brain on the landing page, a gallery, and sketchbooks you can flip through.",
    year: 2026,
    tags: ["Next.js", "TypeScript", "Canvas"],
    repo: "ssm8892/PERSONAL_PORTFOLIO",
    links: { github: "https://github.com/ssm8892/PERSONAL_PORTFOLIO" },
    featured: true,
  },
  {
    type: "project",
    title: "Example Project",
    description: "Replace me in content/developer.ts. A short line about what it does and why it was interesting to build.",
    year: 2025,
    tags: ["Python", "ML"],
    links: { github: "https://github.com/ssm8892" },
  },
  {
    type: "project",
    title: "Another Example",
    description: "Add a demo link and it shows up as a button. Add a repo and the stars and language appear automatically.",
    year: 2025,
    tags: ["TypeScript", "React"],
    links: { github: "https://github.com/ssm8892", demo: "#" },
  },
  {
    type: "paper",
    title: "Example Paper Title: A Study of Something Interesting",
    description: "One-sentence abstract. Papers get their own filter and show authors and venue.",
    authors: "Saish, Co-Author, Advisor",
    venue: "arXiv preprint",
    year: 2025,
    tags: ["Research"],
    links: { paper: "#", github: "https://github.com/ssm8892" },
  },
];
