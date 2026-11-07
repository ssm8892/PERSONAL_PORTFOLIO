"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import type { GalleryPiece } from "@/content/types";
import { ChevronLeft, ChevronRight, Close } from "@/lib/icons";
import { project } from "@/lib/spring";

export function Gallery({ pieces }: { pieces: GalleryPiece[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState(0);
  const [swapping, setSwapping] = useState(false);
  const drag = useRef<{ id: number; x0: number; y0: number; dx: number; t: number; v: number; locked: boolean } | null>(null);

  const piece = pieces[index];
  const n = pieces.length;

  // Next keeps hidden routes mounted — make sure the dialog never survives a navigation.
  useEffect(() => {
    const d = dialogRef.current;
    return () => d?.close();
  }, []);

  function open(i: number, from: HTMLElement) {
    returnFocus.current = from;
    setIndex(i);
    dialogRef.current?.showModal();
  }

  function show(i: number) {
    // Short crossfade so the swap doesn't teleport.
    setSwapping(true);
    window.setTimeout(() => {
      setIndex(((i % n) + n) % n);
      setSwapping(false);
    }, 120);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
  }

  /* Swipe: the image tracks the finger 1:1; release projects momentum to decide. */
  function onPointerDown(e: RPointerEvent) {
    if (e.pointerType === "mouse" || n < 2) return;
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, t: e.timeStamp, v: 0, locked: false };
  }
  function onPointerMove(e: RPointerEvent) {
    const d = drag.current;
    const img = imgRef.current;
    if (!d || e.pointerId !== d.id || !img) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.locked) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return; // hysteresis
      if (Math.abs(dy) > Math.abs(dx)) { drag.current = null; return; }
      d.locked = true;
      mediaRef.current?.setPointerCapture(e.pointerId);
      img.style.transition = "none";
    }
    const dt = Math.max(1, e.timeStamp - d.t);
    d.v = ((dx - d.dx) / dt) * 1000;
    d.dx = dx;
    d.t = e.timeStamp;
    img.style.transform = `translateX(${dx}px)`;
  }
  function onPointerUp() {
    const d = drag.current;
    const img = imgRef.current;
    drag.current = null;
    if (!d?.locked || !img) return;
    const projected = d.dx + project(d.v, 0.99);
    const threshold = (mediaRef.current?.clientWidth ?? 400) * 0.25;
    img.style.transition = "transform 300ms var(--ease-out), opacity 150ms ease";
    img.style.transform = "";
    if (projected < -threshold) show(index + 1);
    else if (projected > threshold) show(index - 1);
  }

  if (!n) return <p>No pieces yet — add some in content/artist.ts.</p>;

  return (
    <>
      <div className="masonry">
        {pieces.map((p, i) => {
          const meta = [p.medium, p.year].filter(Boolean).join(", ");
          return (
            <button
              key={p.src}
              type="button"
              className="tile rise"
              style={{ "--i": Math.min(i, 8) + 4 } as CSSProperties}
              aria-label={`View ${p.title}`}
              onClick={(e) => open(i, e.currentTarget)}
            >
              <div className="tile-img">
                {/* Plain <img>: artwork is shown as-is, at its own aspect ratio */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.alt ?? p.title} width={p.width} height={p.height} loading={i < 3 ? "eager" : "lazy"} decoding="async" />
              </div>
              <div className="tile-cap">
                <span className="tile-title">{p.title}</span>
                {meta && <span className="tile-meta">{meta}</span>}
              </div>
            </button>
          );
        })}
      </div>

      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-labelledby="lbTitle"
        onKeyDown={onKeyDown}
        onClose={() => returnFocus.current?.focus({ preventScroll: true })}
        onClick={(e) => { if (e.target === e.currentTarget) dialogRef.current?.close(); }}
      >
        <div
          className="lb-media"
          ref={mediaRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={imgRef} src={piece.src} alt={piece.alt ?? piece.title} className={swapping ? "is-swapping" : undefined} draggable={false} />
        </div>
        <div className="lb-info">
          <div>
            <h2 id="lbTitle">{piece.title}</h2>
            <p className="lb-meta">{[piece.medium, piece.year].filter(Boolean).join(" · ")}</p>
            {piece.description && <p className="lb-desc">{piece.description}</p>}
          </div>
          <div className="lb-controls">
            <span className="lb-count">{index + 1} / {n}</span>
            <button className="icon-btn" type="button" aria-label="Previous piece" disabled={n < 2} onClick={() => show(index - 1)}><ChevronLeft /></button>
            <button className="icon-btn" type="button" aria-label="Next piece" disabled={n < 2} onClick={() => show(index + 1)}><ChevronRight /></button>
          </div>
        </div>
        <button className="icon-btn lb-close" type="button" aria-label="Close" onClick={() => dialogRef.current?.close()}><Close /></button>
      </dialog>
    </>
  );
}
