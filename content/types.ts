export type SiteConfig = {
  name: string;
  tagline: string;
  /** GitHub username — powers live stars and the "More on GitHub" list. "" to disable. */
  githubUser: string;
  links: { github?: string; email?: string; linkedin?: string; resume?: string };
  developer: { headline: string; intro: string };
  artist: { headline: string; intro: string };
};

export type DevItemType = "project" | "paper" | "talk" | "other";

export type DevItem = {
  type: DevItemType;
  title: string;
  description?: string;
  year?: number;
  tags?: string[];
  /** "owner/name" — live stars + language are fetched from GitHub */
  repo?: string;
  links?: { github?: string; paper?: string; demo?: string; site?: string };
  /** Card spans two columns */
  featured?: boolean;
  authors?: string;
  venue?: string;
};

export type GalleryPiece = {
  src: string;
  title: string;
  description?: string;
  medium?: string;
  year?: number;
  alt?: string;
  /** Real pixel size — avoids layout shift while loading */
  width?: number;
  height?: number;
};

export type SketchbookPage = { src: string; title?: string; caption?: string; alt?: string };

export type Sketchbook = {
  /** Used in the URL: /sketchbooks/<id> */
  id: string;
  title: string;
  subtitle?: string;
  year?: number;
  /** Cover color */
  color?: string;
  /** Optional cover image instead of a plain color */
  cover?: string;
  /** Page width / height. Default 0.75 (portrait) */
  aspect?: number;
  pages: SketchbookPage[];
};
