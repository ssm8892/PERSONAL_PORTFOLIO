/* ==========================================================================
   Sketchbook reader engine — a page-flip book driven by springs.

   Model
   - A book is a stack of leaves. Each leaf has a front face and a back face
     and rotates around the spine: 0° = lying on the right, -180° = on the left.
   - Each leaf owns a spring. A flip only changes that spring's target, so a
     page can be grabbed mid-flight and thrown back the other way.
   - "Flipped" = the leaves whose target is -180°. They always form a prefix.

   Gestures
   - Drag: the leaf tracks the pointer 1:1. The page's free edge follows the
     finger (cos θ = horizontal reach), respecting where you grabbed it.
   - Release: momentum is projected forward to decide which way the page falls;
     the release velocity is handed to the spring so there is no seam.
   - Tap the right/left side, arrow keys, buttons, or the scrubber.
   ========================================================================== */

import type { Sketchbook, SketchbookPage } from "@/content/types";
import { Spring, project } from "@/lib/spring";

type Mode = "double" | "single";

type FaceSpec =
  | { kind: "cover" | "back-cover" | "endpaper-front" | "endpaper-back" | "end" | "blank" }
  | { kind: "drawing"; page: SketchbookPage; num: number };

type Leaf = {
  el: HTMLDivElement;
  i: number;
  shadeF: HTMLDivElement;
  shadeB: HTMLDivElement;
  spring: Spring;
  startAt: number;
  dragging: boolean;
};

export type ReaderElements = {
  stage: HTMLElement;
  shift: HTMLElement;
  book: HTMLElement;
  stackLeft: HTMLElement;
};

export type ReaderState = { flipped: number; max: number; label: string; touched: boolean };

export type ReaderOptions = {
  book: Sketchbook;
  ownerName: string;
  initialFlipped: number;
  reduceMotion: () => boolean;
  onChange: (s: ReaderState) => void;
  onNavigate: (href: string) => void;
};

export type ReaderApi = {
  next: () => void;
  prev: () => void;
  goTo: (n: number) => void;
  destroy: () => void;
};

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

export function mountReader(els: ReaderElements, opts: ReaderOptions): ReaderApi {
  const { stage, shift, book: bookEl, stackLeft } = els;
  const { book, ownerName } = opts;
  const pages = book.pages;
  const aspect = book.aspect ?? 0.75;
  const RAD = Math.PI / 180;

  /* ---------- Faces ---------- */

  const drawingFaces: FaceSpec[] = pages.map((p, i) => ({ kind: "drawing", page: p, num: i + 1 }));

  function faceEl(spec: FaceSpec, side: "front" | "back") {
    const face = el("div", `face ${side}`);
    const shade = el("div", "shade");
    switch (spec.kind) {
      case "cover": {
        face.classList.add("cover");
        if (book.cover) face.classList.add("has-image");
        const inner = el("div", "cover-inner");
        const top = el("div");
        top.append(el("p", "cover-kicker", "Sketchbook"), el("p", "cover-title", book.title));
        if (book.subtitle) top.append(el("p", "cover-sub", book.subtitle));
        inner.append(top, el("p", "cover-foot", [ownerName, book.year].filter(Boolean).join(" · ")));
        face.append(inner);
        break;
      }
      case "back-cover":
        face.classList.add("back-cover");
        break;
      case "endpaper-front": {
        face.classList.add("endpaper");
        const inner = el("div", "endpaper-inner");
        inner.append(
          el("p", "muted", "This sketchbook belongs to"),
          el("p", "owner", ownerName),
          el("p", "muted", [book.title, book.year].filter(Boolean).join(", "))
        );
        face.append(inner);
        break;
      }
      case "endpaper-back":
      case "end": {
        face.classList.add("endpaper");
        const inner = el("div", "endpaper-inner");
        const back = el("a", undefined, "Back to sketchbooks");
        back.href = "/artist#sketchbooks";
        back.addEventListener("click", (e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          opts.onNavigate(back.getAttribute("href")!);
        });
        const muted = el("p", "muted");
        muted.append(back);
        inner.append(el("p", "owner", "Fin."), muted);
        face.append(inner);
        break;
      }
      case "drawing": {
        const p = spec.page;
        const img = el("img", "drawing");
        img.src = p.src;
        img.alt = p.alt ?? p.title ?? `Page ${spec.num}`;
        img.draggable = false;
        img.loading = spec.num <= 4 ? "eager" : "lazy";
        img.decoding = "async";
        face.append(img);
        if (p.title || p.caption) {
          const cap = el("p", "page-cap");
          if (p.title) cap.append(el("strong", undefined, p.title));
          if (p.caption) cap.append(el("span", undefined, p.caption));
          face.append(cap);
        }
        face.append(el("span", "page-num", String(spec.num)));
        break;
      }
      default:
        break; // blank paper
    }
    face.append(shade);
    return { face, shade };
  }

  /* ---------- Build leaves for a layout mode ---------- */

  let mode: Mode | null = null;
  let leaves: Leaf[] = [];
  let maxFlipped = 0;
  let pageW = 0;
  let touched = false;

  function sheetsFor(m: Mode): { sheets: [FaceSpec, FaceSpec][]; max: number } {
    if (m === "double") {
      const faces: FaceSpec[] = [{ kind: "cover" }, { kind: "endpaper-front" }, ...drawingFaces];
      if (faces.length % 2) faces.push({ kind: "blank" });
      faces.push({ kind: "endpaper-back" }, { kind: "back-cover" });
      const sheets: [FaceSpec, FaceSpec][] = [];
      for (let i = 0; i < faces.length; i += 2) sheets.push([faces[i], faces[i + 1]]);
      return { sheets, max: sheets.length };
    }
    const sheets: [FaceSpec, FaceSpec][] = [
      [{ kind: "cover" }, { kind: "blank" }],
      ...drawingFaces.map((f): [FaceSpec, FaceSpec] => [f, { kind: "blank" }]),
      [{ kind: "end" }, { kind: "blank" }],
    ];
    return { sheets, max: sheets.length - 1 }; // the last sheet stays down
  }

  // Keep your place when the layout switches (e.g. rotating a phone).
  function flippedForDrawing(m: Mode, idx: number) {
    if (idx < 0) return 0;
    if (m === "double") {
      const f = 2 + idx;
      return f % 2 ? (f + 1) / 2 : f / 2;
    }
    return idx + 1;
  }
  function drawingForFlipped(m: Mode, c: number) {
    if (m === "double") return Math.min(Math.max(2 * c - 3, c === 0 ? -1 : 0), pages.length - 1);
    return Math.min(c - 1, pages.length - 1);
  }

  function build(m: Mode, flipped: number) {
    leaves.forEach((l) => l.el.remove());
    mode = m;
    const { sheets, max } = sheetsFor(m);
    maxFlipped = max;
    flipped = Math.max(0, Math.min(flipped, max));
    leaves = sheets.map(([frontSpec, backSpec], i) => {
      const leafEl = el("div", "leaf");
      const f = faceEl(frontSpec, "front");
      const b = faceEl(backSpec, "back");
      leafEl.append(f.face, b.face);
      bookEl.append(leafEl);
      return {
        el: leafEl,
        i,
        shadeF: f.shade,
        shadeB: b.shade,
        spring: new Spring({ value: i < flipped ? -180 : 0, response: 0.55, damping: 1 }),
        startAt: 0,
        dragging: false,
      };
    });
    leaves.forEach(render);
    onTargetsChanged();
  }

  /* ---------- Rendering ---------- */

  function render(leaf: Leaf) {
    const a = Math.max(-180, Math.min(0, leaf.spring.value));
    leaf.el.style.transform = `rotateY(${a.toFixed(3)}deg)`;
    // Stacking: on the right, earlier leaves are on top; on the left, later ones.
    leaf.el.style.zIndex = String(a > -90 ? leaves.length - leaf.i + 1 : leaf.i + 1);
    const lift = Math.sin(-a * RAD); // 0 flat → 1 upright
    leaf.shadeF.style.opacity = a > -90 ? (lift * 0.7).toFixed(3) : "0";
    leaf.shadeB.style.opacity = a <= -90 ? (lift * 0.7).toFixed(3) : "0";
  }

  let raf = 0;
  let lastT = 0;
  function frame(t: number) {
    const dt = lastT ? (t - lastT) / 1000 : 1 / 60;
    lastT = t;
    let moving = false;
    for (const leaf of leaves) {
      if (leaf.dragging) { moving = true; continue; }
      if (leaf.startAt && t < leaf.startAt) { moving = true; continue; }
      leaf.startAt = 0;
      const prev = leaf.spring.value;
      const still = leaf.spring.step(dt);
      if (still || prev !== leaf.spring.value) render(leaf);
      if (still) moving = true;
    }
    if (moving) raf = requestAnimationFrame(frame);
    else { raf = 0; lastT = 0; }
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  /* ---------- State ---------- */

  function flippedCount() {
    let c = 0;
    while (c < leaves.length && leaves[c].spring.target === -180) c++;
    return c;
  }

  function labelFor(c: number) {
    const n = pages.length;
    const pagesWord = `${n} ${n === 1 ? "page" : "pages"}`;
    if (c === 0) return `Cover · ${pagesWord}`;
    if (mode === "double") {
      if (c >= leaves.length) return "Back cover";
      const vis = [2 * c - 2, 2 * c - 1].filter((x) => x >= 1 && x <= n);
      if (!vis.length) return c === 1 ? pagesWord : "End";
      return vis.length === 2 ? `Pages ${vis[0]}–${vis[1]} of ${n}` : `Page ${vis[0]} of ${n}`;
    }
    return c <= n ? `Page ${c} of ${n}` : "End";
  }

  function onTargetsChanged(userAction = false) {
    const c = flippedCount();
    if (userAction) touched = true;

    // Thickness on each side + center the book when it's closed
    bookEl.classList.toggle("has-left", c > 0);
    bookEl.classList.toggle("has-right", c < leaves.length);
    let offset = 0;
    if (mode === "single" || c === 0) offset = -pageW / 2;
    else if (c >= leaves.length) offset = pageW / 2;
    shift.style.transform = `translateX(${offset}px)`;
    stackLeft.style.visibility = mode === "single" ? "hidden" : "";

    opts.onChange({ flipped: c, max: maxFlipped, label: labelFor(c), touched });

    // Remember the page in the URL without a navigation.
    try {
      const url = new URL(window.location.href);
      if (c) url.searchParams.set("page", String(c));
      else url.searchParams.delete("page");
      window.history.replaceState(window.history.state, "", url);
    } catch { /* ignore */ }
  }

  /* ---------- Flipping ---------- */

  function setTarget(leaf: Leaf, target: number, { velocity, delay = 0 }: { velocity?: number; delay?: number } = {}) {
    leaf.spring.target = target;
    if (velocity != null) leaf.spring.velocity = velocity;
    leaf.startAt = delay ? performance.now() + delay : 0;
    if (opts.reduceMotion()) {
      leaf.spring.snap(target);
      leaf.startAt = 0;
      render(leaf);
    }
  }

  function softSwap() {
    // Reduced motion: no page swing, just a gentle cross-fade.
    if (opts.reduceMotion()) bookEl.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 200, easing: "ease" });
  }

  function goTo(n: number) {
    n = Math.max(0, Math.min(maxFlipped, n));
    const c = flippedCount();
    if (n === c) return;
    // Riffle: several pages flip in quick succession, like thumbing through.
    const gap = Math.min(70, 400 / Math.abs(n - c));
    if (n > c) for (let i = c, k = 0; i < n; i++, k++) setTarget(leaves[i], -180, { delay: k * gap });
    else for (let i = c - 1, k = 0; i >= n; i--, k++) setTarget(leaves[i], 0, { delay: k * gap });
    softSwap();
    onTargetsChanged(true);
    kick();
  }
  const next = () => goTo(flippedCount() + 1);
  const prev = () => goTo(flippedCount() - 1);

  function onKey(e: KeyboardEvent) {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); prev(); }
    else if (e.key === "Home") { e.preventDefault(); goTo(0); }
    else if (e.key === "End") { e.preventDefault(); goTo(maxFlipped); }
  }

  /* ---------- Direct manipulation ---------- */

  type Drag = {
    id: number; x0: number; y0: number; locked: boolean; onLink: boolean;
    leaf: Leaf | null; cos0: number; r: number; samples: { t: number; a: number }[];
  };
  let drag: Drag | null = null;
  let pressMoved = false;

  const spineX = () => {
    const r = bookEl.getBoundingClientRect();
    return r.left + r.width / 2;
  };

  const onDragStart = (e: Event) => e.preventDefault();

  // A press that moved is a drag, never a click (e.g. on the "Back" link inside the book).
  const onClickCapture = (e: MouseEvent) => {
    if (pressMoved) { e.preventDefault(); e.stopPropagation(); }
  };

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    pressMoved = false;
    drag = {
      id: e.pointerId, x0: e.clientX, y0: e.clientY, locked: false,
      onLink: !!(e.target as HTMLElement).closest("a"), leaf: null, cos0: 1, r: 1, samples: [],
    };
  }

  function onPointerMove(e: PointerEvent) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0;
    const dy = e.clientY - drag.y0;

    if (!drag.locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return; // hysteresis
      pressMoved = true;
      if (Math.abs(dy) > Math.abs(dx) * 1.2) { drag = null; return; }
      const c = flippedCount();
      // Direction of travel picks the page: pull left to turn forward, right to turn back.
      const leaf = dx < 0 ? (c < maxFlipped ? leaves[c] : null) : c > 0 ? leaves[c - 1] : null;
      if (!leaf) { drag = null; return; }
      drag.locked = true;
      drag.leaf = leaf;
      leaf.dragging = true;
      leaf.startAt = 0;
      bookEl.setPointerCapture(e.pointerId);
      bookEl.classList.add("is-dragging");

      // Start from the page's *current* angle (it may be mid-flight), and keep
      // the grab offset: the reach is how far from the spine you took hold.
      const a0 = Math.max(-180, Math.min(0, leaf.spring.value));
      drag.cos0 = Math.cos(-a0 * RAD);
      drag.x0 = e.clientX;
      const reach = Math.abs(drag.x0 - spineX());
      drag.r = Math.max(pageW * 0.4, Math.min(pageW, reach || pageW));
      drag.samples = [{ t: e.timeStamp, a: a0 }];
      if (!touched) { touched = true; onTargetsChanged(); }
      kick();
    }

    const leaf = drag.leaf!;
    const cos = Math.max(-1, Math.min(1, drag.cos0 + (e.clientX - drag.x0) / drag.r));
    const angle = -Math.acos(cos) / RAD;
    leaf.spring.value = angle;
    leaf.spring.velocity = 0;
    render(leaf);

    drag.samples.push({ t: e.timeStamp, a: angle });
    while (drag.samples.length > 2 && e.timeStamp - drag.samples[0].t > 100) drag.samples.shift();
  }

  function endDrag(e: PointerEvent) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    bookEl.classList.remove("is-dragging");

    if (!d.locked) {
      // A tap. Right side turns forward, left side turns back.
      if (d.onLink || e.type === "pointercancel" || pressMoved) return;
      const x = e.clientX - spineX();
      const back = mode === "single" ? x < pageW * 0.3 : x < 0;
      if (back) prev(); else next();
      return;
    }

    const leaf = d.leaf!;
    leaf.dragging = false;
    const s = d.samples;
    const first = s[0], last = s[s.length - 1];
    const dt = (last.t - first.t) / 1000;
    const v = dt > 0 ? (last.a - first.a) / dt : 0; // deg/s

    // Project where the throw would come to rest, then let it fall that way.
    const projected = leaf.spring.value + project(v);
    setTarget(leaf, projected < -90 ? -180 : 0, { velocity: v });
    softSwap();
    onTargetsChanged(true);
    kick();
  }

  const onLostCapture = (e: PointerEvent) => { if (drag?.locked) endDrag(e); };

  /* ---------- Layout ---------- */

  function layout(initial = false) {
    const pad = 24;
    const W = stage.clientWidth - pad * 2;
    const H = stage.clientHeight - pad * 2;
    const m: Mode = W >= 720 ? "double" : "single";
    let pageH = m === "double" ? Math.min(H, W / 2 / aspect) : Math.min(H, W / aspect);
    pageH = Math.max(160, Math.floor(pageH));
    pageW = Math.floor(pageH * aspect);
    bookEl.style.setProperty("--bw", `${pageW * 2}px`);
    bookEl.style.setProperty("--bh", `${pageH}px`);

    if (m !== mode) {
      const c = initial ? opts.initialFlipped : flippedCount();
      const keep = initial || !mode ? null : drawingForFlipped(mode, c);
      build(m, keep == null ? c : flippedForDrawing(m, keep));
    } else {
      onTargetsChanged();
    }
  }

  /* ---------- Wire up ---------- */

  bookEl.addEventListener("dragstart", onDragStart);
  bookEl.addEventListener("click", onClickCapture, true);
  bookEl.addEventListener("pointerdown", onPointerDown);
  bookEl.addEventListener("pointermove", onPointerMove);
  bookEl.addEventListener("pointerup", endDrag);
  bookEl.addEventListener("pointercancel", endDrag);
  bookEl.addEventListener("lostpointercapture", onLostCapture);
  document.addEventListener("keydown", onKey);

  // Don't animate the very first placement.
  shift.style.transition = "none";
  layout(true);
  const r1 = requestAnimationFrame(() => {
    shift.style.transition = "";
  });

  let resizeRaf = 0;
  const onResize = () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => layout());
  };
  window.addEventListener("resize", onResize);

  return {
    next,
    prev,
    goTo,
    destroy() {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(r1);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
      bookEl.removeEventListener("dragstart", onDragStart);
      bookEl.removeEventListener("click", onClickCapture, true);
      bookEl.removeEventListener("pointerdown", onPointerDown);
      bookEl.removeEventListener("pointermove", onPointerMove);
      bookEl.removeEventListener("pointerup", endDrag);
      bookEl.removeEventListener("pointercancel", endDrag);
      bookEl.removeEventListener("lostpointercapture", onLostCapture);
      leaves.forEach((l) => l.el.remove());
      leaves = [];
    },
  };
}
