// Title templates (Library › Titles). A title is one layer on the text tracks, like a shape or visualizer:
// item.title = { tpl, lines: [...], colorA, colorB, font?, speed? }. Each template draws itself centred on its
// anchor (the item's x / y), with its own intro and outro, so it moves, scales, rotates and trims as one piece.
// Every look here is drawn by Cutline (fonts are the free Google Fonts Cutline already uses).

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const E = {
  out: (x) => 1 - Math.pow(1 - clamp01(x), 3),
  inOut: (x) => { x = clamp01(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
  back: (x) => { x = clamp01(x); return 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2); },
};
const hash = (a, b = 0) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };

// Fonts (CSS families; Cutline loads them from Google Fonts like the rest of its list).
const F = {
  mont: "'Montserrat', Arial, sans-serif", anton: "'Anton', Impact, sans-serif", bebas: "'Bebas Neue', Impact, sans-serif",
  dmserif: "'DM Serif Display', Georgia, serif", playfair: "'Playfair Display', Georgia, serif", righteous: "'Righteous', Arial, sans-serif",
  blackops: "'Black Ops One', Impact, sans-serif", poppins: "'Poppins', Arial, sans-serif", caveat: "'Caveat Brush', 'Comic Sans MS', cursive",
  bangers: "'Bangers', Impact, cursive", archivo: "'Archivo Black', Arial Black, sans-serif", marker: "'Permanent Marker', 'Comic Sans MS', cursive",
  pacifico: "'Pacifico', cursive", grotesk: "'Space Grotesk', 'Courier New', monospace", abril: "'Abril Fatface', Georgia, serif",
};

/** Intro / outro progress: i 0→1 over the first `a` s, o 1→0 over the last `b` s (scaled by the title's speed). */
function phase(T, lt, dur, a = 0.7, b = 0.5) {
  const sp = T.speed || 1;
  a /= sp; b /= sp;
  const i = clamp01(lt / a), o = T.noOut ? 1 : clamp01((dur - lt) / b);
  return { i, o, ie: E.out(i), oe: E.out(o), v: Math.min(E.out(i), E.out(o)), lt: lt * sp };
}
const line = (T, n, def) => (T.lines?.[n] ?? def ?? "");
function font(c, css, weight, size, italic = false) { c.font = `${italic ? "italic " : ""}${weight} ${Math.max(1, size)}px ${css}`; }
/** Fills (and optionally strokes first) text with letter spacing `sp` (em). */
function text(c, s, x, y, { sp = 0, size = 10, fill, stroke, sw = 0, align = "center", base = "middle" } = {}) {
  c.letterSpacing = `${(sp * size).toFixed(2)}px`;
  c.textAlign = align; c.textBaseline = base; c.lineJoin = "round";
  // Canvas adds the spacing after the last letter too; nudge centred / right-aligned text back by half / all of it.
  const fix = align === "center" ? (sp * size) / 2 : align === "right" ? sp * size : 0;
  if (stroke && sw > 0) { c.strokeStyle = stroke; c.lineWidth = sw; c.strokeText(s, x + fix, y); }
  if (fill) { c.fillStyle = fill; c.fillText(s, x + fix, y); }
  const w = c.measureText(s).width - sp * size;
  c.letterSpacing = "0px";
  return Math.max(0, w);
}
const measure = (c, s, size, sp = 0) => { c.letterSpacing = `${(sp * size).toFixed(2)}px`; const w = c.measureText(s).width - sp * size; c.letterSpacing = "0px"; return Math.max(0, w); };
function rrect(c, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
/** Clips to the part of [x, x + w] revealed so far (p 0..1, left to right). */
function wipe(c, x, y, w, h, p) { c.beginPath(); c.rect(x, y, w * clamp01(p), h); c.clip(); }
function star4(c, x, y, r) {
  c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r);
  c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill();
}

/**
 * Templates: [id, name, category, { lines (defaults), labels, colors [A, B], colorLabels, font, pos [x, y], draw }].
 * draw(c, T, lt, dur, k): origin at the anchor, k = frame width / 1920.
 */
export const TITLE_TEMPLATES = [
  ["default", "Default title", "titles", {
    lines: ["YOUR TITLE HERE"], colors: ["#ffffff", "#000000"], colorLabels: ["Text", "Shadow"], font: F.mont,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur);
      c.globalAlpha *= p.v;
      font(c, T.font || F.mont, 800, 104 * k);
      c.shadowColor = T.colorB + "aa"; c.shadowBlur = 18 * k; c.shadowOffsetY = 6 * k;
      text(c, line(T, 0), 0, (1 - p.ie) * 40 * k, { sp: 0.04 + 0.16 * (1 - p.ie), size: 104 * k, fill: T.colorA });
    },
  }],
  ["big", "Big title", "titles", {
    lines: ["TITLE", "LOWER TITLE HERE"], labels: ["Title", "Subtitle"], colors: ["#ffffff", "#ffd23f"], colorLabels: ["Title", "Lines"], font: F.anton,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.8);
      const s = 1.25 - 0.25 * p.ie;
      c.save(); c.globalAlpha *= p.v; c.scale(s, s);
      font(c, T.font || F.anton, 400, 230 * k);
      text(c, line(T, 0), 0, -30 * k, { sp: 0.02, size: 230 * k, fill: T.colorA });
      c.restore();
      const q = E.out(clamp01((p.lt - 0.25) / 0.6)) * p.oe;
      c.globalAlpha *= q;
      font(c, F.mont, 600, 34 * k);
      const w = text(c, line(T, 1), 0, 120 * k + (1 - q) * 20 * k, { sp: 0.42, size: 34 * k, fill: T.colorA });
      c.fillStyle = T.colorB;
      const lw = 140 * k * q;
      c.fillRect(-w / 2 - 30 * k - lw, 118 * k, lw, 3 * k);
      c.fillRect(w / 2 + 30 * k, 118 * k, lw, 3 * k);
    },
  }],
  ["credit", "Credit", "titles", {
    lines: ["Directed by", "JANE DOE"], labels: ["Role", "Name"], colors: ["#ffffff", "#9fb3c8"], colorLabels: ["Name", "Role"], font: F.mont,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.9, 0.6);
      c.globalAlpha *= p.v;
      font(c, F.mont, 500, 30 * k);
      text(c, line(T, 0), 0, -44 * k + (1 - p.ie) * 14 * k, { sp: 0.1, size: 30 * k, fill: T.colorB });
      font(c, T.font || F.mont, 800, 72 * k);
      text(c, line(T, 1), 0, 22 * k + (1 - p.ie) * 24 * k, { sp: 0.16, size: 72 * k, fill: T.colorA });
    },
  }],
  ["cinematic", "Cinematic", "titles", {
    lines: ["Cinematic Title", "A FILM BY YOUR NAME"], labels: ["Title", "Subtitle"], colors: ["#f3e9d2", "#c9a96e"], colorLabels: ["Title", "Subtitle"], font: F.dmserif,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 1.4, 1);
      const slow = clamp01(lt / Math.max(1, dur));
      c.globalAlpha *= p.v;
      font(c, T.font || F.dmserif, 400, 124 * k);
      c.shadowColor = "rgba(0,0,0,.6)"; c.shadowBlur = 24 * k;
      text(c, line(T, 0), 0, -20 * k, { sp: 0.02 + 0.08 * slow, size: 124 * k, fill: T.colorA });
      c.shadowBlur = 0;
      font(c, F.mont, 500, 26 * k);
      c.globalAlpha *= E.out(clamp01((p.lt - 0.6) / 0.8));
      text(c, line(T, 1), 0, 78 * k, { sp: 0.5, size: 26 * k, fill: T.colorB });
    },
  }],
  ["galaxy", "Galaxy", "effects", {
    lines: ["GALAXY PACK", "TITLES COLLECTION"], labels: ["Title", "Subtitle"], colors: ["#b9a6ff", "#5ee7ff"], colorLabels: ["Colour 1", "Colour 2"], font: F.mont,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.9);
      c.globalAlpha *= p.v;
      font(c, T.font || F.mont, 800, 96 * k);
      const w = measure(c, line(T, 0), 96 * k, 0.28);
      const g = c.createLinearGradient(-w / 2, 0, w / 2, 0);
      g.addColorStop(0, T.colorA); g.addColorStop(1, T.colorB);
      c.shadowColor = T.colorA; c.shadowBlur = 24 * k;
      text(c, line(T, 0), 0, -14 * k, { sp: 0.28 + 0.2 * (1 - p.ie), size: 96 * k, fill: g });
      c.shadowBlur = 0;
      font(c, F.mont, 500, 26 * k);
      text(c, line(T, 1), 0, 62 * k, { sp: 0.55, size: 26 * k, fill: "#ffffffcc" });
      c.fillStyle = "#ffffff";
      for (let i = 0; i < 14; i++) {
        const tw = 0.5 + 0.5 * Math.sin(lt * (2 + hash(i, 1) * 4) + hash(i, 2) * 6);
        c.globalAlpha = p.v * tw;
        star4(c, (hash(i, 3) - 0.5) * (w + 160 * k), (hash(i, 4) - 0.5) * 200 * k, (3 + hash(i, 5) * 9) * k);
      }
    },
  }],
  ["glow", "Neon glow", "effects", {
    lines: ["GLOW"], colors: ["#ffffff", "#ff2bd6"], colorLabels: ["Tube", "Glow"], font: F.righteous,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.9, 0.5);
      // A neon sign switching on: a few flickers, then a steady glow that breathes a little.
      const flick = p.i < 1 ? (Math.sin(p.lt * 55) > 0.2 ? 1 : 0.15) * p.i : 0.88 + 0.12 * Math.sin(lt * 3);
      c.globalAlpha *= flick * p.oe;
      font(c, T.font || F.righteous, 400, 170 * k);
      c.shadowColor = T.colorB;
      for (const blur of [60, 30, 12]) { c.shadowBlur = blur * k; text(c, line(T, 0), 0, 0, { sp: 0.06, size: 170 * k, fill: T.colorB }); }
      c.shadowBlur = 6 * k;
      text(c, line(T, 0), 0, 0, { sp: 0.06, size: 170 * k, fill: T.colorA });
    },
  }],
  ["fire", "Fire particles", "effects", {
    lines: ["YOUR TITLE"], colors: ["#ffd23f", "#ff4b1f"], colorLabels: ["Hot", "Flame"], font: F.anton,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 1, 0.6);
      font(c, T.font || F.anton, 400, 150 * k);
      const w = measure(c, line(T, 0), 150 * k, 0.04), h = 150 * k;
      c.save();
      c.globalAlpha *= p.oe;
      wipe(c, -w / 2 - 20 * k, -h, w + 40 * k, h * 2, p.ie * 1.05);
      const g = c.createLinearGradient(0, -h / 2, 0, h / 2);
      g.addColorStop(0, T.colorA); g.addColorStop(1, T.colorB);
      c.shadowColor = T.colorB; c.shadowBlur = (24 + 10 * Math.sin(lt * 13)) * k;
      text(c, line(T, 0), 0, 0, { sp: 0.04, size: 150 * k, fill: g });
      c.restore();
      // Embers rising from the letters (and a burst where the reveal is).
      c.save();
      c.globalCompositeOperation = "lighter";
      for (let i = 0; i < 70; i++) {
        const x0 = (hash(i, 1) - 0.5) * w, speed = 0.4 + hash(i, 2) * 0.7;
        const life = (lt * speed + hash(i, 3)) % 1;
        if (x0 / w + 0.5 > p.ie * 1.05) continue;
        const x = x0 + Math.sin(lt * 3 + i) * 14 * k, y = h * 0.35 - life * 260 * k;
        c.globalAlpha = (1 - life) * p.oe * (0.5 + 0.5 * hash(i, 4));
        c.fillStyle = i % 3 ? T.colorB : T.colorA;
        c.beginPath(); c.arc(x, y, (1.5 + hash(i, 5) * 3.5) * k * (1 - life * 0.6), 0, Math.PI * 2); c.fill();
      }
      c.restore();
    },
  }],
  ["metal", "3D metal", "effects", {
    lines: ["SWORD"], colors: ["#fff1c2", "#8a5a12"], colorLabels: ["Shine", "Shadow"], font: F.abril,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.8);
      const s = 0.55 + 0.45 * E.back(p.i);
      c.globalAlpha *= Math.min(clamp01(p.i * 3), p.oe);
      c.scale(s, s);
      font(c, T.font || F.abril, 400, 190 * k);
      const s0 = line(T, 0), h = 190 * k, w = measure(c, s0, h, 0.04);
      // Extrusion: darker copies stepping down-right.
      for (let d = 14; d >= 1; d--) text(c, s0, d * 0.9 * k, d * 1.1 * k, { sp: 0.04, size: h, fill: d > 10 ? "#1a1208" : T.colorB });
      const g = c.createLinearGradient(0, -h * 0.45, 0, h * 0.45);
      g.addColorStop(0, T.colorA); g.addColorStop(0.42, "#e2b553"); g.addColorStop(0.5, T.colorB); g.addColorStop(0.62, "#f4d27a"); g.addColorStop(1, T.colorB);
      text(c, s0, 0, 0, { sp: 0.04, size: h, fill: g, stroke: "#3a2606", sw: 3 * k });
      // One shine passing over the letters once the title has landed.
      const sweep = clamp01((p.lt - 0.6) / 0.9);
      if (sweep > 0 && sweep < 1) {
        c.save();
        c.globalCompositeOperation = "source-atop";
        const x = -w / 2 - 100 * k + sweep * (w + 200 * k);
        const sh = c.createLinearGradient(x - 60 * k, 0, x + 60 * k, 0);
        sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(0.5, "rgba(255,255,255,.85)"); sh.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = sh; c.fillRect(-w, -h, w * 2, h * 2);
        c.restore();
      }
    },
  }],
  ["sweep", "Light sweep", "effects", {
    lines: ["Light Sweep"], colors: ["#c9d2e0", "#ffffff"], colorLabels: ["Text", "Light"], font: F.poppins,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.7);
      c.globalAlpha *= p.v;
      font(c, T.font || F.poppins, 700, 130 * k);
      const h = 130 * k, w = text(c, line(T, 0), 0, (1 - p.ie) * 20 * k, { sp: 0.02, size: h, fill: T.colorA });
      const cyc = ((lt * (T.speed || 1)) % 2.4) / 1.2;
      if (cyc < 1) {
        c.globalCompositeOperation = "source-atop";
        const x = -w / 2 - 120 * k + cyc * (w + 240 * k);
        const g = c.createLinearGradient(x - 70 * k, -h / 2, x + 70 * k, h / 2);
        g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, T.colorB); g.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = g; c.fillRect(-w, -h, w * 2, h * 2);
        c.globalCompositeOperation = "source-over";
      }
    },
  }],
  ["jitter", "Jittery text", "effects", {
    lines: ["Beautiful Day"], colors: ["#fff36b", "#1b1b1b"], colorLabels: ["Text", "Outline"], font: F.caveat,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.6, 0.4);
      const s0 = line(T, 0), size = 130 * k;
      font(c, T.font || F.caveat, 400, size);
      const total = measure(c, s0, size);
      let x = -total / 2;
      const frame = Math.floor(lt * 8); // hand-drawn "boil" at 8 drawings a second
      c.textAlign = "left"; c.textBaseline = "middle"; c.lineJoin = "round";
      [...s0].forEach((ch, i) => {
        const cw = c.measureText(ch).width;
        const appear = E.back(clamp01((p.lt - i * 0.045) / 0.35));
        if (appear > 0.01 && ch.trim()) {
          c.save();
          c.globalAlpha *= clamp01(appear) * p.oe;
          c.translate(x + cw / 2 + (hash(i, frame) - 0.5) * 5 * k, (hash(i + 50, frame) - 0.5) * 6 * k);
          c.rotate((hash(i + 99, frame) - 0.5) * 0.12);
          c.scale(appear, appear);
          c.strokeStyle = T.colorB; c.lineWidth = 8 * k; c.strokeText(ch, -cw / 2, 0);
          c.fillStyle = T.colorA; c.fillText(ch, -cw / 2, 0);
          c.restore();
        }
        x += cw;
      });
    },
  }],
  ["cartoon", "Cartoon", "effects", {
    lines: ["Cartoon"], colors: ["#ffd23f", "#2a1600"], colorLabels: ["Fill", "Outline"], font: F.bangers,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.7, 0.4);
      const s0 = line(T, 0), size = 170 * k;
      font(c, T.font || F.bangers, 400, size);
      c.letterSpacing = `${0.04 * size}px`;
      const total = measure(c, s0, size, 0.04);
      let x = -total / 2;
      c.textAlign = "left"; c.textBaseline = "middle"; c.lineJoin = "round";
      [...s0].forEach((ch, i) => {
        c.letterSpacing = "0px";
        const cw = c.measureText(ch).width + 0.04 * size;
        const s = E.back(clamp01((p.lt - i * 0.06) / 0.4));
        if (s > 0.01) {
          c.save();
          c.globalAlpha *= p.oe;
          c.translate(x + cw / 2, 0); c.rotate((i % 2 ? 1 : -1) * 0.04); c.scale(s, s);
          c.fillStyle = T.colorB; c.fillText(ch, -cw / 2 + 9 * k, 10 * k); // hard drop shadow
          c.strokeStyle = T.colorB; c.lineWidth = 14 * k; c.strokeText(ch, -cw / 2, 0);
          c.fillStyle = T.colorA; c.fillText(ch, -cw / 2, 0);
          c.restore();
        }
        x += cw;
      });
    },
  }],
  ["art", "Bold art", "effects", {
    lines: ["ART"], colors: ["#ff2d4b", "#ffffff"], colorLabels: ["Fill", "Outline"], font: F.archivo,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.45, 0.4);
      const s = 1.6 - 0.6 * E.out(p.i);
      c.globalAlpha *= Math.min(clamp01(p.i * 2.5), p.oe);
      c.transform(s, 0, -0.18 * s, s, 0, 0); // slanted
      font(c, T.font || F.archivo, 400, 210 * k);
      const s0 = line(T, 0);
      text(c, s0, 0, 0, { sp: 0.02, size: 210 * k, stroke: T.colorA, sw: 40 * k });
      text(c, s0, 0, 0, { sp: 0.02, size: 210 * k, stroke: T.colorB, sw: 24 * k });
      text(c, s0, 0, 0, { sp: 0.02, size: 210 * k, fill: T.colorA });
    },
  }],
  ["headline", "Headline boxes", "social", {
    lines: ["TODAY'S", "HEADLINES"], labels: ["Label", "Headline"], colors: ["#e8222e", "#ffffff"], colorLabels: ["Label box", "Headline box"], font: F.anton,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.9, 0.5);
      font(c, T.font || F.anton, 400, 120 * k);
      const hw = measure(c, line(T, 1), 120 * k, 0.02) + 70 * k, hh = 150 * k;
      font(c, F.anton, 400, 54 * k);
      const lw = measure(c, line(T, 0), 54 * k, 0.04) + 44 * k, lh = 72 * k;
      const x0 = -hw / 2, y0 = -40 * k;
      c.globalAlpha *= p.oe;
      c.save(); wipe(c, x0, y0 - lh, lw, lh, E.out(clamp01(p.lt / 0.45)));
      c.fillStyle = T.colorA; c.fillRect(x0, y0 - lh, lw, lh);
      text(c, line(T, 0), x0 + 22 * k, y0 - lh / 2 + 3 * k, { sp: 0.04, size: 54 * k, fill: "#ffffff", align: "left" });
      c.restore();
      c.save(); wipe(c, x0, y0, hw, hh, E.out(clamp01((p.lt - 0.2) / 0.55)));
      c.fillStyle = T.colorB; c.fillRect(x0, y0, hw, hh);
      font(c, T.font || F.anton, 400, 120 * k);
      text(c, line(T, 1), 0, y0 + hh / 2 + 4 * k, { sp: 0.02, size: 120 * k, fill: "#14141a" });
      c.restore();
    },
  }],
  ["brush", "Brush headline", "social", {
    lines: ["YOUR TEXT HERE", "YOUR HEADLINE", "HERE"], labels: ["Top line", "Headline", "Headline line 2"], colors: ["#1f5fbf", "#ffffff"], colorLabels: ["Brush", "Text"], font: F.anton,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 1, 0.5);
      c.globalAlpha *= p.oe;
      const W = 760 * k, H = 230 * k;
      // A dry-brush stroke: overlapping rough bands, painted left to right.
      c.save(); wipe(c, -W / 2 - 40 * k, -H, W + 80 * k, H * 2, E.inOut(clamp01(p.lt / 0.6)));
      c.fillStyle = T.colorA;
      for (let b = 0; b < 9; b++) {
        const y = -H / 2 + 20 * k + b * (H - 40 * k) / 8;
        c.beginPath();
        c.moveTo(-W / 2 + hash(b, 1) * 40 * k, y);
        for (let s = 0; s <= 16; s++) c.lineTo(-W / 2 + (s / 16) * W, y + (hash(b, s) - 0.5) * 16 * k);
        for (let s = 16; s >= 0; s--) c.lineTo(-W / 2 + (s / 16) * W - hash(b + 9, s) * 30 * k, y + 30 * k + (hash(b + 20, s) - 0.5) * 16 * k);
        c.closePath(); c.globalAlpha = p.oe * (0.75 + 0.25 * hash(b, 7)); c.fill();
      }
      c.restore();
      const q = E.out(clamp01((p.lt - 0.35) / 0.5));
      c.globalAlpha = p.oe * q;
      font(c, F.mont, 700, 28 * k);
      text(c, line(T, 0), -W / 2 + 40 * k, -H / 2 - 26 * k, { sp: 0.2, size: 28 * k, fill: T.colorB, align: "left" });
      font(c, T.font || F.anton, 400, 92 * k);
      text(c, line(T, 1), -W / 2 + 40 * k + (1 - q) * 30 * k, -40 * k, { sp: 0.02, size: 92 * k, fill: T.colorB, align: "left" });
      text(c, line(T, 2), -W / 2 + 40 * k + (1 - q) * 50 * k, 52 * k, { sp: 0.02, size: 92 * k, fill: T.colorB, align: "left" });
    },
  }],
  ["frame", "Corner frame", "titles", {
    lines: ["YOUR TITLE"], colors: ["#ffffff", "#3d8bff"], colorLabels: ["Text", "Corners"], font: F.mont,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.8);
      font(c, T.font || F.mont, 800, 96 * k);
      const w = measure(c, line(T, 0), 96 * k, 0.08) + 90 * k, h = 160 * k;
      c.globalAlpha *= p.v;
      text(c, line(T, 0), 0, 0, { sp: 0.08, size: 96 * k, fill: T.colorA });
      const off = (1 - p.ie) * 80 * k, L = 46 * k;
      c.strokeStyle = T.colorB; c.lineWidth = 6 * k; c.lineCap = "square";
      c.beginPath();
      c.moveTo(-w / 2 - off, -h / 2 - off + L); c.lineTo(-w / 2 - off, -h / 2 - off); c.lineTo(-w / 2 - off + L, -h / 2 - off);
      c.moveTo(w / 2 + off, h / 2 + off - L); c.lineTo(w / 2 + off, h / 2 + off); c.lineTo(w / 2 + off - L, h / 2 + off);
      c.stroke();
    },
  }],
  ["flash", "Flash sale", "social", {
    lines: ["FLASH SALE", "UP TO 50% OFF"], labels: ["Title", "Tag"], colors: ["#7b2bff", "#ff2bd6"], colorLabels: ["Colour 1", "Colour 2"], font: F.archivo,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.7, 0.4);
      font(c, T.font || F.archivo, 400, 92 * k);
      const w = measure(c, line(T, 0), 92 * k, 0.02) + 120 * k, h = 140 * k;
      c.globalAlpha *= p.oe;
      c.save();
      c.translate(-(1 - p.ie) * 900 * k, 0);
      c.transform(1, 0, -0.25, 1, 0, 0);
      const g = c.createLinearGradient(-w / 2, 0, w / 2, 0);
      g.addColorStop(0, T.colorA); g.addColorStop(1, T.colorB);
      c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h);
      c.fillStyle = "#ffffff"; c.fillRect(-w / 2 - 26 * k, -h / 2, 12 * k, h);
      text(c, line(T, 0), 0, 4 * k, { sp: 0.02, size: 92 * k, fill: "#ffffff" });
      c.restore();
      const q = E.back(clamp01((p.lt - 0.45) / 0.4));
      if (q > 0.01) {
        c.save(); c.translate(w / 2 - 40 * k, h / 2 + 10 * k); c.rotate(-0.05); c.scale(q, q);
        font(c, F.mont, 800, 34 * k);
        const tw = measure(c, line(T, 1), 34 * k, 0.06) + 34 * k;
        c.fillStyle = "#ffe14d"; rrect(c, -tw, -26 * k, tw, 52 * k, 6 * k); c.fill();
        text(c, line(T, 1), -tw / 2, 2 * k, { sp: 0.06, size: 34 * k, fill: "#14141a" });
        c.restore();
      }
    },
  }],
  ["comic", "Comic burst", "social", {
    lines: ["DOES IT", "REALLY WORK?"], labels: ["Line 1", "Line 2"], colors: ["#ffcf24", "#ff7a1a"], colorLabels: ["Rays", "Rays 2"], font: F.bangers,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.5, 0.4);
      const s = E.back(p.i);
      c.globalAlpha *= Math.min(clamp01(p.i * 3), p.oe);
      c.rotate(-0.05); c.scale(s, s);
      const W = 760 * k, H = 380 * k;
      c.save();
      rrect(c, -W / 2, -H / 2, W, H, 14 * k); c.clip();
      c.fillStyle = T.colorB; c.fillRect(-W / 2, -H / 2, W, H);
      c.fillStyle = T.colorA;
      const turn = lt * 0.15;
      for (let i = 0; i < 24; i += 2) {
        const a0 = turn + (i / 24) * Math.PI * 2, a1 = turn + ((i + 1) / 24) * Math.PI * 2;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a0) * W, Math.sin(a0) * W); c.lineTo(Math.cos(a1) * W, Math.sin(a1) * W); c.closePath(); c.fill();
      }
      c.restore();
      c.strokeStyle = "#111"; c.lineWidth = 8 * k; rrect(c, -W / 2, -H / 2, W, H, 14 * k); c.stroke();
      font(c, T.font || F.bangers, 400, 104 * k);
      for (const [n, y] of [[0, -58 * k], [1, 62 * k]]) {
        text(c, line(T, n), 6 * k, y + 7 * k, { sp: 0.03, size: 104 * k, fill: "#111" });
        text(c, line(T, n), 0, y, { sp: 0.03, size: 104 * k, fill: "#ffffff", stroke: "#111", sw: 12 * k });
      }
    },
  }],
  ["typewriter", "Typewriter", "titles", {
    lines: ["Lorem ipsum dolor"], colors: ["#ffffff", "#ffd23f"], colorLabels: ["Text", "Cursor"], font: F.grotesk,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.4, 0.4);
      const s0 = line(T, 0), size = 76 * k;
      font(c, T.font || F.grotesk, 600, size);
      const total = measure(c, s0, size, 0.02);
      const n = Math.min(s0.length, Math.floor(p.lt / 0.075));
      c.globalAlpha *= p.oe;
      const w = text(c, s0.slice(0, n), -total / 2, 0, { sp: 0.02, size, fill: T.colorA, align: "left" });
      if (n < s0.length || Math.floor(lt * 2.2) % 2 === 0) { c.fillStyle = T.colorB; c.fillRect(-total / 2 + w + 8 * k, -size * 0.45, 6 * k, size * 0.9); }
    },
  }],
  ["script", "Script", "titles", {
    lines: ["Simple", "PERFECT FOR YOUR VLOG"], labels: ["Title", "Subtitle"], colors: ["#ffffff", "#ffffff"], colorLabels: ["Title", "Subtitle"], font: F.pacifico,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 1.1, 0.5);
      font(c, T.font || F.pacifico, 400, 170 * k);
      const w = measure(c, line(T, 0), 170 * k);
      c.globalAlpha *= p.oe;
      c.save(); wipe(c, -w / 2 - 30 * k, -200 * k, w + 60 * k, 400 * k, E.inOut(p.i));
      c.shadowColor = "rgba(0,0,0,.45)"; c.shadowBlur = 14 * k; c.shadowOffsetY = 5 * k;
      text(c, line(T, 0), 0, -26 * k, { size: 170 * k, fill: T.colorA });
      c.restore();
      const q = E.out(clamp01((p.lt - 0.7) / 0.6));
      c.globalAlpha *= q;
      font(c, F.mont, 600, 26 * k);
      const sw = text(c, line(T, 1), 0, 98 * k, { sp: 0.3, size: 26 * k, fill: T.colorB });
      c.fillStyle = T.colorB; c.fillRect(-sw / 2 * q, 78 * k, sw * q, 2 * k);
    },
  }],
  ["story", "Two-line story", "titles", {
    lines: ["WHOLE", "MY STORY"], labels: ["Line 1", "Line 2"], colors: ["#ffffff", "#ffffff"], colorLabels: ["Line 1", "Line 2"], font: F.archivo,
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.7, 0.4);
      font(c, T.font || F.archivo, 400, 130 * k);
      c.globalAlpha *= p.oe;
      const a = E.out(p.i), b = E.out(clamp01((p.lt - 0.12) / 0.7));
      c.save(); c.globalAlpha *= a; text(c, line(T, 0), -(1 - a) * 400 * k, -64 * k, { sp: 0.01, size: 130 * k, fill: T.colorA }); c.restore();
      c.globalAlpha *= b; text(c, line(T, 1), (1 - b) * 400 * k, 66 * k, { sp: 0.01, size: 130 * k, fill: T.colorB });
    },
  }],
  ["lt-bar", "Lower third: bar", "lower", {
    lines: ["Your Name", "Your title or role"], labels: ["Name", "Role"], colors: ["#22d3c5", "#ffffff"], colorLabels: ["Bar", "Text"], font: F.mont, pos: [0.08, 0.82],
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.8, 0.45);
      const h = 120 * k;
      c.globalAlpha *= p.oe;
      c.fillStyle = T.colorA; c.fillRect(0, -h / 2 + (1 - p.ie) * h / 2, 10 * k, h * p.ie);
      const q = E.out(clamp01((p.lt - 0.2) / 0.6));
      c.save(); c.beginPath(); c.rect(18 * k, -h, 1400 * k, h * 2); c.clip();
      font(c, T.font || F.mont, 700, 58 * k);
      text(c, line(T, 0), 34 * k - (1 - q) * 300 * k, -18 * k, { size: 58 * k, fill: T.colorB, align: "left" });
      font(c, F.mont, 400, 32 * k);
      c.globalAlpha *= 0.85;
      text(c, line(T, 1), 34 * k - (1 - q) * 380 * k, 36 * k, { size: 32 * k, fill: T.colorB, align: "left", sp: 0.04 });
      c.restore();
    },
  }],
  ["lt-box", "Lower third: boxes", "lower", {
    lines: ["YOUR NAME", "Your title or role"], labels: ["Name", "Role"], colors: ["#e8222e", "#14141a"], colorLabels: ["Name box", "Role box"], font: F.mont, pos: [0.08, 0.82],
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.9, 0.45);
      font(c, T.font || F.mont, 800, 52 * k);
      const nw = measure(c, line(T, 0), 52 * k, 0.06) + 56 * k;
      font(c, F.mont, 500, 32 * k);
      const rw = measure(c, line(T, 1), 32 * k, 0.02) + 48 * k;
      c.globalAlpha *= p.oe;
      c.save(); wipe(c, 0, -80 * k, nw, 80 * k, E.out(clamp01(p.lt / 0.45)));
      c.fillStyle = T.colorA; c.fillRect(0, -80 * k, nw, 80 * k);
      font(c, T.font || F.mont, 800, 52 * k);
      text(c, line(T, 0), 28 * k, -38 * k, { sp: 0.06, size: 52 * k, fill: "#ffffff", align: "left" });
      c.restore();
      c.save(); wipe(c, 0, 0, rw, 56 * k, E.out(clamp01((p.lt - 0.2) / 0.5)));
      c.fillStyle = T.colorB; c.fillRect(0, 0, rw, 56 * k);
      font(c, F.mont, 500, 32 * k);
      text(c, line(T, 1), 24 * k, 29 * k, { sp: 0.02, size: 32 * k, fill: "#ffffff", align: "left" });
      c.restore();
    },
  }],
  ["lt-line", "Lower third: line", "lower", {
    lines: ["Lorem Ipsum", "Description goes here"], labels: ["Name", "Role"], colors: ["#ffffff", "#ffd23f"], colorLabels: ["Text", "Line"], font: F.poppins, pos: [0.08, 0.82],
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 1, 0.45);
      c.globalAlpha *= p.oe;
      c.fillStyle = T.colorB; c.fillRect(0, -2 * k, 520 * k * E.inOut(clamp01(p.lt / 0.55)), 4 * k);
      const q = E.out(clamp01((p.lt - 0.35) / 0.55));
      c.save(); c.beginPath(); c.rect(-10 * k, -110 * k, 1400 * k, 108 * k); c.clip();
      font(c, T.font || F.poppins, 700, 60 * k);
      text(c, line(T, 0), 0, -40 * k + (1 - q) * 80 * k, { size: 60 * k, fill: T.colorA, align: "left" });
      c.restore();
      c.save(); c.beginPath(); c.rect(-10 * k, 4 * k, 1400 * k, 80 * k); c.clip();
      font(c, F.poppins, 400, 32 * k);
      text(c, line(T, 1), 0, 34 * k - (1 - q) * 60 * k, { size: 32 * k, fill: T.colorA, align: "left", sp: 0.03 });
      c.restore();
    },
  }],
  ["lt-corp", "Lower third: corporate", "lower", {
    lines: ["UPPER TEXT", "Lower text goes here"], labels: ["Upper", "Lower"], colors: ["#d7263d", "#ffffff"], colorLabels: ["Upper bar", "Lower bar"], font: F.mont, pos: [0.08, 0.84],
    draw(c, T, lt, dur, k) {
      const p = phase(T, lt, dur, 0.9, 0.45);
      font(c, T.font || F.mont, 800, 40 * k);
      const w = Math.max(measure(c, line(T, 0), 40 * k, 0.12), (font(c, F.mont, 500, 30 * k), measure(c, line(T, 1), 30 * k))) + 80 * k;
      c.globalAlpha *= p.oe;
      c.fillStyle = T.colorA; c.fillRect(0, -64 * k, 14 * k, 112 * k * E.out(clamp01(p.lt / 0.3)));
      c.save(); wipe(c, 14 * k, -64 * k, w, 60 * k, E.out(clamp01((p.lt - 0.1) / 0.5)));
      c.fillStyle = T.colorA; c.fillRect(14 * k, -64 * k, w, 60 * k);
      font(c, T.font || F.mont, 800, 40 * k);
      text(c, line(T, 0), 40 * k, -32 * k, { sp: 0.12, size: 40 * k, fill: "#ffffff", align: "left" });
      c.restore();
      c.save(); wipe(c, 14 * k, -4 * k, w, 52 * k, E.out(clamp01((p.lt - 0.25) / 0.5)));
      c.fillStyle = T.colorB; c.fillRect(14 * k, -4 * k, w, 52 * k);
      font(c, F.mont, 500, 30 * k);
      text(c, line(T, 1), 40 * k, 23 * k, { size: 30 * k, fill: "#1a1a22", align: "left" });
      c.restore();
    },
  }],
];

const byId = new Map(TITLE_TEMPLATES.map((t) => [t[0], t]));
export const titleTemplate = (id) => byId.get(id) || TITLE_TEMPLATES[0];
export const titleName = (id) => titleTemplate(id)[1];
export const TITLE_CATEGORIES = [["all", "All"], ["titles", "Titles"], ["lower", "Lower thirds"], ["effects", "Effects"], ["social", "Social & promo"]];

/** A new title's settings for a template. */
export function newTitle(id) {
  const [tid, , , d] = titleTemplate(id);
  return { tpl: tid, lines: [...d.lines], colorA: d.colors[0], colorB: d.colors[1] };
}
/** Default anchor position of a template ([x, y] as frame fractions). */
export const titlePos = (id) => titleTemplate(id)[3].pos || [0.5, 0.5];
/** The fonts a title uses (to load them before drawing / exporting). */
export function titleFonts(T) {
  const d = titleTemplate(T.tpl)[3];
  return [T.font || d.font, F.mont, F.poppins, F.anton].filter((v, i, a) => a.indexOf(v) === i);
}

/** Draws title settings T at local time lt of a clip lasting dur; origin at the anchor, k = frame width / 1920. */
export function drawTitle(c, T, lt, dur, k) {
  c.save();
  titleTemplate(T.tpl)[3].draw(c, T, lt, dur, k);
  c.restore();
}

// ---------- bounds (for clicking and the selection box) ----------

const boxCache = new Map();
let mctx;
/**
 * The title's extent at full size (k = 1) around its anchor, measured from what it draws once its intro has
 * finished: { x0, y0, x1, y1 } in 1920-wide pixels. Cached per title content.
 */
export function titleBox(T) {
  const key = JSON.stringify([T.tpl, T.lines, T.font]);
  const hit = boxCache.get(key);
  if (hit) return hit;
  const S = 2400, H = 1600;
  mctx ??= new OffscreenCanvas(S, H).getContext("2d", { willReadFrequently: true });
  mctx.setTransform(1, 0, 0, 1, 0, 0);
  mctx.clearRect(0, 0, S, H);
  mctx.translate(S / 2, H / 2);
  drawTitle(mctx, { ...T, speed: 1, noOut: true }, 2.2, 10, 1);
  const data = mctx.getImageData(0, 0, S, H).data;
  let x0 = S, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y += 4) for (let x = 0; x < S; x += 4) {
    if (data[(y * S + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  const box = x1 < 0 ? { x0: -200, y0: -60, x1: 200, y1: 60 } : { x0: x0 - S / 2 - 8, y0: y0 - H / 2 - 8, x1: x1 - S / 2 + 12, y1: y1 - H / 2 + 12 };
  if (boxCache.size > 200) boxCache.clear();
  boxCache.set(key, box);
  return box;
}
/** Forget measured sizes (after fonts finish loading, text gets a different width). */
export const resetTitleBoxes = () => boxCache.clear();
