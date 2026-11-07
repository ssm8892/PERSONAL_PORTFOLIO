#!/usr/bin/env node
/* ==========================================================================
   Brain geometry generator — run once:  npm run brain
   --------------------------------------------------------------------------
   Grows cortical folds with a Gray-Scott reaction-diffusion simulation inside
   two hemisphere masks (top-down view), traces the folds with marching
   squares, and writes vector geometry to public/brain.json.

   The browser never simulates anything: it just draws these paths.

   Output (all coordinates are integers in tenths of a grid cell; the grid is
   W x H cells, brain centered in it):
     left.outline / right.outline   closed polygon per hemisphere
     left.traces                    developer side: octilinear "circuit" paths
     left.vias                      trace endpoints [x, y, ...]
     right.folds                    artist side: smooth fold contours
     dev.bus                        circuit traces running off the left edge
     art.strokes                    loose brush strokes running off the right edge
     art.drops                      ink splatter [x, y, r, ...]
   ========================================================================== */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../public/brain.json");

/* ---------- Deterministic RNG ---------- */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261107);
const rr = (a, b) => a + rand() * (b - a);

/* ---------- Grid & hemisphere masks ---------- */
const W = 300;           // cells
const H = 350;
const MID = W / 2;
const GAP = 2.2;         // half-width of the longitudinal fissure
const TOP = 10, BOT = H - 10;
const HALF_MAX = 132;    // widest half-width

// Half-width profile along the front→back axis (t: 0 = frontal pole, 1 = occipital pole)
function halfWidth(t, side) {
  if (t <= 0 || t >= 1) return 0;
  const base = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.92)), 0.52);
  const temporal = 0.06 * Math.exp(-Math.pow((t - 0.58) / 0.16, 2)); // slight bulge at the temporal lobe
  const lumps =
    0.012 * Math.sin(t * 61 + (side ? 1.7 : 0.3)) +
    0.009 * Math.sin(t * 97 + (side ? 0.4 : 2.2)) +
    0.006 * Math.sin(t * 151 + (side ? 2.9 : 1.1));
  return HALF_MAX * (base + temporal) * (1 + lumps);
}
// Medial edge bows a little — hemispheres aren't perfectly straight at the fissure
const medialOffset = (t) => GAP + 1.2 * Math.sin(Math.PI * t);

function inside(x, y, side) {
  const t = (y - TOP) / (BOT - TOP);
  if (t <= 0 || t >= 1) return false;
  const m = medialOffset(t);
  const w = halfWidth(t, side);
  if (side === 0) return x <= MID - m && x >= MID - m - w;
  return x >= MID + m && x <= MID + m + w;
}

function outline(side) {
  const pts = [];
  const N = 220;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const y = TOP + t * (BOT - TOP);
    const m = medialOffset(t);
    const w = halfWidth(t, side);
    pts.push([side === 0 ? MID - m - w : MID + m + w, y]);
  }
  for (let i = N; i >= 0; i--) {
    const t = i / N;
    const y = TOP + t * (BOT - TOP);
    const m = medialOffset(t);
    pts.push([side === 0 ? MID - m : MID + m, y]);
  }
  return pts;
}

/* ---------- Gray-Scott reaction-diffusion ---------- */
function simulate(side, seedCount, iterations) {
  const N = W * H;
  let u = new Float32Array(N).fill(1);
  let v = new Float32Array(N);
  let u2 = new Float32Array(N);
  let v2 = new Float32Array(N);
  const mask = new Uint8Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inside(x + 0.5, y + 0.5, side)) mask[y * W + x] = 1;

  for (let s = 0; s < seedCount; s++) {
    let x, y;
    do { x = Math.floor(rr(0, W)); y = Math.floor(rr(0, H)); } while (!mask[y * W + x]);
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const i = (y + dy) * W + (x + dx);
      if (i >= 0 && i < N && mask[i]) { v[i] = 0.9; u[i] = 0.4; }
    }
  }

  // "Coral / maze" regime — produces labyrinthine ridges that read as gyri.
  const Du = 1.0, Dv = 0.5, F = 0.0545, K = 0.062, dt = 1.0;
  for (let it = 0; it < iterations; it++) {
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        if (!mask[i]) { u2[i] = 1; v2[i] = 0; continue; }
        const lu =
          -u[i] + 0.2 * (u[i - 1] + u[i + 1] + u[i - W] + u[i + W]) +
          0.05 * (u[i - W - 1] + u[i - W + 1] + u[i + W - 1] + u[i + W + 1]);
        const lv =
          -v[i] + 0.2 * (v[i - 1] + v[i + 1] + v[i - W] + v[i + W]) +
          0.05 * (v[i - W - 1] + v[i - W + 1] + v[i + W - 1] + v[i + W + 1]);
        const uvv = u[i] * v[i] * v[i];
        u2[i] = u[i] + dt * (Du * lu - uvv + F * (1 - u[i]));
        v2[i] = v[i] + dt * (Dv * lv + uvv - (F + K) * v[i]);
      }
    }
    [u, u2] = [u2, u];
    [v, v2] = [v2, v];
  }
  return { v, mask };
}

/* ---------- Marching squares → polylines ---------- */
function contours(field, iso) {
  // Segment endpoints are keyed by the grid edge they sit on, so joins are exact.
  const segs = [];
  const at = (x, y) => field[y * W + x];
  const interp = (a, b) => (iso - a) / (b - a);
  for (let y = 0; y < H - 1; y++) {
    for (let x = 0; x < W - 1; x++) {
      const a = at(x, y), b = at(x + 1, y), c = at(x + 1, y + 1), d = at(x, y + 1);
      const code = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0);
      if (code === 0 || code === 15) continue;
      const E = {
        t: { k: `h${x},${y}`, p: [x + interp(a, b), y] },
        r: { k: `v${x + 1},${y}`, p: [x + 1, y + interp(b, c)] },
        b: { k: `h${x},${y + 1}`, p: [x + interp(d, c), y + 1] },
        l: { k: `v${x},${y}`, p: [x, y + interp(a, d)] },
      };
      const table = {
        1: [["l", "b"]], 2: [["b", "r"]], 3: [["l", "r"]], 4: [["t", "r"]],
        5: [["l", "t"], ["b", "r"]], 6: [["t", "b"]], 7: [["l", "t"]], 8: [["l", "t"]],
        9: [["t", "b"]], 10: [["l", "b"], ["t", "r"]], 11: [["t", "r"]], 12: [["l", "r"]],
        13: [["b", "r"]], 14: [["l", "b"]],
      };
      for (const [p, q] of table[code]) segs.push([E[p], E[q]]);
    }
  }
  // Join segments into polylines
  const byKey = new Map();
  segs.forEach((s, i) => {
    for (const e of s) {
      if (!byKey.has(e.k)) byKey.set(e.k, []);
      byKey.get(e.k).push(i);
    }
  });
  const used = new Uint8Array(segs.length);
  const lines = [];
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const line = [segs[i][0], segs[i][1]];
    for (const dir of [1, 0]) {
      // extend from the tail (dir=1) then from the head (dir=0)
      for (;;) {
        const end = dir ? line[line.length - 1] : line[0];
        const next = (byKey.get(end.k) || []).find((j) => !used[j]);
        if (next == null) break;
        used[next] = 1;
        const s = segs[next];
        const other = s[0].k === end.k ? s[1] : s[0];
        if (dir) line.push(other);
        else line.unshift(other);
      }
    }
    const closed = line[0].k === line[line.length - 1].k;
    lines.push({ pts: line.map((e) => e.p), closed });
  }
  return lines;
}

/* ---------- Geometry helpers ---------- */
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy);
  let max = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    // Closed loop (first == last): distance to the start point instead of to a degenerate line,
    // otherwise every point measures 0 and the whole loop collapses.
    const d = len < 1e-9
      ? Math.hypot(pts[i][0] - ax, pts[i][1] - ay)
      : Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len;
    if (d > max) { max = d; idx = i; }
  }
  if (max <= eps) return [pts[0], pts[pts.length - 1]];
  return rdp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(pts.slice(idx), eps));
}
const pathLength = (pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);

// PCB-style routing: each hop becomes a 45° diagonal plus a straight run.
function octilinear(pts) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = out[out.length - 1];
    const [x1, y1] = pts[i];
    const dx = x1 - x0, dy = y1 - y0;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    const diag = Math.min(adx, ady);
    // Alternate which leg comes first for variety
    if (i % 2) {
      out.push([x0 + Math.sign(dx) * diag, y0 + Math.sign(dy) * diag]);
    } else if (adx > ady) {
      out.push([x0 + Math.sign(dx) * (adx - diag), y0]);
    } else {
      out.push([x0, y0 + Math.sign(dy) * (ady - diag)]);
    }
    out.push([x1, y1]);
  }
  // Drop zero-length and collinear points
  const clean = [out[0]];
  for (let i = 1; i < out.length; i++) {
    const p = out[i], q = clean[clean.length - 1];
    if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.3) continue;
    if (clean.length >= 2) {
      const o = clean[clean.length - 2];
      const cross = (q[0] - o[0]) * (p[1] - q[1]) - (q[1] - o[1]) * (p[0] - q[0]);
      if (Math.abs(cross) < 1e-6) { clean[clean.length - 1] = p; continue; }
    }
    clean.push(p);
  }
  return clean;
}

const pack = (pts) => pts.flatMap(([x, y]) => [Math.round(x * 10), Math.round(y * 10)]);

/* ---------- Build ---------- */
console.time("left hemisphere");
const L = simulate(0, 180, 9000);
console.timeEnd("left hemisphere");
console.time("right hemisphere");
const R = simulate(1, 180, 9000);
console.timeEnd("right hemisphere");

const ISO = 0.22;
const leftLines = contours(L.v, ISO).filter((l) => pathLength(l.pts) > 8);
const rightLines = contours(R.v, ISO).filter((l) => pathLength(l.pts) > 8);

// Developer side: the maze contours are long and connected, so cut them into
// many shorter runs separated by small gaps (each run gets a via at both ends),
// then route each run octilinearly like a PCB trace.
function chunks(pts) {
  const out = [];
  let cur = [pts[0]];
  let acc = 0;
  let target = rr(16, 56);
  let skipping = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (skipping > 0) {
      skipping -= d;
      if (skipping <= 0) { cur = [pts[i]]; acc = 0; target = rr(16, 56); }
      continue;
    }
    cur.push(pts[i]);
    acc += d;
    if (acc >= target) {
      out.push(cur);
      skipping = rr(3, 6);
      cur = [];
    }
  }
  if (cur.length > 1 && acc > 10) out.push(cur);
  return out;
}

const traces = [];
const vias = [];
for (const l of leftLines) {
  for (const run of chunks(l.pts)) {
    const routed = octilinear(rdp(run, 1.6));
    if (routed.length < 2 || pathLength(routed) < 8) continue;
    traces.push(pack(routed));
    vias.push(...pack([routed[0], routed[routed.length - 1]]));
  }
}

// Artist side: keep smooth contours.
const folds = rightLines.map((l) => pack(rdp(l.pts, 0.45)));

// Bus traces leaving the left hemisphere toward the screen edge
const bus = [];
for (let k = 0; k < 18; k++) {
  const t = 0.12 + (k / 17) * 0.76 + rr(-0.015, 0.015);
  const y = TOP + t * (BOT - TOP);
  const x = MID - medialOffset(t) - halfWidth(t, 0) + 1;
  const pts = [[x, y]];
  let cx = x - rr(6, 26);
  pts.push([cx, y]);
  const jog = rr(-1, 1) * rr(6, 22);
  pts.push([cx - Math.abs(jog), y + jog]);
  cx = cx - Math.abs(jog) - rr(10, 60);
  pts.push([cx, y + jog]);
  if (rand() < 0.55) {
    const jog2 = rr(-1, 1) * rr(4, 16);
    pts.push([cx - Math.abs(jog2), y + jog + jog2]);
    pts.push([-3 * H, y + jog + jog2]);
  } else {
    pts.push([-3 * H, y + jog]);
  }
  bus.push(pack(pts));
}

// Loose brush strokes leaving the right hemisphere toward the screen edge
const strokes = [];
for (let k = 0; k < 14; k++) {
  const t = 0.1 + (k / 13) * 0.8 + rr(-0.02, 0.02);
  const y0 = TOP + t * (BOT - TOP);
  const x0 = MID + medialOffset(t) + halfWidth(t, 1) - rr(4, 14);
  const pts = [[x0, y0]];
  let x = x0, y = y0;
  const drift = rr(-0.5, 0.5);
  const len = rr(0.8, 2.6) * H;
  const steps = 10;
  for (let s = 1; s <= steps; s++) {
    x += len / steps;
    y += drift * (len / steps) + Math.sin(s * rr(0.6, 1.2) + k) * rr(4, 14);
    pts.push([x, y]);
  }
  strokes.push({ w: Math.round(rr(4, 16) * 10) / 10, c: k % 6, p: pack(pts) });
}

// Ink splatter: a few bursts of droplets to the right of the brain
const drops = [];
for (let c = 0; c < 6; c++) {
  const cx = W + rr(0.05, 1.3) * H;
  const cy = rr(0.1, 0.9) * H;
  const n = Math.floor(rr(10, 26));
  for (let i = 0; i < n; i++) {
    const a = rr(0, Math.PI * 2);
    const d = Math.pow(rand(), 1.8) * rr(10, 46);
    const r = Math.max(0.6, Math.pow(rand(), 3) * 9);
    drops.push(Math.round((cx + Math.cos(a) * d) * 10), Math.round((cy + Math.sin(a) * d) * 10), Math.round(r * 10));
  }
}

const data = {
  W, H,
  left: { outline: pack(outline(0)), traces, vias },
  right: { outline: pack(outline(1)), folds },
  dev: { bus },
  art: { strokes, drops },
};

// Optional: BRAIN_DEBUG=<dir containing png.mjs> dumps the raw fields as images.
if (process.env.BRAIN_DEBUG) {
  const { pathToFileURL } = await import("node:url");
  const { writePNG } = await import(pathToFileURL(`${process.env.BRAIN_DEBUG}/png.mjs`).href);
  const g = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) g[i] = Math.min(255, Math.max(0, Math.round((L.v[i] + R.v[i]) * 400)));
  writePNG(`${process.env.BRAIN_DEBUG}/field.png`, W, H, g);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(data));
const kb = (JSON.stringify(data).length / 1024).toFixed(1);
console.log(`brain.json: ${traces.length} traces, ${folds.length} folds, ${kb} KB`);
