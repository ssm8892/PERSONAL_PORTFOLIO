import { cacheLife } from "next/cache";
import type { RepoStats } from "./repo";

export type { RepoStats };


type ApiRepo = {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
};

const toStats = (r: ApiRepo): RepoStats => ({
  name: r.name,
  fullName: r.full_name,
  url: r.html_url,
  description: r.description,
  language: r.language,
  stars: r.stargazers_count,
  pushedAt: r.pushed_at,
});

async function gh<T>(path: string): Promise<T | null> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  // Optional: set GITHUB_TOKEN to lift the 60 requests/hour anonymous limit.
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch(`https://api.github.com${path}`, { headers });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null; // offline or rate-limited: the page still renders, just without stats
  }
}

/** Stars + language for one repo ("owner/name"). Cached; refreshed hourly. */
export async function getRepo(fullName: string): Promise<RepoStats | null> {
  "use cache";
  cacheLife("hours");
  const r = await gh<ApiRepo>(`/repos/${fullName}`);
  return r ? toStats(r) : null;
}

/** A user's public, non-fork, non-archived repos, most recently pushed first. */
export async function getUserRepos(user: string): Promise<RepoStats[]> {
  "use cache";
  cacheLife("hours");
  const list = await gh<ApiRepo[]>(`/users/${user}/repos?per_page=100&sort=pushed`);
  if (!list) return [];
  return list
    .filter((r) => !r.fork && !r.archived)
    .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
    .map(toStats);
}

