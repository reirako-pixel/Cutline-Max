// Decorative frames: borders drawn over the whole picture (torn paper, stars, burnt edges, film burn, paper cut-out,
// deckled edge, watercolour flowers, lace, metallic foil, guilloche). A frame is a layer on the text tracks
// (item.frame); everything is drawn here from code, so it stays sharp at any size and looks the same in the export.

/** [id, name, icon, defaults]. Colours: `color` is the main colour, `color2` the accent. */
export const FRAMES = [
  ["torn", "Torn paper", "file", { color: "#f4efe4", color2: "#6b5b45", size: 1 }],
  ["stars", "Stars border", "star", { color: "#ffd23f", color2: "#ffffff", size: 1, motif: "stars", animate: true }],
  ["burnt", "Burnt paper", "flame", { color: "#140b05", color2: "#ff7a1a", size: 1, animate: true }],
  ["filmburn", "Film burn", "film", { color: "#3b1d08", color2: "#ff8a2a", size: 1, animate: true }],
  ["papercut", "3D paper cut-out", "layers", { color: "#2f7d6d", color2: "#f6c453", size: 1 }],
  ["deckled", "Deckled edge", "scroll", { color: "#f7f2e8", color2: "#cfc3ad", size: 1 }],
  ["floral", "Watercolour floral", "flower-2", { color: "#f28bb0", color2: "#7fb685", size: 1, corners: "two" }],
  ["lace", "Scallop lace", "flower", { color: "#ffffff", color2: "#e9e1d6", size: 1 }],
  ["foil", "Metallic foil", "gem", { color: "#d4af37", color2: "#ffffff", size: 1, metal: "gold", animate: true }],
  ["guilloche", "Guilloche certificate", "award", { color: "#1f5f4a", color2: "#f4efdf", size: 1 }],
];
export const frameDef = (type) => FRAMES.find((f) => f[0] === type) || FRAMES[0];
export const frameName = (type) => frameDef(type)[1];
export const ANIMATED_FRAMES = new Set(["stars", "burnt", "filmburn", "foil"]);
export const MOTIFS = [["stars", "Stars"], ["hearts", "Hearts"], ["sparkles", "Sparkles"], ["dots", "Dots"], ["snow", "Snowflakes"]];
export const METALS = { gold: ["#7a5a14", "#d4af37", "#fff1b8", "#b8862b"], silver: ["#5e6670", "#c9ced6", "#ffffff", "#8b939e"],
  rose: ["#7a3f36", "#d9967f", "#ffe1d6", "#b56a5a"] };

// ---------- helpers ----------

/** Seeded random numbers (the same frame always looks the same). */
function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
/** Smooth 1-D noise from a seeded table. */
function noise1(seed) {
  const r = rng(seed), tab = Array.from({ length: 256 }, r);
  return (x) => { const i = Math.floor(x), f = x - i, a = tab[i & 255], b = tab[(i + 1) & 255]; const u = f * f * (3 - 2 * f); return a + (b - a) * u; };
}

/** Points around a rectangle inset by `d`, with each point pushed in by off(s, side) (s = distance along the edge). */
function edgePath(c, W, H, d, step, off) {
  const pts = [];
  const side = (x0, y0, x1, y1, nx, ny, k) => {
    const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(len / step));
    for (let i = 0; i < n; i++) {
      const t = i / n, s = len * t, o = off(s + k * 10000, k);
      pts.push([x0 + (x1 - x0) * t + nx * o, y0 + (y1 - y0) * t + ny * o]);
    }
  };
  side(d, d, W - d, d, 0, 1, 0);
  side(W - d, d, W - d, H - d, -1, 0, 1);
  side(W - d, H - d, d, H - d, 0, -1, 2);
  side(d, H - d, d, d, 1, 0, 3);
  c.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts.slice(1)) c.lineTo(p[0], p[1]);
  c.closePath();
}
const outer = (c, W, H) => { c.moveTo(-2, -2); c.lineTo(W + 2, -2); c.lineTo(W + 2, H + 2); c.lineTo(-2, H + 2); c.closePath(); };
const roundRectPath = (c, x, y, w, h, r) => {
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
};
function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
}
const rgba = (h, a) => `rgba(${[1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",")},${a})`;

/** Points evenly spaced around a rectangle inset by `d`: [x, y, angle of the edge]. */
function aroundRect(W, H, d, gap) {
  const out = [];
  const per = 2 * (W - 2 * d) + 2 * (H - 2 * d);
  const n = Math.max(8, Math.round(per / gap));
  for (let i = 0; i < n; i++) {
    let s = (i / n) * per;
    const w = W - 2 * d, h = H - 2 * d;
    if (s < w) out.push([d + s, d, 0]);
    else if ((s -= w) < h) out.push([W - d, d + s, Math.PI / 2]);
    else if ((s -= h) < w) out.push([W - d - s, H - d, Math.PI]);
    else { s -= w; out.push([d, H - d - s, -Math.PI / 2]); }
  }
  return out;
}

function star(c, x, y, r, points = 5, inner = 0.45, rot = -Math.PI / 2) {
  for (let i = 0; i < points * 2; i++) {
    const a = rot + (i * Math.PI) / points, rr = i % 2 ? r * inner : r;
    i ? c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath();
}
function heart(c, x, y, r) {
  c.moveTo(x, y + r * 0.9);
  c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.6, y - r * 1.3, x, y - r * 0.45);
  c.bezierCurveTo(x + r * 0.6, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9);
  c.closePath();
}

// ---------- the frames ----------

const DRAW = {
  torn(c, f, W, H, u) {
    const band = 7 * u * f.size, r = rng(f.seed || 1), n = noise1(f.seed || 1);
    const jag = (s) => band * (0.55 + 0.35 * n(s / (9 * u))) + (r() - 0.5) * u * 1.6;
    // A darker under-layer peeks out from the rip, then the paper on top.
    c.save();
    c.beginPath(); outer(c, W, H); edgePath(c, W, H, 0, u * 0.9, (s) => jag(s) + u * 0.9);
    c.fillStyle = mix(f.color, f.color2, 0.45); c.shadowColor = "rgba(0,0,0,0.45)"; c.shadowBlur = u * 2.2; c.fill("evenodd");
    c.restore();
    const r2 = rng(f.seed || 1);
    c.beginPath(); outer(c, W, H); edgePath(c, W, H, 0, u * 0.9, (s) => band * (0.55 + 0.35 * n(s / (9 * u))) + (r2() - 0.5) * u * 1.6);
    c.fillStyle = f.color; c.fill("evenodd");
    // paper fibres along the rip
    c.strokeStyle = rgba("#ffffff", 0.55); c.lineWidth = Math.max(1, u * 0.12);
    for (const [x, y, a] of aroundRect(W, H, band * 0.9, u * 0.7)) {
      if (r() < 0.5) continue;
      const l = u * (0.4 + r()), b = a + Math.PI / 2 + (r() - 0.5) * 1.2;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(b) * l, y + Math.sin(b) * l); c.stroke();
    }
    paperGrain(c, f, W, H, u, band * 0.5);
  },
  stars(c, f, W, H, u, t) {
    const r = rng(f.seed || 3), d = 3.2 * u * f.size;
    const motif = f.motif || "stars";
    for (let row = 0; row < 2; row++) {
      for (const [x, y] of aroundRect(W, H, d * (row ? 2.1 : 1), u * (row ? 7 : 4.6))) {
        const ph = r() * 6.283, tw = f.animate ? 0.75 + 0.25 * Math.sin(t * 3 + ph) : 1;
        const size = u * f.size * (row ? 0.9 + r() * 0.8 : 1.4 + r() * 1.1) * tw;
        const col = r() < 0.7 ? f.color : f.color2;
        c.save(); c.fillStyle = col; c.shadowColor = rgba(col.length === 7 ? col : "#ffffff", 0.8); c.shadowBlur = u * 1.2 * f.size;
        c.beginPath();
        const jx = x + (r() - 0.5) * u * 2, jy = y + (r() - 0.5) * u * 2, rot = r() * 6.283 + (f.animate ? t * 0.3 : 0);
        if (motif === "hearts") heart(c, jx, jy, size);
        else if (motif === "sparkles") star(c, jx, jy, size * 1.3, 4, 0.22, rot);
        else if (motif === "dots") c.arc(jx, jy, size * 0.6, 0, 6.283);
        else if (motif === "snow") { c.restore(); snowflake(c, jx, jy, size * 1.2, col, u); continue; }
        else star(c, jx, jy, size, 5, 0.45, rot);
        c.fill(); c.restore();
      }
    }
  },
  burnt(c, f, W, H, u, t) {
    const band = 8 * u * f.size, n = noise1(f.seed || 5), n2 = noise1((f.seed || 5) + 9), r = rng(f.seed || 5);
    const edge = (s) => band * (0.35 + 0.75 * n(s / (14 * u)) + 0.25 * n2(s / (4 * u)));
    // singed brown halo, the charred rim, then glowing embers along the edge
    c.save();
    c.beginPath(); outer(c, W, H); edgePath(c, W, H, 0, u * 1.2, (s) => edge(s) + u * 2.2);
    c.fillStyle = "rgba(92,52,20,0.55)"; c.shadowColor = "rgba(92,52,20,0.9)"; c.shadowBlur = u * 5; c.fill("evenodd");
    c.restore();
    c.beginPath(); outer(c, W, H); edgePath(c, W, H, 0, u * 1.2, edge);
    c.fillStyle = f.color; c.fill("evenodd");
    const flick = f.animate ? 0.65 + 0.35 * Math.sin(t * 7) * Math.sin(t * 2.3 + 1) : 0.85;
    c.save();
    c.beginPath(); edgePath(c, W, H, 0, u * 1.2, edge);
    c.strokeStyle = rgba(f.color2, 0.85 * flick); c.lineWidth = u * 0.6; c.shadowColor = f.color2; c.shadowBlur = u * 2.5 * flick; c.stroke();
    c.restore();
    // ash flecks on the rim
    c.fillStyle = "rgba(160,150,140,0.35)";
    const rim = aroundRect(W, H, band * 0.4, u * 1.5);
    for (const [x, y] of rim) for (let k = 0; k < 2; k++) c.fillRect(x + (r() - 0.5) * band * 0.8, y + (r() - 0.5) * band * 0.8, u * 0.25, u * 0.25);
  },
  filmburn(c, f, W, H, u, t) {
    const band = 12 * u * f.size;
    // scorched parchment around the edges
    const g = (x0, y0, x1, y1) => { const gr = c.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, rgba(f.color, 0.95)); gr.addColorStop(0.35, rgba(f.color, 0.55)); gr.addColorStop(1, rgba(f.color, 0)); return gr; };
    c.fillStyle = g(0, 0, 0, band); c.fillRect(0, 0, W, band);
    c.fillStyle = g(0, H, 0, H - band); c.fillRect(0, H - band, W, band);
    c.fillStyle = g(0, 0, band, 0); c.fillRect(0, 0, band, H);
    c.fillStyle = g(W, 0, W - band, 0); c.fillRect(W - band, 0, band, H);
    // warm light leaks drifting in from the sides
    c.save(); c.globalCompositeOperation = "lighter";
    const leaks = [[0.05, 0.2, 0.55, "#ff5a1a"], [0.95, 0.75, 0.5, f.color2], [0.1, 0.9, 0.35, "#ffd27a"], [0.85, 0.05, 0.3, "#ff2d2d"]];
    leaks.forEach(([x, y, rad, col], i) => {
      const k = f.animate ? 0.55 + 0.45 * Math.sin(t * (0.7 + i * 0.3) + i * 2) : 0.8;
      const cx = (x + (f.animate ? 0.04 * Math.sin(t * 0.4 + i) : 0)) * W, cy = (y + (f.animate ? 0.05 * Math.cos(t * 0.5 + i) : 0)) * H, R = rad * Math.max(W, H) * f.size;
      const gr = c.createRadialGradient(cx, cy, 0, cx, cy, R);
      gr.addColorStop(0, rgba(col, 0.75 * k)); gr.addColorStop(0.4, rgba(col, 0.3 * k)); gr.addColorStop(1, rgba(col, 0));
      c.fillStyle = gr; c.fillRect(0, 0, W, H);
    });
    c.restore();
    // a burn hole eating in from one corner
    const R = band * 1.3, cx = W - band * 0.3, cy = band * 0.2;
    const gr = c.createRadialGradient(cx, cy, 0, cx, cy, R);
    gr.addColorStop(0, "rgba(10,4,0,0.95)"); gr.addColorStop(0.55, "rgba(30,10,0,0.85)"); gr.addColorStop(0.72, rgba(f.color2, 0.8)); gr.addColorStop(1, rgba(f.color2, 0));
    c.fillStyle = gr; c.beginPath(); c.arc(cx, cy, R, 0, 6.283); c.fill();
  },
  papercut(c, f, W, H, u) {
    const layers = 4, band = 4.2 * u * f.size, n = noise1(f.seed || 7);
    for (let k = layers - 1; k >= 0; k--) {
      const d = band * (k + 1), amp = u * 1.6 * f.size, ph = k * 37;
      const col = k === 0 ? f.color : k === layers - 1 ? f.color2 : mix(f.color, f.color2, k / (layers - 1));
      c.save();
      c.beginPath(); outer(c, W, H); edgePath(c, W, H, 0, u * 1.5, (s) => d + amp * (Math.sin(s / (6 * u) + ph) * 0.6 + (n(s / (11 * u) + ph) - 0.5)));
      c.fillStyle = col; c.shadowColor = "rgba(0,0,0,0.45)"; c.shadowBlur = u * 2.4; c.shadowOffsetX = u * 0.5; c.shadowOffsetY = u * 0.8;
      c.fill("evenodd");
      c.restore();
    }
  },
  deckled(c, f, W, H, u) {
    const band = 6.5 * u * f.size, r = rng(f.seed || 11), n = noise1(f.seed || 11);
    c.save();
    c.beginPath(); outer(c, W, H); edgePath(c, W, H, 0, u * 0.35, (s) => band + u * 0.55 * (n(s / (2.5 * u)) - 0.5) + (r() - 0.5) * u * 0.35);
    c.fillStyle = f.color; c.shadowColor = "rgba(0,0,0,0.28)"; c.shadowBlur = u * 1.2; c.shadowOffsetY = u * 0.25; c.fill("evenodd");
    c.restore();
    // soft fibres just at the deckle
    c.strokeStyle = rgba(f.color2, 0.55); c.lineWidth = Math.max(0.6, u * 0.08);
    for (const [x, y, a] of aroundRect(W, H, band - u * 0.3, u * 0.45)) {
      const l = u * (0.3 + r() * 0.7), b = a + Math.PI / 2 + (r() - 0.5) * 0.8;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(b) * l, y + Math.sin(b) * l); c.stroke();
    }
    // a faint pressed line inside the mat
    c.strokeStyle = rgba(f.color2, 0.6); c.lineWidth = Math.max(1, u * 0.12);
    c.strokeRect(band * 0.45, band * 0.45, W - band * 0.9, H - band * 0.9);
    paperGrain(c, f, W, H, u, band * 0.8);
  },
  floral(c, f, W, H, u) {
    const r = rng(f.seed || 13), S = u * 9 * f.size;
    const corners = f.corners === "four" ? [[0, 0], [W, 0], [0, H], [W, H]] : [[0, 0], [W, H]];
    for (const [cx, cy] of corners) {
      const dx = cx ? -1 : 1, dy = cy ? -1 : 1;
      // leaves and stems first, then blooms and buds, all soft and see-through like watercolour
      for (let i = 0; i < 9; i++) {
        const a = Math.atan2(dy, dx) + (r() - 0.5) * 2.2, d = S * (0.6 + r() * 2.4);
        leaf(c, cx + Math.cos(a) * d * 0.5, cy + Math.sin(a) * d * 0.5, S * (0.5 + r() * 0.5), a + (r() - 0.5), f.color2, r);
      }
      for (let i = 0; i < 6; i++) {
        const along = r() < 0.5, d = S * (0.4 + r() * (i < 3 ? 1.4 : 3.2)), spread = S * (r() * 1.4);
        const x = cx + dx * (along ? d : spread), y = cy + dy * (along ? spread : d);
        bloom(c, x, y, S * (i < 3 ? 0.9 + r() * 0.5 : 0.45 + r() * 0.3), f.color, r);
      }
      c.fillStyle = rgba(f.color, 0.18);
      for (let i = 0; i < 18; i++) { c.beginPath(); c.arc(cx + dx * r() * S * 4, cy + dy * r() * S * 4, u * (0.2 + r() * 0.6), 0, 6.283); c.fill(); }
    }
  },
  lace(c, f, W, H, u) {
    const band = 5 * u * f.size, sc = 2.6 * u * f.size;
    // the lace band: a solid edge, a scalloped inner rim, and openwork holes
    c.beginPath(); outer(c, W, H);
    const pts = aroundRect(W, H, band, sc * 2);
    c.moveTo(pts[0][0], pts[0][1]);
    pts.forEach(([x, y, a], i) => {
      const [nx, ny] = pts[(i + 1) % pts.length];
      const mx = (x + nx) / 2 + Math.cos(a + Math.PI / 2) * sc, my = (y + ny) / 2 + Math.sin(a + Math.PI / 2) * sc;
      c.quadraticCurveTo(mx, my, nx, ny);
    });
    c.closePath();
    c.fillStyle = rgba(f.color, 0.95); c.shadowColor = "rgba(0,0,0,0.25)"; c.shadowBlur = u * 0.8; c.fill("evenodd"); c.shadowBlur = 0;
    // holes (cut out with destination-out: this draws on its own layer)
    c.save(); c.globalCompositeOperation = "destination-out";
    for (const [x, y, a] of aroundRect(W, H, band * 0.55, sc * 2)) {
      c.beginPath(); c.arc(x, y, sc * 0.34, 0, 6.283); c.fill();
      for (let k = 0; k < 6; k++) { const b = (k * Math.PI) / 3; c.beginPath(); c.arc(x + Math.cos(b) * sc * 0.62, y + Math.sin(b) * sc * 0.62, sc * 0.12, 0, 6.283); c.fill(); }
    }
    for (const [x, y, a] of aroundRect(W, H, band + sc * 0.4, sc * 2)) { c.beginPath(); c.arc(x, y, sc * 0.18, 0, 6.283); c.fill(); }
    c.restore();
    c.strokeStyle = rgba(f.color2, 0.9); c.lineWidth = Math.max(1, u * 0.15);
    c.strokeRect(band * 0.2, band * 0.2, W - band * 0.4, H - band * 0.4);
  },
  foil(c, f, W, H, u, t) {
    const m = METALS[f.metal] || METALS.gold, d = 3.5 * u * f.size;
    const shine = f.animate ? (t * 0.25) % 1.6 - 0.3 : 0.4;
    const grad = () => {
      const g = c.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, m[0]); g.addColorStop(0.25, m[1]); g.addColorStop(Math.min(0.99, Math.max(0.01, shine)), m[2]); g.addColorStop(0.75, m[3]); g.addColorStop(1, m[1]);
      return g;
    };
    c.save(); c.strokeStyle = grad(); c.fillStyle = grad(); c.shadowColor = "rgba(0,0,0,0.45)"; c.shadowBlur = u * 0.6; c.shadowOffsetY = u * 0.15;
    c.lineWidth = u * 0.55 * f.size; c.strokeRect(d, d, W - 2 * d, H - 2 * d);
    c.lineWidth = u * 0.18 * f.size; c.strokeRect(d * 1.6, d * 1.6, W - 3.2 * d, H - 3.2 * d);
    // corner brackets and diamonds
    const L = u * 9 * f.size;
    for (const [x, y, sx, sy] of [[d * 2.2, d * 2.2, 1, 1], [W - d * 2.2, d * 2.2, -1, 1], [d * 2.2, H - d * 2.2, 1, -1], [W - d * 2.2, H - d * 2.2, -1, -1]]) {
      c.lineWidth = u * 0.35 * f.size;
      c.beginPath(); c.moveTo(x, y + sy * L); c.lineTo(x, y); c.lineTo(x + sx * L, y); c.stroke();
      c.beginPath(); c.moveTo(x + sx * L * 0.25, y + sy * L * 0.6); c.lineTo(x + sx * L * 0.25, y + sy * L * 0.25); c.lineTo(x + sx * L * 0.6, y + sy * L * 0.25); c.stroke();
      const k = u * 1.1 * f.size, cx = x - sx * d * 0.6, cy = y - sy * d * 0.6;
      c.beginPath(); c.moveTo(cx, cy - k); c.lineTo(cx + k, cy); c.lineTo(cx, cy + k); c.lineTo(cx - k, cy); c.closePath(); c.fill();
    }
    // a small diamond at the middle of each side
    for (const [x, y] of [[W / 2, d], [W / 2, H - d], [d, H / 2], [W - d, H / 2]]) {
      const k = u * 0.9 * f.size; c.beginPath(); c.moveTo(x, y - k); c.lineTo(x + k * 1.6, y); c.lineTo(x, y + k); c.lineTo(x - k * 1.6, y); c.closePath(); c.fill();
    }
    c.restore();
  },
  guilloche(c, f, W, H, u) {
    const band = 7 * u * f.size;
    c.beginPath(); outer(c, W, H); roundRectPath(c, band, band, W - 2 * band, H - 2 * band, u * 1.5);
    c.fillStyle = f.color2; c.fill("evenodd");
    c.strokeStyle = f.color; c.lineWidth = Math.max(1, u * 0.25);
    c.strokeRect(band * 0.18, band * 0.18, W - band * 0.36, H - band * 0.36);
    c.beginPath(); roundRectPath(c, band, band, W - 2 * band, H - 2 * band, u * 1.5); c.stroke();
    // overlapping waves running all the way round the band
    const per = 2 * (W - band) + 2 * (H - band), N = Math.round(per / (u * 0.5));
    c.lineWidth = Math.max(0.6, u * 0.09);
    for (let k = 0; k < 10; k++) {
      c.strokeStyle = rgba(f.color, k % 2 ? 0.55 : 0.85);
      c.beginPath();
      for (let i = 0; i <= N; i++) {
        const s = (i / N) * per, [x, y, nx, ny] = perimeter(W, H, band / 2, s);
        const o = band * 0.3 * Math.sin((s / (u * 3.2)) + (k * Math.PI) / 5) * Math.cos((s / (u * 11)) + k * 0.3);
        i ? c.lineTo(x + nx * o, y + ny * o) : c.moveTo(x + nx * o, y + ny * o);
      }
      c.stroke();
    }
    // rosettes in the corners
    for (const [x, y] of [[band / 2, band / 2], [W - band / 2, band / 2], [band / 2, H - band / 2], [W - band / 2, H - band / 2]]) {
      c.save(); c.fillStyle = f.color2; c.beginPath(); c.arc(x, y, band * 0.62, 0, 6.283); c.fill();
      c.strokeStyle = f.color; c.lineWidth = Math.max(0.6, u * 0.08); c.beginPath();
      const R = band * 0.5, rr = R * 0.36, dd = R * 0.5;
      for (let i = 0; i <= 720; i++) {
        const a = (i / 720) * 6.283 * 9, px = (R - rr) * Math.cos(a) + dd * Math.cos(((R - rr) / rr) * a), py = (R - rr) * Math.sin(a) - dd * Math.sin(((R - rr) / rr) * a);
        const s = 0.62;
        i ? c.lineTo(x + px * s, y + py * s) : c.moveTo(x + px * s, y + py * s);
      }
      c.stroke(); c.restore();
    }
  },
};

/** A point on a rectangle inset by d, at distance s along it, with its inward normal. */
function perimeter(W, H, d, s) {
  const w = W - 2 * d, h = H - 2 * d, per = 2 * (w + h);
  s = ((s % per) + per) % per;
  if (s < w) return [d + s, d, 0, 1];
  if ((s -= w) < h) return [W - d, d + s, -1, 0];
  if ((s -= h) < w) return [W - d - s, H - d, 0, -1];
  s -= w; return [d, H - d - s, 1, 0];
}

function paperGrain(c, f, W, H, u, band) {
  const r = rng((f.seed || 1) + 99);
  c.fillStyle = rgba(f.color2, 0.08);
  for (let i = 0; i < 500; i++) {
    const side = Math.floor(r() * 4), along = r(), depth = r() * band;
    const x = side === 0 || side === 2 ? along * W : side === 1 ? W - depth : depth;
    const y = side === 1 || side === 3 ? along * H : side === 2 ? H - depth : depth;
    c.fillRect(x, y, u * 0.3, u * 0.3);
  }
}
function snowflake(c, x, y, r, col, u) {
  c.save(); c.strokeStyle = col; c.lineWidth = Math.max(1, u * 0.18); c.lineCap = "round"; c.shadowColor = col; c.shadowBlur = u * 0.8;
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3, ex = x + Math.cos(a) * r, ey = y + Math.sin(a) * r;
    c.beginPath(); c.moveTo(x, y); c.lineTo(ex, ey);
    const mx = x + Math.cos(a) * r * 0.6, my = y + Math.sin(a) * r * 0.6;
    for (const b of [a + 0.6, a - 0.6]) { c.moveTo(mx, my); c.lineTo(mx + Math.cos(b) * r * 0.3, my + Math.sin(b) * r * 0.3); }
    c.stroke();
  }
  c.restore();
}
function leaf(c, x, y, s, a, col, r) {
  c.save(); c.translate(x, y); c.rotate(a);
  const g = c.createLinearGradient(-s, 0, s, 0); g.addColorStop(0, rgba(col, 0.55)); g.addColorStop(1, rgba(col, 0.2));
  c.fillStyle = g; c.beginPath(); c.moveTo(-s, 0); c.quadraticCurveTo(0, -s * 0.55, s, 0); c.quadraticCurveTo(0, s * 0.55, -s, 0); c.fill();
  c.strokeStyle = rgba(col, 0.45); c.lineWidth = Math.max(1, s * 0.04); c.beginPath(); c.moveTo(-s * 0.9, 0); c.lineTo(s * 0.9, 0); c.stroke();
  c.restore();
}
function bloom(c, x, y, s, col, r) {
  const petals = 5 + Math.floor(r() * 2), rot = r() * 6.283;
  for (let layer = 0; layer < 2; layer++) {
    for (let i = 0; i < petals; i++) {
      const a = rot + (i * 6.283) / petals + layer * 0.4, d = s * (layer ? 0.35 : 0.55), pr = s * (layer ? 0.4 : 0.55);
      const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
      const g = c.createRadialGradient(px, py, 0, px, py, pr);
      g.addColorStop(0, rgba(col, layer ? 0.5 : 0.4)); g.addColorStop(0.7, rgba(col, 0.28)); g.addColorStop(1, rgba(col, 0.05));
      c.fillStyle = g; c.beginPath(); c.ellipse(px, py, pr, pr * 0.72, a, 0, 6.283); c.fill();
    }
  }
  c.fillStyle = "rgba(255,214,90,0.8)"; c.beginPath(); c.arc(x, y, s * 0.14, 0, 6.283); c.fill();
}

// ---------- drawing a frame layer ----------

const cache = new Map(); // static frames are drawn once per look and size
let work = null;

/** The frame drawn on its own transparent W×H canvas (some frames cut holes, so they need their own layer). */
export function frameImage(f, W, H, t = 0) {
  const animated = f.animate && ANIMATED_FRAMES.has(f.type);
  const key = animated ? null : JSON.stringify([f.type, f.color, f.color2, f.size, f.seed, f.motif, f.metal, f.corners, W, H]);
  if (key && cache.has(key)) return cache.get(key);
  const cv = key ? new OffscreenCanvas(W, H) : (work && work.width === W && work.height === H ? work : (work = new OffscreenCanvas(W, H)));
  const c = cv.getContext("2d");
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, W, H);
  const u = Math.min(W, H) / 100;
  const def = frameDef(f.type)[3];
  (DRAW[f.type] || DRAW.torn)(c, { ...def, ...f, size: f.size ?? 1 }, W, H, u, t);
  if (key) { if (cache.size > 24) cache.delete(cache.keys().next().value); cache.set(key, cv); }
  return cv;
}

/** A new frame item's settings. */
export const newFrameLook = (type) => ({ type, ...structuredClone(frameDef(type)[3]), seed: 1 + Math.floor(Math.random() * 9999) });
