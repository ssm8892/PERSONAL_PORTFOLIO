import { LANG_COLORS, type RepoStats } from "@/lib/repo";
import { Star } from "@/lib/icons";

export function Stats({ repo }: { repo: RepoStats | null }) {
  if (!repo) return <div className="stats" />;
  return (
    <div className="stats">
      {repo.language && (
        <span>
          <i className="lang-dot" style={{ background: LANG_COLORS[repo.language] ?? "var(--text-3)" }} />
          {repo.language}
        </span>
      )}
      {repo.stars > 0 && (
        <span aria-label={`${repo.stars} stars`}>
          <Star />
          {repo.stars}
        </span>
      )}
    </div>
  );
}
