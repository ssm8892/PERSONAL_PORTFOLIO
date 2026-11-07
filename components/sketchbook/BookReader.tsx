"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Sketchbook } from "@/content/types";
import { ChevronLeft, ChevronRight } from "@/lib/icons";
import { prefersReducedMotion } from "@/lib/spring";
import { mountReader, type ReaderApi, type ReaderState } from "./reader";

export function BookReader({ book, ownerName }: { book: Sketchbook; ownerName: string }) {
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement>(null);
  const shiftRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const stackLeftRef = useRef<HTMLDivElement>(null);
  const api = useRef<ReaderApi | null>(null);
  const [state, setState] = useState<ReaderState>({ flipped: 0, max: 1, label: "", touched: false });

  useEffect(() => {
    // ?page= lets a reload or a shared link land on the same spread.
    const initial = Number(new URLSearchParams(window.location.search).get("page")) || 0;
    api.current = mountReader(
      { stage: stageRef.current!, shift: shiftRef.current!, book: bookRef.current!, stackLeft: stackLeftRef.current! },
      {
        book,
        ownerName,
        initialFlipped: initial,
        reduceMotion: prefersReducedMotion,
        onChange: setState,
        onNavigate: (href) => router.push(href),
      }
    );
    return () => {
      api.current?.destroy();
      api.current = null;
    };
  }, [book, ownerName, router]);

  const cover = book.cover ? `${book.color ?? "#333"} url("${book.cover}")` : book.color ?? "#2f4858";

  return (
    <div className="reader-page">
      <header className="chrome">
        <div className="wrap chrome-inner">
          <Link className="chrome-home" href="/artist#sketchbooks">
            <ChevronLeft />
            Sketchbooks
          </Link>
          <h1 className="reader-title">{[book.title, book.subtitle].filter(Boolean).join(" — ")}</h1>
          <span className="reader-count" aria-live="polite">{state.label}</span>
        </div>
      </header>

      <main className="reader">
        <div className="reader-stage" ref={stageRef}>
          <div className="book-shift" ref={shiftRef}>
            <div
              className="book3d"
              ref={bookRef}
              role="region"
              aria-roledescription="sketchbook"
              aria-label={`${book.title} pages`}
              style={{ "--cover": cover } as CSSProperties}
            >
              <div className="stack stack-left" ref={stackLeftRef} aria-hidden="true" />
              <div className="stack stack-right" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="reader-bar">
          <button className="icon-btn" type="button" aria-label="Previous page" disabled={state.flipped === 0} onClick={() => api.current?.prev()}>
            <ChevronLeft />
          </button>
          <div className="scrub">
            <input
              type="range"
              min={0}
              max={state.max}
              step={1}
              value={state.flipped}
              aria-label="Jump to page"
              onChange={(e) => api.current?.goTo(Number(e.target.value))}
            />
            <p className={`reader-hint${state.touched ? " is-hidden" : ""}`}>
              Drag a page corner, tap the edges, or use &larr; &rarr;
            </p>
          </div>
          <button className="icon-btn" type="button" aria-label="Next page" disabled={state.flipped >= state.max} onClick={() => api.current?.next()}>
            <ChevronRight />
          </button>
        </div>
      </main>
    </div>
  );
}
