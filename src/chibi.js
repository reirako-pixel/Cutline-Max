// Characters drawn from code in a soft, semi-realistic anime style: singing animals and people (their mouths follow
// the project's music), tiny animals that peek in from the edge of the screen, and pets that walk across it doing
// pet things. Shading: light from the top left, a soft cel shadow at the bottom right, a thin rim light, anime eyes
// with layered irises and highlights. Everything comes from the time, so scrubbing, preview and export all match.

const TAU = Math.PI * 2;
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

// ---------- colour helpers ----------
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (a) => "#" + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mixc = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A.map((v, i) => v + (B[i] - v) * t)); };
const shade = (h, t) => mixc(h, "#1a0f14", t); // towards a warm dark (anime shadows aren't grey)
const tint = (h, t) => mixc(h, "#ffffff", t);
const rgba = (h, a) => { const [r, g, b] = rgb(h); return `rgba(${r},${g},${b},${a})`; };

/** Characters: colours and features. iris = eye colour. */
export const CHARACTERS = {
  cat: { name: "Cat", fur: "#ffb36b", ear: "#ffa5c8", muzzle: "#fff4e6", ears: "pointy", stripes: true, whiskers: true, iris: "#3fae6a", fluff: true },
  dog: { name: "Puppy", fur: "#e3b27a", ear: "#8a5a2b", muzzle: "#fff4e6", ears: "floppy", nose: true, iris: "#6b3d1e" },
  bunny: { name: "Bunny", fur: "#fbf8f6", ear: "#ffb7d5", muzzle: "#ffffff", ears: "long", iris: "#d9466f" },
  bear: { name: "Bear", fur: "#a8743f", ear: "#7a5028", muzzle: "#ecd0a8", ears: "round", nose: true, iris: "#4a2a12" },
  panda: { name: "Panda", fur: "#fbfbfb", ear: "#26262e", muzzle: "#ffffff", ears: "round", patches: true, nose: true, iris: "#3a3a4a" },
  chick: { name: "Chick", fur: "#ffd84a", ear: "#ffd84a", muzzle: "#ffd84a", ears: "tuft", beak: true, iris: "#3a2410" },
  fox: { name: "Fox", fur: "#ff8a3d", ear: "#2b1a10", muzzle: "#ffffff", ears: "pointy", nose: true, iris: "#e0a020", fluff: true },
  hamster: { name: "Hamster", fur: "#f2c27b", ear: "#ffa5c8", muzzle: "#fff8ee", ears: "small", nose: true, iris: "#3a2410", fluff: true },
  frog: { name: "Frog", fur: "#7ed957", ear: "#7ed957", muzzle: "#d4f7c0", ears: "frog", iris: "#2b5a14" },
  girl: { name: "Girl", fur: "#ffe0cc", hair: "#4a2a1c", human: "girl", iris: "#7a4bd6" },
  boy: { name: "Boy", fur: "#f9d3b5", hair: "#22222e", human: "boy", iris: "#2f7ad6" },
};

function ellipse(c, x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, TAU); }

/** Fills the current path with a soft 3D look: lit from the top left, darker towards the bottom right. */
function softFill(c, col, cx, cy, r, light = 0.35, dark = 0.22) {
  const g = c.createRadialGradient(cx - r * 0.35, cy - r * 0.45, r * 0.05, cx, cy, r * 1.25);
  g.addColorStop(0, tint(col, light)); g.addColorStop(0.55, col); g.addColorStop(1, shade(col, dark));
  c.fillStyle = g; c.fill();
}
/** A soft cel shadow inside the current clip (bottom right), and a thin rim light (top left). */
function celShade(c, col, cx, cy, rx, ry, k = 1) {
  c.save();
  c.fillStyle = rgba(shade(col, 0.45), 0.28 * k);
  ellipse(c, cx + rx * 0.45, cy + ry * 0.55, rx * 1.05, ry * 0.85, -0.4); c.fill();
  c.strokeStyle = "rgba(255,255,255,0.55)"; c.lineWidth = Math.max(1, rx * 0.06);
  c.beginPath(); c.ellipse(cx, cy, rx * 0.93, ry * 0.93, 0, Math.PI * 1.08, Math.PI * 1.45); c.stroke();
  c.restore();
}

/** Anime eye: white, layered iris, pupil, highlights, upper lid with lashes. */
function animeEye(c, x, y, w, h, iris, look, side, lashes, R) {
  const line = "#2a1418";
  c.save();
  // white of the eye with a shadow from the lid
  c.beginPath(); c.ellipse(x, y, w, h, 0, 0, TAU);
  const wg = c.createLinearGradient(0, y - h, 0, y + h); wg.addColorStop(0, "#d9dcef"); wg.addColorStop(0.35, "#ffffff"); wg.addColorStop(1, "#ffffff");
  c.fillStyle = wg; c.fill();
  c.clip();
  // iris: dark at the top, bright at the bottom, with a darker ring
  const ix = x + look * w * 0.35, iy = y + h * 0.1, ir = w * 0.92, irh = h * 0.86;
  const ig = c.createLinearGradient(0, iy - irh, 0, iy + irh);
  ig.addColorStop(0, shade(iris, 0.55)); ig.addColorStop(0.5, iris); ig.addColorStop(1, tint(iris, 0.55));
  c.fillStyle = ig; c.beginPath(); c.ellipse(ix, iy, ir, irh, 0, 0, TAU); c.fill();
  c.strokeStyle = shade(iris, 0.6); c.lineWidth = Math.max(1, w * 0.12); c.stroke();
  // pupil and the glow under it
  c.fillStyle = rgba(tint(iris, 0.7), 0.6); c.beginPath(); c.ellipse(ix, iy + irh * 0.45, ir * 0.6, irh * 0.28, 0, 0, TAU); c.fill();
  c.fillStyle = shade(iris, 0.8); c.beginPath(); c.ellipse(ix, iy - irh * 0.05, ir * 0.42, irh * 0.48, 0, 0, TAU); c.fill();
  // lid shadow over the top of the iris
  c.fillStyle = "rgba(40,20,30,0.25)"; c.beginPath(); c.ellipse(x, y - h * 0.95, w * 1.2, h * 0.45, 0, 0, TAU); c.fill();
  // highlights
  c.fillStyle = "#ffffff";
  c.beginPath(); c.ellipse(ix - ir * 0.38, iy - irh * 0.42, ir * 0.36, irh * 0.26, -0.4, 0, TAU); c.fill();
  c.beginPath(); c.arc(ix + ir * 0.4, iy + irh * 0.38, ir * 0.15, 0, TAU); c.fill();
  c.globalAlpha = 0.8; c.beginPath(); c.arc(ix + ir * 0.15, iy - irh * 0.55, ir * 0.08, 0, TAU); c.fill();
  c.restore();
  // upper lid: a thick line with a little wing at the outer corner; lower lid: a thin line
  c.save();
  c.strokeStyle = line; c.lineCap = "round"; c.lineJoin = "round";
  c.lineWidth = Math.max(1.2, h * 0.24);
  c.beginPath(); c.ellipse(x, y, w * 1.02, h * 1.0, 0, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
  c.lineWidth = Math.max(1, h * 0.14);
  c.beginPath(); c.moveTo(x + side * w * 0.95, y - h * 0.45); c.quadraticCurveTo(x + side * w * 1.3, y - h * 0.6, x + side * w * 1.45, y - h * 0.85); c.stroke();
  if (lashes) for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(x + side * w * (0.55 + i * 0.25), y - h * 0.95); c.lineTo(x + side * w * (0.75 + i * 0.32), y - h * (1.35 - i * 0.1)); c.stroke(); }
  c.strokeStyle = rgba(line, 0.5); c.lineWidth = Math.max(1, h * 0.07);
  c.beginPath(); c.ellipse(x, y, w * 0.95, h * 0.98, 0, Math.PI * 0.2, Math.PI * 0.6); c.stroke();
  c.restore();
}

/** A closed or happy (smiling) anime eye. */
function closedEye(c, x, y, w, h, happy, R) {
  c.save(); c.strokeStyle = "#2a1418"; c.lineCap = "round"; c.lineWidth = Math.max(1.2, h * 0.24);
  c.beginPath();
  if (happy) c.arc(x, y + h * 0.55, w * 1.0, Math.PI * 1.15, Math.PI * 1.85);
  else { c.moveTo(x - w * 1.05, y); c.quadraticCurveTo(x, y + h * 0.75, x + w * 1.05, y); }
  c.stroke();
  if (!happy) { c.lineWidth = Math.max(1, h * 0.12); c.beginPath(); c.moveTo(x + w * 0.9, y + h * 0.1); c.lineTo(x + w * 1.25, y + h * 0.35); c.stroke(); }
  c.restore();
}

/** Anime blush: a soft pink patch with three little strokes. */
function blush(c, x, y, R, a = 1) {
  c.save(); c.globalAlpha *= a;
  const g = c.createRadialGradient(x, y, 0, x, y, R * 0.2); g.addColorStop(0, "rgba(255,95,135,0.55)"); g.addColorStop(1, "rgba(255,95,135,0)");
  c.fillStyle = g; ellipse(c, x, y, R * 0.2, R * 0.12); c.fill();
  c.strokeStyle = "rgba(230,70,110,0.55)"; c.lineWidth = Math.max(1, R * 0.018); c.lineCap = "round";
  for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(x + i * R * 0.06 - R * 0.02, y + R * 0.03); c.lineTo(x + i * R * 0.06 + R * 0.02, y - R * 0.03); c.stroke(); }
  c.restore();
}

/** Glossy hair fill with an "angel ring" highlight band. */
function hairFill(c, col, R, top) {
  const g = c.createLinearGradient(0, top, 0, top + R * 1.6);
  g.addColorStop(0, tint(col, 0.12)); g.addColorStop(0.5, col); g.addColorStop(1, shade(col, 0.35));
  c.fillStyle = g; c.fill();
}

/**
 * A head centred on the origin. o: { mouth 0–1 (open), blink, look -1–1 (eyes left/right), happy (smiling closed eyes) }.
 */
export function drawHead(c, who, R, o = {}) {
  const ch = CHARACTERS[who] || CHARACTERS.cat;
  const fur = ch.fur, line = shade(fur, 0.62), lw = Math.max(1, R * 0.038);
  c.save();
  c.lineJoin = "round"; c.lineCap = "round"; c.lineWidth = lw; c.strokeStyle = line;
  const ears = ch.ears;
  // ---- ears (behind the head)
  if (ears === "pointy") for (const sx of [-1, 1]) {
    c.beginPath(); c.moveTo(sx * R * 0.88, -R * 0.3); c.quadraticCurveTo(sx * R * 0.92, -R * 0.95, sx * R * 0.74, -R * 1.22); c.quadraticCurveTo(sx * R * 0.45, -R * 1.0, sx * R * 0.18, -R * 0.84); c.closePath();
    softFill(c, fur, sx * R * 0.6, -R * 0.8, R * 0.45); c.stroke();
    c.beginPath(); c.moveTo(sx * R * 0.74, -R * 0.48); c.quadraticCurveTo(sx * R * 0.78, -R * 0.9, sx * R * 0.68, -R * 1.02); c.quadraticCurveTo(sx * R * 0.5, -R * 0.88, sx * R * 0.34, -R * 0.78); c.closePath();
    const eg = c.createLinearGradient(0, -R * 1.0, 0, -R * 0.5); eg.addColorStop(0, shade(ch.ear, 0.25)); eg.addColorStop(1, tint(ch.ear, 0.3)); c.fillStyle = eg; c.fill();
    if (who === "fox") { c.fillStyle = "#2b1a10"; c.beginPath(); c.moveTo(sx * R * 0.74, -R * 1.22); c.lineTo(sx * R * 0.84, -R * 1.0); c.lineTo(sx * R * 0.6, -R * 1.08); c.closePath(); c.fill(); }
    c.strokeStyle = rgba("#ffffff", 0.7); c.lineWidth = lw * 0.6; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(sx * R * (0.55 + i * 0.06), -R * 0.62); c.lineTo(sx * R * (0.6 + i * 0.05), -R * (0.8 + i * 0.03)); c.stroke(); }
    c.strokeStyle = line; c.lineWidth = lw;
  } else if (ears === "long") for (const sx of [-1, 1]) {
    ellipse(c, sx * R * 0.36, -R * 1.25, R * 0.24, R * 0.64, sx * 0.15); softFill(c, fur, sx * R * 0.36, -R * 1.25, R * 0.5, 0.2, 0.18); c.stroke();
    ellipse(c, sx * R * 0.36, -R * 1.2, R * 0.12, R * 0.48, sx * 0.15);
    const eg = c.createLinearGradient(0, -R * 1.65, 0, -R * 0.75); eg.addColorStop(0, tint(ch.ear, 0.2)); eg.addColorStop(0.6, ch.ear); eg.addColorStop(1, shade(ch.ear, 0.2)); c.fillStyle = eg; c.fill();
  } else if (ears === "round" || ears === "small") for (const sx of [-1, 1]) {
    const er = ears === "small" ? R * 0.22 : R * 0.3, earCol = ch.patches ? "#26262e" : fur;
    ellipse(c, sx * R * 0.7, -R * 0.68, er, er); softFill(c, earCol, sx * R * 0.7, -R * 0.68, er); c.stroke();
    ellipse(c, sx * R * 0.7, -R * 0.66, er * 0.55, er * 0.55); softFill(c, ch.patches ? "#3a3a46" : ch.ear, sx * R * 0.7, -R * 0.66, er * 0.55, 0.1, 0.35);
  } else if (ears === "frog") for (const sx of [-1, 1]) {
    ellipse(c, sx * R * 0.48, -R * 0.74, R * 0.36, R * 0.34); softFill(c, fur, sx * R * 0.48, -R * 0.74, R * 0.36); c.stroke();
  }
  // ---- girl's pigtails (behind)
  if (ch.human === "girl") for (const sx of [-1, 1]) {
    c.beginPath(); c.moveTo(sx * R * 0.8, -R * 0.45); c.bezierCurveTo(sx * R * 1.45, -R * 0.35, sx * R * 1.35, R * 0.55, sx * R * 1.05, R * 0.75);
    c.bezierCurveTo(sx * R * 1.0, R * 0.4, sx * R * 0.85, R * 0.0, sx * R * 0.8, -R * 0.45); hairFill(c, ch.hair, R, -R * 0.5); c.strokeStyle = shade(ch.hair, 0.5); c.stroke();
    c.strokeStyle = rgba(tint(ch.hair, 0.5), 0.6); c.lineWidth = lw * 0.6; c.beginPath(); c.moveTo(sx * R * 1.05, -R * 0.2); c.quadraticCurveTo(sx * R * 1.2, R * 0.2, sx * R * 1.05, R * 0.55); c.stroke();
    c.lineWidth = lw; ellipse(c, sx * R * 0.92, -R * 0.42, R * 0.1, R * 0.13); softFill(c, "#ff4f9a", sx * R * 0.92, -R * 0.42, R * 0.13); c.strokeStyle = line; c.stroke();
  }
  // ---- head shape
  c.strokeStyle = line;
  const headPath = () => {
    if (ch.human) {
      c.beginPath(); c.moveTo(0, -R * 0.9); c.bezierCurveTo(R * 0.62, -R * 0.92, R * 0.98, -R * 0.5, R * 0.95, -R * 0.02);
      c.bezierCurveTo(R * 0.92, R * 0.48, R * 0.45, R * 0.86, 0, R * 0.9); c.bezierCurveTo(-R * 0.45, R * 0.86, -R * 0.92, R * 0.48, -R * 0.95, -R * 0.02);
      c.bezierCurveTo(-R * 0.98, -R * 0.5, -R * 0.62, -R * 0.92, 0, -R * 0.9); c.closePath();
    } else ellipse(c, 0, 0, R * 1.0, R * 0.92);
  };
  headPath();
  c.save();
  softFill(c, fur, 0, 0, R, 0.3, 0.2);
  c.clip();
  // markings inside the head
  if (ch.stripes) { c.fillStyle = rgba(shade(fur, 0.35), 0.7); for (const dx of [-0.2, 0, 0.2]) { c.beginPath(); c.moveTo(dx * R - R * 0.05, -R * 0.95); c.quadraticCurveTo(dx * R, -R * 0.62, dx * R + R * 0.05, -R * 0.95); c.fill(); }
    for (const sx of [-1, 1]) for (const dy of [-0.05, 0.1]) { c.beginPath(); c.moveTo(sx * R * 1.0, dy * R - R * 0.04); c.quadraticCurveTo(sx * R * 0.78, dy * R, sx * R * 1.0, dy * R + R * 0.04); c.fill(); } }
  if (who === "fox") { c.fillStyle = "#ffffff"; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * R * 1.0, R * 0.0); c.quadraticCurveTo(sx * R * 0.5, R * 0.95, 0, R * 0.95); c.quadraticCurveTo(sx * R * 0.3, R * 0.3, sx * R * 1.0, R * 0.0); c.fill(); } }
  if (ch.patches) for (const sx of [-1, 1]) { ellipse(c, sx * R * 0.38, R * 0.0, R * 0.27, R * 0.34, sx * 0.55); softFill(c, "#26262e", sx * R * 0.38, 0, R * 0.3, 0.12, 0.1); }
  if (!ch.human && ch.ears !== "frog" && !ch.beak) { ellipse(c, 0, R * 0.32, R * 0.36, R * 0.24); softFill(c, ch.muzzle, 0, R * 0.32, R * 0.36, 0.2, 0.1); }
  celShade(c, fur, 0, 0, R, R * 0.92, ch.human ? 0.7 : 1);
  if (ch.human) { c.fillStyle = rgba(shade(fur, 0.35), 0.35); c.beginPath(); c.ellipse(0, -R * 0.42, R * 1.0, R * 0.32, 0, 0, Math.PI); c.fill(); } // shadow under the fringe
  c.restore();
  headPath(); c.strokeStyle = line; c.lineWidth = lw; c.stroke();
  // cheek fluff
  if (ch.fluff) for (const sx of [-1, 1]) {
    c.beginPath(); c.moveTo(sx * R * 0.9, R * 0.05);
    for (let i = 0; i < 3; i++) { c.lineTo(sx * R * (1.08 - i * 0.02), R * (0.15 + i * 0.13)); c.lineTo(sx * R * (0.92 - i * 0.04), R * (0.2 + i * 0.13)); }
    c.lineTo(sx * R * 0.7, R * 0.6); c.fillStyle = who === "fox" ? "#ffffff" : tint(fur, 0.15); c.fill(); c.stroke();
  }
  // ---- hair on top (people)
  if (ch.human) {
    const hc = ch.hair;
    c.beginPath();
    c.moveTo(-R * 1.0, R * 0.1); c.bezierCurveTo(-R * 1.12, -R * 1.2, R * 1.12, -R * 1.2, R * 1.0, R * 0.1);
    if (ch.human === "boy") { // spiky fringe
      const pts = [[0.92, -0.25], [0.72, -0.05], [0.6, -0.4], [0.38, -0.12], [0.22, -0.48], [0.0, -0.18], [-0.2, -0.5], [-0.38, -0.15], [-0.6, -0.42], [-0.75, -0.08], [-0.92, -0.3]];
      for (const [x, y] of pts) c.lineTo(x * R, y * R);
    } else { // soft bangs
      c.quadraticCurveTo(R * 0.85, -R * 0.3, R * 0.62, -R * 0.2); c.quadraticCurveTo(R * 0.5, -R * 0.45, R * 0.25, -R * 0.28);
      c.quadraticCurveTo(R * 0.1, -R * 0.5, -R * 0.12, -R * 0.3); c.quadraticCurveTo(-R * 0.35, -R * 0.48, -R * 0.55, -R * 0.22); c.quadraticCurveTo(-R * 0.85, -R * 0.32, -R * 1.0, R * 0.1);
    }
    c.closePath();
    hairFill(c, hc, R, -R * 1.1); c.strokeStyle = shade(hc, 0.5); c.stroke();
    // strands and the shiny ring
    c.save(); c.clip();
    c.strokeStyle = rgba(tint(hc, 0.55), 0.75); c.lineWidth = R * 0.05;
    c.beginPath(); c.ellipse(0, -R * 0.62, R * 0.72, R * 0.2, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
    c.strokeStyle = rgba(shade(hc, 0.5), 0.6); c.lineWidth = Math.max(1, R * 0.02);
    for (const x of [-0.6, -0.3, 0.05, 0.35, 0.65]) { c.beginPath(); c.moveTo(x * R * 0.6, -R * 0.95); c.quadraticCurveTo(x * R, -R * 0.6, x * R * 1.05, -R * 0.25); c.stroke(); }
    c.restore();
    c.strokeStyle = line;
  }
  if (ears === "tuft") { c.beginPath(); c.moveTo(-R * 0.12, -R * 0.88); c.quadraticCurveTo(-R * 0.05, -R * 1.4, R * 0.12, -R * 0.9); c.quadraticCurveTo(R * 0.25, -R * 1.25, R * 0.32, -R * 0.84); softFill(c, fur, 0, -R * 1.0, R * 0.3); c.stroke(); }
  if (ears === "floppy") for (const sx of [-1, 1]) {
    ellipse(c, sx * R * 0.92, -R * 0.12, R * 0.25, R * 0.54, sx * -0.35); softFill(c, ch.ear, sx * R * 0.92, -R * 0.12, R * 0.5, 0.25, 0.25); c.stroke();
    c.strokeStyle = rgba(tint(ch.ear, 0.5), 0.5); c.lineWidth = lw * 0.7; c.beginPath(); c.moveTo(sx * R * 0.85, -R * 0.45); c.quadraticCurveTo(sx * R * 0.98, -R * 0.1, sx * R * 0.95, R * 0.25); c.stroke(); c.strokeStyle = line; c.lineWidth = lw;
  }
  // ---- eyes
  const frog = ch.ears === "frog";
  const ey = frog ? -R * 0.76 : ch.human ? R * 0.06 : -R * 0.04, ex = frog ? R * 0.48 : ch.human ? R * 0.4 : R * 0.4;
  const ew = R * (ch.human ? 0.17 : 0.16), eh = R * (ch.human ? 0.22 : 0.2);
  const lashes = ch.human === "girl" || who === "cat" || who === "bunny";
  for (const sx of [-1, 1]) {
    if (o.blink || o.happy) closedEye(c, sx * ex, ey, ew, eh, o.happy, R);
    else animeEye(c, sx * ex, ey, ew, eh, ch.iris, o.look || 0, sx, lashes, R);
  }
  if (ch.human || who === "dog" || who === "bear") { // brows
    c.strokeStyle = ch.human ? shade(ch.hair, 0.2) : shade(fur, 0.45); c.lineWidth = Math.max(1, R * 0.035);
    for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * (ex - ew * 0.8), ey - eh * 1.75); c.quadraticCurveTo(sx * ex, ey - eh * 2.0, sx * (ex + ew * 0.9), ey - eh * 1.7); c.stroke(); }
  }
  // ---- cheeks
  for (const sx of [-1, 1]) blush(c, sx * R * 0.6, ch.human ? R * 0.36 : R * 0.26, R, ch.human ? 0.9 : 0.75);
  // ---- nose, mouth, beak
  const my = ch.human ? R * 0.5 : R * 0.3, m = clamp01(o.mouth || 0);
  if (ch.beak) {
    c.beginPath(); c.moveTo(-R * 0.15, R * 0.14); c.quadraticCurveTo(0, R * 0.08, R * 0.15, R * 0.14); c.lineTo(0, R * (0.32 + 0.16 * m)); c.closePath();
    softFill(c, "#ff9a2a", 0, R * 0.2, R * 0.16, 0.35, 0.2); c.strokeStyle = "#b5560c"; c.stroke();
    if (m > 0.05) { c.fillStyle = "#a0300c"; c.beginPath(); c.moveTo(-R * 0.12, R * 0.18); c.lineTo(R * 0.12, R * 0.18); c.lineTo(0, R * (0.22 + 0.14 * m)); c.fill(); }
    c.fillStyle = "rgba(255,255,255,0.7)"; ellipse(c, -R * 0.05, R * 0.14, R * 0.04, R * 0.02, -0.3); c.fill();
  } else {
    if (ch.human) { c.strokeStyle = rgba(shade(fur, 0.5), 0.6); c.lineWidth = Math.max(1, R * 0.025); c.beginPath(); c.moveTo(R * 0.02, R * 0.3); c.lineTo(-R * 0.02, R * 0.36); c.stroke(); }
    else if (ch.ears !== "frog") {
      c.beginPath(); c.moveTo(-R * 0.09, my - R * 0.13); c.quadraticCurveTo(0, my - R * 0.17, R * 0.09, my - R * 0.13); c.quadraticCurveTo(R * 0.06, my - R * 0.04, 0, my - R * 0.03); c.quadraticCurveTo(-R * 0.06, my - R * 0.04, -R * 0.09, my - R * 0.13);
      softFill(c, ch.nose ? "#3a2226" : "#ff8fb0", 0, my - R * 0.1, R * 0.1, 0.3, 0.2);
      c.fillStyle = "rgba(255,255,255,0.75)"; ellipse(c, -R * 0.03, my - R * 0.13, R * 0.025, R * 0.012); c.fill();
    }
    if (m > 0.05) {
      const mw = R * (0.1 + 0.05 * m), mh = R * (0.05 + 0.17 * m), mcy = my + R * 0.06 + mh * 0.55;
      c.beginPath(); c.moveTo(-mw, mcy - mh * 0.5); c.quadraticCurveTo(0, mcy - mh * 0.75, mw, mcy - mh * 0.5); c.quadraticCurveTo(mw * 0.9, mcy + mh * 0.8, 0, mcy + mh * 0.75); c.quadraticCurveTo(-mw * 0.9, mcy + mh * 0.8, -mw, mcy - mh * 0.5); c.closePath();
      const mg = c.createLinearGradient(0, mcy - mh, 0, mcy + mh); mg.addColorStop(0, "#4a0f1c"); mg.addColorStop(1, "#8a2236");
      c.fillStyle = mg; c.fill(); c.strokeStyle = shade(fur, 0.6); c.lineWidth = Math.max(1, R * 0.025); c.stroke();
      c.save(); c.clip();
      c.fillStyle = "#ffffff"; c.fillRect(-mw, mcy - mh * 0.75, mw * 2, mh * 0.28);
      const tg = c.createRadialGradient(0, mcy + mh * 0.55, 0, 0, mcy + mh * 0.55, mw); tg.addColorStop(0, "#ff8fa8"); tg.addColorStop(1, "#d84a6a");
      c.fillStyle = tg; ellipse(c, 0, mcy + mh * 0.6, mw * 0.75, mh * 0.45); c.fill();
      c.restore();
    } else {
      c.strokeStyle = shade(fur, 0.65); c.lineWidth = Math.max(1, R * 0.032);
      c.beginPath();
      if (!ch.human && (who === "cat" || who === "bunny" || who === "hamster")) { c.moveTo(-R * 0.11, my + R * 0.03); c.quadraticCurveTo(-R * 0.055, my + R * 0.1, 0, my + R * 0.02); c.quadraticCurveTo(R * 0.055, my + R * 0.1, R * 0.11, my + R * 0.03); }
      else { c.moveTo(-R * 0.08, my + R * 0.03); c.quadraticCurveTo(0, my + R * 0.09, R * 0.08, my + R * 0.03); }
      c.stroke();
    }
  }
  if (ch.whiskers) { c.strokeStyle = "rgba(255,255,255,0.85)"; c.lineWidth = Math.max(1, R * 0.018); for (const sx of [-1, 1]) for (const dy of [-0.02, 0.06]) { c.beginPath(); c.moveTo(sx * R * 0.4, my + dy * R - R * 0.05); c.quadraticCurveTo(sx * R * 0.6, my + dy * R - R * 0.08, sx * R * 0.85, my + dy * R * 2 - R * 0.06); c.stroke(); } }
  c.restore();
}

// ---------- singers ----------

/**
 * A character singing into a microphone. `level` (0–1) is how loud the music is now and `beat` a bass hit: the mouth
 * opens with the sound and the body bobs on the beat. Box: about 2.2R wide, 3.4R tall, centred.
 */
export function drawSinger(c, s, R, t, level, beat) {
  const who = s.who || "cat", ch = CHARACTERS[who] || CHARACTERS.cat;
  const bob = Math.sin(t * Math.PI * 2 * 1.0) * R * 0.04 + beat * R * 0.06;
  const tilt = Math.sin(t * Math.PI * 1.0) * 0.08 + (level - 0.3) * 0.05;
  const mouth = clamp01(level * 1.7 - 0.08);
  const shirt = s.shirt || "#ff3c8e", sline = shade(shirt, 0.55), skin = ch.fur, kline = shade(skin, 0.62);
  c.save();
  c.lineJoin = "round"; c.lineCap = "round";
  const lw = Math.max(1, R * 0.038);
  // music notes drifting up
  for (let i = 0; i < 3; i++) {
    const d = (t * 0.5 + i / 3) % 1;
    c.globalAlpha = Math.sin(d * Math.PI) * 0.9; c.fillStyle = ["#ff3cac", "#3df2ff", "#ffd23f"][i];
    c.shadowColor = c.fillStyle; c.shadowBlur = R * 0.15;
    c.font = `${R * 0.42}px "Segoe UI Symbol", "Noto Sans Symbols 2", sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(i % 2 ? "♪" : "♫", (i % 2 ? 1 : -1) * R * (1.0 + d * 0.25), -R * (0.4 + d * 1.1));
  }
  c.shadowBlur = 0; c.globalAlpha = 1;
  c.translate(0, bob);
  c.lineWidth = lw;
  // shadow on the floor
  c.fillStyle = "rgba(0,0,0,0.22)"; ellipse(c, 0, R * 1.72, R * 0.6, R * 0.1); c.fill();
  // legs / shoes
  for (const sx of [-1, 1]) {
    if (ch.human) { c.fillStyle = shade(shirt, 0.15); c.fillRect(sx * R * 0.28 - R * 0.09, R * 1.35, R * 0.18, R * 0.25); }
    ellipse(c, sx * R * 0.3, R * 1.62, R * 0.24, R * 0.13); softFill(c, ch.human ? "#4a4a62" : skin, sx * R * 0.3, R * 1.62, R * 0.24, 0.35, 0.3); c.strokeStyle = ch.human ? "#22222e" : kline; c.stroke();
    if (ch.human) { c.fillStyle = "rgba(255,255,255,0.8)"; ellipse(c, sx * R * 0.3 - R * 0.06, R * 1.57, R * 0.08, R * 0.025); c.fill(); }
  }
  // body: shirt with shading and a collar
  c.beginPath(); c.moveTo(-R * 0.5, R * 0.72); c.quadraticCurveTo(-R * 0.66, R * 1.55, -R * 0.1, R * 1.52); c.lineTo(R * 0.1, R * 1.52); c.quadraticCurveTo(R * 0.66, R * 1.55, R * 0.5, R * 0.72); c.quadraticCurveTo(0, R * 0.56, -R * 0.5, R * 0.72); c.closePath();
  c.save(); softFill(c, shirt, -R * 0.1, R * 1.0, R * 0.7, 0.3, 0.25); c.clip();
  c.fillStyle = rgba(shade(shirt, 0.5), 0.3); ellipse(c, R * 0.35, R * 1.3, R * 0.45, R * 0.5, -0.3); c.fill();
  c.strokeStyle = rgba(tint(shirt, 0.6), 0.5); c.lineWidth = lw; c.beginPath(); c.moveTo(-R * 0.15, R * 0.9); c.quadraticCurveTo(-R * 0.2, R * 1.2, -R * 0.12, R * 1.45); c.stroke(); // fold
  c.restore();
  c.strokeStyle = sline; c.lineWidth = lw; c.stroke();
  c.beginPath(); c.moveTo(-R * 0.22, R * 0.68); c.quadraticCurveTo(0, R * 0.9, R * 0.22, R * 0.68); c.quadraticCurveTo(0, R * 0.78, -R * 0.22, R * 0.68);
  c.fillStyle = "#ffffff"; c.fill(); c.strokeStyle = sline; c.stroke();
  // waving arm
  const wave = Math.sin(t * Math.PI * 2) * 0.35;
  c.save(); c.translate(R * 0.45, R * 0.85); c.rotate(-0.9 + wave);
  ellipse(c, R * 0.3, 0, R * 0.32, R * 0.14); softFill(c, shirt, R * 0.3, 0, R * 0.32); c.strokeStyle = sline; c.stroke();
  ellipse(c, R * 0.63, 0, R * 0.13, R * 0.13); softFill(c, skin, R * 0.63, 0, R * 0.13); c.strokeStyle = kline; c.stroke();
  c.restore();
  // head
  c.save(); c.translate(0, -R * 0.2); c.rotate(tilt);
  drawHead(c, who, R, { mouth, blink: (t % 3.1) > 2.95, happy: s.happy && mouth < 0.2 });
  c.restore();
  // microphone beside the mouth, in the other hand
  c.save(); c.translate(-R * 0.42, R * 0.4);
  c.rotate(0.55);
  const hg = c.createLinearGradient(-R * 0.05, 0, R * 0.05, 0); hg.addColorStop(0, "#1a1b22"); hg.addColorStop(0.5, "#4a4d5a"); hg.addColorStop(1, "#1a1b22");
  c.fillStyle = hg; c.beginPath(); c.moveTo(-R * 0.055, 0); c.lineTo(R * 0.055, 0); c.lineTo(R * 0.035, R * 0.58); c.lineTo(-R * 0.035, R * 0.58); c.closePath(); c.fill();
  const mg = c.createRadialGradient(-R * 0.05, -R * 0.08, R * 0.01, 0, -R * 0.03, R * 0.15);
  mg.addColorStop(0, "#ffffff"); mg.addColorStop(0.5, "#c3c8d2"); mg.addColorStop(1, "#5e6470");
  c.fillStyle = mg; c.beginPath(); c.arc(0, -R * 0.04, R * 0.14, 0, TAU); c.fill(); c.strokeStyle = "#2a2c34"; c.lineWidth = lw * 0.7; c.stroke();
  c.strokeStyle = "rgba(40,40,50,0.35)"; c.lineWidth = Math.max(1, R * 0.012);
  for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * R * 0.05, -R * 0.17); c.lineTo(i * R * 0.05, R * 0.09); c.stroke(); c.beginPath(); c.moveTo(-R * 0.13, -R * 0.04 + i * R * 0.05); c.lineTo(R * 0.13, -R * 0.04 + i * R * 0.05); c.stroke(); }
  c.fillStyle = shirt; c.fillRect(-R * 0.05, R * 0.14, R * 0.1, R * 0.04);
  c.restore();
  ellipse(c, -R * 0.32, R * 0.62, R * 0.13, R * 0.13); softFill(c, skin, -R * 0.32, R * 0.62, R * 0.13); c.strokeStyle = kline; c.lineWidth = lw; c.stroke();
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
    const pawCol = ch.patches ? "#26262e" : ch.fur;
    c.strokeStyle = shade(pawCol, 0.62); c.lineWidth = Math.max(1, R * 0.038);
    for (const sx of [-1, 1]) {
      ellipse(c, sx * R * 0.55, edge - R * 0.1 * pa, R * 0.21, R * 0.15 * pa + 0.01); softFill(c, pawCol, sx * R * 0.55, edge - R * 0.1 * pa, R * 0.21); c.stroke();
      if (!ch.human) {
        c.beginPath(); for (const dx of [-0.06, 0.06]) { c.moveTo(sx * R * 0.55 + dx * R, edge - R * 0.2 * pa); c.lineTo(sx * R * 0.55 + dx * R, edge - R * 0.07 * pa); } c.stroke();
        c.fillStyle = "rgba(255,160,190,0.8)"; for (const dx of [-0.11, 0, 0.11]) { ellipse(c, sx * R * 0.55 + dx * R, edge - R * 0.2 * pa, R * 0.03, R * 0.025 * pa + 0.01); c.fill(); }
      }
    }
  }
  c.restore();
}

// ---------- walking pets ----------

/** Pet species for walkers. */
export const PETS = { cat: { name: "Cat", fur: "#ffb36b", dark: "#e08a3a", iris: "#3fae6a" }, kitten: { name: "Grey kitten", fur: "#b8bec9", dark: "#8a919c", iris: "#4aa0d6" },
  tux: { name: "Tuxedo cat", fur: "#2b2b33", dark: "#111116", belly: "#ffffff", iris: "#d6b420" }, dog: { name: "Puppy", fur: "#e3b27a", dark: "#8a5a2b", iris: "#6b3d1e" },
  corgi: { name: "Corgi", fur: "#f0a050", dark: "#ffffff", belly: "#ffffff", iris: "#4a2a12" }, bunny: { name: "Bunny", fur: "#fbf8f6", dark: "#ffb7d5", iris: "#d9466f" },
  chick: { name: "Chick", fur: "#ffd84a", dark: "#ff8a1f", iris: "#3a2410" } };

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

/** A side-view anime eye for pets (looking forward, to the right). */
function sideEye(c, x, y, r, iris) {
  c.save();
  ellipse(c, x, y, r * 0.8, r); c.fillStyle = "#ffffff"; c.fill();
  c.clip();
  const ig = c.createLinearGradient(0, y - r, 0, y + r); ig.addColorStop(0, shade(iris, 0.55)); ig.addColorStop(0.55, iris); ig.addColorStop(1, tint(iris, 0.55));
  c.fillStyle = ig; ellipse(c, x + r * 0.15, y + r * 0.05, r * 0.72, r * 0.92); c.fill();
  c.fillStyle = shade(iris, 0.8); ellipse(c, x + r * 0.2, y, r * 0.35, r * 0.55); c.fill();
  c.fillStyle = "rgba(40,20,30,0.25)"; ellipse(c, x, y - r * 0.95, r, r * 0.4); c.fill();
  c.fillStyle = "#ffffff"; ellipse(c, x - r * 0.1, y - r * 0.4, r * 0.28, r * 0.22, -0.4); c.fill();
  c.beginPath(); c.arc(x + r * 0.35, y + r * 0.4, r * 0.12, 0, TAU); c.fill();
  c.restore();
  c.save(); c.strokeStyle = "#2a1418"; c.lineCap = "round"; c.lineWidth = Math.max(1, r * 0.28);
  c.beginPath(); c.ellipse(x, y, r * 0.82, r * 1.02, 0, Math.PI * 1.1, Math.PI * 1.95); c.stroke();
  c.restore();
}

/** Draws a pet in side view, facing right, standing on y = 0 (the caller flips it to walk left). R ≈ body height. */
export function drawPet(c, s, R, st, t) {
  const sp = s.pet || "cat", pet = PETS[sp] || PETS.cat;
  const kind = sp === "kitten" || sp === "tux" ? "cat" : sp === "corgi" ? "dog" : sp;
  const fur = pet.fur, line = sp === "tux" ? "#0a0a0e" : shade(fur, 0.62), lw = Math.max(1, R * 0.045);
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
  c.save(); c.lineJoin = "round"; c.lineCap = "round"; c.lineWidth = lw; c.strokeStyle = line;
  // soft shadow on the ground
  const sg = c.createRadialGradient(0, 0, 0, 0, 0, R);
  sg.addColorStop(0, "rgba(0,0,0,0.32)"); sg.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = sg; ellipse(c, 0, 0, R * (1.0 - lift / R * 0.3), R * 0.14); c.fill();
  c.translate(0, -lift);
  if (kind === "chick") {
    c.strokeStyle = "#e0761a"; c.lineWidth = R * 0.08;
    for (const sx of [-1, 1]) { const sw = walking ? Math.sin(step + (sx > 0 ? Math.PI : 0)) * R * 0.15 : 0; c.beginPath(); c.moveTo(sx * R * 0.12, -R * 0.3); c.lineTo(sx * R * 0.12 + sw, 0); c.lineTo(sx * R * 0.12 + sw + R * 0.12, 0); c.stroke(); }
    c.strokeStyle = line; c.lineWidth = lw;
    c.save(); c.translate(0, -R * 0.62); c.rotate(walking ? Math.sin(step) * 0.08 : 0);
    ellipse(c, 0, 0, R * 0.5, R * 0.42); softFill(c, fur, 0, 0, R * 0.5); c.stroke();
    c.save(); ellipse(c, 0, 0, R * 0.5, R * 0.42); c.clip(); celShade(c, fur, 0, 0, R * 0.5, R * 0.42); c.restore();
    ellipse(c, -R * 0.1, R * 0.02, R * 0.25, R * 0.16, 0.4); softFill(c, "#ffc21a", -R * 0.1, 0, R * 0.25, 0.2, 0.25); c.stroke(); // wing
    c.save(); c.translate(R * 0.32, -R * 0.38 + headDy * 0.6); c.rotate(headRot);
    ellipse(c, 0, 0, R * 0.32, R * 0.3); softFill(c, fur, 0, 0, R * 0.32); c.stroke();
    sideEye(c, R * 0.1, -R * 0.05, R * 0.075, pet.iris);
    c.beginPath(); c.moveTo(R * 0.27, -R * 0.03); c.lineTo(R * 0.43, R * 0.03); c.lineTo(R * 0.27, R * 0.09); c.closePath(); softFill(c, "#ff9a2a", R * 0.33, R * 0.03, R * 0.1); c.strokeStyle = "#b5560c"; c.stroke();
    blush(c, R * 0.05, R * 0.12, R * 0.4, 0.8);
    c.restore(); c.restore(); c.restore();
    return;
  }
  // tail
  const tailBase = [-R * 0.62, bodyY - R * (kind === "cat" ? 0.05 : 0.15) + sit * R * 0.35];
  const sway = Math.sin(t * tailSpeed) * (a === "wag" ? 0.6 : 0.25);
  if (kind === "bunny") { ellipse(c, tailBase[0], tailBase[1], R * 0.17, R * 0.17); softFill(c, "#ffffff", tailBase[0], tailBase[1], R * 0.17); c.stroke(); }
  else {
    const tw = R * (kind === "cat" ? 0.15 : 0.17);
    c.beginPath(); c.moveTo(tailBase[0], tailBase[1]);
    if (kind === "cat") c.bezierCurveTo(tailBase[0] - R * 0.35, tailBase[1] - R * 0.1, tailBase[0] - R * 0.3 + sway * R * 0.4, tailBase[1] - R * 0.7, tailBase[0] - R * 0.1 + sway * R * 0.5, tailBase[1] - R * 0.85);
    else c.quadraticCurveTo(tailBase[0] - R * 0.3, tailBase[1] - R * 0.2 + sway * R * 0.3, tailBase[0] - R * 0.35 + sway * R * 0.2, tailBase[1] - R * 0.5);
    c.lineWidth = tw + lw * 2; c.strokeStyle = line; c.stroke();
    c.lineWidth = tw; c.strokeStyle = fur; c.stroke();
    c.lineWidth = tw * 0.35; c.strokeStyle = rgba(tint(fur, 0.45), 0.7); c.stroke();
    c.lineWidth = lw; c.strokeStyle = line;
  }
  // legs (back pair, then front pair), swinging while walking; folded when sitting
  const leg = (x, phase, front, far) => {
    const swing = walking ? Math.sin(step + phase) * 0.45 : hopping ? (front ? -0.5 : 0.6) * Math.sin(((tt * 2.2) % 1) * Math.PI) : 0;
    const len = R * (front ? 0.62 : 0.6) * (sit && !front ? 0.55 : 1);
    c.save(); c.translate(x, bodyY + R * 0.2 + (sit && !front ? R * 0.25 : 0)); c.rotate(swing);
    const col = (sp === "tux" && front) || sp === "corgi" ? "#ffffff" : fur;
    c.beginPath(); c.roundRect ? c.roundRect(-R * 0.1, 0, R * 0.2, len, R * 0.1) : c.rect(-R * 0.1, 0, R * 0.2, len);
    const g = c.createLinearGradient(-R * 0.1, 0, R * 0.1, 0); g.addColorStop(0, tint(col, 0.2)); g.addColorStop(1, shade(col, far ? 0.35 : 0.15));
    c.fillStyle = g; c.fill(); c.stroke();
    ellipse(c, R * 0.02, len - R * 0.02, R * 0.12, R * 0.06); c.fillStyle = far ? shade(col, 0.2) : tint(col, 0.15); c.fill(); c.stroke(); // paw
    c.restore();
  };
  leg(-R * 0.45, Math.PI, false, true); leg(R * 0.4, 0, true, true);
  // body
  c.save(); c.translate(0, bodyY); c.rotate(bodyTilt - sit * 0.38);
  const bry = R * (sp === "corgi" ? 0.36 : 0.42);
  ellipse(c, 0, 0, R * 0.78, bry); softFill(c, fur, 0, 0, R * 0.78, 0.3, 0.22); c.stroke();
  c.save(); ellipse(c, 0, 0, R * 0.78, bry); c.clip();
  if (pet.belly) { ellipse(c, R * 0.15, bry * 0.55, R * 0.55, bry * 0.5); softFill(c, pet.belly, R * 0.15, bry * 0.55, R * 0.5, 0.1, 0.12); }
  if (sp === "cat") { c.fillStyle = rgba(shade(fur, 0.3), 0.6); for (const dx of [-0.4, -0.15, 0.1]) { c.beginPath(); c.moveTo(dx * R - R * 0.05, -bry); c.quadraticCurveTo(dx * R + R * 0.04, -bry * 0.4, dx * R + R * 0.06, -bry); c.fill(); } }
  celShade(c, fur, 0, 0, R * 0.78, bry);
  c.restore();
  // chest fluff
  c.beginPath(); c.moveTo(R * 0.55, -bry * 0.3); c.lineTo(R * 0.72, -bry * 0.05); c.lineTo(R * 0.62, bry * 0.05); c.lineTo(R * 0.74, bry * 0.25); c.lineTo(R * 0.58, bry * 0.4);
  c.fillStyle = pet.belly || tint(fur, 0.25); c.fill();
  c.restore();
  leg(-R * 0.3, 0, false, false); leg(R * 0.55, Math.PI, true, false);
  // head
  const hx = R * 0.72, hy = bodyY - R * 0.42 + headDy - sit * R * 0.18;
  c.save(); c.translate(hx, hy); c.rotate(headRot);
  const hr = R * 0.42;
  const ear = (pts, inner) => { c.beginPath(); c.moveTo(...pts[0]); c.quadraticCurveTo(...pts[1], ...pts[2]); c.quadraticCurveTo(...pts[3], ...pts[4]); c.closePath(); softFill(c, fur, pts[2][0], pts[2][1], hr * 0.5); c.stroke();
    if (inner) { c.beginPath(); c.moveTo(...inner[0]); c.lineTo(...inner[1]); c.lineTo(...inner[2]); c.closePath(); c.fillStyle = sp === "tux" ? "#5a3a44" : "#ffa5c8"; c.fill(); } };
  if (kind === "cat" || sp === "corgi") for (const ex of [-0.45, 0.22]) ear([[ex * hr - hr * 0.28, -hr * 0.55], [ex * hr - hr * 0.1, -hr * 1.1], [ex * hr + hr * 0.02, -hr * 1.38], [ex * hr + hr * 0.25, -hr * 1.0], [ex * hr + hr * 0.36, -hr * 0.65]],
    [[ex * hr - hr * 0.12, -hr * 0.68], [ex * hr + hr * 0.02, -hr * 1.18], [ex * hr + hr * 0.2, -hr * 0.72]]);
  if (kind === "bunny") for (const ex of [-0.35, 0.05]) {
    ellipse(c, ex * hr, -hr * 1.35, hr * 0.23, hr * 0.72, -0.2); softFill(c, fur, ex * hr, -hr * 1.35, hr * 0.5, 0.15, 0.18); c.stroke();
    ellipse(c, ex * hr, -hr * 1.32, hr * 0.11, hr * 0.52, -0.2); c.fillStyle = "#ffb7d5"; c.fill();
  }
  ellipse(c, 0, 0, hr, hr * 0.9); softFill(c, fur, 0, 0, hr, 0.3, 0.2); c.stroke();
  c.save(); ellipse(c, 0, 0, hr, hr * 0.9); c.clip(); celShade(c, fur, 0, 0, hr, hr * 0.9);
  if (sp === "cat") { c.fillStyle = rgba(shade(fur, 0.3), 0.6); for (const dx of [-0.25, 0]) { c.beginPath(); c.moveTo(dx * hr - hr * 0.06, -hr * 0.9); c.quadraticCurveTo(dx * hr, -hr * 0.55, dx * hr + hr * 0.06, -hr * 0.9); c.fill(); } }
  c.restore();
  // snout
  ellipse(c, hr * 0.75, hr * 0.2, hr * 0.42, hr * 0.3); softFill(c, kind === "dog" || pet.belly ? "#fff3e6" : tint(fur, 0.1), hr * 0.75, hr * 0.2, hr * 0.42, 0.2, 0.12); c.stroke();
  c.beginPath(); c.ellipse(hr * 1.12, hr * 0.08, hr * 0.13, hr * 0.1, 0, 0, TAU); softFill(c, kind === "bunny" ? "#ff8fb0" : "#3a2226", hr * 1.12, hr * 0.08, hr * 0.13, 0.3, 0.2);
  c.fillStyle = "rgba(255,255,255,0.7)"; ellipse(c, hr * 1.08, hr * 0.04, hr * 0.04, hr * 0.025); c.fill();
  if (kind === "dog" && sp !== "corgi") { ellipse(c, -hr * 0.25, -hr * 0.05, hr * 0.3, hr * 0.62, 0.35); softFill(c, pet.dark, -hr * 0.25, -hr * 0.05, hr * 0.5, 0.25, 0.25); c.stroke(); }
  // eye: closed while blinking or licking
  const blinking = (t % 3.7) > 3.55 || a === "lick";
  if (blinking) { c.strokeStyle = "#2a1418"; c.lineWidth = hr * 0.1; c.beginPath(); c.arc(hr * 0.3, -hr * 0.08, hr * 0.15, Math.PI * 0.1, Math.PI * 0.9); c.stroke(); }
  else sideEye(c, hr * 0.32, -hr * 0.1, hr * 0.19, pet.iris);
  blush(c, hr * 0.38, hr * 0.36, hr * 0.9, 0.8);
  if (kind === "cat") { c.strokeStyle = "rgba(255,255,255,0.85)"; c.lineWidth = Math.max(1, hr * 0.03); for (const dy of [0.05, 0.18]) { c.beginPath(); c.moveTo(hr * 0.9, hr * dy); c.quadraticCurveTo(hr * 1.2, hr * (dy - 0.05), hr * 1.45, hr * (dy + 0.02)); c.stroke(); } }
  if (a === "lick") { c.fillStyle = "#ff7a95"; ellipse(c, hr * 1.0, hr * 0.42 + Math.sin(tt * 20) * hr * 0.05, hr * 0.1, hr * 0.14); c.fill(); }
  c.restore();
  c.restore();
}
