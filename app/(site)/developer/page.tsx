import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { WorkGrid } from "@/components/developer/WorkGrid";
import { Stats } from "@/components/developer/Stats";
import { devItems } from "@/content/developer";
import { site } from "@/content/site";
import { getRepo, getUserRepos } from "@/lib/github";
import { Doc, GitHub, LinkIcon, Mail } from "@/lib/icons";
import "@/styles/developer.css";

export const metadata: Metadata = {
  title: "Developer",
  description: site.developer.intro,
};

const HERO_LINKS: { key: keyof typeof site.links; label: string; icon: ReactNode; primary?: boolean }[] = [
  { key: "github", label: "GitHub", icon: <GitHub />, primary: true },
  { key: "linkedin", label: "LinkedIn", icon: <LinkIcon /> },
  { key: "email", label: "Email", icon: <Mail /> },
  { key: "resume", label: "Résumé", icon: <Doc /> },
];

export default async function DeveloperPage() {
  // Both calls are cached ('use cache' + cacheLife('hours')), so this page is prerendered.
  const [stats, repos] = await Promise.all([
    Promise.all(devItems.map((i) => (i.repo ? getRepo(i.repo) : Promise.resolve(null)))),
    site.githubUser ? getUserRepos(site.githubUser) : Promise.resolve([]),
  ]);

  const featured = new Set(devItems.map((i) => i.repo?.toLowerCase()).filter(Boolean));
  const more = repos.filter((r) => !featured.has(r.fullName.toLowerCase())).slice(0, 9);

  return (
    <main>
      <section className="page-hero wrap">
        <p className="eyebrow dev rise" style={{ "--i": 0 } as CSSProperties}>Developer</p>
        <h1 className="display rise" style={{ "--i": 1 } as CSSProperties}>{site.developer.headline}</h1>
        <p className="lede rise" style={{ "--i": 2 } as CSSProperties}>{site.developer.intro}</p>
        <div className="hero-links rise" style={{ "--i": 3 } as CSSProperties}>
          {HERO_LINKS.map(({ key, label, icon, primary }) => {
            const href = site.links[key];
            if (!href) return null;
            const external = !href.startsWith("mailto:");
            return (
              <a key={key} className={`btn${primary ? "" : " secondary"}`} href={href} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
                {icon}
                {label}
              </a>
            );
          })}
        </div>
      </section>

      <WorkGrid items={devItems} stats={stats} />

      {more.length > 0 && (
        <section className="wrap section" aria-labelledby="ghTitle">
          <div className="section-head">
            <div>
              <h2 className="title-2" id="ghTitle">More on GitHub</h2>
              <p>Recently updated public repositories.</p>
            </div>
            <a className="btn secondary" href={`https://github.com/${site.githubUser}?tab=repositories`} target="_blank" rel="noopener">
              View all
            </a>
          </div>
          <div className="repo-grid">
            {more.map((r, i) => (
              <a key={r.fullName} className="repo rise" href={r.url} target="_blank" rel="noopener" style={{ "--i": i } as CSSProperties}>
                <span className="repo-name">
                  <GitHub />
                  <span>{r.name}</span>
                </span>
                <p>{r.description || "No description."}</p>
                <Stats repo={r} />
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
