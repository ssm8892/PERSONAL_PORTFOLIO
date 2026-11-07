import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { site } from "@/content/site";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteNav name={site.name} />
      {children}
      <footer className="site-footer">
        <div className="wrap">
          <span>&copy; {site.name}</span>
          <span style={{ display: "flex", gap: "1.25rem" }}>
            <Link href="/developer">Developer</Link>
            <Link href="/artist">Artist</Link>
          </span>
        </div>
      </footer>
    </>
  );
}
