// Stickers: animated emoji and text stickers (WOW!, LOL, SUBSCRIBE…) on the text tracks (item.sticker).
// Everything is drawn here from code: the emoji come from the computer's own emoji font, the badges and
// bubbles are drawn shapes, and the animation is worked out from the time, so preview and export match.

/** Looping animations: [id, name]. */
export const STICKER_ANIMS = [
  ["bounce", "Bounce"], ["pop", "Pop"], ["wobble", "Wobble"], ["float", "Float"], ["spin", "Spin"], ["shake", "Shake"],
  ["heartbeat", "Heartbeat"], ["swing", "Swing"], ["jelly", "Jelly"], ["blink", "Blink"], ["tada", "Ta-da"], ["none", "Still"],
];

/** Emoji by group, each with the animation that suits it best. */
export const EMOJI_GROUPS = [
  ["Faces", [["😂", "shake"], ["🤣", "wobble"], ["😍", "heartbeat"], ["🥰", "float"], ["😘", "pop"], ["😎", "swing"], ["🤩", "tada"], ["😊", "float"],
    ["😭", "shake"], ["😱", "shake"], ["😡", "shake"], ["🤔", "wobble"], ["😴", "float"], ["🥳", "tada"], ["😇", "float"], ["🤯", "pop"],
    ["😏", "swing"], ["🙄", "wobble"], ["😜", "bounce"], ["🤗", "jelly"], ["🫠", "jelly"], ["😳", "pop"], ["🥺", "float"], ["💀", "wobble"]]],
  ["Love", [["❤️", "heartbeat"], ["💖", "heartbeat"], ["💕", "float"], ["💘", "swing"], ["💔", "shake"], ["😻", "heartbeat"], ["💋", "pop"], ["🌹", "swing"]]],
  ["Party", [["🎉", "tada"], ["🎊", "bounce"], ["🎂", "bounce"], ["🎁", "jelly"], ["🎈", "float"], ["🥂", "swing"], ["🏆", "tada"], ["🎵", "float"],
    ["🎶", "float"], ["🎤", "swing"], ["🎸", "wobble"], ["🕺", "bounce"]]],
  ["Hands", [["👍", "pop"], ["👏", "shake"], ["🙌", "bounce"], ["👋", "swing"], ["✌️", "wobble"], ["🙏", "float"], ["💪", "pop"], ["👀", "shake"], ["👉", "bounce"], ["🤞", "wobble"]]],
  ["Animals", [["🐱", "bounce"], ["😺", "wobble"], ["🐶", "bounce"], ["🐰", "bounce"], ["🦋", "float"], ["🐝", "float"], ["🦄", "float"], ["🐼", "jelly"], ["🐸", "bounce"], ["🐧", "wobble"]]],
  ["Food", [["🍕", "spin"], ["🍔", "bounce"], ["🍟", "wobble"], ["🍩", "spin"], ["🍦", "swing"], ["🍓", "pop"], ["☕", "float"], ["🧋", "wobble"], ["🍿", "shake"], ["🍉", "bounce"]]],
  ["Symbols", [["🔥", "wobble"], ["⭐", "spin"], ["🌟", "pop"], ["✨", "blink"], ["💯", "pop"], ["⚡", "shake"], ["💥", "pop"], ["✅", "pop"], ["❌", "shake"], ["❓", "wobble"],
    ["❗", "bounce"], ["💡", "blink"], ["🎯", "pop"], ["🚀", "float"], ["💰", "bounce"], ["📌", "bounce"], ["🔔", "swing"], ["⏰", "shake"]]],
  ["Weather & nature", [["☀️", "spin"], ["🌈", "float"], ["⛅", "float"], ["🌧️", "float"], ["❄️", "spin"], ["🌙", "swing"], ["🌸", "spin"], ["🍀", "wobble"], ["🌊", "float"], ["🌴", "swing"]]],
];

/** Text sticker designs: [name, shape, fill, text colour, outline, font, animation]. */
export const TEXT_STICKERS = [
  ["WOW!", "burst", "#ffe14d", "#ff2d2d", "#111111", "comic", "pop"],
  ["BOOM!", "burst", "#ff7a00", "#ffffff", "#111111", "comic", "shake"],
  ["POW!", "burst", "#ff3cac", "#ffe14d", "#111111", "comic", "tada"],
  ["OMG", "bubble", "#ffffff", "#ff2d6a", "#111111", "comic", "shake"],
  ["LOL", "bubble", "#3df2ff", "#111111", "#111111", "comic", "jelly"],
  ["YES!", "badge", "#39d353", "#ffffff", "#0a3d12", "comic", "bounce"],
  ["NO WAY", "bubble", "#ffe14d", "#111111", "#111111", "comic", "wobble"],
  ["Oops!", "cloud", "#ffffff", "#ff7a00", "#333333", "round", "wobble"],
  ["SUBSCRIBE", "pill", "#ff0033", "#ffffff", "#7a0018", "round", "pop"],
  ["LIKE 👍", "pill", "#1877f2", "#ffffff", "#0a3a7a", "round", "bounce"],
  ["FOLLOW", "pill", "#111111", "#ffffff", "#ffffff", "round", "pop"],
  ["LIVE", "live", "#ff0033", "#ffffff", "#ffffff", "round", "blink"],
  ["NEW!", "badge", "#ff3cac", "#ffffff", "#5a0a33", "comic", "spin"],
  ["SALE", "tag", "#ffe14d", "#c4001a", "#111111", "comic", "swing"],
  ["HOT 🔥", "pill", "#ff5a1a", "#ffffff", "#5a1500", "comic", "wobble"],
  ["Hello!", "bubble", "#ffd6e7", "#c2187a", "#5a0a33", "round", "swing"],
  ["Thank you!", "ribbon", "#ff8fb1", "#ffffff", "#8a1f45", "round", "float"],
  ["Yay!", "burst", "#9dff3d", "#1a5a00", "#111111", "comic", "tada"],
  ["LOVE IT ❤️", "pill", "#ff4d8d", "#ffffff", "#7a0a35", "round", "heartbeat"],
  ["Happy Birthday!", "ribbon", "#6a5cff", "#ffffff", "#25187a", "round", "float"],
  ["Congrats!", "ribbon", "#d4af37", "#ffffff", "#5a3f00", "round", "tada"],
  ["Good vibes", "cloud", "#ffffff", "#7b4bff", "#333333", "round", "float"],
  ["Coming soon", "tag", "#111111", "#ffe14d", "#ffe14d", "round", "pop"],
  ["Wait for it…", "bubble", "#ffffff", "#111111", "#111111", "round", "blink"],
  ["Cute!", "cloud", "#ffd6e7", "#ff3c8e", "#5a0a33", "round", "jelly"],
  ["Salamat!", "ribbon", "#3d8bff", "#ffffff", "#0a2a6a", "round", "swing"],
  ["Grabe!", "burst", "#ffe14d", "#7a00c4", "#111111", "comic", "shake"],
  ["Kilig!", "cloud", "#ffc2e0", "#e0006a", "#5a0a33", "round", "heartbeat"],
  ["Ayos!", "badge", "#00c48c", "#ffffff", "#00402c", "comic", "pop"],
  ["Plain bold", "none", "#ffffff", "#ffffff", "#111111", "comic", "bounce"],
];
export const STICKER_SHAPES = [["burst", "Burst"], ["bubble", "Speech bubble"], ["cloud", "Thought cloud"], ["badge", "Badge"], ["pill", "Pill"],
  ["tag", "Price tag"], ["ribbon", "Ribbon"], ["live", "Live badge"], ["none", "Just the words"]];
export const STICKER_FONTS = { comic: ["'Bangers', 'Arial Black', cursive", 400], round: ["'Poppins', 'Arial Black', sans-serif", 900] };

import { drawFace, sceneBack, sceneFront, drawElegant, elegantSize } from "./stickerart.js";

/** Premium faces for the Emoji tab: [shape, mood, palette, animation]. */
export const PREMIUM_FACES = [
  ["heart", "smile", "rose", "heartbeat"], ["heart", "love", "red", "heartbeat"], ["heart", "laugh", "rose", "shake"], ["heart", "wink", "pink", "wobble"],
  ["heart", "kiss", "red", "pop"], ["heart", "blush", "pink", "float"], ["heart", "cool", "red", "swing"], ["heart", "starry", "rose", "tada"],
  ["heart", "wow", "pink", "pop"], ["heart", "cry", "lilac", "float"], ["heart", "sleepy", "lilac", "float"], ["heart", "angry", "red", "shake"],
  ["heart", "cute", "peach", "jelly"], ["heart", "sad", "sky", "float"], ["heart", "love", "gold", "heartbeat"], ["heart", "smile", "mint", "bounce"],
  ["round", "smile", "sun", "bounce"], ["round", "love", "sun", "heartbeat"], ["round", "laugh", "sun", "shake"], ["round", "blush", "peach", "float"],
  ["round", "cool", "gold", "swing"], ["round", "cute", "pink", "jelly"], ["round", "sleepy", "sky", "float"], ["round", "wow", "sun", "pop"],
  ["star", "starry", "gold", "spin"], ["star", "smile", "sun", "tada"], ["star", "wink", "gold", "wobble"], ["star", "love", "pink", "pop"],
  ["cloud", "sleepy", "sky", "float"], ["cloud", "cute", "pink", "float"], ["cloud", "cry", "sky", "float"], ["cloud", "smile", "mint", "float"],
];

/** Animated elements (Elements tab): category → [emoji, animation, scene effect, glow colour]. */
export const ANIMATED_ELEMENTS = {
  emotions: [["😍", "heartbeat", "hearts", "#ff3c6e"], ["😂", "shake", "tears", "#ffd23f"], ["🥳", "tada", "confetti", "#b46bff"], ["😴", "float", "zzz", "#3d5bff"],
    ["😡", "shake", "anger", "#ff2d2d"], ["🥰", "float", "hearts", "#ff9ccb"], ["🤩", "pop", "sparkle", "#ffd23f"], ["😭", "shake", "tears", "#3d8bff"],
    ["😎", "swing", "shine", "#00e5ff"], ["🤗", "jelly", "sparkle", "#ff8a1f"], ["😘", "pop", "hearts", "#ff3c8e"], ["🤯", "pop", "confetti", "#ff5a1a"]],
  animals: [["🐱", "bounce", "hearts", "#ff9ccb"], ["🐶", "wobble", "sparkle", "#ffb07a"], ["🐰", "bounce", "dust", "#ffd6e7"], ["🐼", "jelly", "petals", "#7ff0c4"],
    ["🦋", "float", "sparkle", "#b46bff"], ["🐠", "float", "bubbles", "#3df2ff"], ["🐥", "bounce", "hearts", "#ffd23f"], ["🦄", "float", "sparkle", "#ff71ce"],
    ["🐸", "bounce", "bubbles", "#39d353"], ["🐧", "wobble", "snow", "#7cc8ff"], ["🐝", "float", "petals", "#ffcc33"], ["🦊", "swing", "sparkle", "#ff8a1f"]],
  weather: [["☀️", "spin", "rays", "#ffcc33"], ["🌧️", "float", "rain", "#3d8bff"], ["❄️", "spin", "snow", "#9fdcff"], ["⛈️", "shake", "lightning", "#6a5cff"],
    ["🌈", "float", "sparkle", "#ff71ce"], ["🌙", "swing", "sparkle", "#b46bff"], ["⛅", "float", "rays", "#ffd23f"], ["🌪️", "spin", "dust", "#9aa0a6"],
    ["🌸", "spin", "petals", "#ff9ccb"], ["⚡", "shake", "lightning", "#ffe14d"], ["☃️", "wobble", "snow", "#7cc8ff"], ["🔥", "wobble", "flame", "#ff5a1a"]],
  drinks: [["☕", "float", "steam", "#c27a3a"], ["🧋", "wobble", "bubbles", "#e0a96d"], ["🥤", "bounce", "fizz", "#ff3c6e"], ["🍹", "swing", "sparkle", "#ff8a1f"],
    ["🍵", "float", "steam", "#7fb685"], ["🥂", "swing", "fizz", "#ffd23f"], ["🍺", "wobble", "fizz", "#ffcc33"], ["🧃", "bounce", "sparkle", "#9dff3d"],
    ["🍷", "swing", "shine", "#a8002a"], ["🥛", "float", "sparkle", "#ffffff"], ["🍸", "swing", "fizz", "#3df2ff"], ["🧉", "wobble", "steam", "#7fb685"]],
  vehicles: [["🚗", "bounce", "speed", "#ff3c6e"], ["🚀", "shake", "flame", "#b46bff"], ["✈️", "float", "speed", "#3d8bff"], ["🚲", "bounce", "speed", "#39d353"],
    ["🏍️", "shake", "speed", "#ff8a1f"], ["🚌", "bounce", "dust", "#ffd23f"], ["🚂", "bounce", "steam", "#9aa0a6"], ["🚁", "float", "speed", "#3df2ff"],
    ["🛵", "bounce", "dust", "#ff71ce"], ["🚤", "float", "bubbles", "#3d8bff"], ["🛸", "float", "sparkle", "#9dff3d"], ["🏎️", "shake", "speed", "#ff2d2d"]],
  furniture: [["🛋️", "jelly", "sparkle", "#c39bff"], ["🛏️", "float", "zzz", "#7cc8ff"], ["🪑", "wobble", "dust", "#c27a3a"], ["🕯️", "float", "flame", "#ffcc33"],
    ["💡", "pop", "rays", "#ffe14d"], ["🪴", "swing", "petals", "#7fb685"], ["🚪", "swing", "shine", "#c27a3a"], ["🛁", "float", "bubbles", "#7cc8ff"],
    ["🖼️", "swing", "shine", "#ffd23f"], ["🧸", "jelly", "hearts", "#ffb07a"], ["⏰", "shake", "sparkle", "#ff3c6e"], ["📺", "wobble", "sparkle", "#3df2ff"]],
  clothing: [["👗", "swing", "sparkle", "#ff71ce"], ["👟", "bounce", "dust", "#3df2ff"], ["👑", "float", "shine", "#ffd23f"], ["🧢", "wobble", "sparkle", "#3d8bff"],
    ["👠", "swing", "sparkle", "#ff2d55"], ["👕", "jelly", "sparkle", "#39d353"], ["🕶️", "swing", "shine", "#00e5ff"], ["🎀", "wobble", "hearts", "#ff9ccb"],
    ["👜", "swing", "shine", "#c27a3a"], ["🧣", "wobble", "snow", "#ff3c6e"], ["💍", "spin", "shine", "#dfe8ff"], ["🎩", "tada", "sparkle", "#b46bff"]],
  people: [["💃", "swing", "notes", "#ff3c6e"], ["🕺", "bounce", "notes", "#b46bff"], ["👋", "swing", "sparkle", "#ffd23f"], ["🙋", "bounce", "sparkle", "#ff8a1f"],
    ["🧑‍🎤", "shake", "notes", "#ff71ce"], ["👩‍🍳", "wobble", "steam", "#ffffff"], ["🧑‍💻", "float", "sparkle", "#3df2ff"], ["👰", "float", "petals", "#ffd6e7"],
    ["🤳", "pop", "shine", "#3d8bff"], ["🏃", "bounce", "speed", "#39d353"], ["🧘", "float", "sparkle", "#7ff0c4"], ["👨‍👩‍👧", "jelly", "hearts", "#ff9ccb"]],
};
export const ELEMENT_CATEGORIES = [["emotions", "Emotions"], ["animals", "Cute animals"], ["weather", "Weather"], ["drinks", "Drinks"], ["vehicles", "Vehicles"],
  ["furniture", "Household & furniture"], ["clothing", "Clothing"], ["people", "People"]];

/** Elegant word stickers: [words, palette, effect, font]. */
export const ELEGANT_STICKERS = [
  ["Thank You", "gold", "write", "vibes"], ["Happy Birthday", "rose", "glitter", "vibes"], ["Congratulations", "gold", "glitter", "vibes"], ["Love", "ruby", "glow", "vibes"],
  ["Welcome", "silver", "write", "vibes"], ["Best Wishes", "champagne", "glow", "vibes"], ["Just Married", "pearl", "write", "vibes"], ["Merry Christmas", "ruby", "glitter", "vibes"],
  ["Happy Anniversary", "rose", "write", "vibes"], ["Forever", "lilac", "glow", "vibes"], ["With Love", "pink", "write", "dancing"], ["Salamat Po", "gold", "write", "vibes"],
  ["Happy New Year", "gold", "glitter", "playfair"], ["Good Morning", "champagne", "write", "dancing"], ["Sweet Dreams", "lilac", "glow", "vibes"], ["Celebrate", "emerald", "glitter", "playfair"],
];

const EMOJI_FONT = `"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif`;
let measureCv = null;
const mctx = () => (measureCv ??= new OffscreenCanvas(4, 4)).getContext("2d");

/** Size of a sticker in pixels on a 1920-wide frame, before scaling: { w, h, fs (font size) }. */
export function stickerSize(s) {
  const base = s.size ?? 220;
  if (s.kind === "emoji" || s.kind === "face") return { w: base * 1.1, h: base * 1.1, fs: base * 0.82 };
  if (s.shape === "elegant") return elegantSize(s, mctx());
  const fs = base * 0.42;
  const c = mctx();
  const [font, weight] = STICKER_FONTS[s.font] || STICKER_FONTS.comic;
  c.font = `${weight} ${fs}px ${font}`;
  const lines = (s.text || " ").split("\n");
  const tw = Math.max(...lines.map((l) => c.measureText(l).width)), th = fs * 1.1 * lines.length;
  const pad = { burst: [0.75, 1.2], bubble: [0.5, 0.95], cloud: [0.6, 1.1], badge: [0, 0], pill: [0.45, 0.6], tag: [0.6, 0.6], ribbon: [0.9, 0.6], live: [0.55, 0.55], none: [0.15, 0.25] }[s.shape] || [0.4, 0.6];
  if (s.shape === "badge") { const d = Math.max(tw, th) + fs * 0.9; return { w: d, h: d, fs, tw, th, lines }; }
  return { w: tw + fs * pad[0] * 2, h: th + fs * pad[1], fs, tw, th, lines };
}

/** The sticker's looping motion at time t (seconds since it appeared): offsets in units of its size, turn in degrees. */
function motion(s, t, dur) {
  const sp = s.speed ?? 1, p = t * sp, ph = p % 1;
  let dx = 0, dy = 0, rot = 0, sx = 1, sy = 1, alpha = 1, pivot = 0;
  switch (s.anim || "bounce") {
    case "bounce": { const h = Math.abs(Math.sin(Math.PI * p)); dy = -h * 0.22; const land = 1 - Math.min(1, h * 4); sx = 1 + 0.12 * land; sy = 1 - 0.12 * land; break; }
    case "pop": { const k = Math.max(0, Math.sin(2 * Math.PI * p)); sx = sy = 1 + 0.16 * k * k; break; }
    case "wobble": rot = Math.sin(2 * Math.PI * p) * 12; break;
    case "float": dy = Math.sin(2 * Math.PI * p * 0.5) * 0.08; rot = Math.sin(2 * Math.PI * p * 0.25) * 4; break;
    case "spin": rot = (p * 360) % 360; break;
    case "shake": dx = (Math.sin(p * 37) + Math.sin(p * 23)) * 0.03; dy = (Math.cos(p * 31) + Math.sin(p * 19)) * 0.025; rot = Math.sin(p * 29) * 5; break;
    case "heartbeat": { const b = Math.max(Math.exp(-((ph - 0.1) ** 2) / 0.003), 0.7 * Math.exp(-((ph - 0.32) ** 2) / 0.003)); sx = sy = 1 + 0.2 * b; break; }
    case "swing": rot = Math.sin(2 * Math.PI * p) * 16; pivot = -0.5; break;
    case "jelly": { const w = Math.sin(2 * Math.PI * p * 1.5) * Math.exp(-((ph * 2) % 1) * 1.5); sx = 1 + 0.14 * w; sy = 1 - 0.14 * w; break; }
    case "blink": alpha = ph < 0.65 ? 1 : 0.25; break;
    case "tada": { const k = ph < 0.6 ? Math.sin((ph / 0.6) * Math.PI * 4) : 0; rot = k * 8; sx = sy = ph < 0.6 ? 1.1 : 1; break; }
    default: break;
  }
  // Pops in when it appears (unless switched off).
  if (s.popIn !== false) {
    const k = Math.min(1, t / 0.35), e = k === 1 ? 1 : 1 - Math.pow(1 - k, 3) * Math.cos(k * Math.PI * 1.6) * 1.0;
    sx *= Math.max(0, e); sy *= Math.max(0, e);
  }
  return { dx, dy, rot, sx, sy, alpha, pivot };
}

/** Draws a sticker centred on the origin (the caller has placed, scaled and turned the layer). k = frame width / 1920. */
export function drawStickerAt(c, s, t, dur, k) {
  const z = stickerSize(s);
  const m = motion(s, t, dur);
  const W = z.w * k, H = z.h * k;
  c.save();
  c.globalAlpha *= m.alpha;
  c.translate(m.dx * W, m.dy * H + m.pivot * H);
  c.rotate((m.rot * Math.PI) / 180);
  c.translate(0, -m.pivot * H);
  c.scale(m.sx, m.sy);
  if (s.kind === "face") {
    drawFace(c, s, W * 0.46, t * (s.speed ?? 1), k);
    if (s.sparkles) sparkles(c, W, t * (s.speed ?? 1));
  } else if (s.kind === "emoji") {
    const ts = t * (s.speed ?? 1);
    if (s.scene || s.glow) sceneBack(c, s, W / 2, ts);
    c.font = `${z.fs * k}px ${EMOJI_FONT}`;
    c.textAlign = "center"; c.textBaseline = "middle";
    if (s.shadow !== false) { c.shadowColor = "rgba(0,0,0,0.35)"; c.shadowBlur = 14 * k; c.shadowOffsetY = 6 * k; }
    c.fillText(s.emoji || "😀", 0, z.fs * k * 0.06);
    c.shadowColor = "transparent"; c.shadowBlur = 0; c.shadowOffsetY = 0;
    if (s.scene) sceneFront(c, s, W / 2, ts);
    if (s.sparkles) sparkles(c, W, ts);
  } else if (s.shape === "elegant") {
    drawElegant(c, s, z, k, t);
  } else {
    drawBadge(c, s, z, k, t);
    if (s.sparkles) sparkles(c, W * 1.05, t * (s.speed ?? 1));
  }
  c.restore();
}

function sparkles(c, size, t) {
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + t * 0.8, r = size * (0.55 + 0.08 * Math.sin(t * 3 + i));
    const tw = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.7), s = size * 0.06 * tw;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    c.fillStyle = i % 2 ? "#ffffff" : "#ffe14d";
    c.beginPath();
    for (let j = 0; j < 8; j++) { const b = (j * Math.PI) / 4, rr = j % 2 ? s * 0.25 : s; j ? c.lineTo(x + Math.cos(b) * rr, y + Math.sin(b) * rr) : c.moveTo(x + Math.cos(b) * rr, y + Math.sin(b) * rr); }
    c.closePath(); c.fill();
  }
}

function drawBadge(c, s, z, k, t) {
  const W = z.w * k, H = z.h * k, fs = z.fs * k, ol = Math.max(2, fs * 0.09);
  const fill = s.fill || "#ffe14d", line = s.outline || "#111111";
  c.lineJoin = "round"; c.lineCap = "round";
  const shape = s.shape || "burst";
  if (shape !== "none") {
    c.save();
    c.beginPath();
    if (shape === "burst") {
      const n = 14, R = W / 2, Rh = H / 2;
      for (let i = 0; i < n * 2; i++) {
        const a = (i * Math.PI) / n - Math.PI / 2, rr = i % 2 ? 0.72 : 1;
        const x = Math.cos(a) * R * rr, y = Math.sin(a) * Rh * rr;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.closePath();
    } else if (shape === "bubble") {
      const w = W, h = H * 0.82, r = Math.min(w, h) * 0.45, y0 = -H / 2;
      roundRect(c, -w / 2, y0, w, h, r);
      c.moveTo(-w * 0.18, y0 + h - 1); c.lineTo(-w * 0.3, H / 2); c.lineTo(w * 0.02, y0 + h - 1);
    } else if (shape === "cloud") {
      const h = H * 0.8, y0 = -H / 2, bumps = Math.max(5, Math.round(W / (h * 0.45)));
      for (let i = 0; i < bumps; i++) {
        const x = -W / 2 + h * 0.3 + (i / (bumps - 1)) * (W - h * 0.6);
        c.moveTo(x + h * 0.32, y0 + h * 0.3); c.arc(x, y0 + h * 0.3, h * 0.32, 0, Math.PI * 2);
        c.moveTo(x + h * 0.32, y0 + h * 0.7); c.arc(x, y0 + h * 0.7, h * 0.32, 0, Math.PI * 2);
      }
      roundRect(c, -W / 2 + h * 0.15, y0 + h * 0.15, W - h * 0.3, h * 0.7, h * 0.3);
      c.moveTo(-W * 0.32 + h * 0.12, H / 2 - h * 0.12); c.arc(-W * 0.32, H / 2 - h * 0.12, h * 0.12, 0, Math.PI * 2);
      c.moveTo(-W * 0.4 + h * 0.07, H / 2 - h * 0.01); c.arc(-W * 0.4, H / 2 - h * 0.01, h * 0.07, 0, Math.PI * 2);
    } else if (shape === "badge") {
      const R = W / 2, n = 24;
      for (let i = 0; i < n * 2; i++) { const a = (i * Math.PI) / n, rr = i % 2 ? 0.92 : 1; const x = Math.cos(a) * R * rr, y = Math.sin(a) * R * rr; i ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.closePath();
    } else if (shape === "pill" || shape === "live") roundRect(c, -W / 2, -H / 2, W, H, H / 2);
    else if (shape === "tag") {
      const n = H * 0.45;
      c.moveTo(-W / 2 + n, -H / 2); c.lineTo(W / 2 - H * 0.12, -H / 2); c.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + H * 0.12);
      c.lineTo(W / 2, H / 2 - H * 0.12); c.quadraticCurveTo(W / 2, H / 2, W / 2 - H * 0.12, H / 2); c.lineTo(-W / 2 + n, H / 2); c.lineTo(-W / 2, 0); c.closePath();
    } else if (shape === "ribbon") {
      const f = H * 0.5;
      c.moveTo(-W / 2, -H / 2); c.lineTo(W / 2, -H / 2); c.lineTo(W / 2 - f * 0.6, 0); c.lineTo(W / 2, H / 2); c.lineTo(-W / 2, H / 2); c.lineTo(-W / 2 + f * 0.6, 0); c.closePath();
    }
    // A thick outline first (with the drop shadow), then the fill on top: pieces that overlap (cloud bumps,
    // the bubble's tail) share one clean outer border.
    c.shadowColor = "rgba(0,0,0,0.35)"; c.shadowBlur = fs * 0.3; c.shadowOffsetY = fs * 0.12;
    c.lineWidth = ol * 2; c.strokeStyle = line; c.stroke();
    c.shadowColor = "transparent";
    c.fillStyle = fill; c.fill("nonzero");
    c.lineWidth = ol;
    if (shape === "tag") { c.beginPath(); c.arc(-W / 2 + H * 0.5, 0, H * 0.09, 0, Math.PI * 2); c.fillStyle = line; c.fill(); }
    if (shape === "badge") { c.beginPath(); c.arc(0, 0, W * 0.38, 0, Math.PI * 2); c.lineWidth = ol * 0.6; c.setLineDash([ol * 1.2, ol * 1.2]); c.stroke(); c.setLineDash([]); }
    c.restore();
  }
  // the words
  const [font, weight] = STICKER_FONTS[s.font] || STICKER_FONTS.comic;
  c.font = `${weight} ${fs}px ${font}`;
  c.textAlign = "center"; c.textBaseline = "middle";
  const lines = z.lines || [s.text];
  const live = shape === "live";
  const dot = live ? fs * 0.28 : 0;
  const yOff = shape === "bubble" ? -H * 0.09 : shape === "cloud" ? -H * 0.1 : 0;
  lines.forEach((l, i) => {
    const y = yOff + (i - (lines.length - 1) / 2) * fs * 1.1 + fs * 0.04;
    const x = live ? dot * 1.1 : 0;
    c.lineWidth = Math.max(2, fs * (shape === "none" ? 0.22 : 0.12)); c.strokeStyle = shape === "none" ? line : s.textOutline || "rgba(0,0,0,0)";
    if (shape === "none" || s.textOutline) c.strokeText(l, x, y);
    c.fillStyle = s.color || "#ffffff";
    c.fillText(l, x, y);
  });
  if (live) { // a red "recording" dot that pulses
    const tw = c.measureText(lines[0]).width;
    c.globalAlpha *= 0.55 + 0.45 * Math.abs(Math.sin(t * 3));
    c.beginPath(); c.arc(-tw / 2 - dot * 0.2, fs * 0.04, dot * 0.55, 0, Math.PI * 2); c.fillStyle = "#ffffff"; c.fill();
  }
}

function roundRect(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

/** A new sticker's settings. */
export function newEmojiSticker(emoji, anim) { return { kind: "emoji", emoji, anim: anim || "bounce", speed: 1, size: 260, popIn: true }; }
export function newTextSticker(def) {
  const [text, shape, fill, color, outline, font, anim] = def;
  return { kind: "text", text: text === "Plain bold" ? "AWESOME" : text, shape, fill, color, outline, font, anim, speed: 1, size: 300, popIn: true };
}
export const stickerName = (s) => (s.kind === "emoji" ? `${s.emoji} sticker` : s.kind === "face" ? "Premium face" : `“${(s.text || "").replace(/\n/g, " ")}” sticker`);

export const newFaceSticker = ([shape, mood, palette, anim]) => ({ kind: "face", shape, mood, palette, anim, speed: 1, size: 260, popIn: true });
export const newSceneSticker = ([emoji, anim, scene, glow]) => ({ kind: "emoji", emoji, anim, scene, glow, speed: 1, size: 280, popIn: true });
export const newElegantSticker = ([text, palette, effect, font]) => ({ kind: "text", shape: "elegant", text, palette, effect, font, anim: "none", speed: 1, size: 300, popIn: false, writeDur: 1.8 });
