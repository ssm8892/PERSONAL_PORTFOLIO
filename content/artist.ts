import type { GalleryPiece, Sketchbook } from "./types";

/* ARTIST CONTENT
   Put images in public/gallery/ and public/sketchbooks/<book-id>/ and reference
   them from the site root, e.g. "/gallery/piece-01.jpg".
   Any format the browser understands works: .jpg, .png, .webp, .svg. */

export const gallery: GalleryPiece[] = [
  { src: "/gallery/piece-01.svg", title: "Dusk Study", medium: "Gouache", year: 2026, description: "Replace these with your own pieces in content/artist.ts. Descriptions show up here in the viewer.", width: 800, height: 1000 },
  { src: "/gallery/piece-02.svg", title: "Harbor", medium: "Oil on panel", year: 2025, description: "Tall, wide and square images all fit the masonry layout.", width: 1000, height: 700 },
  { src: "/gallery/piece-03.svg", title: "Bloom", medium: "Digital", year: 2025, description: "Use the arrow keys or swipe to move between pieces.", width: 800, height: 800 },
  { src: "/gallery/piece-04.svg", title: "Night Walk", medium: "Ink & wash", year: 2024, description: "A placeholder piece.", width: 800, height: 1100 },
  { src: "/gallery/piece-05.svg", title: "Morning Fields", medium: "Watercolor", year: 2024, description: "A placeholder piece.", width: 1000, height: 750 },
  { src: "/gallery/piece-06.svg", title: "Ember", medium: "Acrylic", year: 2023, description: "A placeholder piece.", width: 800, height: 950 },
];

/* SKETCHBOOKS — as many as you like; each gets its own flip-through book at /sketchbooks/<id>. */
export const sketchbooks: Sketchbook[] = [
  {
    id: "daily-2026",
    title: "Daily",
    subtitle: "Sketchbook No. 3",
    year: 2026,
    color: "#2f4858",
    pages: [
      { src: "/sketchbooks/daily-2026/01.svg", title: "Morning coffee", caption: "Five minutes, ballpoint." },
      { src: "/sketchbooks/daily-2026/02.svg", title: "Hands", caption: "Gesture studies." },
      { src: "/sketchbooks/daily-2026/03.svg", title: "Train window" },
      { src: "/sketchbooks/daily-2026/04.svg", title: "Plant on the sill" },
      { src: "/sketchbooks/daily-2026/05.svg", title: "Old shoes", caption: "Graphite." },
      { src: "/sketchbooks/daily-2026/06.svg", title: "Rooftops" },
      { src: "/sketchbooks/daily-2026/07.svg", title: "Cat, asleep" },
      { src: "/sketchbooks/daily-2026/08.svg", title: "Last page", caption: "Replace these in content/artist.ts." },
    ],
  },
  {
    id: "travel",
    title: "Travel",
    subtitle: "Places & people",
    year: 2025,
    color: "#8c3b2a",
    pages: [
      { src: "/sketchbooks/travel/01.svg", title: "Market" },
      { src: "/sketchbooks/travel/02.svg", title: "Bridge" },
      { src: "/sketchbooks/travel/03.svg", title: "Street musician" },
      { src: "/sketchbooks/travel/04.svg", title: "Coastline" },
      { src: "/sketchbooks/travel/05.svg", title: "Café corner" },
      { src: "/sketchbooks/travel/06.svg", title: "Mountains" },
    ],
  },
  {
    id: "figure",
    title: "Figure",
    subtitle: "Life drawing",
    year: 2024,
    color: "#3d3a4b",
    pages: [
      { src: "/sketchbooks/figure/01.svg", title: "Two-minute poses" },
      { src: "/sketchbooks/figure/02.svg", title: "Seated" },
      { src: "/sketchbooks/figure/03.svg", title: "Contour" },
      { src: "/sketchbooks/figure/04.svg", title: "Long pose" },
      { src: "/sketchbooks/figure/05.svg", title: "Portrait" },
    ],
  },
];
