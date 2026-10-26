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
  ["halo", "Hologram ring", "circle-dashed", [680, 680], { count: 180, thick: 0.35, radius: 0.6 }],
  ["flame", "Flame ring", "flame", [680, 680], { count: 64, thick: 0.5, radius: 0.55 }],
  ["badge", "Music badge", "disc-3", [640, 640], { count: 150, thick: 0.4, radius: 0.55 }],
  ["sparkle", "Sparkle beam", "minus", [1700, 420], { count: 320, thick: 0.4 }],
  ["hud", "Tech circle", "radar", [660, 660], { count: 120, thick: 0.35, radius: 0.8 }],
  ["led", "LED blocks", "chart-no-axes-column", [1100, 420], { count: 24, thick: 0.7, reflect: true }],
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
  ["Hologram ring", "halo", "#ff4fd8", "#3df2ff", { glow: 0.7, spin: 6 }],
  ["Silver halo", "halo", "#ffffff", "#b9c7ff", { glow: 0.6 }],
  ["Rainbow flame", "flame", "#ffd23f", "#7b5cff", { glow: 0.7, rainbow: true, spin: 10 }],
  ["Neon flame", "flame", "#ff2bd6", "#00f0ff", { glow: 0.8 }],
  ["Music badge", "badge", "#3d8bff", "#ff3cac", { glow: 0.7 }],
  ["Sunset badge", "badge", "#ffd23f", "#ff3c6e", { glow: 0.6 }],
  ["Sparkle beam", "sparkle", "#7b5cff", "#3d8bff", { glow: 0.8 }],
  ["Ice beam", "sparkle", "#3df2ff", "#ffffff", { glow: 0.8 }],
  ["Tech circle", "hud", "#3df2c6", "#b02bff", { glow: 0.6, spin: 14 }],
  ["Gold tech circle", "hud", "#ffd23f", "#ff6a1a", { glow: 0.6, spin: -10 }],
  ["Party LED", "led", "#2bff88", "#ff3b3b", { glow: 0.45, rainbow: true }],
  ["Classic LED", "led", "#2bff88", "#ff3b3b", { glow: 0.35 }],
  ["Thin glow ring", "ring", "#ff6a1a", "#b02bff", { glow: 0.7, thick: 0.06, sens: 0.6, radius: 0.82, count: 96 }],
];

export const vizStyleName = (id) => VIZ_STYLES.find((s) => s[0] === id)?.[1] || "Visualizer";

/** A full visualizer settings object for a style (+ colours / overrides). */
export function newViz(style, colorA = "#00f0ff", colorB = "#ff2bd6", extra = {}) {
  const def = VIZ_STYLES.find((s) => s[0] === style) || VIZ_STYLES[0];
  const [w, h] = def[3];
  return { style: def[0], w, h, colorA, colorB, glow: 0.5, sens: 1, smooth: 0.3, spin: 0, mirror: false, radius: 0.55, rainbow: false, ...def[4], ...extra };
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

/** Colour stops: colour 1 → colour 2, or the whole rainbow when v.rainbow is on. */
function stops(g, v, loop) {
  if (v.rainbow) { for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, `hsl(${(i * 60 + (loop ? 0 : 200)) % 360} 100% 60%)`); return g; }
  g.addColorStop(0, v.colorA); g.addColorStop(loop ? 0.5 : 1, v.colorB); if (loop) g.addColorStop(1, v.colorA);
  return g;
}
function linear(c, v, w) { return stops(c.createLinearGradient(-w / 2, 0, w / 2, 0), v, false); }
function conic(c, v, rot) {
  if (!c.createConicGradient) return v.colorA;
  return stops(c.createConicGradient(rot, 0, 0), v, true);
}
const rot0 = (v, t) => ((v.spin || 0) * t * Math.PI) / 180 - Math.PI / 2;
const hash = (a, b) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };

/** A soft "fur" of thin spikes around a circle (hologram ring, music badge): long where the music is strong, fading outward. */
function fur(c, v, t, r0, R, n, rot, k) {
  const vals = values(v, t, n, true);
  c.save();
  c.lineCap = "round";
  c.lineWidth = Math.max(1, ((2 * Math.PI * r0) / n) * (0.25 + 0.6 * v.thick));
  c.strokeStyle = conic(c, v, rot);
  c.beginPath();
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    const len = (0.05 + 0.95 * vals[i]) * (R - r0) * (0.55 + 0.45 * hash(i, Math.floor(t * 20)));
    c.moveTo(Math.cos(a) * r0 * 0.98, Math.sin(a) * r0 * 0.98);
    c.lineTo(Math.cos(a) * (r0 + len), Math.sin(a) * (r0 + len));
  }
  c.stroke();
  // Fade the spikes out toward their tips.
  const g = c.createRadialGradient(0, 0, r0 * 0.95, 0, 0, R);
  g.addColorStop(0, "#000"); g.addColorStop(0.35, "rgba(0,0,0,.75)"); g.addColorStop(1, "rgba(0,0,0,0)");
  c.globalCompositeOperation = "destination-in";
  c.fillStyle = g;
  c.beginPath(); c.arc(0, 0, R, 0, Math.PI * 2); c.fill();
  c.restore();
}

/** A music note (two beamed notes) of height s, centred on the origin. */
function noteGlyph(c, s) {
  const hw = s * 0.2, hh = s * 0.14, stem = s * 0.08;
  const heads = [[-s * 0.22, s * 0.3], [s * 0.26, s * 0.22]];
  c.beginPath();
  for (const [x, y] of heads) { c.moveTo(x + hw, y); c.ellipse(x, y, hw, hh, -0.35, 0, Math.PI * 2); }
  c.fill();
  const top = -s * 0.42;
  c.fillRect(heads[0][0] + hw - stem, top + s * 0.08, stem, heads[0][1] - top - s * 0.08);
  c.fillRect(heads[1][0] + hw - stem, top, stem, heads[1][1] - top);
  c.beginPath();
  c.moveTo(heads[0][0] + hw - stem, top + s * 0.08); c.lineTo(heads[1][0] + hw, top);
  c.lineTo(heads[1][0] + hw, top + s * 0.16); c.lineTo(heads[0][0] + hw - stem, top + s * 0.24); c.closePath();
  c.fill();
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

Object.assign(DRAW, {
  halo(c, v, t, w, h, k) {
    const R = Math.min(w, h) / 2, r0 = R * Math.max(0.3, Math.min(0.85, v.radius)), rot = rot0(v, t);
    fur(c, v, t, r0 * 1.05, R, Math.max(24, Math.round(v.count)), rot, k);
    const lv = levelAt(t);
    c.save();
    c.globalCompositeOperation = "lighter";
    const lw = Math.max(1.2, (1.5 + v.thick * 5) * k);
    // Three thin rings; each drawn in red and blue a little apart, then white on top (the hologram split).
    for (const [rr, a] of [[1, 1], [0.93, 0.55], [1.06, 0.4]]) {
      const r = r0 * rr, off = (1.5 + 2.5 * lv) * k;
      c.lineWidth = lw;
      c.globalAlpha = a * 0.7; c.strokeStyle = "#ff3b5c"; c.beginPath(); c.arc(off, 0, r, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = "#3b7bff"; c.beginPath(); c.arc(-off, 0, r, 0, Math.PI * 2); c.stroke();
      c.globalAlpha = a * (0.6 + 0.4 * lv); c.strokeStyle = "#ffffff"; c.lineWidth = lw * 0.6;
      c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke();
    }
    // Fine tick marks on the main ring.
    c.globalAlpha = 0.5; c.lineWidth = lw * 0.8; c.strokeStyle = conic(c, v, rot);
    c.setLineDash([2 * k, 10 * k]); c.lineDashOffset = -t * 30 * k;
    c.beginPath(); c.arc(0, 0, r0 * 0.965, 0, Math.PI * 2); c.stroke();
    c.restore();
  },
  flame(c, v, t, w, h, k) {
    const R = Math.min(w, h) / 2, r0 = R * Math.max(0.3, Math.min(0.85, v.radius)), n = Math.max(16, Math.round(v.count));
    const vals = values(v, t, n, true), rot = rot0(v, t);
    c.save();
    c.fillStyle = conic(c, v, rot);
    // Tongues of flame in layers: wide and faint, then shorter and brighter.
    for (const [scale, alpha, blur] of [[1, 0.35, 0.05], [0.75, 0.55, 0.03], [0.5, 0.85, 0.015]]) {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = rot + (i / n) * Math.PI * 2, flick = 0.75 + 0.25 * Math.sin(i * 1.7 + t * 9 + scale * 5);
        const r = r0 + (0.04 + vals[i]) * (R - r0) * scale * flick;
        pts.push([Math.cos(a) * r, Math.sin(a) * r]);
      }
      c.globalAlpha = alpha;
      c.filter = `blur(${(R * blur).toFixed(1)}px)`;
      c.beginPath(); smoothPath(c, pts, true); c.fill();
    }
    c.filter = "none"; c.globalAlpha = 1;
    // The dark centre.
    c.globalCompositeOperation = v.clearCentre ? "destination-out" : "source-over";
    c.fillStyle = "#000";
    c.beginPath(); c.arc(0, 0, r0, 0, Math.PI * 2); c.fill();
    c.restore();
  },
  badge(c, v, t, w, h, k) {
    const R = Math.min(w, h) / 2, r0 = R * Math.max(0.3, Math.min(0.8, v.radius)), rot = rot0(v, t);
    const beat = beatAt(t) * v.sens, pr = r0 * (1 + 0.07 * Math.min(1, beat));
    fur(c, v, t, pr * 1.08, R, Math.max(24, Math.round(v.count)), rot, k);
    c.save();
    c.fillStyle = "#07070d";
    c.beginPath(); c.arc(0, 0, pr * 1.1, 0, Math.PI * 2); c.fill();
    const g = c.createLinearGradient(-pr, -pr, pr, pr);
    if (v.rainbow) stops(g, v, false); else { g.addColorStop(0, v.colorA); g.addColorStop(1, v.colorB); }
    c.fillStyle = g;
    c.beginPath(); c.arc(0, 0, pr, 0, Math.PI * 2); c.fill();
    c.lineWidth = Math.max(1, pr * 0.04); c.strokeStyle = "rgba(255,255,255,.35)";
    c.beginPath(); c.arc(0, 0, pr * 0.97, 0, Math.PI * 2); c.stroke();
    c.fillStyle = "#0b0b14";
    noteGlyph(c, pr * 1.05);
    c.restore();
  },
  sparkle(c, v, t, w, h, k) {
    const lv = levelAt(t) * v.sens, beat = beatAt(t) * v.sens;
    c.save();
    // A soft band of light behind the beam.
    const bg = c.createLinearGradient(0, -h / 2, 0, h / 2);
    bg.addColorStop(0, "rgba(0,0,0,0)"); bg.addColorStop(0.5, v.colorA); bg.addColorStop(1, "rgba(0,0,0,0)");
    c.globalAlpha = 0.18 + 0.2 * lv; c.fillStyle = bg; c.fillRect(-w / 2, -h / 2, w, h);
    c.globalCompositeOperation = "lighter";
    // Spikes along the beam where the music is strong (low notes in the middle).
    const n = 140, vals = values(v, t, n, true);
    c.globalAlpha = 0.9; c.lineWidth = Math.max(1, 1.6 * k); c.strokeStyle = linear(c, v, w);
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + ((i + 0.5) / n) * w, len = Math.pow(vals[i], 1.6) * (h / 2) * (0.4 + 0.6 * hash(i, Math.floor(t * 24)));
      c.moveTo(x, -len); c.lineTo(x, len);
    }
    c.stroke();
    // Dust that twinkles more on loud parts and spreads out on bass hits.
    const dots = Math.max(20, Math.round(v.count));
    for (let i = 0; i < dots; i++) {
      const x = -w / 2 + hash(i, 1) * w, spread = Math.pow(hash(i, 2), 2.2) * (h / 2) * (0.5 + 0.8 * beat) * (hash(i, 3) < 0.5 ? -1 : 1);
      const tw = 0.5 + 0.5 * Math.sin(t * (3 + hash(i, 4) * 8) + hash(i, 5) * 6);
      c.globalAlpha = Math.min(1, (0.15 + 0.85 * tw) * (0.35 + 0.65 * lv));
      c.fillStyle = i % 4 ? v.colorA : v.colorB;
      c.beginPath(); c.arc(x + Math.sin(t * 0.7 + i) * 4 * k, spread, (0.6 + hash(i, 6) * 1.8) * (0.6 + v.thick) * k * 1.6, 0, Math.PI * 2); c.fill();
    }
    // The beam: coloured glow with a white-hot core, fading at both ends.
    const lw = (2 + v.thick * 10) * k;
    c.globalAlpha = 0.7; c.lineWidth = lw * 2.4; c.strokeStyle = linear(c, v, w);
    c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(w / 2, 0); c.stroke();
    c.globalAlpha = 0.9; c.lineWidth = lw * 0.6; c.strokeStyle = "#ffffff";
    c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(w / 2, 0); c.stroke();
    c.globalCompositeOperation = "destination-in"; c.globalAlpha = 1;
    const fade = c.createLinearGradient(-w / 2, 0, w / 2, 0);
    fade.addColorStop(0, "rgba(0,0,0,0)"); fade.addColorStop(0.12, "#000"); fade.addColorStop(0.88, "#000"); fade.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = fade; c.fillRect(-w / 2, -h / 2, w, h);
    c.restore();
  },
  hud(c, v, t, w, h, k) {
    const R = Math.min(w, h) / 2, rb = R * Math.max(0.5, Math.min(0.9, v.radius)), rot = rot0(v, t);
    const beat = beatAt(t) * v.sens, lw = Math.max(1, (1 + v.thick * 4) * k);
    const n = Math.max(24, Math.round(v.count)), vals = values(v, t, n, true);
    c.save();
    c.strokeStyle = conic(c, v, rot);
    c.fillStyle = c.strokeStyle;
    // Spectrum ticks just outside the main ring.
    c.lineWidth = Math.max(1, ((2 * Math.PI * rb) / n) * 0.45);
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const a = rot + (i / n) * Math.PI * 2, len = (0.08 + 0.92 * vals[i]) * (R - rb) * 0.95;
      c.moveTo(Math.cos(a) * (rb + 3 * k), Math.sin(a) * (rb + 3 * k));
      c.lineTo(Math.cos(a) * (rb + 3 * k + len), Math.sin(a) * (rb + 3 * k + len));
    }
    c.stroke();
    // Rings: main, middle with two moving arcs, dashed inner, faint core, centre dot.
    c.lineWidth = lw; c.globalAlpha = 0.85 + 0.15 * beat;
    c.beginPath(); c.arc(0, 0, rb, 0, Math.PI * 2); c.stroke();
    const r2 = rb * 0.84;
    c.globalAlpha = 0.45; c.beginPath(); c.arc(0, 0, r2, 0, Math.PI * 2); c.stroke();
    c.globalAlpha = 0.9 + 0.1 * beat; c.lineWidth = lw * 3;
    const s1 = rot * 1.8 + t * 0.9, s2 = -rot * 1.3 - t * 0.6;
    c.beginPath(); c.arc(0, 0, r2, s1, s1 + 0.7 + 0.5 * beat); c.stroke();
    c.beginPath(); c.arc(0, 0, r2, s2 + Math.PI, s2 + Math.PI + 1.1); c.stroke();
    c.lineWidth = lw; c.globalAlpha = 0.6;
    c.setLineDash([6 * k, 9 * k]); c.lineDashOffset = t * 40 * k;
    c.beginPath(); c.arc(0, 0, rb * 0.66, 0, Math.PI * 2); c.stroke();
    c.setLineDash([]);
    c.globalAlpha = 0.25; c.beginPath(); c.arc(0, 0, rb * 0.48, 0, Math.PI * 2); c.stroke();
    c.globalAlpha = 0.9; c.beginPath(); c.arc(0, 0, rb * 0.045, 0, Math.PI * 2); c.stroke();
    // Little triangle markers riding the rings.
    const tri = (r, a, s) => {
      c.save(); c.rotate(a); c.translate(r, 0);
      c.beginPath(); c.moveTo(-s, -s * 0.8); c.lineTo(s * 0.6, 0); c.lineTo(-s, s * 0.8); c.closePath(); c.fill(); c.restore();
    };
    c.globalAlpha = 1;
    tri(rb, -rot * 0.5 + t * 0.4, 9 * k * (1 + beat * 0.6));
    tri(rb, -rot * 0.5 + t * 0.4 + Math.PI * 0.9, 7 * k);
    tri(r2, rot + Math.PI / 3, 6 * k);
    c.restore();
  },
  led(c, v, t, w, h, k) {
    const n = Math.max(4, Math.round(v.count)), body = v.reflect ? h * 0.72 : h;
    const slot = w / n, bw = Math.max(1, slot * (0.2 + 0.75 * v.thick));
    const rows = Math.max(4, Math.round(body / (bw * 0.42))), rh = body / rows, bh = Math.max(1, rh * 0.68);
    const vals = Float32Array.from(values(v, t, n, v.mirror));
    // Peak caps: the highest recent level, sinking back down (worked out from the last 0.5 s so scrubbing matches).
    const peaks = new Float32Array(vals);
    for (let j = 2; j <= 30; j += 2) {
      const past = values(v, Math.max(0, t - j / 60), n, v.mirror);
      for (let i = 0; i < n; i++) peaks[i] = Math.max(peaks[i], past[i] - (j / 60) * 1.6);
    }
    const base = -h / 2 + body, below = h / 2 - base;
    const colour = (i, r) => (v.rainbow ? `hsl(${220 - (i / Math.max(1, n - 1)) * 220} 100% 58%)` : mix(v.colorA, v.colorB, r / Math.max(1, rows - 1)));
    c.save();
    for (let i = 0; i < n; i++) {
      const lit = Math.round(vals[i] * rows), x = -w / 2 + i * slot + (slot - bw) / 2;
      for (let r = 0; r < lit; r++) {
        c.fillStyle = colour(i, r);
        c.globalAlpha = 1;
        c.fillRect(x, base - r * rh - bh, bw, bh);
        // The reflection: the same blocks upside down below the line, fading out.
        const ry = base + (rh - bh) + r * rh;
        if (v.reflect && ry + bh < h / 2) { c.globalAlpha = 0.28 * (1 - (r * rh) / below); c.fillRect(x, ry, bw, bh); }
      }
      const pr = Math.min(rows - 1, Math.round(peaks[i] * rows));
      if (pr > lit) { c.globalAlpha = 1; c.fillStyle = "#ffffff"; c.fillRect(x, base - pr * rh - bh * 0.55, bw, bh * 0.55); }
    }
    c.restore();
  },
});

/** Mixes two #rrggbb colours (0 = a, 1 = b). */
function mix(a, b, f) {
  const p = (s, i) => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16) || 0;
  return `rgb(${[0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * f)).join(",")})`;
}

/** Draws visualizer settings `v` at time t; k = canvas width / 1920. */
export function drawVizStyle(c, v, t, k) {
  const w = v.w * k, h = v.h * k;
  (DRAW[v.style] || DRAW.bars)(c, v, t, w, h, k);
}
