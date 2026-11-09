// Drawings for premium stickers (all drawn from code, so they stay sharp at any size and look the same when exported):
//  • premium faces: glossy heart / round / star / cloud shaped faces with many expressions,
//  • scene effects around animated emoji (floating hearts, rain, steam, Zzz, confetti…) — the "GIF" elements,
//  • elegant script words that write themselves, glitter or glow.

const TAU = Math.PI * 2;
const hash = (a, b) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

// ---------- premium faces ----------

/** Body colours: [light, main, deep rim]. */
export const FACE_PALETTES = {
  rose: ["#ffd1df", "#ff5d8f", "#c2185b"], red: ["#ffb3b3", "#ff2d55", "#a8002a"], pink: ["#ffe3f1", "#ff9ccb", "#e0569a"],
  gold: ["#fff6c9", "#ffd23f", "#d48a00"], peach: ["#ffe6d1", "#ffb07a", "#e0703a"], lilac: ["#f1e3ff", "#c39bff", "#7b4bd6"],
  mint: ["#e3fff3", "#7ff0c4", "#1fa37a"], sky: ["#e3f4ff", "#7cc8ff", "#2b7fd6"], sun: ["#fff3b0", "#ffcc33", "#e09b00"],
};
export const FACE_SHAPES = [["heart", "Heart"], ["round", "Round"], ["star", "Star"], ["cloud", "Cloud"]];
export const FACE_MOODS = [["smile", "Smile"], ["love", "In love"], ["laugh", "Laughing"], ["wink", "Wink"], ["kiss", "Kiss"], ["blush", "Shy blush"],
  ["cool", "Cool"], ["starry", "Starry eyes"], ["wow", "Wow"], ["cry", "Crying"], ["sleepy", "Sleepy"], ["angry", "Angry"], ["cute", "Cute"], ["sad", "Sad"]];

function bodyPath(c, shape, R) {
  c.beginPath();
  if (shape === "heart") {
    c.moveTo(0, R * 0.95);
    c.bezierCurveTo(-R * 1.25, R * 0.15, -R * 1.15, -R * 0.95, -R * 0.5, -R * 0.92);
    c.bezierCurveTo(-R * 0.18, -R * 0.9, 0, -R * 0.65, 0, -R * 0.5);
    c.bezierCurveTo(0, -R * 0.65, R * 0.18, -R * 0.9, R * 0.5, -R * 0.92);
    c.bezierCurveTo(R * 1.15, -R * 0.95, R * 1.25, R * 0.15, 0, R * 0.95);
  } else if (shape === "star") {
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? R * 0.58 : R * 1.02;
      // soft, rounded points
      const x = Math.cos(a) * r, y = Math.sin(a) * r + R * 0.06;
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.closePath();
  } else if (shape === "cloud") {
    for (const [x, y, r] of [[-0.55, 0.1, 0.45], [-0.2, -0.3, 0.5], [0.3, -0.25, 0.52], [0.62, 0.12, 0.42], [0.05, 0.25, 0.6]]) {
      c.moveTo(x * R + r * R, y * R); c.arc(x * R, y * R, r * R, 0, TAU);
    }
  } else c.arc(0, 0, R * 0.92, 0, TAU);
}

/** A glossy premium face, centred on the origin, about 2R wide. `t` drives blinking and little moves. */
export function drawFace(c, s, R, t, k) {
  const [light, main, deep] = FACE_PALETTES[s.palette] || FACE_PALETTES.rose;
  const shape = s.shape || "heart", mood = s.mood || "smile";
  c.save();
  c.lineJoin = "round"; c.lineCap = "round";
  if (shape === "star") c.lineJoin = "round";
  // soft drop shadow + rim
  c.save();
  c.shadowColor = "rgba(0,0,0,0.35)"; c.shadowBlur = R * 0.18; c.shadowOffsetY = R * 0.08;
  bodyPath(c, shape, R);
  c.fillStyle = deep; c.fill();
  c.restore();
  // body: light from the top left
  const g = c.createRadialGradient(-R * 0.35, -R * 0.45, R * 0.05, 0, 0, R * 1.15);
  g.addColorStop(0, light); g.addColorStop(0.45, main); g.addColorStop(1, deep);
  c.save();
  if (shape === "star") { c.lineWidth = R * 0.18; c.strokeStyle = deep; bodyPath(c, shape, R * 0.95); c.stroke(); }
  bodyPath(c, shape, R * 0.95);
  c.fillStyle = g; c.fill();
  c.clip();
  // glossy shine
  const sh = c.createLinearGradient(0, -R, 0, -R * 0.1);
  sh.addColorStop(0, "rgba(255,255,255,0.75)"); sh.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = sh;
  c.beginPath(); c.ellipse(-R * 0.28, -R * 0.52, R * 0.36, R * 0.2, -0.5, 0, TAU); c.fill();
  c.fillStyle = "rgba(255,255,255,0.9)";
  c.beginPath(); c.ellipse(-R * 0.45, -R * 0.55, R * 0.07, R * 0.045, -0.6, 0, TAU); c.fill();
  c.restore();
  // face
  const ink = "#3b1d24", fy = shape === "heart" ? R * 0.02 : shape === "star" ? R * 0.1 : R * 0.04;
  c.translate(0, fy);
  const ex = R * 0.32, ey = -R * 0.12, er = R * 0.11;
  const blink = mood !== "sleepy" && (t % 3.3) > 3.15; // a blink now and then
  c.fillStyle = ink; c.strokeStyle = ink; c.lineWidth = R * 0.07;
  const cheeks = (a = 0.55) => {
    c.save(); c.globalAlpha = a;
    for (const sx of [-1, 1]) { const gr = c.createRadialGradient(sx * R * 0.5, R * 0.12, 0, sx * R * 0.5, R * 0.12, R * 0.17); gr.addColorStop(0, "#ff4f7a"); gr.addColorStop(1, "rgba(255,79,122,0)"); c.fillStyle = gr; c.beginPath(); c.arc(sx * R * 0.5, R * 0.12, R * 0.17, 0, TAU); c.fill(); }
    c.restore();
  };
  const dotEyes = (big = 1) => {
    for (const sx of [-1, 1]) {
      if (blink) { c.beginPath(); c.moveTo(sx * ex - er, ey); c.lineTo(sx * ex + er, ey); c.stroke(); continue; }
      c.fillStyle = ink; c.beginPath(); c.ellipse(sx * ex, ey, er * big, er * 1.25 * big, 0, 0, TAU); c.fill();
      c.fillStyle = "#fff"; c.beginPath(); c.arc(sx * ex - er * 0.35 * big, ey - er * 0.45 * big, er * 0.38 * big, 0, TAU); c.fill();
      c.beginPath(); c.arc(sx * ex + er * 0.3 * big, ey + er * 0.35 * big, er * 0.16 * big, 0, TAU); c.fill();
    }
    c.fillStyle = ink;
  };
  const happyEyes = () => { for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * ex, ey + er * 0.6, er * 1.05, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); } };
  const smile = (w = 0.28, d = 0.16) => { c.beginPath(); c.moveTo(-R * w, R * 0.18); c.quadraticCurveTo(0, R * (0.18 + d * 2), R * w, R * 0.18); c.stroke(); };
  const heartAt = (x, y, r, col) => {
    c.fillStyle = col; c.beginPath(); c.moveTo(x, y + r * 0.9);
    c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.6, y - r * 1.3, x, y - r * 0.45);
    c.bezierCurveTo(x + r * 0.6, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill();
  };
  const starAt = (x, y, r, col) => {
    c.fillStyle = col; c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; i ? c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.fill();
  };
  const openMouth = (w, h, tongue = true) => {
    c.save();
    c.beginPath(); c.moveTo(-w, R * 0.12); c.quadraticCurveTo(0, R * 0.12 + h * 2.1, w, R * 0.12); c.closePath();
    c.fillStyle = "#5a1622"; c.fill();
    c.clip();
    if (tongue) { c.fillStyle = "#ff6f8f"; c.beginPath(); c.ellipse(0, R * 0.12 + h * 1.25, w * 0.55, h * 0.55, 0, 0, TAU); c.fill(); }
    c.fillStyle = "#fff"; c.fillRect(-w, R * 0.1, w * 2, h * 0.32);
    c.restore();
  };
  const pulse = 1 + 0.12 * Math.max(0, Math.sin(t * 6));
  switch (mood) {
    case "love": for (const sx of [-1, 1]) heartAt(sx * ex, ey + er * 0.2, er * 1.6 * pulse, "#e8003d"); smile(0.24, 0.13); cheeks(0.4); break;
    case "laugh": happyEyes(); openMouth(R * 0.3, R * 0.14); cheeks(0.5);
      c.fillStyle = "#7fd3ff"; for (const sx of [-1, 1]) { const d = (t * 1.6 + (sx > 0 ? 0.5 : 0)) % 1; c.globalAlpha = 1 - d; c.beginPath(); c.ellipse(sx * (ex + er * 1.6), ey + er + d * R * 0.35, er * 0.45, er * 0.7, 0, 0, TAU); c.fill(); }
      c.globalAlpha = 1; break;
    case "wink": c.fillStyle = ink; c.beginPath(); c.ellipse(-ex, ey, er, er * 1.25, 0, 0, TAU); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.arc(-ex - er * 0.35, ey - er * 0.45, er * 0.38, 0, TAU); c.fill();
      c.beginPath(); c.arc(ex, ey + er * 0.4, er * 1.05, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); smile(0.26, 0.14); cheeks(0.45);
      c.beginPath(); c.fillStyle = "#ff6f8f"; c.ellipse(R * 0.12, R * 0.33, R * 0.08, R * 0.06, 0.3, 0, TAU); c.fill(); break;
    case "kiss": happyEyes(); c.beginPath(); c.moveTo(-R * 0.02, R * 0.12); c.quadraticCurveTo(R * 0.13, R * 0.18, R * 0.02, R * 0.24); c.quadraticCurveTo(R * 0.15, R * 0.3, R * 0.0, R * 0.36); c.stroke();
      cheeks(0.55); { const d = (t * 0.8) % 1; c.globalAlpha = 1 - d; heartAt(R * (0.45 + d * 0.3), R * (0.1 - d * 0.6), R * 0.1, "#e8003d"); c.globalAlpha = 1; } break;
    case "blush": dotEyes(0.9); c.beginPath(); c.moveTo(-R * 0.13, R * 0.24); c.quadraticCurveTo(-R * 0.06, R * 0.3, 0, R * 0.24); c.quadraticCurveTo(R * 0.06, R * 0.3, R * 0.13, R * 0.24); c.stroke(); cheeks(0.85);
      c.strokeStyle = "rgba(200,30,70,.6)"; c.lineWidth = R * 0.025; for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(sx * R * (0.42 + i * 0.07), R * 0.07); c.lineTo(sx * R * (0.4 + i * 0.07), R * 0.17); c.stroke(); } break;
    case "cool": { c.fillStyle = "#14141c"; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * ex, ey, er * 2.3, er * 1.6, 0, 0, TAU); c.fill(); } c.fillRect(-ex, ey - er * 1.3, ex * 2, er * 0.5);
      c.fillStyle = "rgba(255,255,255,.55)"; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * ex - er * 0.8, ey - er * 0.6, er * 0.5, er * 0.25, -0.4, 0, TAU); c.fill(); }
      c.strokeStyle = ink; c.beginPath(); c.moveTo(-R * 0.18, R * 0.25); c.quadraticCurveTo(R * 0.1, R * 0.36, R * 0.28, R * 0.2); c.stroke(); break; }
    case "starry": for (const sx of [-1, 1]) starAt(sx * ex, ey, er * 1.7 * pulse, "#ffd23f"); c.strokeStyle = ink; openMouth(R * 0.22, R * 0.11); cheeks(0.4); break;
    case "wow": dotEyes(1.25); c.fillStyle = "#5a1622"; c.beginPath(); c.ellipse(0, R * 0.3, R * 0.11, R * 0.14, 0, 0, TAU); c.fill(); cheeks(0.3); break;
    case "cry": for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * ex, ey + er * 1.4, er * 1.05, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
      c.beginPath(); c.moveTo(-R * 0.22, R * 0.34); c.quadraticCurveTo(0, R * 0.16, R * 0.22, R * 0.34); c.stroke();
      { const tg = c.createLinearGradient(0, ey, 0, R * 0.8); tg.addColorStop(0, "rgba(120,210,255,.95)"); tg.addColorStop(1, "rgba(120,210,255,.3)"); c.fillStyle = tg;
        for (const sx of [-1, 1]) { const d = (t * 1.2 + (sx > 0 ? 0.4 : 0)) % 1; c.beginPath(); c.ellipse(sx * ex, ey + er * 1.4 + d * R * 0.45, er * 0.45, er * 0.75, 0, 0, TAU); c.fill(); } } break;
    case "sleepy": for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * ex, ey - er * 0.2, er * 1.05, Math.PI * 0.15, Math.PI * 0.85); c.stroke(); }
      c.fillStyle = "#5a1622"; c.beginPath(); c.ellipse(R * 0.04, R * 0.3, R * 0.07, R * 0.05, 0, 0, TAU); c.fill();
      c.fillStyle = "#ffffff"; c.strokeStyle = deep; c.lineWidth = R * 0.03; c.font = `900 ${R * 0.28}px Poppins, Arial, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
      for (let i = 0; i < 3; i++) { const d = (t * 0.6 + i / 3) % 1; c.globalAlpha = Math.sin(d * Math.PI); const sz = 0.5 + d; c.save(); c.translate(R * (0.55 + d * 0.4), -R * (0.5 + d * 0.5)); c.scale(sz, sz); c.strokeText("z", 0, 0); c.fillText("z", 0, 0); c.restore(); }
      c.globalAlpha = 1; break;
    case "angry": { c.lineWidth = R * 0.08; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * (ex + er * 1.4), ey - er * 2); c.lineTo(sx * (ex - er * 1.1), ey - er * 1.1); c.stroke(); }
      dotEyes(0.85); c.beginPath(); c.moveTo(-R * 0.2, R * 0.32); c.quadraticCurveTo(0, R * 0.18, R * 0.2, R * 0.32); c.stroke();
      c.fillStyle = "rgba(255,255,255,.75)"; for (let i = 0; i < 2; i++) { const d = (t * 1.5 + i * 0.5) % 1; c.globalAlpha = 1 - d; c.beginPath(); c.arc((i ? 1 : -1) * R * (0.75 + d * 0.2), -R * (0.65 + d * 0.3), R * (0.06 + d * 0.08), 0, TAU); c.fill(); }
      c.globalAlpha = 1; break; }
    case "cute": dotEyes(1.35); c.beginPath(); c.moveTo(-R * 0.1, R * 0.2); c.quadraticCurveTo(-R * 0.05, R * 0.27, 0, R * 0.2); c.quadraticCurveTo(R * 0.05, R * 0.27, R * 0.1, R * 0.2); c.stroke(); cheeks(0.7); break;
    case "sad": dotEyes(1); c.beginPath(); c.moveTo(-R * 0.2, R * 0.32); c.quadraticCurveTo(0, R * 0.2, R * 0.2, R * 0.32); c.stroke();
      c.fillStyle = "rgba(120,210,255,.9)"; c.beginPath(); c.ellipse(ex + er * 0.5, ey + er * 2 + ((t * 0.7) % 1) * R * 0.3, er * 0.4, er * 0.65, 0, 0, TAU); c.fill(); break;
    default: dotEyes(1); smile(); cheeks(0.45);
  }
  c.restore();
}

// ---------- scene effects around emoji (animated "GIF" elements) ----------

export const SCENE_FX = [["none", "None"], ["halo", "Halo"], ["lights", "Twinkle lights"], ["hearts", "Floating hearts"], ["sparkle", "Sparkles"], ["confetti", "Confetti"], ["tears", "Tears"], ["steam", "Steam"],
  ["zzz", "Zzz"], ["rain", "Rain"], ["snow", "Snow"], ["rays", "Sun rays"], ["lightning", "Lightning"], ["bubbles", "Bubbles"], ["speed", "Speed lines"],
  ["notes", "Music notes"], ["dust", "Dust puffs"], ["shine", "Shine"], ["fizz", "Fizz"], ["petals", "Petals"], ["flame", "Flame"], ["anger", "Anger puffs"]];

/** Effects drawn behind the emoji (glow and rays) and in front (particles). R = half the sticker size. */
export function sceneBack(c, s, R, t) {
  const col = s.glow || null;
  if (col) {
    const pulse = 0.85 + 0.15 * Math.sin(t * 3);
    const g = c.createRadialGradient(0, 0, R * 0.1, 0, 0, R * 1.25 * pulse);
    g.addColorStop(0, col + "cc"); g.addColorStop(0.55, col + "55"); g.addColorStop(1, col + "00");
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, R * 1.25 * pulse, 0, TAU); c.fill();
  }
  const fx = s.scene;
  if (fx === "rays") {
    c.save(); c.rotate(t * 0.6);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      c.fillStyle = i % 2 ? "rgba(255,210,63,0.55)" : "rgba(255,140,0,0.45)";
      c.beginPath(); c.moveTo(Math.cos(a - 0.12) * R * 0.5, Math.sin(a - 0.12) * R * 0.5);
      c.lineTo(Math.cos(a) * R * (1.25 + 0.1 * Math.sin(t * 4 + i)), Math.sin(a) * R * (1.25 + 0.1 * Math.sin(t * 4 + i)));
      c.lineTo(Math.cos(a + 0.12) * R * 0.5, Math.sin(a + 0.12) * R * 0.5); c.fill();
    }
    c.restore();
  } else if (fx === "speed") {
    c.save(); c.lineCap = "round";
    for (let i = 0; i < 7; i++) {
      const y = (hash(i, 1) - 0.5) * R * 1.3, d = (t * 2.5 + hash(i, 2)) % 1, len = R * (0.4 + hash(i, 3) * 0.5);
      const x = R * 0.6 + d * R * 0.9;
      c.globalAlpha = 1 - d; c.strokeStyle = i % 2 ? "#ffffff" : (s.glow || "#7fd3ff"); c.lineWidth = R * 0.05;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + len, y); c.stroke();
    }
    c.restore();
  } else if (fx === "lightning" && (t % 1.6) < 0.18) {
    c.save(); c.fillStyle = "rgba(255,255,220,0.45)"; c.beginPath(); c.arc(0, 0, R * 1.3, 0, TAU); c.fill(); c.restore();
  } else if (fx === "flame") {
    c.save(); c.globalCompositeOperation = "lighter";
    for (let i = 0; i < 9; i++) {
      const d = (t * 1.8 + hash(i, 4)) % 1, x = (hash(i, 5) - 0.5) * R * 0.8 * (1 - d), y = R * 0.55 - d * R * 1.4;
      const g = c.createRadialGradient(x, y, 0, x, y, R * 0.35 * (1 - d * 0.6));
      g.addColorStop(0, `rgba(255,${Math.round(200 - d * 150)},40,${0.6 * (1 - d)})`); g.addColorStop(1, "rgba(255,60,0,0)");
      c.fillStyle = g; c.beginPath(); c.arc(x, y, R * 0.35, 0, TAU); c.fill();
    }
    c.restore();
  }
}

export function sceneFront(c, s, R, t) {
  const fx = s.scene;
  if (!fx || fx === "none") return;
  c.save();
  c.lineCap = "round"; c.lineJoin = "round";
  const parts = (n, period, fn) => { for (let i = 0; i < n; i++) { const d = (t / period + hash(i, 9)) % 1; fn(i, d); } };
  const heart = (x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.6, y - r * 1.3, x, y - r * 0.45); c.bezierCurveTo(x + r * 0.6, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); };
  const spark = (x, y, r, col) => { c.fillStyle = col; c.beginPath(); for (let j = 0; j < 8; j++) { const b = (j * Math.PI) / 4, rr = j % 2 ? r * 0.22 : r; j ? c.lineTo(x + Math.cos(b) * rr, y + Math.sin(b) * rr) : c.moveTo(x + Math.cos(b) * rr, y + Math.sin(b) * rr); } c.closePath(); c.fill(); };
  switch (fx) {
    case "hearts": parts(7, 2.2, (i, d) => { c.globalAlpha = Math.sin(d * Math.PI); heart((hash(i, 1) - 0.5) * R * 1.8 + Math.sin(d * 6 + i) * R * 0.1, R * 0.7 - d * R * 1.9, R * (0.08 + hash(i, 2) * 0.1), i % 3 ? "#ff3c6e" : "#ff9ccb"); }); break;
    case "sparkle": parts(9, 1.4, (i, d) => { c.globalAlpha = Math.sin(d * Math.PI); const a = hash(i, 3) * TAU, r = R * (0.75 + hash(i, 4) * 0.45); spark(Math.cos(a) * r, Math.sin(a) * r, R * 0.12 * Math.sin(d * Math.PI), i % 2 ? "#ffffff" : "#ffe14d"); }); break;
    case "confetti": parts(18, 2, (i, d) => {
      const x = (hash(i, 1) - 0.5) * R * 2.2 + Math.sin(d * 8 + i) * R * 0.1, y = -R * 1.1 + d * R * 2.3;
      c.globalAlpha = 1 - d * 0.6; c.fillStyle = ["#ff3c6e", "#ffd23f", "#3df2ff", "#9dff3d", "#b46bff"][i % 5];
      c.save(); c.translate(x, y); c.rotate(d * 10 + i); c.fillRect(-R * 0.05, -R * 0.025, R * 0.1, R * 0.05); c.restore(); }); break;
    case "tears": parts(4, 0.9, (i, d) => { c.globalAlpha = 1 - d; c.fillStyle = "#7fd3ff"; const sx = i % 2 ? 1 : -1; c.beginPath(); c.ellipse(sx * (R * 0.45 + d * R * 0.35), -R * 0.05 + d * d * R * 0.6, R * 0.06, R * 0.09, 0, 0, TAU); c.fill(); }); break;
    case "steam": parts(4, 2.4, (i, d) => {
      c.globalAlpha = 0.55 * Math.sin(d * Math.PI); c.strokeStyle = "#ffffff"; c.lineWidth = R * 0.07;
      const x0 = (i - 1.5) * R * 0.22; c.beginPath();
      for (let j = 0; j <= 10; j++) { const y = -R * 0.55 - j * R * 0.07 - d * R * 0.4, x = x0 + Math.sin(j * 0.8 + d * 6 + i) * R * 0.08; j ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke(); }); break;
    case "zzz": parts(3, 2.4, (i, d) => { c.globalAlpha = Math.sin(d * Math.PI); c.fillStyle = "#ffffff"; c.strokeStyle = "#3d5bff"; c.lineWidth = R * 0.04;
      c.font = `900 ${R * (0.25 + d * 0.25)}px Poppins, Arial, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
      const x = R * (0.55 + d * 0.45), y = -R * (0.45 + d * 0.65); c.strokeText("Z", x, y); c.fillText("Z", x, y); }); break;
    case "rain": parts(16, 0.7, (i, d) => { c.globalAlpha = 0.85; c.strokeStyle = "#7fd3ff"; c.lineWidth = R * 0.035; const x = (hash(i, 1) - 0.5) * R * 1.4, y = R * 0.15 + d * R * 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x - R * 0.04, y + R * 0.14); c.stroke(); }); break;
    case "snow": parts(16, 3, (i, d) => { c.globalAlpha = 0.9; c.fillStyle = "#ffffff"; c.beginPath(); c.arc((hash(i, 1) - 0.5) * R * 2 + Math.sin(d * 6 + i) * R * 0.1, -R * 1.1 + d * R * 2.2, R * (0.025 + hash(i, 2) * 0.04), 0, TAU); c.fill(); }); break;
    case "lightning": if ((t % 1.6) < 0.18) { c.strokeStyle = "#fff6a0"; c.lineWidth = R * 0.06; c.shadowColor = "#fff6a0"; c.shadowBlur = R * 0.2; c.beginPath(); c.moveTo(R * 0.1, R * 0.2); c.lineTo(-R * 0.1, R * 0.55); c.lineTo(R * 0.08, R * 0.55); c.lineTo(-R * 0.15, R * 1.0); c.stroke(); } break;
    case "bubbles": case "fizz": parts(fx === "fizz" ? 14 : 9, fx === "fizz" ? 1.2 : 2.4, (i, d) => {
      c.globalAlpha = 0.8 * Math.sin(d * Math.PI); c.strokeStyle = "#ffffff"; c.fillStyle = "rgba(255,255,255,0.25)"; c.lineWidth = R * 0.02;
      const r = R * (fx === "fizz" ? 0.02 + hash(i, 2) * 0.03 : 0.05 + hash(i, 2) * 0.08), x = (hash(i, 1) - 0.5) * R * (fx === "fizz" ? 0.7 : 1.6) + Math.sin(d * 7 + i) * R * 0.06, y = R * 0.3 - d * R * 1.5;
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.stroke(); }); break;
    case "notes": parts(5, 2.2, (i, d) => { c.globalAlpha = Math.sin(d * Math.PI); c.fillStyle = ["#ff3cac", "#3df2ff", "#ffd23f"][i % 3]; c.font = `${R * 0.38}px "Segoe UI Symbol", "Noto Sans Symbols 2", sans-serif`;
      c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(i % 2 ? "♪" : "♫", (i % 2 ? 1 : -1) * R * (0.6 + d * 0.3), R * 0.2 - d * R * 1.2); }); break;
    case "dust": parts(6, 1, (i, d) => { c.globalAlpha = 0.6 * (1 - d); c.fillStyle = "#e9e1d6"; const sx = i % 2 ? 1 : -1; c.beginPath(); c.arc(sx * (R * 0.35 + d * R * 0.6), R * 0.75 - d * R * 0.15, R * (0.06 + d * 0.12), 0, TAU); c.fill(); }); break;
    case "shine": { const d = (t * 0.6) % 1.6; if (d < 1) { c.globalAlpha = Math.sin(d * Math.PI) * 0.9; c.globalCompositeOperation = "lighter"; const x = -R + d * R * 2; const g = c.createLinearGradient(x - R * 0.3, 0, x + R * 0.3, 0); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, "rgba(255,255,255,0.8)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.beginPath(); c.arc(0, 0, R * 0.85, 0, TAU); c.fill(); }
      parts(3, 1.6, (i, d2) => { c.globalAlpha = Math.sin(d2 * Math.PI); spark((hash(i, 6) - 0.5) * R * 1.4, (hash(i, 7) - 0.5) * R * 1.4, R * 0.12, "#ffffff"); }); break; }
    case "petals": parts(10, 3, (i, d) => { c.globalAlpha = 0.9; c.fillStyle = i % 2 ? "#ffb7d5" : "#ff8fb8"; c.save(); c.translate((hash(i, 1) - 0.5) * R * 2.2 + Math.sin(d * 5 + i) * R * 0.2, -R * 1.1 + d * R * 2.2); c.rotate(d * 8 + i); c.beginPath(); c.ellipse(0, 0, R * 0.07, R * 0.04, 0, 0, TAU); c.fill(); c.restore(); }); break;
    case "halo": { // a golden halo floating above
      const bob = Math.sin(t * 2) * R * 0.05;
      c.save(); c.shadowColor = "#ffd23f"; c.shadowBlur = R * 0.25; c.strokeStyle = "#ffe066"; c.lineWidth = R * 0.07;
      c.beginPath(); c.ellipse(0, -R * 0.95 + bob, R * 0.42, R * 0.12, 0, 0, TAU); c.stroke(); c.restore();
      parts(3, 1.6, (i, d) => { c.globalAlpha = Math.sin(d * Math.PI); spark((i - 1) * R * 0.4, -R * (1.05 + d * 0.15), R * 0.07, "#fff6c9"); });
      break; }
    case "lights": { // a string of coloured bulbs that twinkle
      c.strokeStyle = "rgba(40,60,40,0.8)"; c.lineWidth = R * 0.025; c.beginPath(); c.arc(0, R * 0.1, R * 0.95, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (1.08 + (i / 8) * 0.84), x = Math.cos(a) * R * 0.95, y = R * 0.1 + Math.sin(a) * R * 0.95;
        const on = Math.sin(t * 4 + i * 1.7) > -0.2, col = ["#ff2d2d", "#ffd23f", "#39d353", "#3d8bff", "#ff71ce"][i % 5];
        c.save(); if (on) { c.shadowColor = col; c.shadowBlur = R * 0.2; } c.globalAlpha = on ? 1 : 0.35; c.fillStyle = col;
        c.beginPath(); c.ellipse(x, y + R * 0.05, R * 0.045, R * 0.07, 0, 0, TAU); c.fill(); c.restore();
      }
      break; }
    case "anger": parts(3, 1.2, (i, d) => { c.globalAlpha = 1 - d; c.fillStyle = "rgba(255,255,255,0.8)"; c.beginPath(); c.arc((i - 1) * R * 0.5, -R * (0.75 + d * 0.4), R * (0.08 + d * 0.12), 0, TAU); c.fill(); }); break;
    default: break;
  }
  c.restore();
}

// ---------- elegant words: writing, glitter and glow ----------

/** Metallic and soft fills: [light, main, dark, glow]. */
export const ELEGANT_PALETTES = {
  gold: ["#fff3c4", "#e6b84a", "#8a5a12", "#ffd36b"], rose: ["#ffe1d6", "#e79a8a", "#8a3f35", "#ffb4a3"], silver: ["#ffffff", "#c9ced6", "#5e6670", "#dfe8ff"],
  pearl: ["#ffffff", "#f5efe6", "#b9ad9a", "#ffffff"], pink: ["#ffe3f1", "#ff7ab6", "#a8125a", "#ff9ccb"], lilac: ["#f1e3ff", "#b98bff", "#5a2bb0", "#d2b8ff"],
  champagne: ["#fff8e7", "#f1d9a7", "#9c7a3c", "#ffe9b8"], emerald: ["#d6fff0", "#2fbf8a", "#0b5a3d", "#7fffd0"], ruby: ["#ffd6dc", "#e0284f", "#6b0019", "#ff6f8f"],
};
export const ELEGANT_FX = [["write", "Writing"], ["glitter", "Glitter"], ["glow", "Glow"]];
export const ELEGANT_FONTS = { vibes: ["'Great Vibes', 'Dancing Script', cursive", 400], dancing: ["'Dancing Script', cursive", 700], playfair: ["'Playfair Display', Georgia, serif", "italic 700"] };

let layer = null;
/** Draws the elegant words centred on the origin. z = { tw, th, fs, lines }. */
export function drawElegant(c, s, z, k, t) {
  const fs = z.fs * k, [light, main, dark, glowCol] = ELEGANT_PALETTES[s.palette] || ELEGANT_PALETTES.gold;
  const [font, weight] = ELEGANT_FONTS[s.font] || ELEGANT_FONTS.vibes;
  const tw = z.tw * k, th = z.th * k, pad = fs * 0.6;
  const LW = Math.ceil(tw + pad * 2), LH = Math.ceil(th + pad * 2);
  if (!layer || layer.width < LW || layer.height < LH) layer = new OffscreenCanvas(Math.max(LW, layer?.width || 0), Math.max(LH, layer?.height || 0));
  const L = layer.getContext("2d");
  L.setTransform(1, 0, 0, 1, 0, 0); L.globalAlpha = 1; L.globalCompositeOperation = "source-over"; L.shadowColor = "transparent";
  L.clearRect(0, 0, layer.width, layer.height);
  L.translate(LW / 2, LH / 2);
  L.font = `${weight} ${fs}px ${font}`; L.textAlign = "center"; L.textBaseline = "middle";
  const lines = z.lines || [s.text];
  const sp = s.speed ?? 1, fx = s.effect || "write";
  const g = L.createLinearGradient(0, -th / 2, 0, th / 2);
  g.addColorStop(0, light); g.addColorStop(0.45, main); g.addColorStop(0.55, dark); g.addColorStop(0.7, main); g.addColorStop(1, light);
  const each = (fn) => lines.forEach((l, i) => fn(l, (i - (lines.length - 1) / 2) * fs * 1.15));
  // fine darker edge, then the metallic fill
  L.lineJoin = "round"; L.lineWidth = Math.max(1, fs * 0.035); L.strokeStyle = dark;
  each((l, y) => L.strokeText(l, 0, y));
  L.fillStyle = g; each((l, y) => L.fillText(l, 0, y));
  // a light sweep across the letters
  const sweep = ((t * sp * 0.45) % 1.8) - 0.4;
  if (sweep > -0.3 && sweep < 1.3) {
    L.globalCompositeOperation = "source-atop";
    const x = -tw / 2 - pad + sweep * (tw + pad * 2);
    const sg = L.createLinearGradient(x - fs, -th, x + fs, th);
    sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(0.5, "rgba(255,255,255,0.85)"); sg.addColorStop(1, "rgba(255,255,255,0)");
    L.fillStyle = sg; L.fillRect(-LW / 2, -LH / 2, LW, LH);
    L.globalCompositeOperation = "source-over";
  }
  // Writing: the words appear left to right like a pen stroke, with a bright nib.
  let reveal = 1;
  if (fx === "write") {
    const wd = Math.max(0.4, (s.writeDur ?? 1.8) / sp);
    reveal = clamp01((t - 0.15) / wd);
    reveal = reveal < 1 ? 1 - Math.pow(1 - reveal, 1.6) : 1;
    if (reveal < 1) {
      L.globalCompositeOperation = "destination-in";
      const edge = -tw / 2 - fs * 0.2 + reveal * (tw + fs * 0.4);
      const mg = L.createLinearGradient(edge - fs * 0.5, 0, edge + fs * 0.05, 0);
      mg.addColorStop(0, "rgba(0,0,0,1)"); mg.addColorStop(1, "rgba(0,0,0,0)");
      L.fillStyle = mg; L.fillRect(-LW / 2, -LH / 2, LW, LH);
      L.globalCompositeOperation = "source-over";
    }
  }
  // the finished layer onto the picture, with its glow
  c.save();
  const pulse = fx === "glow" ? 0.6 + 0.4 * Math.sin(t * sp * 2.6) : 0.35;
  c.shadowColor = glowCol; c.shadowBlur = fs * (fx === "glow" ? 0.35 + 0.45 * pulse : 0.18);
  c.drawImage(layer, 0, 0, LW, LH, -LW / 2, -LH / 2, LW, LH);
  if (fx === "glow") { c.globalAlpha *= 0.5 * pulse; c.globalCompositeOperation = "lighter"; c.drawImage(layer, 0, 0, LW, LH, -LW / 2, -LH / 2, LW, LH); }
  c.restore();
  // nib sparkle while writing
  if (fx === "write" && reveal < 1 && t > 0.15) {
    const x = -tw / 2 + reveal * tw, y = Math.sin(t * sp * 18) * th * 0.18;
    sparkle(c, x, y, fs * 0.22, "#ffffff", glowCol);
  }
  // Glitter: twinkling sparkles over the letters.
  if (fx === "glitter" || (fx === "write" && reveal >= 1)) {
    const n = fx === "glitter" ? 16 : 5;
    for (let i = 0; i < n; i++) {
      const tw2 = Math.max(0, Math.sin(t * sp * (2 + hash(i, 1) * 3) + hash(i, 2) * 6));
      if (tw2 < 0.05) continue;
      const x = (hash(i, 3) - 0.5) * tw, y = (hash(i, 4) - 0.5) * th * 0.9;
      c.globalAlpha = tw2;
      sparkle(c, x, y, fs * (0.06 + 0.12 * hash(i, 5)) * tw2, "#ffffff", glowCol);
    }
    c.globalAlpha = 1;
  }
}

function sparkle(c, x, y, r, col, glow) {
  c.save();
  c.shadowColor = glow; c.shadowBlur = r * 1.5;
  c.fillStyle = col; c.beginPath();
  for (let j = 0; j < 8; j++) { const b = (j * Math.PI) / 4, rr = j % 2 ? r * 0.18 : r; j ? c.lineTo(x + Math.cos(b) * rr, y + Math.sin(b) * rr) : c.moveTo(x + Math.cos(b) * rr, y + Math.sin(b) * rr); }
  c.closePath(); c.fill();
  c.restore();
}

/** Measures elegant words (font size from the sticker size). */
export function elegantSize(s, mctx) {
  const base = s.size ?? 300, fs = base * 0.5;
  const [font, weight] = ELEGANT_FONTS[s.font] || ELEGANT_FONTS.vibes;
  mctx.font = `${weight} ${fs}px ${font}`;
  const lines = (s.text || " ").split("\n");
  const tw = Math.max(...lines.map((l) => mctx.measureText(l).width)) * 1.06, th = fs * 1.15 * lines.length;
  return { w: tw + fs * 0.5, h: th + fs * 0.35, fs, tw, th, lines };
}
