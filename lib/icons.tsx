import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { "aria-hidden": true, focusable: false } as const;

export const ArrowUpRight = (p: P) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...base} {...p}><path d="M5 11 11 5M6 5h5v5" /></svg>
);
export const GitHub = (p: P) => (
  <svg viewBox="0 0 16 16" fill="currentColor" {...base} {...p}><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" /></svg>
);
export const Doc = (p: P) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" {...base} {...p}><path d="M4 1.75h5.5L12.25 4.5v9.75H4z" /><path d="M9.25 1.75V4.75h3M6 8h4.25M6 10.75h4.25" /></svg>
);
export const Play = (p: P) => (
  <svg viewBox="0 0 16 16" fill="currentColor" {...base} {...p}><path d="M5 3.5v9l7-4.5z" /></svg>
);
export const Mail = (p: P) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" {...base} {...p}><rect x="1.75" y="3.25" width="12.5" height="9.5" rx="2" /><path d="m2.5 4.5 5.5 4 5.5-4" /></svg>
);
export const Star = (p: P) => (
  <svg viewBox="0 0 16 16" fill="currentColor" {...base} {...p}><path d="M8 1.25l2.06 4.17 4.6.67-3.33 3.25.79 4.58L8 11.76l-4.12 2.16.79-4.58L1.34 6.09l4.6-.67z" /></svg>
);
export const ChevronLeft = (p: P) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...base} {...p}><path d="M10 3 5 8l5 5" /></svg>
);
export const ChevronRight = (p: P) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...base} {...p}><path d="m6 3 5 5-5 5" /></svg>
);
export const Close = (p: P) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" {...base} {...p}><path d="m4 4 8 8M12 4l-8 8" /></svg>
);
export const LinkIcon = (p: P) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" {...base} {...p}><path d="M6.5 9.5 9.5 6.5M7 4.5l1.2-1.2a2.8 2.8 0 0 1 4 4L11 8.5M9 11.5l-1.2 1.2a2.8 2.8 0 0 1-4-4L5 7.5" /></svg>
);
