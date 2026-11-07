"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import type { DevItem, DevItemType } from "@/content/types";
import type { RepoStats } from "@/lib/repo";
import { ArrowUpRight, Doc, GitHub, Play } from "@/lib/icons";
import { Stats } from "./Stats";

const LABELS: Record<DevItemType, string> = { project: "Projects", paper: "Papers", talk: "Talks", other: "Other" };

const LINKS: { key: keyof NonNullable<DevItem["links"]>; label: string; icon: ReactNode }[] = [
  { key: "github", label: "Code", icon: <GitHub /> },
  { key: "paper", label: "Paper", icon: <Doc /> },
  { key: "demo", label: "Demo", icon: <Play /> },
  { key: "site", label: "Website", icon: <ArrowUpRight /> },
];

function primaryHref(item: DevItem) {
  const l = item.links ?? {};
  return l.demo || l.site || l.paper || l.github || (item.repo ? `https://github.com/${item.repo}` : undefined);
}

export function WorkGrid({ items, stats }: { items: DevItem[]; stats: (RepoStats | null)[] }) {
  const [filter, setFilter] = useState<DevItemType | "all">("all");
  // Bumped on every filter change so the newly shown cards replay their entrance.
  const [generation, setGeneration] = useState(0);
  const types = [...new Set(items.map((i) => i.type))];

  const visible = items
    .map((item, i) => ({ item, stat: stats[i], i }))
    .filter(({ item }) => filter === "all" || item.type === filter);

  function choose(t: DevItemType | "all") {
    setFilter(t);
    setGeneration((g) => g + 1);
  }

  return (
    <section className="wrap section" aria-labelledby="workTitle">
      <div className="section-head">
        <h2 className="title-2" id="workTitle">Work</h2>
        {types.length > 1 && (
          <div className="chips" role="group" aria-label="Filter by type">
            {(["all", ...types] as const).map((t) => (
              <button key={t} type="button" className="chip" aria-pressed={filter === t} onClick={() => choose(t)}>
                {t === "all" ? "All" : LABELS[t]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid">
        {visible.map(({ item, stat, i }, n) => {
          const href = primaryHref(item);
          const meta = [item.authors, item.venue].filter(Boolean).join(" · ");
          return (
            <article
              key={`${i}-${generation}`}
              className={`card${item.featured ? " featured" : ""} ${generation ? "is-entering" : "rise"}`}
              style={{ "--i": generation ? n : n + 4 } as CSSProperties}
            >
              <div className="card-top">
                <span className={`badge ${item.type}`}>{item.type}</span>
                {item.year && <span>{item.year}</span>}
              </div>
              <h3>
                {href ? (
                  <a href={href} target="_blank" rel="noopener">{item.title}</a>
                ) : (
                  item.title
                )}
              </h3>
              {meta && <p className="meta">{meta}</p>}
              {item.description && <p className="desc">{item.description}</p>}
              {item.tags?.length ? (
                <ul className="tags">{item.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              ) : null}
              <div className="card-foot">
                <div className="card-links">
                  {LINKS.map(({ key, label, icon }) => {
                    const url = item.links?.[key];
                    if (!url) return null;
                    return (
                      <a key={key} href={url} target="_blank" rel="noopener" aria-label={`${label}: ${item.title}`}>
                        {icon}
                        {label}
                      </a>
                    );
                  })}
                </div>
                <Stats repo={stat} />
              </div>
            </article>
          );
        })}
      </div>
      {visible.length === 0 && <p className="empty">Nothing here yet.</p>}
    </section>
  );
}
