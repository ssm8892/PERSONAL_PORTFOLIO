import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookReader } from "@/components/sketchbook/BookReader";
import { sketchbooks } from "@/content/artist";
import { site } from "@/content/site";
import { ChevronLeft } from "@/lib/icons";
import "@/styles/sketchbook.css";

// One prerendered page per sketchbook.
export function generateStaticParams() {
  return sketchbooks.map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: PageProps<"/sketchbooks/[id]">): Promise<Metadata> {
  const { id } = await params;
  const book = sketchbooks.find((b) => b.id === id);
  return { title: book ? `${book.title} — Sketchbook` : "Sketchbook" };
}

// The App Shell is shared by every sketchbook, so it must not read `params`.
// The URL-specific part (which book) resolves inside the Suspense boundary;
// the shelf links prefetch it, so in practice the book appears with the click.
export default function SketchbookPage({ params }: PageProps<"/sketchbooks/[id]">) {
  return (
    <Suspense fallback={<ReaderShell />}>
      <Book params={params} />
    </Suspense>
  );
}

async function Book({ params }: Pick<PageProps<"/sketchbooks/[id]">, "params">) {
  const { id } = await params;
  const book = sketchbooks.find((b) => b.id === id);
  if (!book) notFound();
  return <BookReader book={book} ownerName={site.name} />;
}

function ReaderShell() {
  return (
    <div className="reader-page" aria-busy="true">
      <header className="chrome">
        <div className="wrap chrome-inner">
          <Link className="chrome-home" href="/artist#sketchbooks">
            <ChevronLeft />
            Sketchbooks
          </Link>
        </div>
      </header>
    </div>
  );
}
