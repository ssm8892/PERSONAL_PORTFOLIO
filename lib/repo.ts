/* Shared between server (lib/github.ts) and client components — no server-only code here. */

export type RepoStats = {
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
};

export const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", Java: "#b07219", "C++": "#f34b7d",
  C: "#555555", "C#": "#178600", Go: "#00ADD8", Rust: "#dea584", Swift: "#F05138", Kotlin: "#A97BFF",
  HTML: "#e34c26", CSS: "#563d7c", "Jupyter Notebook": "#DA5B0B", Shell: "#89e051", Ruby: "#701516",
  Dart: "#00B4AB", R: "#198CE7", MATLAB: "#e16737", Vue: "#41b883", Svelte: "#ff3e00",
};
