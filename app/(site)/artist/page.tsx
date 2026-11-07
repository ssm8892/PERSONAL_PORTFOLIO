import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Gallery } from "@/components/artist/Gallery";
import { gallery, sketchbooks } from "@/content/artist";
import { site } from "@/content/site";
import "@/styles/artist.css";

export const metadata: Metadata = {
  title: "Artist",
  description: site.artist.intro,
};

export default function ArtistPage() {
  return (
    <main>
      <section className="page-hero wrap">
        <p className="eyebrow art rise" style={{ "--i": 0 } as CSSProperties}>Artist</p>
        <h1 className="display rise" style={{ "--i": 1 } as CSSProperties}>{site.artist.headline}</h1>
        <p className="lede rise" style={{ "--i": 2 } as CSSProperties}>{site.artist.intro}</p>
        <div className="jump rise" style={{ "--i": 3 } as CSSProperties}>
          <a className="btn secondary" href="#gallery">Gallery</a>
          <a className="btn secondary" href="#sketchbooks">Sketchbooks</a>
        </div>
      </section>

      <section className="wrap section" id="gallery" aria-labelledby="galleryTitle">
        <div className="section-head">
          <div>
            <h2 className="title-2" id="galleryTitle">Gallery</h2>
            <p>Finished pieces. Select one to see it larger.</p>
          </div>
        </div>
        <Gallery pieces={gallery} />
      </section>

      <section className="wrap section" id="sketchbooks" aria-labelledby="booksTitle">
        <div className="section-head">
          <div>
            <h2 className="title-2" id="booksTitle">Sketchbooks</h2>
            <p>Pick one up and flip through it.</p>
          </div>
        </div>
        <div className="shelf">
          {sketchbooks.map((book, i) => {
            const count = book.pages.length;
            const first = book.pages[0]?.src;
            const cover = book.cover ? `${book.color ?? "#333"} url("${book.cover}")` : book.color ?? "#2f4858";
            return (
              // prefetch={true}: also resolve the book's URL-specific content ahead of the click
              <Link key={book.id} href={`/sketchbooks/${book.id}`} prefetch={true} className="book rise" style={{ "--i": i + 4 } as CSSProperties}>
                <div className="book-body">
                  <div className="book-page" style={first ? { backgroundImage: `url("${first}")` } : undefined} />
                  <div className={`book-cover${book.cover ? " has-image" : ""}`} style={{ "--cover": cover } as CSSProperties}>
                    <div>
                      <p className="book-title">{book.title}</p>
                      {book.subtitle && <p className="book-sub">{book.subtitle}</p>}
                    </div>
                    <div className="book-foot">
                      <span>{book.year ?? ""}</span>
                      <span>{count} {count === 1 ? "page" : "pages"}</span>
                    </div>
                  </div>
                </div>
                <span className="book-label">
                  {book.title}
                  <small>{[book.subtitle, book.year].filter(Boolean).join(" · ")}</small>
                </span>
              </Link>
            );
          })}
          {!sketchbooks.length && <p>No sketchbooks yet — add one in content/artist.ts.</p>}
        </div>
      </section>
    </main>
  );
}
