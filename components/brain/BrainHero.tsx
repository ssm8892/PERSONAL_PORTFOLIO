"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, type MouseEvent } from "react";
import { BrainRenderer, type BrainData, type Side } from "./renderer";
import styles from "./BrainHero.module.css";

let dataPromise: Promise<BrainData> | null = null;
function loadBrain() {
  dataPromise ??= fetch("/brain.json").then((r) => {
    if (!r.ok) throw new Error(`brain.json ${r.status}`);
    return r.json() as Promise<BrainData>;
  });
  return dataPromise;
}

const SIDES = [
  { side: "left" as const, href: "/developer", title: "Developer", sub: "Projects · Papers · Code" },
  { side: "right" as const, href: "/artist", title: "Artist", sub: "Gallery · Sketchbooks" },
];

export function BrainHero({ name, tagline }: { name: string; tagline: string }) {
  const router = useRouter();
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<BrainRenderer | null>(null);
  const floatRefs = useRef<Record<"left" | "right", HTMLSpanElement | null>>({ left: null, right: null });

  // Hover state lives on the DOM (data-attributes), not in React state:
  // it changes on every pointer move and must not re-render the tree.
  const setSide = useCallback((side: Side) => {
    const stage = stageRef.current;
    if (!stage || stage.dataset.leaving || stage.dataset.active === side) return;
    stage.dataset.active = side;
    if (side !== "none") stage.dataset.touched = "";
    rendererRef.current?.setActive(side);
  }, []);

  useEffect(() => {
    const stage = stageRef.current!;
    const canvas = canvasRef.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: BrainRenderer | null = null;
    let cancelled = false;

    // Fresh start each time the page becomes visible (Next keeps routes mounted while hidden).
    stage.dataset.active = "none";
    delete stage.dataset.leaving;

    loadBrain()
      .then((data) => {
        if (cancelled) return;
        renderer = new BrainRenderer(canvas, data, {
          reduceMotion: reduce,
          onLayout: (l) => {
            stage.style.setProperty("--lx", `${l.leftX}px`);
            stage.style.setProperty("--rx", `${l.rightX}px`);
            stage.style.setProperty("--cy", `${l.centerY}px`);
            stage.style.setProperty("--bh", `${l.height}px`);
          },
          // Labels drift a little against the brain, so they read as floating above it.
          onParallax: (x, y) => {
            const t = `translate3d(${(-x * 0.7).toFixed(2)}px, ${(-y * 0.7).toFixed(2)}px, 0)`;
            if (floatRefs.current.left) floatRefs.current.left.style.transform = t;
            if (floatRefs.current.right) floatRefs.current.right.style.transform = t;
          },
        });
        rendererRef.current = renderer;
        renderer.start();
        stage.dataset.ready = "";
      })
      .catch(() => {
        stage.dataset.ready = "";
      });

    const onMove = (e: PointerEvent) => renderer?.setPointer(e.clientX, e.clientY, true);
    const onLeave = () => {
      renderer?.setPointer(-1, -1, false);
      setSide("none");
    };
    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => renderer?.resize());
    };
    const onVisibility = () => (document.hidden ? renderer?.stop() : renderer?.start());

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer?.destroy();
      rendererRef.current = null;
    };
  }, [setSide]);

  function enter(e: MouseEvent<HTMLAnchorElement>, side: "left" | "right", href: string) {
    // New-tab / new-window clicks behave normally.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage || stage.dataset.leaving) return;
    setSide(side);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href);
      return;
    }
    // Fly into the chosen hemisphere, then hand off to the route transition.
    stage.dataset.leaving = side;
    window.setTimeout(() => router.push(href), 200);
  }

  return (
    <main ref={stageRef} className={styles.stage} data-active="none">
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

      <header className={styles.intro}>
        <p className={styles.name}>{name}</p>
        <p className={styles.tagline}>{tagline}</p>
      </header>

      <nav className={styles.sides} aria-label="Choose a side">
        {SIDES.map(({ side, href, title, sub }) => (
          <Link
            key={side}
            href={href}
            className={`${styles.side} ${side === "left" ? styles.sideLeft : styles.sideRight}`}
            onPointerEnter={() => setSide(side)}
            onPointerDown={() => setSide(side)}
            onFocus={() => setSide(side)}
            onClick={(e) => enter(e, side, href)}
          >
            <span className={styles.label}>
              <span className={styles.float} ref={(n) => { floatRefs.current[side] = n; }}>
                <span className={styles.title}>{title}</span>
                <span className={styles.sub}>{sub}</span>
                <span className={styles.enter} aria-hidden="true">
                  Enter {side === "left" ? "←" : "→"}
                </span>
              </span>
            </span>
          </Link>
        ))}
      </nav>

      <p className={styles.hint} aria-hidden="true">
        <span className={styles.hintFine}>Move across the brain · click a side to enter</span>
        <span className={styles.hintCoarse}>Tap a side to enter</span>
      </p>
    </main>
  );
}
