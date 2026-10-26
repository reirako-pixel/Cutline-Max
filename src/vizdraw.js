// Visualizer styles. Each draws one frame of a visualizer layer centred on the origin, inside a box
// w × h (canvas pixels); the engine has already applied position, rotation and scale, and adds the glow.
import { bandsAt, waveAt, levelAt, beatAt } from "./vizdata.js";

/** [id, name, icon, default box (px on a 1920-wide frame), default settings] */
export const VIZ_STYLES = [
  ["bars", "Spectrum bars", "chart-column", [1200, 360], { count: 48, thick: 0.62 }],
  ["mirror", "Mirror bars", "audio-lines", [1200, 420], { count: 56, thick: 0.55 }],
  ["wave", "Waveform line", "activity", [1400, 360], { thick: 0.35 }],
  ["hills", "Soft hills", "mountain", [1500, 380], { count: 40, thick: 0.3 }],
  ["circle", "Circle bars", "sun", [620, 620], { count: 96, thick: 0.45, radius: 0.55 }],
  ["ring", "Ring wave", "circle-dot", [600, 600], { count: 72, thick: 0.3, radius: 0.62 }],
  ["dots", "Dot matrix", "grip", [1100, 380], { count: 32, thick: 0.6 }],
  ["stardust", "Stardust", "sparkles", [1000, 700], { count: 140, thick: 0.4 }],
];

/** Ready-made looks for the library: [name, style, colour A, colour B, extra settings]. */
export const VIZ_PRESETS = [
  ["Neon bars", "bars", "#00f0ff", "#ff2bd6", { glow: 0.7 }],
  ["White bars", "bars", "#ffffff", "#ffffff", { glow: 0.25, thick: 0.4, count: 64 }],
  ["Centre bars", "bars", "#ffd23f", "#ff6a1a", { glow: 0.5, mirror: true }],
  ["Mirror spectrum", "mirror", "#ff3cac", "#7b5cff", { glow: 0.6 }],
  ["Silver mirror", "mirror", "#e8eef5", "#9fb3c8", { glow: 0.2, thick: 0.35, count: 80 }],
  ["Glow line", "wave", "#00f0ff", "#00f0ff", { glow: 0.9 }],
  ["White waveform", "wave", "#ffffff", "#ffffff", { glow: 0.3, thick: 0.25 }],
  ["Sunset line", "wave", "#ff6a1a", "#ff3cac", { glow: 0.7, thick: 0.5 }],
  ["Soft hills", "hills", "#3d8bff", "#00ffa3", { glow: 0.5 }],
  ["Candy hills", "hills", "#ff3cac", "#ffd23f", { glow: 0.4 }],
  ["Radial burst", "circle", "#ffffff", "#ffffff", { glow: 0.35 }],
  ["Iridescent circle", "circle", "#3d8bff", "#ff2bd6", { glow: 0.7, spin: 12 }],
  ["Neon ring", "ring", "#ff2bd6", "#00f0ff", { glow: 0.8, spin: 8 }],
  ["Golden ring", "ring", "#ffd23f", "#ff6a1a", { glow: 0.7 }],
  ["Dot matrix", "dots", "#ffffff", "#9fb3c8", { glow: 0.25 }],
  ["Neon dots", "dots", "#a6ff00", "#00ffa3", { glow: 0.6 }],
  ["Stardust", "stardust", "#ffd23f", "#ffffff", { glow: 0.7 }],
  ["Cosmic dust", "stardust", "#b26bff", "#00f0ff", { glow: 0.8 }],
];

export const vizStyleName = (id) => VIZ_STYLES.find((s) => s[0] === id)?.[1] || "Visualizer";

/** A full visualizer settings object for a style (+ colours / overrides). */
export function newViz(style, colorA = "#00f0ff", colorB = "#ff2bd6", extra = {}) {
  const def = VIZ_STYLES.find((s) => s[0] === style) || VIZ_STYLES[0];
  const [w, h] = def[3];
  return { style: def[0], w, h, colorA, colorB, glow: 0.5, sens: 1, smooth: 0.3, spin: 0, mirror: false, radius: 0.55, ...def[4], ...extra };
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
let buf = new Float32Array(256);
const scratchBands = (n) => (buf.length >= n ? buf.subarray(0, n) : (buf = new Float32Array(n)));

/** Band values for n items; with `sym`, low notes sit in the middle and the two halves mirror. */
function values(v, t, n, sym) {
  const out = scratchBands(n);
  if (!sym) { bandsAt(t, n, v.smooth, out); }
  else {
    const half = Math.ceil(n / 2), b = bandsAt(t, half, v.smooth, new Float32Array(half));
    const mid = (n - 1) / 2 || 1;
    for (let i = 0; i < n; i++) out[i] = b[Math.round((Math.abs(i - mid) / mid) * (half - 1))];
  }
  for (let i = 0; i < n; i++) out[i] = clamp01(out[i] * v.sens);
  return out;
}

function linear(c, v, w) {
  const g = c.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, v.colorA); g.addColorStop(1, v.colorB);
  return g;
}
function conic(c, v, rot) {
  if (!c.createConicGradient) return v.colorA;
  const g = c.createConicGradient(rot, 0, 0);
  g.addColorStop(0, v.colorA); g.addColorStop(0.5, v.colorB); g.addColorStop(1, v.colorA);
  return g;
}
function rounded(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  if (r <= 0.5) { c.rect(x, y, w, h); return; }
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
/** A smooth path through points (midpoint quadratic curves). */
function smoothPath(c, pts, closed) {
  const n = pts.length;
  if (n < 2) return;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (closed) {
    const m0 = mid(pts[n - 1], pts[0]);
    c.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) { const m = mid(pts[i], pts[(i + 1) % n]); c.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); }
    c.closePath();
  } else {
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n - 1; i++) { const m = mid(pts[i], pts[i + 1]); c.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); }
    c.lineTo(pts[n - 1][0], pts[n - 1][1]);
  }
}

const DRAW = {
  bars(c, v, t, w, h, k) {
    const n = Math.max(4, Math.round(v.count)), vals = values(v, t, n, v.mirror);
    const slot = w / n, bw = Math.max(1, slot * (0.15 + 0.8 * v.thick));
    c.fillStyle = linear(c, v, w);
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const bh = Math.max(bw * 0.6, vals[i] * h);
      rounded(c, -w / 2 + i * slot + (slot - bw) / 2, h / 2 - bh, bw, bh, bw / 2);
    }
    c.fill();
  },
  mirror(c, v, t, w, h) {
    const n = Math.max(4, Math.round(v.count)), vals = values(v, t, n, v.mirror);
    const slot = w / n, bw = Math.max(1, slot * (0.15 + 0.8 * v.thick));
    c.fillStyle = linear(c, v, w);
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const bh = Math.max(bw, vals[i] * h);
      rounded(c, -w / 2 + i * slot + (slot - bw) / 2, -bh / 2, bw, bh, bw / 2);
    }
    c.fill();
  },
  wave(c, v, t, w, h, k) {
    const n = 160, p = waveAt(t, n), pts = [];
    const env = 0.35 + 0.65 * levelAt(t);
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + (i / (n - 1)) * w, taper = Math.sin((Math.PI * i) / (n - 1));
      pts.push([x, -clamp01(Math.abs(p[i] * v.sens)) * Math.sign(p[i]) * (h / 2) * taper * env]);
    }
    c.lineWidth = Math.max(1.5, (2 + v.thick * 14) * k);
    c.lineJoin = c.lineCap = "round";
    c.strokeStyle = linear(c, v, w);
    c.beginPath(); smoothPath(c, pts, false); c.stroke();
  },
  hills(c, v, t, w, h, k) {
    const n = Math.max(8, Math.round(v.count)), vals = values(v, t, n, true), pts = [];
    for (let i = 0; i < n; i++) pts.push([-w / 2 + (i / (n - 1)) * w, h / 2 - Math.max(0.02, vals[i]) * h]);
    const g = c.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, v.colorA); g.addColorStop(1, v.colorB + "00");
    c.beginPath(); smoothPath(c, pts, false); c.lineTo(w / 2, h / 2); c.lineTo(-w / 2, h / 2); c.closePath();
    c.globalAlpha *= 0.75; c.fillStyle = g; c.fill(); c.globalAlpha /= 0.75;
    c.lineWidth = Math.max(1.5, (2 + v.thick * 10) * k);
    c.lineJoin = c.lineCap = "round";
    c.strokeStyle = linear(c, v, w);
    c.beginPath(); smoothPath(c, pts, false); c.stroke();
  },
  circle(c, v, t, w, h, k) {
    const R = Math.min(w, h) / 2, r0 = R * Math.max(0.15, Math.min(0.9, v.radius)), n = Math.max(12, Math.round(v.count));
    const vals = values(v, t, n, true), rot = ((v.spin || 0) * t * Math.PI) / 180 - Math.PI / 2;
    c.lineWidth = Math.max(1.5, ((2 * Math.PI * r0) / n) * (0.15 + 0.75 * v.thick));
    c.lineCap = "round";
    c.strokeStyle = conic(c, v, rot);
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const a = rot + (i / n) * Math.PI * 2, len = Math.max(c.lineWidth, vals[i] * (R - r0));
      c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      c.lineTo(Math.cos(a) * (r0 + len), Math.sin(a) * (r0 + len));
    }
    c.stroke();
  },
  ring(c, v, t, w, h, k) {
    const R = Math.min(w, h) / 2, r0 = R * Math.max(0.2, Math.min(0.9, v.radius)), n = Math.max(16, Math.round(v.count));
    const vals = values(v, t, n, true), rot = ((v.spin || 0) * t * Math.PI) / 180 - Math.PI / 2;
    const path = (scale, phase) => {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = rot + phase + (i / n) * Math.PI * 2, r = r0 + vals[i] * (R - r0) * scale;
        pts.push([Math.cos(a) * r, Math.sin(a) * r]);
      }
      c.beginPath(); smoothPath(c, pts, true);
    };
    c.lineJoin = "round";
    c.lineWidth = Math.max(1.5, (2 + v.thick * 12) * k);
    c.strokeStyle = conic(c, v, rot);
    path(1, 0); c.stroke();
    c.globalAlpha *= 0.45; path(0.6, Math.PI / n); c.stroke(); c.globalAlpha /= 0.45;
    c.globalAlpha *= 0.25; c.beginPath(); c.arc(0, 0, r0 * 0.96, 0, Math.PI * 2); c.stroke(); c.globalAlpha /= 0.25;
  },
  dots(c, v, t, w, h) {
    const n = Math.max(6, Math.round(v.count)), vals = values(v, t, n, v.mirror);
    const slot = w / n, rows = Math.max(3, Math.round(h / slot)), rs = h / rows;
    const r = Math.max(1, Math.min(slot, rs) * (0.12 + 0.36 * v.thick));
    const lit = new Path2D(), dim = new Path2D();
    for (let i = 0; i < n; i++) {
      const on = Math.round(vals[i] * rows), x = -w / 2 + (i + 0.5) * slot;
      for (let j = 0; j < rows; j++) {
        const y = h / 2 - (j + 0.5) * rs, p = j < on ? lit : dim;
        p.moveTo(x + r, y); p.arc(x, y, r, 0, Math.PI * 2);
      }
    }
    c.fillStyle = linear(c, v, w);
    c.globalAlpha *= 0.14; c.fill(dim); c.globalAlpha /= 0.14;
    c.fill(lit);
  },
  stardust(c, v, t, w, h, k) {
    const n = Math.max(20, Math.round(v.count)), beat = beatAt(t) * v.sens, lv = levelAt(t) * v.sens;
    const R = Math.max(w, h) / 2;
    // Each speck has fixed random values; its distance from the centre loops over time, faster on loud parts.
    for (let i = 0; i < n; i++) {
      const rnd = (s) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
      const a = rnd(1) * Math.PI * 2 + (v.spin || 0) * t * Math.PI / 180;
      const speed = 0.08 + rnd(2) * 0.22;
      const d = (rnd(3) + t * speed * (1 + lv)) % 1;
      const x = Math.cos(a) * d * (w / 2), y = Math.sin(a) * d * (h / 2);
      const size = (0.6 + rnd(4) * 2.2) * (1 + beat * 1.8) * (1 + v.thick) * k * 2;
      c.globalAlpha = Math.min(1, (1 - d) * (0.35 + 0.65 * Math.max(lv, rnd(5) * 0.6)) + beat * 0.3);
      c.fillStyle = i % 3 ? v.colorA : v.colorB;
      c.beginPath(); c.arc(x, y, size, 0, Math.PI * 2); c.fill();
    }
    // A soft core that swells with the bass.
    const core = c.createRadialGradient(0, 0, 0, 0, 0, R * (0.12 + 0.18 * beat));
    core.addColorStop(0, v.colorB); core.addColorStop(1, v.colorB + "00");
    c.globalAlpha = 0.35 + 0.5 * beat;
    c.fillStyle = core; c.beginPath(); c.arc(0, 0, R * (0.12 + 0.18 * beat), 0, Math.PI * 2); c.fill();
  },
};

/** Draws visualizer settings `v` at time t; k = canvas width / 1920. */
export function drawVizStyle(c, v, t, k) {
  const w = v.w * k, h = v.h * k;
  (DRAW[v.style] || DRAW.bars)(c, v, t, w, h, k);
}
