// Chibi characters drawn from code: singing animals and people (their mouths follow the project's music),
// tiny animals that peek in from the edge of the screen, and pets that walk across it doing pet things.
// Everything comes from the time, so scrubbing, preview and export all match.

const TAU = Math.PI * 2;
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Characters: colours and features. */
export const CHARACTERS = {
  cat: { name: "Cat", fur: "#ffb36b", ear: "#ff9ccb", muzzle: "#fff1e0", ears: "pointy", stripes: "#e08a3a", whiskers: true },
  dog: { name: "Puppy", fur: "#e3b27a", ear: "#8a5a2b", muzzle: "#fff1e0", ears: "floppy", nose: true },
  bunny: { name: "Bunny", fur: "#ffffff", ear: "#ffb7d5", muzzle: "#ffffff", ears: "long" },
  bear: { name: "Bear", fur: "#a0703f", ear: "#7a5028", muzzle: "#e9c9a0", ears: "round", nose: true },
  panda: { name: "Panda", fur: "#ffffff", ear: "#222222", muzzle: "#ffffff", ears: "round", patches: true, nose: true },
  chick: { name: "Chick", fur: "#ffd23f", ear: "#ffd23f", muzzle: "#ffd23f", ears: "tuft", beak: true },
  fox: { name: "Fox", fur: "#ff8a3d", ear: "#2b1a10", muzzle: "#ffffff", ears: "pointy", nose: true },
  hamster: { name: "Hamster", fur: "#f2c27b", ear: "#ff9ccb", muzzle: "#fff6ea", ears: "small", nose: true },
  frog: { name: "Frog", fur: "#7ed957", ear: "#7ed957", muzzle: "#c8f5b0", ears: "frog" },
  girl: { name: "Girl", fur: "#ffdcc5", hair: "#3b2316", human: "girl" },
  boy: { name: "Boy", fur: "#f7cfae", hair: "#2b1a10", human: "boy" },
};

function ellipse(c, x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, TAU); }

/**
 * A big chibi head centred on the origin. o: { mouth 0–1 (open), blink, look -1–1 (eyes left/right), happy (closed smiling eyes) }.
 */
export function drawHead(c, who, R, o = {}) {
  const ch = CHARACTERS[who] || CHARACTERS.cat;
  const outline = "rgba(60,30,30,0.85)", lw = Math.max(1, R * 0.045);
  c.save();
  c.lineJoin = "round"; c.lineCap = "round"; c.lineWidth = lw; c.strokeStyle = outline;
  // ears behind the head
  const ears = ch.ears;
  if (ears === "pointy") for (const sx of [-1, 1]) {
    c.beginPath(); c.moveTo(sx * R * 0.85, -R * 0.35); c.lineTo(sx * R * 0.72, -R * 1.18); c.lineTo(sx * R * 0.2, -R * 0.82); c.closePath();
    c.fillStyle = ch.fur; c.fill(); c.stroke();
    c.beginPath(); c.moveTo(sx * R * 0.72, -R * 0.5); c.lineTo(sx * R * 0.66, -R * 0.98); c.lineTo(sx * R * 0.35, -R * 0.78); c.closePath(); c.fillStyle = ch.ear; c.fill();
  } else if (ears === "long") for (const sx of [-1, 1]) {
    ellipse(c, sx * R * 0.38, -R * 1.25, R * 0.24, R * 0.62, sx * 0.15); c.fillStyle = ch.fur; c.fill(); c.stroke();
    ellipse(c, sx * R * 0.38, -R * 1.22, R * 0.12, R * 0.45, sx * 0.15); c.fillStyle = ch.ear; c.fill();
  } else if (ears === "round" || ears === "small") for (const sx of [-1, 1]) {
    const er = ears === "small" ? R * 0.22 : R * 0.3;
    ellipse(c, sx * R * 0.68, -R * 0.7, er, er); c.fillStyle = ch.patches ? "#222" : ch.fur; c.fill(); c.stroke();
    ellipse(c, sx * R * 0.68, -R * 0.7, er * 0.55, er * 0.55); c.fillStyle = ch.ear; c.fill();
  } else if (ears === "frog") for (const sx of [-1, 1]) {
    ellipse(c, sx * R * 0.48, -R * 0.78, R * 0.34, R * 0.32); c.fillStyle = ch.fur; c.fill(); c.stroke();
  }
  // hair at the back (girl's pigtails)
  if (ch.human === "girl") for (const sx of [-1, 1]) {
    ellipse(c, sx * R * 1.0, R * 0.05, R * 0.3, R * 0.48, sx * -0.3); c.fillStyle = ch.hair; c.fill(); c.stroke();
    c.fillStyle = "#ff3c8e"; ellipse(c, sx * R * 0.86, -R * 0.38, R * 0.13, R * 0.09); c.fill();
  }
  // head
  ellipse(c, 0, 0, R * 1.0, R * 0.92);
  c.fillStyle = ch.fur; c.fill(); c.stroke();
  if (ch.stripes) { c.strokeStyle = ch.stripes; c.lineWidth = R * 0.07; for (const dx of [-0.18, 0, 0.18]) { c.beginPath(); c.moveTo(dx * R, -R * 0.88); c.lineTo(dx * R * 0.8, -R * 0.62); c.stroke(); } c.strokeStyle = outline; c.lineWidth = lw; }
  if (who === "fox") { c.fillStyle = "#ffffff"; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * R * 0.98, R * 0.05); c.quadraticCurveTo(sx * R * 0.5, R * 0.95, 0, R * 0.92); c.quadraticCurveTo(sx * R * 0.35, R * 0.35, sx * R * 0.98, R * 0.05); c.fill(); } }
  if (ch.human) { // hair on top
    c.fillStyle = ch.hair;
    c.beginPath(); c.moveTo(-R * 1.0, R * 0.05); c.bezierCurveTo(-R * 1.15, -R * 1.25, R * 1.15, -R * 1.25, R * 1.0, R * 0.05);
    if (ch.human === "boy") { c.lineTo(R * 0.75, -R * 0.3); c.lineTo(R * 0.45, -R * 0.15); c.lineTo(R * 0.2, -R * 0.42); c.lineTo(-R * 0.1, -R * 0.2); c.lineTo(-R * 0.4, -R * 0.45); c.lineTo(-R * 0.7, -R * 0.2); }
    else { c.quadraticCurveTo(R * 0.55, -R * 0.55, 0, -R * 0.35); c.quadraticCurveTo(-R * 0.55, -R * 0.55, -R * 1.0, R * 0.05); }
    c.closePath(); c.fill(); c.stroke();
    c.fillStyle = "rgba(255,255,255,0.25)"; ellipse(c, -R * 0.35, -R * 0.75, R * 0.25, R * 0.08, -0.3); c.fill();
  }
  if (ears === "tuft") { c.fillStyle = ch.fur; c.beginPath(); c.moveTo(-R * 0.1, -R * 0.88); c.quadraticCurveTo(0, -R * 1.35, R * 0.15, -R * 0.88); c.quadraticCurveTo(R * 0.25, -R * 1.2, R * 0.3, -R * 0.82); c.fill(); }
  if (ears === "floppy") for (const sx of [-1, 1]) { ellipse(c, sx * R * 0.92, -R * 0.15, R * 0.24, R * 0.5, sx * -0.35); c.fillStyle = ch.ear; c.fill(); c.stroke(); }
  if (ch.patches) { c.fillStyle = "#222"; for (const sx of [-1, 1]) { ellipse(c, sx * R * 0.38, -R * 0.02, R * 0.25, R * 0.32, sx * 0.5); c.fill(); } }
  // eyes
  const ey = ch.ears === "frog" ? -R * 0.78 : -R * 0.05, ex = ch.ears === "frog" ? R * 0.48 : R * 0.38, er = R * 0.15, look = (o.look || 0) * er * 0.4;
  for (const sx of [-1, 1]) {
    if (o.blink || o.happy) {
      c.strokeStyle = "#2b1414"; c.lineWidth = R * 0.07;
      c.beginPath(); o.happy ? c.arc(sx * ex, ey + er * 0.5, er * 0.9, Math.PI * 1.15, Math.PI * 1.85) : (c.moveTo(sx * ex - er, ey), c.quadraticCurveTo(sx * ex, ey + er * 0.6, sx * ex + er, ey)); c.stroke();
      continue;
    }
    c.fillStyle = "#2b1414"; ellipse(c, sx * ex + look, ey, er, er * 1.2); c.fill();
    c.fillStyle = "#ffffff"; ellipse(c, sx * ex + look - er * 0.35, ey - er * 0.45, er * 0.42, er * 0.42); c.fill();
    ellipse(c, sx * ex + look + er * 0.35, ey + er * 0.4, er * 0.18, er * 0.18); c.fill();
  }
  // cheeks
  c.fillStyle = "rgba(255,90,130,0.38)";
  for (const sx of [-1, 1]) { ellipse(c, sx * R * 0.62, R * 0.25, R * 0.16, R * 0.1); c.fill(); }
  // muzzle, nose, beak
  const my = R * 0.3;
  if (ch.beak) {
    c.fillStyle = "#ff8a1f"; c.beginPath(); c.moveTo(-R * 0.14, R * 0.12); c.lineTo(R * 0.14, R * 0.12); c.lineTo(0, R * (0.3 + 0.2 * (o.mouth || 0))); c.closePath(); c.fill();
    if ((o.mouth || 0) > 0.05) { c.fillStyle = "#c2410c"; c.beginPath(); c.moveTo(-R * 0.12, R * 0.17); c.lineTo(R * 0.12, R * 0.17); c.lineTo(0, R * (0.22 + 0.12 * o.mouth)); c.fill(); }
  } else {
    if (!ch.human && ch.ears !== "frog") { c.fillStyle = ch.muzzle; ellipse(c, 0, my, R * 0.3, R * 0.2); c.fill(); }
    if (!ch.human) { c.fillStyle = ch.nose ? "#2b1414" : "#ff7aa5"; ellipse(c, 0, my - R * 0.1, R * 0.07, R * 0.05); c.fill(); }
    const m = clamp01(o.mouth || 0);
    if (m > 0.05) {
      c.fillStyle = "#7a1f2b"; ellipse(c, 0, my + R * 0.08 + m * R * 0.08, R * (0.09 + 0.05 * m), R * (0.05 + 0.15 * m)); c.fill();
      c.fillStyle = "#ff7a95"; ellipse(c, 0, my + R * 0.12 + m * R * 0.16, R * 0.06 * (0.6 + m), R * 0.04 * (0.6 + m)); c.fill();
    } else {
      c.strokeStyle = "#2b1414"; c.lineWidth = R * 0.045;
      c.beginPath(); c.moveTo(-R * 0.1, my + R * 0.04); c.quadraticCurveTo(-R * 0.05, my + R * 0.1, 0, my + R * 0.03); c.quadraticCurveTo(R * 0.05, my + R * 0.1, R * 0.1, my + R * 0.04); c.stroke();
    }
  }
  if (ch.whiskers) { c.strokeStyle = "rgba(60,30,30,0.5)"; c.lineWidth = R * 0.025; for (const sx of [-1, 1]) for (const dy of [-0.03, 0.06]) { c.beginPath(); c.moveTo(sx * R * 0.35, my + dy * R); c.lineTo(sx * R * 0.75, my + dy * R * 2 - R * 0.03); c.stroke(); } }
  c.restore();
}

// ---------- singers ----------

/**
 * A chibi singing into a microphone. `level` (0–1) is how loud the music is now and `beat` a bass hit: the mouth
 * opens with the sound and the body bobs on the beat. Box: about 2.2R wide, 3.4R tall, centred.
 */
export function drawSinger(c, s, R, t, level, beat) {
  const who = s.who || "cat", ch = CHARACTERS[who] || CHARACTERS.cat;
  const bob = Math.sin(t * Math.PI * 2 * 1.0) * R * 0.04 + beat * R * 0.06;
  const tilt = Math.sin(t * Math.PI * 1.0) * 0.08 + (level - 0.3) * 0.05;
  const mouth = clamp01(level * 1.7 - 0.08);
  const shirt = s.shirt || "#ff3c8e";
  c.save();
  c.lineJoin = "round"; c.lineCap = "round";
  const outline = "rgba(60,30,30,0.85)", lw = Math.max(1, R * 0.045);
  // music notes drifting up
  for (let i = 0; i < 3; i++) {
    const d = (t * 0.5 + i / 3) % 1;
    c.globalAlpha = Math.sin(d * Math.PI) * 0.9; c.fillStyle = ["#ff3cac", "#3df2ff", "#ffd23f"][i];
    c.font = `${R * 0.42}px "Segoe UI Symbol", "Noto Sans Symbols 2", sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(i % 2 ? "♪" : "♫", (i % 2 ? 1 : -1) * R * (1.0 + d * 0.25), -R * (0.4 + d * 1.1));
  }
  c.globalAlpha = 1;
  c.translate(0, bob);
  // feet and body
  c.lineWidth = lw; c.strokeStyle = outline;
  c.fillStyle = ch.human ? "#3b3b4f" : ch.fur;
  for (const sx of [-1, 1]) { ellipse(c, sx * R * 0.28, R * 1.62, R * 0.22, R * 0.13); c.fill(); c.stroke(); }
  c.fillStyle = shirt;
  c.beginPath(); c.moveTo(-R * 0.55, R * 0.7); c.quadraticCurveTo(-R * 0.62, R * 1.6, 0, R * 1.58); c.quadraticCurveTo(R * 0.62, R * 1.6, R * 0.55, R * 0.7); c.quadraticCurveTo(0, R * 0.55, -R * 0.55, R * 0.7); c.fill(); c.stroke();
  // waving arm
  const wave = Math.sin(t * Math.PI * 2) * 0.35;
  c.save(); c.translate(R * 0.45, R * 0.85); c.rotate(-0.9 + wave);
  ellipse(c, R * 0.3, 0, R * 0.32, R * 0.13); c.fillStyle = shirt; c.fill(); c.stroke();
  ellipse(c, R * 0.62, 0, R * 0.13, R * 0.13); c.fillStyle = ch.fur; c.fill(); c.stroke();
  c.restore();
  // head
  c.save(); c.translate(0, -R * 0.2); c.rotate(tilt);
  drawHead(c, who, R, { mouth, blink: (t % 3.1) > 2.95, happy: s.happy && mouth < 0.2 });
  c.restore();
  // microphone up to the mouth, in the other hand
  c.save(); c.translate(-R * 0.42, R * 0.4);
  c.rotate(0.55);
  c.fillStyle = "#2b2d36"; c.beginPath(); c.moveTo(-R * 0.05, 0); c.lineTo(R * 0.05, 0); c.lineTo(R * 0.035, R * 0.55); c.lineTo(-R * 0.035, R * 0.55); c.closePath(); c.fill();
  const mg = c.createRadialGradient(-R * 0.04, -R * 0.06, R * 0.02, 0, -R * 0.02, R * 0.14);
  mg.addColorStop(0, "#ffffff"); mg.addColorStop(1, "#8a919c");
  c.fillStyle = mg; c.beginPath(); c.arc(0, -R * 0.04, R * 0.13, 0, TAU); c.fill(); c.strokeStyle = outline; c.lineWidth = lw * 0.7; c.stroke();
  c.restore();
  // the hand holding it
  ellipse(c, -R * 0.32, R * 0.62, R * 0.13, R * 0.13); c.fillStyle = ch.fur; c.fill(); c.strokeStyle = outline; c.lineWidth = lw; c.stroke();
  c.restore();
}

// ---------- peekers ----------

/**
 * A tiny animal peeking up from an edge: it rises, looks around and blinks, wiggles, then ducks back down and waits.
 * The edge is the bottom of the box (y = h/2); everything below it is hidden.
 */
export function drawPeek(c, s, w, h, t) {
  const R = Math.min(w, h) * 0.34, period = 6, ph = (t % period) / period;
  let up;
  if (ph < 0.12) up = ease(ph / 0.12);
  else if (ph < 0.62) up = 1;
  else if (ph < 0.74) up = 1 - ease((ph - 0.62) / 0.12);
  else up = 0;
  const wiggle = ph > 0.5 && ph < 0.62 ? Math.sin((ph - 0.5) * 80) * 0.08 : 0;
  const look = ph > 0.15 && ph < 0.5 ? Math.sin((ph - 0.15) * 18) : 0;
  const blink = (ph > 0.3 && ph < 0.32) || (ph > 0.46 && ph < 0.48);
  const edge = h / 2;
  c.save();
  c.beginPath(); c.rect(-w, -h * 2, w * 2, h * 2 + edge); c.clip();
  const hy = edge + R * 1.1 - up * R * 1.95;
  c.save(); c.translate(0, hy); c.rotate(wiggle + look * 0.06);
  drawHead(c, s.who || "cat", R, { look, blink, mouth: ph > 0.5 && ph < 0.6 ? 0.25 : 0 });
  c.restore();
  // paws holding on to the edge
  if (up > 0.3) {
    const ch = CHARACTERS[s.who] || CHARACTERS.cat;
    const pa = clamp01((up - 0.3) / 0.4);
    c.fillStyle = ch.human ? ch.fur : ch.fur; c.strokeStyle = "rgba(60,30,30,0.85)"; c.lineWidth = Math.max(1, R * 0.045);
    for (const sx of [-1, 1]) {
      ellipse(c, sx * R * 0.55, edge - R * 0.1 * pa, R * 0.2, R * 0.14 * pa + 0.01); c.fill(); c.stroke();
      if (!ch.human) { c.beginPath(); for (const dx of [-0.06, 0.06]) { c.moveTo(sx * R * 0.55 + dx * R, edge - R * 0.18 * pa); c.lineTo(sx * R * 0.55 + dx * R, edge - R * 0.06 * pa); } c.stroke(); }
    }
  }
  c.restore();
}

// ---------- walking pets ----------

/** Pet species for walkers. */
export const PETS = { cat: { name: "Cat", fur: "#ffb36b", dark: "#e08a3a" }, kitten: { name: "Grey kitten", fur: "#b8bec9", dark: "#8a919c" },
  tux: { name: "Tuxedo cat", fur: "#2b2b33", dark: "#111116", belly: "#ffffff" }, dog: { name: "Puppy", fur: "#e3b27a", dark: "#8a5a2b" },
  corgi: { name: "Corgi", fur: "#f0a050", dark: "#ffffff" }, bunny: { name: "Bunny", fur: "#ffffff", dark: "#ffb7d5" }, chick: { name: "Chick", fur: "#ffd23f", dark: "#ff8a1f" } };

/** What each pet does, in order, again and again: [action, seconds, direction for walks]. */
const ROUTINES = {
  cat: [["walk", 5, 1], ["sit", 1.6], ["lick", 1.6], ["walk", 5, -1], ["stretch", 1.4], ["look", 1.4]],
  dog: [["walk", 4.2, 1], ["wag", 1.6], ["sniff", 1.4], ["walk", 4.2, -1], ["sit", 1.4], ["wag", 1.2]],
  bunny: [["hop", 4.5, 1], ["sniff", 1.6], ["look", 1.2], ["hop", 4.5, -1], ["sit", 1.4]],
  chick: [["walk", 5, 1], ["peck", 1.8], ["look", 1], ["walk", 5, -1], ["peck", 1.6]],
};
const routineOf = (sp) => ROUTINES[sp === "kitten" || sp === "tux" ? "cat" : sp === "corgi" ? "dog" : sp] || ROUTINES.cat;

/** Where the pet is and what it's doing at time t: { x (−1…1 of the walking range), dir, action, p (0–1 through it), tt (time in it) }. */
export function petState(s, t) {
  const r = routineOf(s.pet || "cat");
  const total = r.reduce((a, x) => a + x[1], 0);
  let tt = ((t % total) + total) % total, x = -1, dir = 1;
  for (const [act, d, dr] of r) {
    if (tt < d) {
      const p = tt / d;
      if (act === "walk" || act === "hop") { dir = dr; x = dr > 0 ? -1 + 2 * p : 1 - 2 * p; }
      return { x, dir, action: act, p, tt };
    }
    if (act === "walk" || act === "hop") { dir = dr; x = dr > 0 ? 1 : -1; }
    tt -= d;
  }
  return { x, dir, action: "sit", p: 0, tt: 0 };
}

/** Draws a pet in side view, facing right, standing on y = 0 (the caller flips it to walk left). R ≈ body height. */
export function drawPet(c, s, R, st, t) {
  const sp = s.pet || "cat", pet = PETS[sp] || PETS.cat;
  const kind = sp === "kitten" || sp === "tux" ? "cat" : sp === "corgi" ? "dog" : sp;
  const outline = "rgba(50,25,25,0.85)", lw = Math.max(1, R * 0.05);
  const a = st.action, tt = st.tt;
  const walking = a === "walk", hopping = a === "hop";
  const step = walking ? t * (kind === "chick" ? 9 : 7) : 0;
  let bodyY = -R * 0.85, lift = 0, bodyTilt = 0, headDy = 0, headRot = 0, tailSpeed = 2, sit = 0;
  if (walking) bodyY += Math.abs(Math.sin(step)) * -R * 0.06;
  if (hopping) { const hp = (tt * 2.2) % 1; lift = Math.sin(hp * Math.PI) * R * 0.7; bodyTilt = Math.cos(hp * Math.PI) * -0.15; }
  if (a === "sit") sit = ease(Math.min(1, tt * 3));
  if (a === "stretch") { const k = Math.sin(st.p * Math.PI); bodyTilt = 0.25 * k; headDy = R * 0.35 * k; }
  if (a === "sniff") { headDy = R * 0.4; headRot = 0.35 + Math.sin(t * 25) * 0.04; }
  if (a === "peck") { const k = Math.max(0, Math.sin(tt * 9)); headDy = R * 0.5 * k; headRot = 0.7 * k; }
  if (a === "lick") { headRot = -0.15 + Math.sin(tt * 10) * 0.08; }
  if (a === "look") headRot = -0.25 * Math.sin(Math.min(1, st.p * 2) * Math.PI);
  if (a === "wag") tailSpeed = 14;
  c.save(); c.lineJoin = "round"; c.lineCap = "round"; c.lineWidth = lw; c.strokeStyle = outline;
  // shadow on the ground
  c.fillStyle = "rgba(0,0,0,0.22)"; ellipse(c, 0, 0, R * (0.95 - lift / R * 0.3), R * 0.12); c.fill();
  c.translate(0, -lift);
  if (kind === "chick") {
    // two little legs
    c.strokeStyle = "#ff8a1f"; c.lineWidth = R * 0.08;
    for (const sx of [-1, 1]) { const sw = walking ? Math.sin(step + (sx > 0 ? Math.PI : 0)) * R * 0.15 : 0; c.beginPath(); c.moveTo(sx * R * 0.12, -R * 0.3); c.lineTo(sx * R * 0.12 + sw, 0); c.lineTo(sx * R * 0.12 + sw + R * 0.12, 0); c.stroke(); }
    c.strokeStyle = outline; c.lineWidth = lw;
    c.save(); c.translate(0, -R * 0.62); c.rotate(walking ? Math.sin(step) * 0.08 : 0);
    ellipse(c, 0, 0, R * 0.5, R * 0.42); c.fillStyle = pet.fur; c.fill(); c.stroke();
    ellipse(c, -R * 0.1, R * 0.02, R * 0.25, R * 0.16, 0.4); c.fillStyle = "#ffc21a"; c.fill(); // wing
    c.save(); c.translate(R * 0.32, -R * 0.38 + headDy * 0.6); c.rotate(headRot);
    ellipse(c, 0, 0, R * 0.32, R * 0.3); c.fillStyle = pet.fur; c.fill(); c.stroke();
    c.fillStyle = "#2b1414"; ellipse(c, R * 0.1, -R * 0.05, R * 0.05, R * 0.065); c.fill();
    c.fillStyle = "#fff"; ellipse(c, R * 0.085, -R * 0.075, R * 0.02, R * 0.02); c.fill();
    c.fillStyle = "#ff8a1f"; c.beginPath(); c.moveTo(R * 0.27, -R * 0.02); c.lineTo(R * 0.42, R * 0.03); c.lineTo(R * 0.27, R * 0.08); c.closePath(); c.fill();
    c.fillStyle = "rgba(255,90,130,0.4)"; ellipse(c, R * 0.05, R * 0.1, R * 0.07, R * 0.04); c.fill();
    c.restore(); c.restore(); c.restore();
    return;
  }
  // tail
  const tailBase = [-R * 0.62, bodyY - R * (kind === "cat" ? 0.05 : 0.15) + sit * R * 0.35];
  const sway = Math.sin(t * tailSpeed) * (a === "wag" ? 0.6 : 0.25);
  c.strokeStyle = kind === "bunny" ? outline : pet.fur;
  if (kind === "bunny") { ellipse(c, tailBase[0], tailBase[1], R * 0.16, R * 0.16); c.fillStyle = "#ffffff"; c.fill(); c.stroke(); }
  else {
    c.lineWidth = R * (kind === "cat" ? 0.13 : 0.15);
    c.beginPath(); c.moveTo(tailBase[0], tailBase[1]);
    if (kind === "cat") c.bezierCurveTo(tailBase[0] - R * 0.35, tailBase[1] - R * 0.1, tailBase[0] - R * 0.3 + sway * R * 0.4, tailBase[1] - R * 0.7, tailBase[0] - R * 0.1 + sway * R * 0.5, tailBase[1] - R * 0.85);
    else c.quadraticCurveTo(tailBase[0] - R * 0.3, tailBase[1] - R * 0.2 + sway * R * 0.3, tailBase[0] - R * 0.35 + sway * R * 0.2, tailBase[1] - R * 0.5);
    c.stroke();
    c.lineWidth = lw; c.strokeStyle = outline;
  }
  c.strokeStyle = outline; c.lineWidth = lw;
  // legs (back pair, then front pair), swinging while walking; folded when sitting
  const leg = (x, phase, front) => {
    const swing = walking ? Math.sin(step + phase) * 0.45 : hopping ? (front ? -0.5 : 0.6) * Math.sin(((tt * 2.2) % 1) * Math.PI) : 0;
    const len = R * (front ? 0.62 : 0.6) * (sit && !front ? 0.55 : 1);
    c.save(); c.translate(x, bodyY + R * 0.2 + (sit && !front ? R * 0.25 : 0)); c.rotate(swing);
    c.fillStyle = sp === "tux" && front ? "#ffffff" : sp === "corgi" ? "#ffffff" : pet.fur;
    c.beginPath(); c.roundRect ? c.roundRect(-R * 0.1, 0, R * 0.2, len, R * 0.1) : c.rect(-R * 0.1, 0, R * 0.2, len); c.fill(); c.stroke();
    c.restore();
  };
  leg(-R * 0.45, Math.PI, false); leg(R * 0.4, 0, true);
  // body
  c.save(); c.translate(0, bodyY); c.rotate(bodyTilt - sit * 0.38);
  ellipse(c, 0, 0, R * 0.78, R * (kind === "dog" && sp === "corgi" ? 0.36 : 0.42)); c.fillStyle = pet.fur; c.fill(); c.stroke();
  if (pet.belly) { ellipse(c, R * 0.2, R * 0.18, R * 0.4, R * 0.18); c.fillStyle = pet.belly; c.fill(); }
  if (sp === "cat") { c.strokeStyle = pet.dark; c.lineWidth = R * 0.08; for (const dx of [-0.35, -0.1, 0.15]) { c.beginPath(); c.moveTo(dx * R, -R * 0.4); c.lineTo(dx * R + R * 0.05, -R * 0.15); c.stroke(); } c.strokeStyle = outline; c.lineWidth = lw; }
  c.restore();
  leg(-R * 0.3, 0, false); leg(R * 0.55, Math.PI, true);
  // head
  const hx = R * 0.72, hy = bodyY - R * 0.42 + headDy - sit * R * 0.18;
  c.save(); c.translate(hx, hy); c.rotate(headRot);
  const hr = R * 0.42;
  if (kind === "cat") for (const ex of [-0.45, 0.25]) { c.beginPath(); c.moveTo(ex * hr - hr * 0.25, -hr * 0.6); c.lineTo(ex * hr, -hr * 1.35); c.lineTo(ex * hr + hr * 0.35, -hr * 0.7); c.closePath(); c.fillStyle = pet.fur; c.fill(); c.stroke(); }
  if (kind === "bunny") for (const ex of [-0.35, 0.05]) { ellipse(c, ex * hr, -hr * 1.35, hr * 0.22, hr * 0.7, -0.2); c.fillStyle = pet.fur; c.fill(); c.stroke(); ellipse(c, ex * hr, -hr * 1.32, hr * 0.1, hr * 0.5, -0.2); c.fillStyle = "#ffb7d5"; c.fill(); }
  if (sp === "corgi") for (const ex of [-0.4, 0.25]) { c.beginPath(); c.moveTo(ex * hr - hr * 0.3, -hr * 0.55); c.lineTo(ex * hr, -hr * 1.3); c.lineTo(ex * hr + hr * 0.35, -hr * 0.6); c.closePath(); c.fillStyle = pet.fur; c.fill(); c.stroke(); }
  ellipse(c, 0, 0, hr, hr * 0.9); c.fillStyle = pet.fur; c.fill(); c.stroke();
  // snout
  ellipse(c, hr * 0.75, hr * 0.2, hr * 0.42, hr * 0.3); c.fillStyle = kind === "dog" || pet.belly ? "#fff3e6" : pet.fur; c.fill(); c.stroke();
  c.fillStyle = "#2b1414"; ellipse(c, hr * 1.12, hr * 0.08, hr * 0.12, hr * 0.09); c.fill();
  if (kind === "dog" && sp !== "corgi") { ellipse(c, -hr * 0.25, -hr * 0.05, hr * 0.3, hr * 0.6, 0.35); c.fillStyle = pet.dark; c.fill(); c.stroke(); }
  // eye: closed while blinking or licking
  const blink = (t % 3.7) > 3.55 || a === "lick";
  if (blink) { c.strokeStyle = "#2b1414"; c.lineWidth = hr * 0.1; c.beginPath(); c.arc(hr * 0.3, -hr * 0.08, hr * 0.14, Math.PI * 0.1, Math.PI * 0.9); c.stroke(); }
  else { c.fillStyle = "#2b1414"; ellipse(c, hr * 0.3, -hr * 0.12, hr * 0.13, hr * 0.17); c.fill(); c.fillStyle = "#fff"; ellipse(c, hr * 0.26, -hr * 0.2, hr * 0.05, hr * 0.05); c.fill(); }
  c.fillStyle = "rgba(255,90,130,0.4)"; ellipse(c, hr * 0.35, hr * 0.3, hr * 0.14, hr * 0.08); c.fill();
  if (a === "lick") { c.fillStyle = "#ff7a95"; ellipse(c, hr * 1.0, hr * 0.42 + Math.sin(tt * 20) * hr * 0.05, hr * 0.1, hr * 0.14); c.fill(); }
  c.restore();
  c.restore();
}
