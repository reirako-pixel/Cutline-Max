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
  ["neonbars", "Neon bars", "chart-column", [1200, 380], { count: 32, thick: 0.55 }],
  ["neonwave", "Neon tube", "activity", [1400, 380], { thick: 0.4 }],
  ["neoncircle", "Neon circle", "circle", [640, 640], { count: 64, thick: 0.45, radius: 0.55 }],
  ["neonpulse", "Neon pulse", "radio", [700, 700], { count: 5, thick: 0.45, radius: 0.3 }],
  ["player", "Music player", "music-4", [1300, 340], { count: 28, thick: 0.55, theme: "dark", title: "Song title", artist: "Artist" }],
  ["vinyl", "Vinyl record", "disc-3", [820, 820], { count: 90, thick: 0.4, radius: 0.36, rpm: 33, deck: true, title: "Song title" }],
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
  ["Neon pink bars", "neonbars", "#ff2bd6", "#ff2bd6", { glow: 0.85 }],
  ["Neon blue bars", "neonbars", "#00c8ff", "#00c8ff", { glow: 0.85 }],
  ["Neon green bars", "neonbars", "#39ff14", "#39ff14", { glow: 0.85, mirror: true }],
  ["Neon red bars", "neonbars", "#ff2d55", "#ff2d55", { glow: 0.85, count: 48, thick: 0.45 }],
  ["Neon purple tube", "neonwave", "#a640ff", "#ff2bd6", { glow: 0.9 }],
  ["Neon cyan tube", "neonwave", "#00e5ff", "#00e5ff", { glow: 0.9 }],
  ["Neon yellow tube", "neonwave", "#ffe14d", "#ff7a00", { glow: 0.85 }],
  ["Neon pink circle", "neoncircle", "#ff2bd6", "#ff2bd6", { glow: 0.85 }],
  ["Neon cyan circle", "neoncircle", "#00f0ff", "#00f0ff", { glow: 0.85, spin: 10 }],
  ["Neon green pulse", "neonpulse", "#39ff14", "#00f0ff", { glow: 0.85 }],
  ["Neon orange pulse", "neonpulse", "#ff7a00", "#ffd23f", { glow: 0.85 }],
  ["Music player", "player", "#ff3cac", "#7b5cff", { glow: 0.15 }],
  ["Light player", "player", "#3d8bff", "#00e5ff", { glow: 0.1, theme: "light" }],
  ["Glass player", "player", "#ffd23f", "#ff6a1a", { glow: 0.15, theme: "glass" }],
  ["Vinyl turntable", "vinyl", "#ff3cac", "#7b5cff", { glow: 0.2 }],
  ["Spinning vinyl", "vinyl", "#ffd23f", "#ff6a1a", { glow: 0.45, deck: false }],
  ["Neon vinyl", "vinyl", "#00f0ff", "#ff2bd6", { glow: 0.75, deck: false, ring: true }],
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
// ---------- neon solids, music player and vinyl ----------

const neonStroke = (c, col, width, k, core = true) => {
  c.save(); c.shadowColor = col; c.shadowBlur = 22 * k; c.strokeStyle = col; c.lineWidth = width; c.stroke(); c.restore();
  if (core) { c.save(); c.strokeStyle = "rgba(255,255,255,0.85)"; c.lineWidth = Math.max(1, width * 0.35); c.stroke(); c.restore(); }
};
const barCol = (v, i, n) => (v.rainbow ? `hsl(${Math.round((i / n) * 300)} 100% 60%)` : i % 2 && v.colorB !== v.colorA ? v.colorB : v.colorA);
/** Song position for player / vinyl: 0–1 and seconds, from the layer's own time on the timeline. */
function trackPos(v, t) {
  const dur = v._dur || 30, el = v._start != null ? Math.max(0, Math.min(dur, t - v._start)) : t % dur;
  return { p: el / dur, el, dur };
}
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
function rrect(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

Object.assign(DRAW, {
  /** Solid neon bars: one bright colour, rounded, with a white-hot core. */
  neonbars(c, v, t, w, h, k) {
    const n = Math.max(4, Math.round(v.count)), vals = values(v, t, n, !!v.mirror);
    const slot = w / n, bw = Math.max(2 * k, slot * (0.15 + 0.8 * v.thick));
    for (let i = 0; i < n; i++) {
      const bh = Math.max(bw, vals[i] * h * 0.95), x = -w / 2 + i * slot + (slot - bw) / 2, y = h / 2 - bh;
      const col = barCol(v, i, n);
      c.save(); c.shadowColor = col; c.shadowBlur = 20 * k; c.fillStyle = col; rrect(c, x, y, bw, bh, bw / 2); c.fill(); c.restore();
      c.fillStyle = "rgba(255,255,255,0.75)"; rrect(c, x + bw * 0.3, y + bw * 0.25, bw * 0.4, Math.max(0, bh - bw * 0.5), bw * 0.2); c.fill();
    }
  },
  /** A glowing neon tube that ripples with the sound. */
  neonwave(c, v, t, w, h, k) {
    const n = 160, wave = waveAt(t, n), lv = levelAt(t) * v.sens;
    const line = (amp, phase, col, width) => {
      c.beginPath();
      for (let i = 0; i < n; i++) {
        const x = -w / 2 + (i / (n - 1)) * w, env = Math.sin((i / (n - 1)) * Math.PI);
        const y = (wave[(i + phase) % n] * v.sens * 0.9 + 0.08 * Math.sin(i * 0.12 + t * 3)) * (h / 2) * amp * env;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      neonStroke(c, col, width, k);
    };
    const lw = (3 + v.thick * 12) * k;
    if (v.colorB !== v.colorA || v.rainbow) { c.globalAlpha = 0.7; line(0.7, 40, v.rainbow ? `hsl(${(t * 60) % 360} 100% 60%)` : v.colorB, lw * 0.7); c.globalAlpha = 1; }
    line(1, 0, v.colorA, lw * (1 + 0.3 * lv));
  },
  /** A neon ring that swells on the beat, with solid neon spokes outside it. */
  neoncircle(c, v, t, w, h, k) {
    const R = Math.min(w, h) / 2, beat = beatAt(t) * v.sens, r0 = R * Math.max(0.2, Math.min(0.85, v.radius)) * (1 + 0.06 * Math.min(1, beat));
    const n = Math.max(12, Math.round(v.count)), vals = values(v, t, n, true), rot = rot0(v, t);
    c.lineCap = "round";
    for (let i = 0; i < n; i++) {
      const a = rot + (i / n) * Math.PI * 2, len = (0.06 + 0.94 * vals[i]) * (R - r0) * 0.9;
      c.beginPath(); c.moveTo(Math.cos(a) * r0 * 1.12, Math.sin(a) * r0 * 1.12); c.lineTo(Math.cos(a) * (r0 * 1.12 + len), Math.sin(a) * (r0 * 1.12 + len));
      neonStroke(c, v.rainbow ? `hsl(${Math.round((i / n) * 360)} 100% 60%)` : v.colorB, Math.max(2 * k, ((2 * Math.PI * r0) / n) * (0.2 + 0.5 * v.thick)), k, false);
    }
    c.beginPath(); c.arc(0, 0, r0, 0, Math.PI * 2);
    neonStroke(c, v.colorA, (4 + v.thick * 12) * k);
  },
  /** Neon rings rippling out from the middle; a bright core flashes on the beat. */
  neonpulse(c, v, t, w, h, k) {
    const R = Math.min(w, h) / 2, lv = levelAt(t) * v.sens, beat = beatAt(t) * v.sens, n = Math.max(2, Math.round(v.count));
    for (let i = 0; i < n; i++) {
      const ph = (t * 0.45 + i / n) % 1, r = R * (Math.max(0.1, v.radius) * 0.6 + ph * (1 - Math.max(0.1, v.radius) * 0.6));
      c.globalAlpha = (1 - ph) * (0.4 + 0.6 * lv);
      c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2);
      neonStroke(c, i % 2 ? v.colorB : v.colorA, (2 + v.thick * 10) * k * (1 - ph * 0.5), k);
    }
    c.globalAlpha = 1;
    const cr = R * Math.max(0.1, v.radius) * 0.55 * (1 + 0.25 * Math.min(1, beat));
    const g = c.createRadialGradient(0, 0, 0, 0, 0, cr);
    g.addColorStop(0, "#ffffff"); g.addColorStop(0.35, v.colorA); g.addColorStop(1, "rgba(0,0,0,0)");
    c.save(); c.shadowColor = v.colorA; c.shadowBlur = 30 * k; c.fillStyle = g; c.beginPath(); c.arc(0, 0, cr, 0, Math.PI * 2); c.fill(); c.restore();
    c.beginPath(); c.arc(0, 0, cr * 0.95, 0, Math.PI * 2); neonStroke(c, v.colorA, (3 + v.thick * 8) * k, k);
  },
  /** A "now playing" card: cover, title, artist, a moving progress bar with times, controls and a little spectrum. */
  player(c, v, t, w, h, k) {
    const theme = v.theme || "dark", light = theme === "light", glass = theme === "glass";
    const fg = light ? "#15151c" : "#ffffff", muted = light ? "rgba(20,20,30,0.55)" : "rgba(255,255,255,0.6)", track = light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.18)";
    const { p, el, dur } = trackPos(v, t), beat = beatAt(t) * v.sens, pad = h * 0.11;
    // card
    c.save(); c.shadowColor = "rgba(0,0,0,0.45)"; c.shadowBlur = 30 * k; c.shadowOffsetY = 10 * k;
    rrect(c, -w / 2, -h / 2, w, h, h * 0.16);
    c.fillStyle = light ? "rgba(255,255,255,0.96)" : glass ? "rgba(255,255,255,0.14)" : "rgba(18,18,28,0.9)"; c.fill(); c.restore();
    rrect(c, -w / 2, -h / 2, w, h, h * 0.16); c.lineWidth = Math.max(1, 1.5 * k); c.strokeStyle = light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.22)"; c.stroke();
    // cover: colour gradient with a spinning disc, pulsing on the beat
    const cs = h - pad * 2, cx = -w / 2 + pad, cy = -h / 2 + pad;
    c.save(); rrect(c, cx, cy, cs, cs, cs * 0.12); c.clip();
    const g = c.createLinearGradient(cx, cy, cx + cs, cy + cs); g.addColorStop(0, v.colorA); g.addColorStop(1, v.colorB); c.fillStyle = g; c.fillRect(cx, cy, cs, cs);
    c.translate(cx + cs / 2, cy + cs / 2); c.scale(1 + 0.05 * Math.min(1, beat), 1 + 0.05 * Math.min(1, beat));
    c.rotate(t * 1.2);
    c.fillStyle = "rgba(0,0,0,0.75)"; c.beginPath(); c.arc(0, 0, cs * 0.34, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "rgba(255,255,255,0.12)"; c.lineWidth = Math.max(1, k);
    for (let r = 0.14; r < 0.33; r += 0.04) { c.beginPath(); c.arc(0, 0, cs * r, 0, Math.PI * 2); c.stroke(); }
    c.fillStyle = v.colorA; c.beginPath(); c.arc(0, 0, cs * 0.11, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#000"; c.beginPath(); c.arc(0, 0, cs * 0.025, 0, Math.PI * 2); c.fill();
    c.restore();
    // words
    const x0 = cx + cs + pad, x1 = w / 2 - pad;
    c.textBaseline = "alphabetic"; c.textAlign = "left";
    c.fillStyle = fg; c.font = `700 ${h * 0.15}px Poppins, Inter, Arial, sans-serif`;
    const fit = (txt, maxW) => { let s = txt || ""; while (s.length > 1 && c.measureText(s).width > maxW) s = s.slice(0, -1); return s.length < (txt || "").length ? s.slice(0, -1) + "…" : s; };
    const specW = (x1 - x0) * 0.32;
    c.fillText(fit(v.title || "Song title", x1 - x0 - specW - pad * 0.5), x0, cy + h * 0.15);
    c.fillStyle = muted; c.font = `500 ${h * 0.1}px Poppins, Inter, Arial, sans-serif`;
    c.fillText(fit(v.artist || "", x1 - x0 - specW - pad * 0.5), x0, cy + h * 0.28);
    // spectrum, top right
    const n = Math.max(6, Math.round(v.count)), vals = values(v, t, n, false), sw = specW / n, sh = h * 0.3;
    for (let i = 0; i < n; i++) {
      const bh = Math.max(2 * k, vals[i] * sh), bx = x1 - specW + i * sw + sw * 0.15;
      c.fillStyle = barCol(v, i, n); rrect(c, bx, cy + sh - bh, sw * (0.3 + 0.6 * v.thick), bh, sw * 0.3); c.fill();
    }
    // progress bar and times
    const by = cy + cs * 0.66, bh = Math.max(3 * k, h * 0.025);
    rrect(c, x0, by - bh / 2, x1 - x0, bh, bh / 2); c.fillStyle = track; c.fill();
    const pg = c.createLinearGradient(x0, 0, x1, 0); pg.addColorStop(0, v.colorA); pg.addColorStop(1, v.colorB);
    rrect(c, x0, by - bh / 2, Math.max(bh, (x1 - x0) * p), bh, bh / 2); c.fillStyle = pg; c.fill();
    c.save(); c.shadowColor = v.colorA; c.shadowBlur = 10 * k; c.fillStyle = light ? v.colorA : "#ffffff";
    c.beginPath(); c.arc(x0 + (x1 - x0) * p, by, bh * 2.1, 0, Math.PI * 2); c.fill(); c.restore();
    c.fillStyle = muted; c.font = `500 ${h * 0.075}px Poppins, Inter, Arial, sans-serif`;
    c.fillText(mmss(el), x0, by + h * 0.12); c.textAlign = "right"; c.fillText("-" + mmss(Math.max(0, dur - el)), x1, by + h * 0.12);
    // controls: back, pause, next
    const my = by + h * 0.135, mx = (x0 + x1) / 2, u = h * 0.06;
    c.fillStyle = fg;
    const tri = (x, dir) => { c.beginPath(); c.moveTo(x, my - u); c.lineTo(x + dir * u * 1.2, my); c.lineTo(x, my + u); c.closePath(); c.fill(); };
    tri(mx - u * 3.2, -1); tri(mx - u * 4.4, -1); c.fillRect(mx - u * 4.7, my - u, u * 0.3, u * 2);
    tri(mx + u * 3.2, 1); tri(mx + u * 4.4, 1); c.fillRect(mx + u * 4.4, my - u, u * 0.3, u * 2);
    c.save(); c.fillStyle = v.colorA; c.shadowColor = v.colorA; c.shadowBlur = 12 * k * (0.5 + Math.min(1, beat)); c.beginPath(); c.arc(mx, my, u * 1.7, 0, Math.PI * 2); c.fill(); c.restore();
    c.fillStyle = "#ffffff"; c.fillRect(mx - u * 0.6, my - u * 0.75, u * 0.38, u * 1.5); c.fillRect(mx + u * 0.22, my - u * 0.75, u * 0.38, u * 1.5);
  },
  /** A spinning vinyl record (on a turntable, or on its own) that pulses with the music; the arm follows the song. */
  vinyl(c, v, t, w, h, k) {
    const R = Math.min(w, h) / 2, beat = Math.min(1, beatAt(t) * v.sens), lv = levelAt(t) * v.sens, deck = v.deck !== false;
    const { p } = trackPos(v, t);
    if (deck) { // turntable base
      c.save(); c.shadowColor = "rgba(0,0,0,0.5)"; c.shadowBlur = 30 * k; c.shadowOffsetY = 12 * k;
      rrect(c, -R, -R, R * 2, R * 2, R * 0.08);
      const bg = c.createLinearGradient(-R, -R, R, R); bg.addColorStop(0, "#2b2d36"); bg.addColorStop(1, "#111218"); c.fillStyle = bg; c.fill(); c.restore();
      rrect(c, -R, -R, R * 2, R * 2, R * 0.08); c.strokeStyle = "rgba(255,255,255,0.12)"; c.lineWidth = 2 * k; c.stroke();
      c.fillStyle = v.colorA; c.beginPath(); c.arc(-R * 0.82, R * 0.82, R * 0.035, 0, Math.PI * 2); c.fill(); // power light
    }
    const rr = (deck ? R * 0.78 : R * 0.9) * (1 + 0.015 * beat), ox = deck ? -R * 0.08 : 0;
    // sound ring around a loose record
    if (!deck || v.ring) {
      const n = Math.max(24, Math.round(v.count)), vals = values(v, t, n, true);
      c.save(); c.translate(ox, 0); c.lineCap = "round";
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2, len = (0.04 + 0.96 * vals[i]) * rr * 0.16;
        c.strokeStyle = barCol(v, i, n); c.lineWidth = Math.max(2 * k, ((2 * Math.PI * rr) / n) * 0.45);
        c.beginPath(); c.moveTo(Math.cos(a) * rr * 1.03, Math.sin(a) * rr * 1.03); c.lineTo(Math.cos(a) * (rr * 1.03 + len), Math.sin(a) * (rr * 1.03 + len)); c.stroke();
      }
      c.restore();
    }
    c.save(); c.translate(ox, 0);
    if (deck) { c.fillStyle = "#0a0a0d"; c.beginPath(); c.arc(0, 0, rr * 1.04, 0, Math.PI * 2); c.fill(); }
    c.save(); c.shadowColor = v.colorA; c.shadowBlur = (8 + 30 * lv) * k;
    const rg = c.createRadialGradient(0, 0, rr * 0.3, 0, 0, rr); rg.addColorStop(0, "#1c1c22"); rg.addColorStop(1, "#050507");
    c.fillStyle = rg; c.beginPath(); c.arc(0, 0, rr, 0, Math.PI * 2); c.fill(); c.restore();
    // grooves
    c.lineWidth = Math.max(0.6, 0.8 * k);
    for (let r = 0.4; r < 0.98; r += 0.025) { c.strokeStyle = `rgba(255,255,255,${0.035 + 0.03 * Math.sin(r * 90)})`; c.beginPath(); c.arc(0, 0, rr * r, 0, Math.PI * 2); c.stroke(); }
    // light catching the grooves (stays still while the record turns)
    if (c.createConicGradient) {
      const sg = c.createConicGradient(-Math.PI / 4, 0, 0);
      sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(0.08, "rgba(255,255,255,0.16)"); sg.addColorStop(0.16, "rgba(255,255,255,0)");
      sg.addColorStop(0.5, "rgba(255,255,255,0)"); sg.addColorStop(0.58, "rgba(255,255,255,0.12)"); sg.addColorStop(0.66, "rgba(255,255,255,0)"); sg.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = sg; c.beginPath(); c.arc(0, 0, rr * 0.98, 0, Math.PI * 2); c.arc(0, 0, rr * 0.38, 0, Math.PI * 2, true); c.fill();
    }
    // label (turns with the record)
    c.rotate((t * (v.rpm || 33) * 6 * Math.PI) / 180);
    const lr = rr * Math.max(0.2, Math.min(0.5, v.radius || 0.36));
    const lg = c.createLinearGradient(-lr, -lr, lr, lr); lg.addColorStop(0, v.colorA); lg.addColorStop(1, v.colorB);
    c.fillStyle = lg; c.beginPath(); c.arc(0, 0, lr, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "rgba(255,255,255,0.35)"; c.lineWidth = Math.max(1, k); c.beginPath(); c.arc(0, 0, lr * 0.82, 0, Math.PI * 2); c.stroke();
    c.fillStyle = "#ffffff"; c.textAlign = "center"; c.textBaseline = "middle";
    c.font = `700 ${lr * 0.2}px Poppins, Inter, Arial, sans-serif`;
    let title = v.title || ""; while (title.length > 1 && c.measureText(title).width > lr * 1.5) title = title.slice(0, -1);
    c.fillText(title, 0, -lr * 0.42);
    c.font = `500 ${lr * 0.13}px Poppins, Inter, Arial, sans-serif`; c.fillText(`${v.rpm || 33} RPM`, 0, lr * 0.45);
    c.fillStyle = "#050507"; c.beginPath(); c.arc(0, 0, lr * 0.09, 0, Math.PI * 2); c.fill();
    c.restore();
    if (deck) { // tone arm: from its rest at the edge in toward the label as the song plays
      const px = R * 0.72, py = -R * 0.72, L = R * 1.18;
      // Needle on the grooves: from the outer edge at the start of the song to near the label at its end.
      const rt = rr * (0.93 - 0.5 * p), dx = ox - px, dy = -py, d = Math.hypot(dx, dy);
      const cosT = Math.max(-1, Math.min(1, (L * L + d * d - rt * rt) / (2 * L * d)));
      const a = Math.atan2(dy, dx) - Math.acos(cosT) + 0.01 * Math.sin(t * 7) * beat;
      c.save(); c.translate(px, py);
      c.fillStyle = "#3a3d48"; c.beginPath(); c.arc(0, 0, R * 0.09, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#9aa0aa"; c.beginPath(); c.arc(0, 0, R * 0.05, 0, Math.PI * 2); c.fill();
      c.rotate(a);
      c.strokeStyle = "#c9ced6"; c.lineCap = "round"; c.lineWidth = R * 0.03; c.beginPath(); c.moveTo(0, 0); c.lineTo(L * 0.95, 0); c.stroke();
      c.fillStyle = "#2b2d36"; c.save(); c.translate(L * 0.98, 0); c.rotate(0.35); c.fillRect(-R * 0.05, -R * 0.04, R * 0.14, R * 0.08); c.fillStyle = v.colorA; c.fillRect(R * 0.06, -R * 0.02, R * 0.03, R * 0.04); c.restore();
      c.restore();
    }
  },
});

export function drawVizStyle(c, v, t, k) {
  const w = v.w * k, h = v.h * k;
  (DRAW[v.style] || DRAW.bars)(c, v, t, w, h, k);
}
