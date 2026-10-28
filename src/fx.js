// GPU effects for clips, layers and the whole frame: colour adjustments, filters (looks), chroma key and a
// catalogue of animated effects. Everything runs in one WebGL2 context as a chain of passes over
// premultiplied-alpha textures, so layers keep their transparency and blur edges stay clean.

// ---------------- catalogue ----------------

/** Colour adjustments (all 0 = unchanged). */
export const ADJUST = {
  exposure: { label: "Exposure", min: -1, max: 1 },
  brightness: { label: "Brightness", min: -1, max: 1 },
  contrast: { label: "Contrast", min: -1, max: 1 },
  saturation: { label: "Saturation", min: -1, max: 1 },
  vibrance: { label: "Vibrance", min: -1, max: 1 },
  temperature: { label: "Temperature", min: -1, max: 1 },
  tint: { label: "Tint", min: -1, max: 1 },
  hue: { label: "Hue", min: -180, max: 180, step: 1 },
  highlights: { label: "Highlights", min: -1, max: 1 },
  shadows: { label: "Shadows", min: -1, max: 1 },
  fade: { label: "Fade", min: 0, max: 1 },
  vignette: { label: "Vignette", min: -1, max: 1 },
  sharpen: { label: "Sharpen", min: 0, max: 1 },
  grain: { label: "Grain", min: 0, max: 1 },
};

/** Filters ("looks"): adjustment presets plus grey/sepia and split-tone colours, blended by an amount. */
export const FILTERS = {
  vivid: { label: "Vivid", p: { saturation: 0.35, vibrance: 0.3, contrast: 0.15 } },
  clean: { label: "Clean", p: { exposure: 0.08, contrast: 0.08, vibrance: 0.15, highlights: -0.15, shadows: 0.15 } },
  warm: { label: "Warm", p: { temperature: 0.45, saturation: 0.08 } },
  cool: { label: "Cool", p: { temperature: -0.45, tint: -0.05 } },
  cinematic: { label: "Cinematic", p: { contrast: 0.2, saturation: -0.05 }, sh: [-0.35, 0.05, 0.35], hi: [0.35, 0.12, -0.25] },
  golden: { label: "Golden hour", p: { temperature: 0.55, exposure: 0.05, saturation: 0.15 }, hi: [0.3, 0.15, -0.2] },
  sunset: { label: "Sunset", p: { temperature: 0.35, tint: 0.25, saturation: 0.2 }, sh: [0.15, -0.1, 0.25] },
  vintage: { label: "Vintage", p: { fade: 0.35, saturation: -0.25, temperature: 0.2, vignette: 0.35 }, sh: [0.1, 0.05, -0.1] },
  film: { label: "Film", p: { contrast: 0.12, fade: 0.2, saturation: -0.1, grain: 0.25 }, sh: [0, 0.08, 0.12], hi: [0.12, 0.05, -0.05] },
  retro70: { label: "Retro 70s", p: { temperature: 0.4, fade: 0.3, saturation: -0.15, hue: 8 }, sh: [0.2, 0.1, 0] },
  matte: { label: "Matte", p: { fade: 0.55, contrast: -0.1, saturation: -0.1 } },
  pastel: { label: "Pastel", p: { exposure: 0.15, saturation: -0.3, fade: 0.3, contrast: -0.15 }, hi: [0.1, 0, 0.12] },
  moody: { label: "Moody", p: { exposure: -0.15, contrast: 0.25, saturation: -0.35, vignette: 0.4 }, sh: [-0.1, 0, 0.12] },
  arctic: { label: "Arctic", p: { temperature: -0.6, exposure: 0.1, saturation: -0.2 }, hi: [-0.1, 0.05, 0.2] },
  forest: { label: "Forest", p: { tint: -0.35, saturation: 0.1, contrast: 0.1 }, sh: [-0.1, 0.12, 0] },
  rose: { label: "Rose", p: { tint: 0.35, exposure: 0.05 }, hi: [0.2, 0, 0.08] },
  cyber: { label: "Cyber", p: { contrast: 0.25, saturation: 0.3 }, sh: [0.1, -0.2, 0.4], hi: [0.45, -0.1, 0.3] },
  bw: { label: "Black & white", p: {}, gray: 1 },
  noir: { label: "Noir", p: { contrast: 0.55, vignette: 0.45 }, gray: 1 },
  sepia: { label: "Sepia", p: { contrast: 0.05 }, sepia: 1 },
};

/** Effects by category. `mode` is the shader branch; ids stay stable in saved projects. */
export const EFFECT_CATEGORIES = ["Distortion & Glitch", "Optical & Lens", "Light & Shadow", "Retro", "Party & Club", "Artistic", "TV & Static", "Camera & Motion"];
export const EFFECTS = {
  glitch: { label: "Glitch", cat: 0, mode: 1, tags: "distort digital error" },
  rgbSplit: { label: "RGB split", cat: 0, mode: 2, tags: "chromatic colour split glitch" },
  shake: { label: "Camera shake", cat: 0, mode: 3, tags: "handheld camera earthquake" },
  wave: { label: "Wave", cat: 0, mode: 4 },
  ripple: { label: "Ripple", cat: 0, mode: 5 },
  swirl: { label: "Swirl", cat: 0, mode: 6 },
  bulge: { label: "Bulge", cat: 0, mode: 7 },
  pinch: { label: "Pinch", cat: 0, mode: 8 },
  pixelate: { label: "Pixelate", cat: 0, mode: 9 },
  digitalNoise: { label: "Digital noise", cat: 0, mode: 10, tags: "static noise snow tv" },
  slices: { label: "Slice shift", cat: 0, mode: 12, tags: "glitch tear" },
  blur: { label: "Blur", cat: 1, mode: 20, tags: "soft defocus" },
  zoomBlur: { label: "Zoom blur", cat: 1, mode: 21 },
  motionBlur: { label: "Motion blur", cat: 1, mode: 22, tags: "trail long exposure speed" },
  tiltShift: { label: "Tilt-shift", cat: 1, mode: 23 },
  chromatic: { label: "Chromatic aberration", cat: 1, mode: 24 },
  fisheye: { label: "Fisheye lens", cat: 1, mode: 25 },
  dreamy: { label: "Dreamy glow", cat: 1, mode: 26 },
  focusPull: { label: "Focus pull", cat: 1, mode: 27 },
  bloom: { label: "Bloom", cat: 2, mode: 30, place: { size: true } },
  lightLeak: { label: "Light leak", cat: 2, mode: 31, tags: "sun light warm", place: { x: 0.2, y: 0.2 } },
  flash: { label: "Flash", cat: 2, mode: 32 },
  godRays: { label: "God rays", cat: 2, mode: 34, tags: "sun rays light beams", place: { x: 0.2, y: 0.1 } },
  lensFlare: { label: "Lens flare", cat: 2, mode: 35, tags: "sun light", place: { x: 0.3, y: 0.25 } },
  neonEdges: { label: "Neon edges", cat: 2, mode: 36 },
  spotlight: { label: "Spotlight", cat: 2, mode: 37, place: { x: 0.5, y: 0.5 }, params: [{ label: "Wander", def: 0 }] },
  darkPulse: { label: "Shadow pulse", cat: 2, mode: 38, place: { x: 0.5, y: 0.5 } },
  filmGrain: { label: "Film grain", cat: 3, mode: 40, tags: "noise texture grain" },
  oldFilm: { label: "Old film", cat: 3, mode: 41, tags: "vintage retro tv" },
  vhs: { label: "VHS", cat: 3, mode: 42, tags: "vcr tape retro tv" },
  crt: { label: "CRT screen", cat: 3, mode: 43, tags: "tv retro old screen scanlines" },
  sepiaTone: { label: "Sepia tone", cat: 3, mode: 44 },
  halftone: { label: "Halftone", cat: 3, mode: 45 },
  posterize: { label: "Posterize", cat: 3, mode: 46 },
  eightBit: { label: "8-bit", cat: 3, mode: 47 },
  dither: { label: "Dither", cat: 3, mode: 48 },
  instant: { label: "Instant photo", cat: 3, mode: 49 },
  strobe: { label: "Strobe", cat: 4, mode: 50 },
  colorCycle: { label: "Colour cycle", cat: 4, mode: 51 },
  kaleidoscope: { label: "Kaleidoscope", cat: 4, mode: 52 },
  mirrorH: { label: "Mirror", cat: 4, mode: 53 },
  mirrorV: { label: "Mirror vertical", cat: 4, mode: 54 },
  mirrorQuad: { label: "Mirror ×4", cat: 4, mode: 55 },
  disco: { label: "Disco lights", cat: 4, mode: 56 },
  heartbeat: { label: "Heartbeat zoom", cat: 4, mode: 57 },
  grid3: { label: "Split ×3", cat: 4, mode: 58 },
  rainbow: { label: "Rainbow", cat: 4, mode: 59 },
  rgbShake: { label: "RGB shake", cat: 4, mode: 60 },
  sketch: { label: "Pencil sketch", cat: 5, mode: 70 },
  comic: { label: "Comic", cat: 5, mode: 71 },
  invert: { label: "Invert", cat: 5, mode: 72 },
  thermal: { label: "Thermal", cat: 5, mode: 73 },
  nightVision: { label: "Night vision", cat: 5, mode: 74 },
  duotone: { label: "Duotone", cat: 5, mode: 75 },
  emboss: { label: "Emboss", cat: 5, mode: 76 },
  xray: { label: "X-ray", cat: 5, mode: 78 },
  colorPop: { label: "Colour pop (red)", cat: 5, mode: 79 },
  sunRays: { label: "Sun rays", cat: 2, mode: 85, tags: "god rays light leak sunlight beams warm",
    place: { x: 0.25, y: -0.08, yMin: -0.4, yMax: 1.2 }, params: [{ label: "Atmosphere", def: 0.4 }, { label: "Warmth", def: 0.6 }, { label: "Ray detail", def: 0.4 }],
    presets: [{ label: "Morning", amount: 0.6, speed: 0.6, p: [0.3, 0.35, 0.4], pos: [0.2, -0.08, 1] }, { label: "Golden hour", amount: 0.85, speed: 0.5, p: [0.5, 0.95, 0.4], pos: [0.75, 0.1, 1.2] },
      { label: "Hazy", amount: 0.7, speed: 0.4, p: [1, 0.5, 0.3], pos: [0.5, -0.1, 1.4] }, { label: "Heavenly", amount: 1, speed: 1, p: [0.7, 0.1, 0.7], pos: [0.5, -0.15, 1] }] },
  staticNoise: { label: "Static noise", cat: 6, mode: 80, tags: "static morph tv snow grain noise chromatic",
    params: [{ label: "Colour split", def: 0.5 }, { label: "Grain size", def: 0.3 }, { label: "Colour", def: 0 }],
    presets: [{ label: "Light static", amount: 0.35, speed: 0.6, p: [0.3, 0.2, 0] }, { label: "Heavy snow", amount: 0.85, speed: 1, p: [0.6, 0.4, 0] },
      { label: "Static morph", amount: 0.6, speed: 2, p: [1, 0.6, 0.4] }, { label: "No signal", amount: 1, speed: 1.5, p: [0.2, 0.2, 0.2] }] },
  signalGlitch: { label: "Signal glitch", cat: 6, mode: 81, tags: "glitch distort level tear blocks signal drop digital",
    params: [{ label: "Tears", def: 0.6 }, { label: "Blocks", def: 0.5 }, { label: "Signal drops", def: 0.3 }],
    presets: [{ label: "Subtle", amount: 0.4, speed: 0.7, p: [0.4, 0.2, 0.1] }, { label: "Distort level", amount: 0.8, speed: 1, p: [0.8, 0.6, 0.3] },
      { label: "Broken signal", amount: 1, speed: 1.6, p: [1, 1, 0.8] }] },
  retroTV: { label: "Retro TV", cat: 6, mode: 82, tags: "old tv crt retro vintage scanlines curve",
    params: [{ label: "Screen curve", def: 0.6 }, { label: "Scanlines", def: 0.6 }, { label: "Colour", def: 0.35 }],
    presets: [{ label: "1980s set", amount: 0.8, speed: 1, p: [0.6, 0.6, 0.5] }, { label: "Black & white", amount: 1, speed: 1, p: [0.8, 0.8, 0] },
      { label: "Flat screen", amount: 0.6, speed: 1, p: [0, 0.5, 0.8] }] },
  vcr: { label: "VCR tape", cat: 6, mode: 83, tags: "vcr vhs tape camcorder tracking timecode battery overlay retro", hud: true,
    params: [{ label: "Tracking", def: 0.5 }, { label: "Noise", def: 0.4 }, { label: "Colour bleed", def: 0.5 }],
    presets: [{ label: "Home video", amount: 0.6, speed: 1, p: [0.3, 0.3, 0.4] }, { label: "Worn tape", amount: 0.9, speed: 1.2, p: [0.9, 0.7, 0.8] },
      { label: "Clean HUD", amount: 0.25, speed: 1, p: [0.1, 0.1, 0.2] }] },
  handheld: { label: "Handheld", cat: 7, mode: 84, tags: "fake camera shake handheld sway walk run",
    params: [{ label: "Sway", def: 0.6 }, { label: "Tilt", def: 0.4 }, { label: "Breathing zoom", def: 0.3 }],
    presets: [{ label: "Tripod breathing", amount: 0.35, speed: 0.4, p: [0.3, 0.2, 1] }, { label: "Gentle walk", amount: 0.45, speed: 0.7, p: [0.6, 0.4, 0.4] },
      { label: "Walking", amount: 0.7, speed: 1, p: [0.8, 0.6, 0.3] }, { label: "Running", amount: 1, speed: 2.2, p: [1, 0.8, 0.2] },
      { label: "Earthquake", amount: 1, speed: 4, p: [1, 0.3, 0] }] },
  longExposure: { label: "Long exposure", cat: 7, mode: 86, tags: "motion trails light trail streak long exposure",
    params: [{ label: "Trail length", def: 0.5 }, { label: "Direction", def: 0 }, { label: "Only bright parts", def: 0.4 }],
    presets: [{ label: "Light streaks", amount: 0.8, speed: 0.3, p: [0.6, 0, 0.7] }, { label: "Dreamy smear", amount: 0.6, speed: 0.3, p: [0.4, 0.25, 0.1] },
      { label: "Rising trails", amount: 0.9, speed: 0.3, p: [0.7, 0.5, 0.5] }] },
  dollyZoom: { label: "Dolly zoom", cat: 7, mode: 87, tags: "vertigo zoom camera push dolly",
    params: [{ label: "Edge stretch", def: 0.7 }],
    presets: [{ label: "Vertigo", amount: 0.8, speed: 0.6, p: [1] }, { label: "Slow push", amount: 0.5, speed: 0.3, p: [0.3] }] },
  whipPan: { label: "Whip pan", cat: 7, mode: 88, tags: "whip pan swish swipe fast camera transition",
    params: [{ label: "Distance", def: 1 }, { label: "Direction", def: 0 }, { label: "Pause between", def: 0.4 }],
    presets: [{ label: "Swipe left", amount: 0.9, speed: 1, p: [1, 0, 0.4] }, { label: "Swipe up", amount: 0.9, speed: 1, p: [1, 0.25, 0.4] },
      { label: "Nudge", amount: 0.6, speed: 1, p: [0.15, 0, 0.3] }] },
  crashZoom: { label: "Crash zoom", cat: 7, mode: 89, tags: "crash zoom punch impact snap camera beat",
    params: [{ label: "Zoom", def: 0.6 }, { label: "Blur", def: 0.7 }, { label: "Pause between", def: 0.35 }],
    presets: [{ label: "Punch", amount: 1, speed: 1, p: [0.6, 0.8, 0.3] }, { label: "On the beat", amount: 0.8, speed: 1, p: [0.35, 0.5, 0.1] },
      { label: "Dramatic", amount: 1, speed: 0.6, p: [1, 1, 0.8] }] },
  tiltSway: { label: "Tilt sway", cat: 7, mode: 90, tags: "dutch tilt roll sway rock boat camera",
    params: [{ label: "Tilt", def: 0.6 }, { label: "Bob", def: 0.3 }],
    presets: [{ label: "Boat", amount: 0.8, speed: 0.7, p: [0.8, 0.6] }, { label: "Dizzy", amount: 1, speed: 1.6, p: [1, 0.4] }, { label: "Gentle", amount: 0.4, speed: 0.6, p: [0.5, 0.2] }] },
  swing3d: { label: "3D swing", cat: 7, mode: 91, tags: "3d swing perspective rotate card tilt parallax camera",
    params: [{ label: "Turn left-right", def: 0.7 }, { label: "Turn up-down", def: 0.3 }, { label: "Show edges", def: 0 }],
    presets: [{ label: "Card turn", amount: 0.8, speed: 1, p: [0.8, 0.2, 0] }, { label: "Floating", amount: 0.5, speed: 0.6, p: [0.5, 0.5, 0] },
      { label: "Poster", amount: 0.7, speed: 0.7, p: [0.7, 0.3, 1] }] },
  droneDrift: { label: "Drone drift", cat: 7, mode: 92, tags: "drone drift float glide aerial slow camera",
    params: [{ label: "Drift", def: 0.6 }, { label: "Turn", def: 0.4 }, { label: "Zoom breathing", def: 0.4 }],
    presets: [{ label: "Aerial", amount: 0.8, speed: 1, p: [0.7, 0.5, 0.4] }, { label: "Dreamy float", amount: 0.6, speed: 0.6, p: [0.5, 0.2, 0.8] }] },
  focusBreath: { label: "Focus breathing", cat: 7, mode: 93, tags: "rack focus breathing blur lens defocus camera",
    params: [{ label: "Blur", def: 0.6 }, { label: "Zoom breathing", def: 0.5 }, { label: "Sharp time", def: 0.5 }],
    presets: [{ label: "Rack focus", amount: 0.8, speed: 0.6, p: [0.8, 0.4, 0.7] }, { label: "Dreamy", amount: 0.6, speed: 0.4, p: [0.5, 0.8, 0.2] }] },
  warpSpeed: { label: "Warp speed", cat: 7, mode: 94, tags: "warp speed hyperspace streaks rush zoom fast",
    params: [{ label: "Streaks", def: 0.5 }, { label: "Zoom blur", def: 0.6 }, { label: "Blue tint", def: 0.5 }],
    presets: [{ label: "Hyperspace", amount: 1, speed: 1.5, p: [0.7, 0.8, 0.7] }, { label: "Rush", amount: 0.7, speed: 1, p: [0.4, 0.5, 0] }] },
  bounce: { label: "Bounce", cat: 7, mode: 95, tags: "bounce hop jump camera beat",
    params: [{ label: "Height", def: 0.6 }, { label: "Bounces per second", def: 0.4 }, { label: "Squash", def: 0.5 }],
    presets: [{ label: "Happy hop", amount: 0.7, speed: 1, p: [0.5, 0.5, 0.6] }, { label: "Big jump", amount: 1, speed: 0.7, p: [1, 0.2, 0.8] }] },
  spin: { label: "Spin", cat: 7, mode: 96, tags: "spin rotate turn round camera",
    params: [{ label: "Spin speed", def: 0.3 }, { label: "Direction", def: 0 }, { label: "Zoom to fill", def: 1 }],
    presets: [{ label: "Slow turn", amount: 1, speed: 1, p: [0.1, 0, 1] }, { label: "Twister", amount: 1, speed: 1, p: [0.8, 1, 1] }] },
  echoShake: { label: "Echo shake", cat: 7, mode: 97, tags: "echo shake ghost trail jitter camera handheld",
    params: [{ label: "Shake", def: 0.6 }, { label: "Echo spacing", def: 0.5 }, { label: "Echo strength", def: 0.6 }],
    presets: [{ label: "Ghosty", amount: 0.8, speed: 0.8, p: [0.6, 0.8, 0.8] }, { label: "Party", amount: 1, speed: 1.6, p: [0.9, 0.3, 0.6] }] },
};

/** An effect's extra slider values (0–1), in the order of its `params`. */
export const fxParams = (f) => (EFFECTS[f.type]?.params || []).map((d, i) => f.p?.[i] ?? d.def);

/** Where a light & shadow effect sits and how big it is: [x 0–1 from the left, y 0–1 from the top, size]. */
export const fxPlace = (f) => {
  const d = EFFECTS[f.type]?.place;
  return d ? [f.pos?.[0] ?? d.x ?? 0.5, f.pos?.[1] ?? d.y ?? 0.5, f.pos?.[2] ?? 1] : [0.5, 0.5, 1];
};

/** A new effect entry for an item's fx list. */
export function newFx(type, uid) {
  const def = EFFECTS[type];
  return { id: uid(), type, amount: 0.7, ...(def?.params ? { p: def.params.map((d) => d.def) } : {}) };
}

/** True if an effect matches a search ("glitch", "static", "handheld"…). */
export function fxMatches(type, q) {
  const d = EFFECTS[type];
  if (!q) return true;
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hit = (hay) => words.every((w) => hay.toLowerCase().includes(w));
  // Names and keywords first; the category name only when nothing else matches it.
  return hit(`${d.label} ${d.tags || ""}`) || (!Object.values(EFFECTS).some((e) => hit(`${e.label} ${e.tags || ""}`)) && hit(EFFECT_CATEGORIES[d.cat]));
}

// ---------------- what an item needs ----------------

const isZeroAdjust = (a) => !a || Object.keys(ADJUST).every((k) => !a[k]);

/** Resolved settings for one frame (keyframes already applied by the caller). */
export function hasFx(s) {
  return !!s && (!isZeroAdjust(s.adjust) || (s.filter?.type && s.filter.amount > 0) || s.fx?.some((f) => f.amount > 0 && EFFECTS[f.type]) || s.chroma?.on);
}

// ---------------- shaders ----------------

const VERT = `#version 300 es
in vec2 pos; out vec2 uv;
void main(){ uv = pos * 0.5 + 0.5; gl_Position = vec4(pos, 0.0, 1.0); }`;

const COMMON = `#version 300 es
precision highp float;
in vec2 uv;
out vec4 o;
uniform sampler2D T;
uniform vec2 res;
uniform float time;
float rnd(vec2 c){ return fract(sin(dot(c, vec2(12.9898,78.233))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(rnd(i), rnd(i+vec2(1,0)), f.x), mix(rnd(i+vec2(0,1)), rnd(i+vec2(1,1)), f.x), f.y); }
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
vec3 unpm(vec4 c){ return c.a > 0.0001 ? c.rgb / c.a : vec3(0.0); }
vec4 pm(vec3 rgb, float a){ return vec4(clamp(rgb, 0.0, 1.0) * a, a); }
vec3 hueRotate(vec3 c, float deg){
  float a = radians(deg); float cs = cos(a), sn = sin(a);
  mat3 m = mat3(0.299,0.587,0.114, 0.299,0.587,0.114, 0.299,0.587,0.114)
    + cs * mat3(0.701,-0.587,-0.114, -0.299,0.413,-0.114, -0.300,-0.588,0.886)
    + sn * mat3(0.168,0.330,-0.497, -0.328,0.035,0.292, 1.250,-1.050,-0.203);
  return c * m;
}
vec4 S(vec2 p){ return texture(T, clamp(p, vec2(0.0), vec2(1.0))); }
`;

const GRADE = COMMON + `
uniform float exposure, brightness, contrast, saturation, vibrance, temperature, tint, hue, highlights, shadows, fade, vignette, sharpen, grain;
uniform float gray, sepia;
uniform vec3 shTint, hiTint;
uniform int keyOn; uniform vec3 keyColor; uniform float keySim, keySmooth, keySpill;
vec2 cbcr(vec3 c){ return vec2(-0.1687*c.r - 0.3313*c.g + 0.5*c.b, 0.5*c.r - 0.4187*c.g - 0.0813*c.b); }
void main(){
  vec4 c = texture(T, uv);
  vec3 rgb = unpm(c);
  float a = c.a;
  if (keyOn == 1) {
    float d = distance(cbcr(rgb), cbcr(keyColor));
    float k = smoothstep(keySim, keySim + keySmooth, d);
    a *= k;
    // Spill: pull the key colour's channel down toward the others near the edge.
    float spill = clamp(1.0 - d / max(0.0001, keySim + keySmooth + 0.1), 0.0, 1.0) * keySpill;
    vec3 desat = vec3(luma(rgb));
    rgb = mix(rgb, desat, spill);
  }
  if (sharpen > 0.0) {
    vec2 px = 1.0 / res;
    vec3 n = unpm(S(uv + vec2(px.x,0))) + unpm(S(uv - vec2(px.x,0))) + unpm(S(uv + vec2(0,px.y))) + unpm(S(uv - vec2(0,px.y)));
    rgb += (rgb - n * 0.25) * sharpen * 2.0;
  }
  rgb *= exp2(exposure * 1.5);
  rgb += brightness * 0.25;
  float l = luma(rgb);
  rgb += shadows * 0.3 * (1.0 - smoothstep(0.0, 0.55, l));
  rgb += highlights * 0.3 * smoothstep(0.45, 1.0, l);
  rgb = (rgb - 0.5) * (1.0 + contrast) + 0.5;
  rgb += vec3(temperature * 0.12, temperature * 0.02, -temperature * 0.12);
  rgb += vec3(tint * 0.06, -tint * 0.1, tint * 0.06);
  if (hue != 0.0) rgb = hueRotate(rgb, hue);
  l = luma(rgb);
  rgb = mix(vec3(l), rgb, 1.0 + saturation);
  float mx = max(rgb.r, max(rgb.g, rgb.b)), mn = min(rgb.r, min(rgb.g, rgb.b));
  rgb = mix(vec3(l), rgb, 1.0 + vibrance * (1.0 - (mx - mn)));
  l = clamp(luma(rgb), 0.0, 1.0);
  rgb += shTint * (1.0 - l) * 0.25 + hiTint * l * 0.25;
  rgb = mix(rgb, vec3(luma(rgb)), gray);
  vec3 sep = vec3(dot(rgb, vec3(0.393,0.769,0.189)), dot(rgb, vec3(0.349,0.686,0.168)), dot(rgb, vec3(0.272,0.534,0.131)));
  rgb = mix(rgb, sep, sepia);
  rgb = rgb * (1.0 - fade * 0.35) + fade * 0.12;
  if (vignette != 0.0) {
    vec2 d = (uv - 0.5) * vec2(res.x / res.y, 1.0);
    float v = smoothstep(0.35, 1.0, length(d) * 1.25);
    rgb = vignette > 0.0 ? rgb * (1.0 - vignette * v) : mix(rgb, vec3(1.0), -vignette * v);
  }
  if (grain > 0.0) rgb += (rnd(uv * res + fract(time * 7.13) * 100.0) - 0.5) * grain * 0.22;
  o = pm(rgb, a);
}`;

const EFFECT = COMMON + `
uniform int mode;
uniform float amount;
uniform vec3 P;
uniform vec3 Q; // where a light sits (x, y with y up) and its size
vec2 rot2(vec2 d, float a){ return mat2(cos(a), -sin(a), sin(a), cos(a)) * d; }
vec2 jit(float t){ return vec2(noise(vec2(t * 1.3, 1.7)) + 0.5 * noise(vec2(t * 3.1, 4.2)), noise(vec2(t * 1.1, 7.3)) + 0.5 * noise(vec2(t * 2.9, 9.1))) / 1.5 - 0.5; }
/** How much a picture turned by angle a must be enlarged to still fill the frame. */
float coverZoom(float a, float asp){ float ca = abs(cos(a)), sa = abs(sin(a)); return max(ca + sa / asp * 1.0, ca + sa * asp) ; }
const float PI = 3.14159265;
vec4 blurAt(vec2 p, float r){
  vec4 acc = vec4(0.0); float w = 0.0;
  for (int i = 0; i < 16; i++) {
    float a = float(i) * 2.39996; float d = sqrt(float(i) / 16.0) * r;
    vec2 off = vec2(cos(a), sin(a)) * d * vec2(res.y / res.x, 1.0);
    acc += S(p + off); w += 1.0;
  }
  return acc / w;
}
vec4 blendScreen(vec4 base, vec3 light){ vec3 b = unpm(base); return pm(1.0 - (1.0 - b) * (1.0 - light), base.a); }
float edge(vec2 p){
  vec2 px = 1.0 / res;
  float tl = luma(S(p + vec2(-px.x, px.y)).rgb), t = luma(S(p + vec2(0, px.y)).rgb), tr = luma(S(p + px).rgb);
  float l = luma(S(p - vec2(px.x, 0)).rgb), r = luma(S(p + vec2(px.x, 0)).rgb);
  float bl = luma(S(p - px).rgb), b = luma(S(p - vec2(0, px.y)).rgb), br = luma(S(p + vec2(px.x, -px.y)).rgb);
  float gx = -tl - 2.0*l - bl + tr + 2.0*r + br, gy = -tl - 2.0*t - tr + bl + 2.0*b + br;
  return length(vec2(gx, gy));
}
void main(){
  float A = amount; vec2 p = uv; float asp = res.x / res.y; vec4 c;
  if (mode == 1) { // glitch: bursts of block offsets + colour split
    float burst = step(0.55, noise(vec2(time * 6.0, 1.0)));
    float k = A * (0.3 + 0.7 * burst);
    float band = floor(p.y * 18.0);
    float shift = (rnd(vec2(band, floor(time * 15.0))) - 0.5) * 0.12 * k * step(0.6, rnd(vec2(band * 3.1, floor(time * 9.0))));
    vec2 g = vec2(p.x + shift, p.y);
    float s = 0.012 * k;
    c = vec4(S(g + vec2(s, 0)).r, S(g).g, S(g - vec2(s, 0)).b, S(g).a);
  } else if (mode == 2) {
    float s = 0.012 * A * (0.7 + 0.3 * sin(time * 3.0));
    c = vec4(S(p + vec2(s, 0)).r, S(p).g, S(p - vec2(s, 0)).b, S(p).a);
  } else if (mode == 3) { // shake: zoom in a little to hide the edges
    float t = floor(time * 24.0);
    vec2 j = (vec2(rnd(vec2(t, 1.0)), rnd(vec2(t, 2.0))) - 0.5) * 0.04 * A;
    c = S((p - 0.5) / (1.0 + 0.05 * A) + 0.5 + j);
  } else if (mode == 4) {
    c = S(p + vec2(sin(p.y * 22.0 + time * 4.0) * 0.012 * A, 0.0));
  } else if (mode == 5) {
    vec2 d = (p - 0.5) * vec2(asp, 1.0); float r = length(d);
    c = S(p + normalize(d + 1e-5) / vec2(asp, 1.0) * sin(r * 40.0 - time * 8.0) * 0.008 * A);
  } else if (mode == 6) {
    vec2 d = (p - 0.5) * vec2(asp, 1.0); float r = length(d);
    float ang = A * 3.0 * smoothstep(0.6, 0.0, r) * sin(time * 0.8 + 1.0);
    d = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * d;
    c = S(d / vec2(asp, 1.0) + 0.5);
  } else if (mode == 7 || mode == 8) {
    vec2 d = (p - 0.5) * vec2(asp, 1.0); float r = length(d);
    float k = mode == 7 ? 1.0 - A * 0.5 * smoothstep(0.7, 0.0, r) : 1.0 + A * 0.6 * smoothstep(0.7, 0.0, r);
    c = S(d * k / vec2(asp, 1.0) + 0.5);
  } else if (mode == 9) {
    float s = mix(0.002, 0.05, A);
    vec2 cell = vec2(s / asp, s);
    c = S((floor(p / cell) + 0.5) * cell);
  } else if (mode == 10) {
    c = S(p);
    float blk = rnd(floor(p * vec2(40.0, 24.0)) + floor(time * 12.0));
    float on = step(1.0 - A * 0.25, blk);
    vec3 n = vec3(rnd(p * res + time), rnd(p * res + time + 1.0), rnd(p * res + time + 2.0));
    vec3 rgb = mix(unpm(c), n, on * 0.85);
    rgb += (rnd(vec2(floor(p.y * res.y * 0.5), time)) - 0.5) * 0.08 * A;
    c = pm(rgb, c.a);
  } else if (mode == 12) {
    float n = floor(p.y * 12.0);
    float dir = mod(n, 2.0) * 2.0 - 1.0;
    c = S(p + vec2(dir * 0.04 * A * sin(time * 2.0 + n), 0.0));
  } else if (mode == 20) {
    c = blurAt(p, 0.03 * A);
  } else if (mode == 21) {
    vec4 acc = vec4(0.0);
    for (int i = 0; i < 16; i++) acc += S((p - 0.5) * (1.0 - A * 0.25 * float(i) / 16.0) + 0.5);
    c = acc / 16.0;
  } else if (mode == 22) {
    vec4 acc = vec4(0.0);
    for (int i = 0; i < 16; i++) acc += S(p + vec2((float(i) / 15.0 - 0.5) * 0.06 * A, 0.0));
    c = acc / 16.0;
  } else if (mode == 23) {
    float band = smoothstep(0.12, 0.45, abs(p.y - 0.5));
    c = blurAt(p, 0.025 * A * band);
    vec3 rgb = mix(unpm(c), mix(vec3(luma(unpm(c))), unpm(c), 1.35), A);
    c = pm(rgb, c.a);
  } else if (mode == 24) {
    vec2 d = p - 0.5;
    float s = 0.025 * A;
    c = vec4(S(p + d * s).r, S(p).g, S(p - d * s).b, S(p).a);
  } else if (mode == 25) {
    vec2 d = (p - 0.5) * vec2(asp, 1.0); float r2 = dot(d, d);
    vec2 q = d * (1.0 + A * 0.6 * r2) / (1.0 + A * 0.25);
    c = S(q / vec2(asp, 1.0) + 0.5);
    c.rgb *= 1.0 - A * 0.5 * smoothstep(0.3, 0.9, sqrt(r2));
  } else if (mode == 26) {
    vec4 b = blurAt(p, 0.02);
    vec4 base = S(p);
    c = mix(base, blendScreen(base, unpm(b) * 0.8), A);
    c.rgb = mix(c.rgb, c.rgb * 1.08 + 0.03 * c.a, A);
  } else if (mode == 27) {
    float k = 0.5 + 0.5 * sin(time * 1.5);
    c = blurAt(p, 0.03 * A * k);
  } else if (mode == 30) {
    vec4 b = blurAt(p, 0.025 * Q.z);
    vec3 bright = max(unpm(b) - 0.55, 0.0) * 2.2;
    c = blendScreen(S(p), bright * A);
  } else if (mode == 31) {
    vec2 q = p * vec2(asp, 1.0);
    float l1 = smoothstep(0.9 * Q.z, 0.0, distance(q, vec2(asp * (Q.x + 0.12 * sin(time * 0.7)), Q.y)));
    float l2 = smoothstep(0.8 * Q.z, 0.0, distance(q, vec2(asp * (1.0 - Q.x * 0.9 + 0.08 * sin(time * 0.5 + 2.0)), 1.05 - Q.y)));
    vec3 light = vec3(1.0, 0.45, 0.15) * l1 + vec3(1.0, 0.75, 0.3) * l2 * 0.7;
    c = blendScreen(S(p), light * A * (0.8 + 0.2 * sin(time * 2.3)));
  } else if (mode == 32) {
    float f = pow(max(0.0, sin(time * 3.0)), 12.0);
    c = S(p); c.rgb = mix(c.rgb, vec3(c.a), f * A);
  } else if (mode == 34) {
    vec2 src = vec2(Q.x + 0.05 * sin(time * 0.6), Q.y);
    vec4 acc = vec4(0.0);
    for (int i = 0; i < 24; i++) { float t = float(i) / 24.0; vec4 s = S(mix(p, src, t * min(0.95, 0.6 * Q.z))); acc += vec4(max(unpm(s) - 0.6, 0.0), 0.0) * (1.0 - t); }
    c = blendScreen(S(p), acc.rgb / 8.0 * A * vec3(1.0, 0.95, 0.8));
  } else if (mode == 35) {
    vec2 q = p * vec2(asp, 1.0);
    vec2 sun = vec2(asp * (Q.x + 0.04 * sin(time * 0.4)), Q.y + 0.02 * cos(time * 0.5));
    vec2 axis = vec2(asp * 0.5, 0.5) - sun;
    vec3 light = vec3(1.0, 0.9, 0.7) * smoothstep(0.25 * Q.z, 0.0, distance(q, sun));
    for (int i = 1; i < 5; i++) { vec2 g = sun + axis * float(i) * 0.5; light += vec3(0.4, 0.6, 1.0) * smoothstep(0.06 * float(i) * Q.z, 0.0, distance(q, g)) * 0.35; }
    c = blendScreen(S(p), light * A);
  } else if (mode == 36) {
    float e = smoothstep(0.15, 0.6, edge(p));
    vec3 col = 0.5 + 0.5 * cos(time + p.xyx * 3.0 + vec3(0, 2, 4));
    vec4 base = S(p);
    vec3 rgb = mix(unpm(base), unpm(base) * 0.25 + col * e * 1.5, A);
    c = pm(rgb, base.a);
  } else if (mode == 37) {
    vec2 q = p * vec2(asp, 1.0);
    vec2 ctr = vec2(asp * (Q.x + 0.3 * P.x * sin(time * 0.6)), Q.y + 0.2 * P.x * cos(time * 0.8));
    float l = smoothstep(0.55 * Q.z, 0.15 * Q.z, distance(q, ctr));
    c = S(p); c.rgb *= mix(1.0, 0.15 + 0.95 * l, A);
  } else if (mode == 38) {
    vec2 d = (p - Q.xy) * vec2(asp, 1.0);
    float k = 0.5 + 0.5 * sin(time * 4.0);
    c = S(p); c.rgb *= 1.0 - A * k * smoothstep(0.25 * Q.z, 0.9 * Q.z, length(d));
  } else if (mode == 40) {
    c = S(p); vec3 rgb = unpm(c);
    rgb += (rnd(p * res + fract(time * 13.7) * 200.0) - 0.5) * 0.35 * A;
    c = pm(rgb, c.a);
  } else if (mode == 41) {
    float jitter = (rnd(vec2(floor(time * 18.0), 3.0)) - 0.5) * 0.004 * A;
    c = S(p + vec2(0.0, jitter)); vec3 rgb = unpm(c);
    vec3 sep = vec3(dot(rgb, vec3(0.393,0.769,0.189)), dot(rgb, vec3(0.349,0.686,0.168)), dot(rgb, vec3(0.272,0.534,0.131)));
    rgb = mix(rgb, sep, A);
    float sx = rnd(vec2(floor(time * 18.0), 7.0));
    rgb *= 1.0 - A * 0.6 * step(abs(p.x - sx), 0.0015) * step(0.5, rnd(vec2(floor(time * 18.0), 9.0)));
    rgb *= 1.0 - A * 0.08 * rnd(vec2(floor(time * 24.0), 1.0));
    rgb -= A * 0.6 * step(0.9985, rnd(floor(p * res / 3.0) + floor(time * 18.0)));
    vec2 d = (p - 0.5) * vec2(asp, 1.0);
    rgb *= 1.0 - A * 0.55 * smoothstep(0.35, 1.0, length(d) * 1.2);
    c = pm(rgb, c.a);
  } else if (mode == 42) {
    float line = step(0.985, fract(p.y * 3.0 - time * 0.6));
    float j = (noise(vec2(p.y * 80.0, time * 10.0)) - 0.5) * 0.01 * A + line * 0.02 * A;
    vec2 g = p + vec2(j, 0.0);
    float s = 0.006 * A;
    vec3 rgb = vec3(S(g + vec2(s, 0)).r, S(g).g, S(g - vec2(s * 1.5, 0)).b);
    rgb = mix(rgb, vec3(luma(rgb)), 0.15 * A);
    rgb += (rnd(p * res + time) - 0.5) * 0.12 * A;
    rgb *= 1.0 - 0.15 * A * step(0.5, fract(p.y * res.y * 0.5));
    c = pm(rgb, S(g).a);
  } else if (mode == 43) {
    vec2 d = p - 0.5; d *= 1.0 + A * 0.18 * dot(d, d) * 4.0;
    vec2 q = d + 0.5;
    if (any(lessThan(q, vec2(0.0))) || any(greaterThan(q, vec2(1.0)))) { c = vec4(0.0, 0.0, 0.0, 1.0); }
    else {
      c = S(q); vec3 rgb = unpm(c);
      float scan = 0.5 + 0.5 * sin(q.y * res.y * 1.4);
      rgb *= mix(1.0, 0.7 + 0.3 * scan, A);
      float m = mod(floor(q.x * res.x), 3.0);
      rgb *= mix(vec3(1.0), m < 1.0 ? vec3(1.15, 0.9, 0.9) : m < 2.0 ? vec3(0.9, 1.15, 0.9) : vec3(0.9, 0.9, 1.15), A);
      c = pm(rgb * (1.0 + 0.15 * A), c.a);
    }
  } else if (mode == 44) {
    c = S(p); vec3 rgb = unpm(c);
    vec3 sep = vec3(dot(rgb, vec3(0.393,0.769,0.189)), dot(rgb, vec3(0.349,0.686,0.168)), dot(rgb, vec3(0.272,0.534,0.131)));
    c = pm(mix(rgb, sep, A), c.a);
  } else if (mode == 45) {
    float cell = mix(0.004, 0.02, A);
    vec2 g = vec2(cell / asp, cell);
    vec2 ctr = (floor(p / g) + 0.5) * g;
    vec4 s = S(ctr); float l = luma(unpm(s));
    float r = distance((p - ctr) / g, vec2(0.0));
    float dot_ = step(r, (1.0 - l) * 0.7);
    vec3 rgb = mix(vec3(1.0), unpm(s) * 0.6, dot_);
    c = mix(S(p), pm(rgb, s.a), A);
  } else if (mode == 46) {
    c = S(p); float n = mix(16.0, 3.0, A);
    c = pm(floor(unpm(c) * n + 0.5) / n, c.a);
  } else if (mode == 47) {
    float s = mix(0.004, 0.02, A);
    vec2 cell = vec2(s / asp, s);
    c = S((floor(p / cell) + 0.5) * cell);
    c = pm(floor(unpm(c) * 4.0 + 0.5) / 4.0, c.a);
  } else if (mode == 48) {
    c = S(p);
    ivec2 ip = ivec2(mod(floor(p * res / mix(1.0, 3.0, A)), 4.0));
    int idx = ip.x + ip.y * 4;
    float bayer[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
    float th = (bayer[idx] + 0.5) / 16.0;
    vec3 rgb = unpm(c);
    vec3 q = step(vec3(th), rgb);
    c = pm(mix(rgb, q, A), c.a);
  } else if (mode == 49) {
    c = S(p); vec3 rgb = unpm(c);
    rgb = rgb * 0.85 + 0.1; rgb += vec3(0.06, 0.03, -0.04);
    rgb = mix(vec3(luma(rgb)), rgb, 0.8);
    vec2 d = (p - 0.5) * vec2(asp, 1.0);
    rgb *= 1.0 - 0.35 * smoothstep(0.4, 1.0, length(d) * 1.2);
    c = mix(c, pm(rgb, c.a), A);
  } else if (mode == 50) {
    float on = step(0.5, fract(time * 8.0));
    c = S(p); c.rgb = mix(c.rgb, c.rgb * (on > 0.5 ? 1.8 : 0.25), A);
  } else if (mode == 51) {
    c = S(p); c = pm(mix(unpm(c), hueRotate(unpm(c), time * 120.0), A), c.a);
  } else if (mode == 52) {
    vec2 d = (p - 0.5) * vec2(asp, 1.0);
    float ang = atan(d.y, d.x) + time * 0.3 * A; float r = length(d);
    float seg = PI / 3.0;
    ang = mod(ang, 2.0 * seg); ang = abs(ang - seg);
    vec2 q = vec2(cos(ang), sin(ang)) * r / vec2(asp, 1.0) + 0.5;
    c = mix(S(p), S(q), A);
  } else if (mode == 53) {
    vec2 q = vec2(p.x < 0.5 ? p.x : 1.0 - p.x, p.y); c = mix(S(p), S(q), A);
  } else if (mode == 54) {
    vec2 q = vec2(p.x, p.y > 0.5 ? p.y : 1.0 - p.y); c = mix(S(p), S(q), A);
  } else if (mode == 55) {
    vec2 q = abs(fract(p * 2.0) - 0.5 * 0.0); q = vec2(p.x < 0.5 ? p.x * 2.0 : 2.0 - p.x * 2.0, p.y < 0.5 ? p.y * 2.0 : 2.0 - p.y * 2.0);
    c = mix(S(p), S(q), A);
  } else if (mode == 56) {
    vec2 q = p * vec2(asp, 1.0);
    vec3 light = vec3(0.0);
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      vec2 ctr = vec2(asp * (0.5 + 0.45 * sin(time * (0.7 + fi * 0.3) + fi * 2.0)), 0.5 + 0.4 * cos(time * (0.9 + fi * 0.2) + fi));
      vec3 col = 0.5 + 0.5 * cos(fi * 1.7 + vec3(0, 2, 4));
      light += col * smoothstep(0.35, 0.0, distance(q, ctr));
    }
    vec4 base = S(p);
    c = pm(unpm(base) * (1.0 - 0.45 * A) + light * A * 0.9, base.a);
  } else if (mode == 57) {
    float beat = pow(max(0.0, sin(time * PI * 2.0)), 8.0);
    c = S((p - 0.5) / (1.0 + 0.12 * A * beat) + 0.5);
  } else if (mode == 58) {
    vec2 q = vec2(fract(p.x * 3.0) / 3.0 + 1.0 / 3.0, p.y);
    c = mix(S(p), S(q), A);
  } else if (mode == 59) {
    vec4 base = S(p);
    vec3 rb = 0.5 + 0.5 * cos(6.2831 * (p.x * 0.8 + p.y * 0.3 - time * 0.25) + vec3(0, 2, 4));
    vec3 b = unpm(base);
    vec3 soft = mix(2.0 * b * rb + b * b * (1.0 - 2.0 * rb), sqrt(b) * (2.0 * rb - 1.0) + 2.0 * b * (1.0 - rb), step(0.5, rb));
    c = pm(mix(b, soft, A * 0.8), base.a);
  } else if (mode == 60) {
    float beat = pow(max(0.0, sin(time * PI * 2.0)), 6.0);
    float s = 0.02 * A * (0.3 + beat);
    float t = floor(time * 20.0);
    vec2 j = (vec2(rnd(vec2(t, 1.0)), rnd(vec2(t, 2.0))) - 0.5) * 0.02 * A * beat;
    vec2 g = (p - 0.5) / (1.0 + 0.04 * A) + 0.5 + j;
    c = vec4(S(g + vec2(s, 0)).r, S(g).g, S(g - vec2(s, 0)).b, S(g).a);
  } else if (mode == 70) {
    float e = edge(p);
    vec3 rgb = vec3(1.0 - smoothstep(0.05, 0.5, e));
    rgb *= 0.92 + 0.08 * noise(p * res * 0.5);
    vec4 base = S(p);
    c = pm(mix(unpm(base), rgb, A), base.a);
  } else if (mode == 71) {
    vec4 base = S(p);
    vec3 q = floor(unpm(base) * 4.0 + 0.5) / 4.0;
    q = mix(vec3(luma(q)), q, 1.4);
    q *= 1.0 - smoothstep(0.25, 0.6, edge(p));
    c = pm(mix(unpm(base), q, A), base.a);
  } else if (mode == 72) {
    c = S(p); c = pm(mix(unpm(c), 1.0 - unpm(c), A), c.a);
  } else if (mode == 73) {
    c = S(p); float l = luma(unpm(c));
    vec3 th = l < 0.33 ? mix(vec3(0.05, 0.0, 0.3), vec3(0.6, 0.0, 0.6), l / 0.33)
      : l < 0.66 ? mix(vec3(0.6, 0.0, 0.6), vec3(1.0, 0.5, 0.0), (l - 0.33) / 0.33)
      : mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 1.0, 0.7), (l - 0.66) / 0.34);
    c = pm(mix(unpm(c), th, A), c.a);
  } else if (mode == 74) {
    c = S(p); float l = luma(unpm(c)) * 1.6;
    vec3 rgb = vec3(0.1, 1.0, 0.25) * l;
    rgb += (rnd(p * res + time) - 0.5) * 0.2;
    vec2 d = (p - 0.5) * vec2(asp, 1.0);
    rgb *= 1.0 - smoothstep(0.35, 0.75, length(d));
    c = pm(mix(unpm(c), rgb, A), c.a);
  } else if (mode == 75) {
    c = S(p); float l = luma(unpm(c));
    vec3 rgb = mix(vec3(0.18, 0.05, 0.45), vec3(1.0, 0.6, 0.2), smoothstep(0.05, 0.95, l));
    c = pm(mix(unpm(c), rgb, A), c.a);
  } else if (mode == 76) {
    vec2 px = 1.0 / res;
    float e = luma(unpm(S(p - px))) - luma(unpm(S(p + px)));
    vec4 base = S(p);
    c = pm(mix(unpm(base), vec3(0.5 + e * 2.0), A), base.a);
  } else if (mode == 78) {
    c = S(p); float l = 1.0 - luma(unpm(c));
    c = pm(mix(unpm(c), vec3(l * 0.75, l * 0.9, l * 1.1), A), c.a);
  } else if (mode == 79) {
    c = S(p); vec3 rgb = unpm(c);
    float red = smoothstep(0.08, 0.25, rgb.r - max(rgb.g, rgb.b));
    c = pm(mix(rgb, mix(vec3(luma(rgb)), rgb, red), A), c.a);
  } else if (mode == 80) { // static noise: drifting TV snow with a sideways colour split
    float sz = mix(1.0, 5.0, P.y);
    float tt = floor(time * 30.0);
    vec2 cell = floor(vec2((p.x * res.x + time * 900.0) / (sz * 2.0), p.y * res.y / sz));
    float n = rnd(cell + vec2(tt * 1.37, tt * 0.71));
    vec3 snow = mix(vec3(n), vec3(rnd(cell + tt + 1.3), rnd(cell + tt + 2.7), rnd(cell + tt + 4.1)), P.z);
    float band = 0.7 + 0.3 * sin(p.y * 7.0 + time * 4.0);
    float s = 0.025 * P.x * A * (0.6 + 0.4 * sin(time * 5.0));
    vec4 base = S(p);
    vec3 rgb = vec3(unpm(S(p + vec2(s, 0))).r, unpm(base).g, unpm(S(p - vec2(s, 0))).b);
    rgb = mix(rgb, snow, clamp(A * 0.7 * band, 0.0, 1.0));
    c = pm(rgb, max(base.a, A * 0.8));
  } else if (mode == 81) { // signal glitch: horizontal tears, block artifacts, signal drops
    float tt = floor(time * 12.0);
    float row = floor(p.y * 40.0);
    float tear = step(1.0 - 0.3 * P.x * A, rnd(vec2(row, tt)));
    float tearBand = step(0.72, noise(vec2(p.y * 8.0, time * 4.0)));
    float off = (rnd(vec2(row * 1.7, tt)) - 0.5) * 0.3 * A * P.x * max(tear, tearBand * 0.35);
    vec2 g = vec2(fract(p.x + off), p.y);
    vec2 blk = floor(p * vec2(16.0, 9.0));
    float bon = step(1.0 - 0.2 * P.y * A, rnd(blk + tt));
    g += (vec2(rnd(blk + tt + 3.0), rnd(blk + tt + 5.0)) - 0.5) * 0.15 * bon;
    float s = 0.015 * A;
    vec3 rgb = vec3(unpm(S(g + vec2(s, 0))).r, unpm(S(g)).g, unpm(S(g - vec2(s, 0))).b);
    rgb = mix(rgb, floor(mix(rgb, rgb.gbr, 0.6) * 5.0) / 5.0 * 1.2, bon * 0.6);
    float drop = step(1.0 - 0.12 * P.z * A, rnd(vec2(tt, 9.0)));
    float lineDrop = step(1.0 - 0.25 * P.z * A, rnd(vec2(floor(p.y * 120.0), tt * 3.1)));
    rgb = mix(rgb, vec3(rnd(floor(p * res / 2.0) + tt)), drop * 0.85);
    rgb *= 1.0 - lineDrop * 0.85;
    c = pm(rgb, S(g).a);
  } else if (mode == 82) { // retro TV: curved screen, rolling bar, scanlines, faded colour
    vec2 d = p - 0.5; d *= 1.0 + P.x * A * 0.3 * dot(d, d) * 4.0;
    vec2 q = d + 0.5;
    if (any(lessThan(q, vec2(0.0))) || any(greaterThan(q, vec2(1.0)))) { c = vec4(0.0, 0.0, 0.0, 1.0); }
    else {
      float jit = (rnd(vec2(floor(time * 20.0), floor(q.y * 200.0))) - 0.5) * 0.002 * A;
      vec4 base = S(q + vec2(jit, 0.0)); vec3 rgb = unpm(base);
      rgb = mix(vec3(luma(rgb)), rgb, mix(1.0, P.z, A));
      rgb = mix(rgb, rgb * vec3(1.06, 1.0, 0.82), A * 0.5);
      float scan = 0.5 + 0.5 * sin(q.y * res.y * 1.6);
      rgb *= 1.0 - P.y * A * 0.5 * (1.0 - scan);
      float bar = fract(q.y * 0.8 + time * 0.2);
      rgb *= 1.0 + 0.2 * A * smoothstep(0.0, 0.06, bar) * smoothstep(0.18, 0.06, bar);
      rgb += (rnd(q * res + fract(time) * 97.0) - 0.5) * 0.08 * A;
      rgb *= 1.0 - A * 0.7 * smoothstep(0.3, 0.75, length(q - 0.5));
      rgb *= 1.0 - 0.05 * A * rnd(vec2(floor(time * 24.0), 2.0));
      c = pm(rgb, max(base.a, A));
    }
  } else if (mode == 83) { // VCR tape: tracking wobble, rolling tracking band, colour bleed, tape noise
    float bandY = fract(-time * 0.15);
    float inBand = smoothstep(0.06, 0.0, abs(p.y - bandY));
    float bottom = smoothstep(0.06, 0.0, p.y);
    float shift = ((noise(vec2(p.y * 60.0, time * 8.0)) - 0.5) * 0.008 + inBand * 0.05 * (noise(vec2(p.y * 200.0, time * 20.0)) - 0.3)) * P.x * A;
    shift += bottom * 0.05 * P.x * A * (rnd(vec2(floor(p.y * res.y / 2.0), floor(time * 30.0))) - 0.5);
    vec2 g = p + vec2(shift, 0.0);
    float s = (0.003 + 0.012 * P.z) * A;
    vec3 rgb = vec3(unpm(S(g + vec2(s, 0))).r, unpm(S(g)).g, unpm(S(g - vec2(s * 1.5, 0))).b);
    rgb = mix(rgb, vec3(luma(rgb)), 0.12 * A) * mix(vec3(1.0), vec3(1.02, 0.98, 1.08), A);
    rgb += (rnd(vec2(floor(p.x * res.x * 0.5 + time * 100.0), floor(p.y * res.y / 2.0) + floor(time * 30.0))) - 0.5) * 0.28 * P.y * A;
    rgb += inBand * P.x * A * 0.35 * step(0.7, rnd(vec2(floor(p.x * res.x * 0.3), floor(time * 30.0) + floor(p.y * 400.0))));
    rgb = mix(rgb, vec3(rnd(floor(p * res / 2.0) + floor(time * 30.0))), bottom * P.x * A * 0.7);
    rgb *= 1.0 - 0.12 * A * step(0.5, fract(p.y * res.y * 0.5));
    c = pm(rgb, S(g).a);
  } else if (mode == 84) { // handheld: smooth organic sway, tilt and breathing zoom (zoomed in to hide the edges)
    vec2 j = vec2(noise(vec2(time * 1.3, 1.7)) + 0.5 * noise(vec2(time * 3.1, 4.2)), noise(vec2(time * 1.1, 7.3)) + 0.5 * noise(vec2(time * 2.9, 9.1))) / 1.5 - 0.5;
    j *= 0.06 * A * P.x;
    float ang = (noise(vec2(time * 0.9, 12.0)) - 0.5) * 0.09 * A * P.y;
    float z = 1.0 + A * (0.07 * P.x + 0.05 * P.y) + 0.04 * A * P.z * (0.5 + 0.5 * sin(time * 1.4));
    vec2 d = (p - 0.5) * vec2(asp, 1.0);
    d = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * d;
    c = S(d / vec2(asp, 1.0) / z + 0.5 + j);
  } else if (mode == 85) { // sun rays: shimmering beams from a sun just above the frame, with haze and warmth
    vec2 src = vec2(Q.x + 0.03 * sin(time * 0.5), Q.y);
    vec2 dir = (p - src) * vec2(asp, 1.0);
    float r = length(dir);
    float ang = atan(dir.x, -dir.y);
    float rays = noise(vec2(ang * mix(4.0, 16.0, P.z), time * 0.6)) + 0.6 * noise(vec2(ang * mix(10.0, 40.0, P.z), time * 1.1 + 5.0));
    rays = pow(rays / 1.6, 2.2) * smoothstep(1.7 * Q.z, 0.0, r);
    vec3 acc = vec3(0.0);
    for (int i = 0; i < 16; i++) { float t = float(i) / 16.0; acc += max(unpm(S(mix(p, src, t * 0.5))) - 0.55, 0.0) * (1.0 - t); }
    vec3 warm = mix(vec3(1.0, 0.97, 0.9), vec3(1.0, 0.6, 0.22), P.y);
    vec3 light = warm * (rays * 1.3 + P.x * 0.45 * smoothstep(1.5 * Q.z, 0.0, r) + smoothstep(0.4 * Q.z, 0.0, r) * 0.8) + acc / 6.0 * warm;
    vec4 base = S(p);
    vec4 tinted = pm(mix(unpm(base), unpm(base) * mix(vec3(1.0), vec3(1.08, 1.0, 0.86), P.y), A), base.a);
    c = blendScreen(tinted, light * A);
  } else if (mode == 86) { // long exposure (approximation): bright parts leave trails along a direction
    float ang = P.y * PI;
    vec2 dir = vec2(cos(ang), sin(ang)) * vec2(1.0 / asp, 1.0) * 0.15 * P.x * A * (0.85 + 0.15 * sin(time * 1.5));
    vec4 base = S(p); vec3 trail = vec3(0.0);
    for (int i = 1; i <= 20; i++) {
      float t = float(i) / 20.0; vec3 s = unpm(S(p - dir * t));
      trail = max(trail, s * smoothstep(mix(0.0, 0.75, P.z), 1.0, luma(s)) * (1.0 - t * 0.9));
    }
    c = pm(max(unpm(base), trail), base.a);
  } else if (mode == 87) { // dolly zoom (vertigo): the middle pushes in while the edges stretch away
    float z = 1.0 + 0.3 * A * (0.5 - 0.5 * cos(time * 1.2));
    vec2 d = (p - 0.5) * vec2(asp, 1.0);
    float rmax2 = 0.25 * (asp * asp + 1.0);
    float k = P.x * (z - 1.0) / rmax2;
    c = S(d * (1.0 + k * dot(d, d)) / z / vec2(asp, 1.0) + 0.5);
  } else if (mode == 88) { // whip pan: a fast blurred swish to the side, then the shot settles again
    float period = mix(0.8, 4.0, P.z);
    float t = fract(time / period);
    float sw = smoothstep(0.38, 0.62, t), v = 4.0 * sw * (1.0 - sw);
    float ang = P.y * 2.0 * PI;
    vec2 dir = vec2(cos(ang), sin(ang));
    vec2 base = p + dir * sw * P.x;
    vec4 acc = vec4(0.0);
    for (int i = 0; i < 16; i++) { float o = (float(i) / 15.0 - 0.5) * v * 0.35 * A; acc += S(fract(base + dir * o)); }
    c = acc / 16.0;
  } else if (mode == 89) { // crash zoom: a sudden punch-in with zoom blur, easing back out
    float period = mix(0.8, 4.0, P.z);
    float t = fract(time / period);
    float e = smoothstep(0.0, 0.1, t) * (1.0 - smoothstep(0.45, 1.0, t));
    float z = 1.0 + P.x * 0.8 * A * e;
    float bl = (1.0 - smoothstep(0.0, 0.18, t)) * smoothstep(0.0, 0.02, t) * 0.25 * A * P.y + 0.02 * A * P.y * e;
    vec4 acc = vec4(0.0);
    for (int i = 0; i < 14; i++) { float k = 1.0 - bl * float(i) / 13.0; acc += S((p - 0.5) / z * k + 0.5); }
    c = acc / 14.0;
  } else if (mode == 90) { // tilt sway: the camera rolls gently side to side (zoomed in to hide the corners)
    float ang = (sin(time * 1.1) * 0.75 + (noise(vec2(time * 0.7, 3.0)) - 0.5) * 0.5) * 0.14 * A * P.x;
    float bob = sin(time * 2.2) * 0.012 * A * P.y;
    vec2 d = rot2((p - 0.5) * vec2(asp, 1.0), ang) / coverZoom(ang, asp) / (1.0 + 0.03 * A * P.y);
    c = S(d / vec2(asp, 1.0) + 0.5 + vec2(0.0, bob));
  } else if (mode == 91) { // 3D swing: the picture turns like a card in space
    float ty = sin(time * 0.8) * 0.5 * A * P.x, tx = sin(time * 0.6 + 1.0) * 0.35 * A * P.y;
    vec2 d = (p - 0.5) * vec2(asp, 1.0);
    float D = 2.2;
    float u = d.x * D / (D * cos(ty) - d.x * sin(ty));
    float v = d.y * (D + u * sin(ty)) / D;
    float v2 = v * D / (D * cos(tx) - v * sin(tx));
    float u2 = u * (D + v2 * sin(tx)) / D;
    float z = 1.0 + (abs(sin(ty)) + abs(sin(tx))) * mix(0.55, 0.0, P.z);
    c = S(vec2(u2, v2) / z / vec2(asp, 1.0) + 0.5);
  } else if (mode == 92) { // drone drift: a slow floating glide with a gentle turn
    vec2 dr = (vec2(noise(vec2(time * 0.15, 2.0)), noise(vec2(time * 0.13, 8.0))) - 0.5) * 0.12 * A * P.x;
    float ang = sin(time * 0.2) * 0.04 * A * P.y;
    float z = coverZoom(ang, asp) * (1.0 + 0.1 * A * P.x + 0.06 * A * P.z * (0.5 + 0.5 * sin(time * 0.25)));
    vec2 d = rot2((p - 0.5) * vec2(asp, 1.0), ang) / z;
    c = S(d / vec2(asp, 1.0) + 0.5 + dr);
  } else if (mode == 93) { // focus breathing: the lens drifts in and out of focus
    float w = 0.5 + 0.5 * sin(time * 1.2);
    float z = 1.0 + 0.03 * A * P.y * w;
    vec2 q = (p - 0.5) / z + 0.5;
    c = blurAt(q, 0.03 * A * P.x * pow(w, mix(1.0, 3.0, P.z)));
  } else if (mode == 94) { // warp speed: streaks rushing out from the middle
    vec2 d = (p - 0.5) * vec2(asp, 1.0);
    float r = length(d), ang = atan(d.y, d.x);
    vec4 acc = vec4(0.0);
    for (int i = 0; i < 16; i++) { float k = 1.0 - 0.18 * A * P.y * float(i) / 15.0; acc += S((p - 0.5) * k + 0.5); }
    vec4 base = acc / 16.0;
    float lanes = floor(ang * mix(20.0, 80.0, P.x) / 6.2832);
    float seed = rnd(vec2(lanes, 3.7));
    float streak = step(0.55, seed) * smoothstep(0.0, 0.03, fract(r * 1.5 - time * (1.0 + seed * 2.0) + seed) ) * (1.0 - smoothstep(0.03, 0.35, fract(r * 1.5 - time * (1.0 + seed * 2.0) + seed)));
    streak *= smoothstep(0.05, 0.5, r);
    vec3 col = mix(vec3(1.0), vec3(0.45, 0.9, 1.0), P.z);
    c = blendScreen(base, col * streak * A * 1.2);
  } else if (mode == 95) { // bounce: the camera hops up and down with a little squash on landing
    float ph = fract(time * mix(0.6, 2.5, P.y));
    float h = 4.0 * ph * (1.0 - ph);
    float land = 1.0 - smoothstep(0.0, 0.12, min(ph, 1.0 - ph));
    vec2 d = (p - 0.5) * vec2(asp, 1.0);
    d.y /= 1.0 - 0.08 * A * P.z * land;
    d.x /= 1.0 + 0.05 * A * P.z * land;
    float z = 1.0 + 0.1 * A * P.x + 0.05 * A * P.z;
    c = S(d / z / vec2(asp, 1.0) + 0.5 - vec2(0.0, h * 0.08 * A * P.x));
  } else if (mode == 96) { // spin: the picture turns round and round
    float ang = time * mix(0.2, 4.0, P.x) * (P.y < 0.5 ? 1.0 : -1.0) * A;
    float z = mix(1.0, coverZoom(ang, asp), P.z);
    vec2 d = rot2((p - 0.5) * vec2(asp, 1.0), ang) / z;
    vec2 q = d / vec2(asp, 1.0) + 0.5;
    c = (any(lessThan(q, vec2(0.0))) || any(greaterThan(q, vec2(1.0)))) ? vec4(0.0, 0.0, 0.0, 1.0) : S(q);
  } else if (mode == 97) { // echo shake: a jittery camera leaving fading copies of itself
    vec4 acc = vec4(0.0); float wsum = 0.0;
    float z = 1.0 + 0.08 * A * P.x;
    for (int i = 0; i < 5; i++) {
      float fi = float(i), w = i == 0 ? 1.0 : P.z * pow(0.7, fi);
      vec2 j = jit(time * 2.5 - fi * mix(0.02, 0.15, P.y)) * 0.07 * A * P.x;
      acc += S((p - 0.5) / z + 0.5 + j) * w; wsum += w;
    }
    c = acc / wsum;
  } else {
    c = S(p);
  }
  o = c;
}`;

const COPY = COMMON + `void main(){ o = texture(T, uv); }`;

// ---------------- GL plumbing ----------------

let gl = null;
const progs = {};
let srcTex = null;
const targets = []; // two ping-pong {tex, fb}
let size = [0, 0];

function compile(src) {
  const sh = (type, s) => {
    const x = gl.createShader(type);
    gl.shaderSource(x, s);
    gl.compileShader(x);
    if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error("Effect shader: " + gl.getShaderInfoLog(x));
    return x;
  };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, src));
  gl.bindAttribLocation(p, 0, "pos");
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("Effect link: " + gl.getProgramInfoLog(p));
  const uniforms = new Map();
  return { p, u: (name) => { if (!uniforms.has(name)) uniforms.set(name, gl.getUniformLocation(p, name)); return uniforms.get(name); } };
}

function makeTex() {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

function init(W, H) {
  const canvas = new OffscreenCanvas(W, H);
  gl = canvas.getContext("webgl2", { premultipliedAlpha: true, alpha: true, preserveDrawingBuffer: true, antialias: false });
  if (!gl) throw new Error("WebGL2 is not available");
  progs.grade = compile(GRADE);
  progs.effect = compile(EFFECT);
  progs.copy = compile(COPY);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  srcTex = makeTex();
  for (let i = 0; i < 2; i++) targets.push({ tex: makeTex(), fb: gl.createFramebuffer() });
}

function resize(W, H) {
  if (size[0] === W && size[1] === H) return;
  size = [W, H];
  gl.canvas.width = W;
  gl.canvas.height = H;
  for (const t of targets) {
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function hex3(hex) {
  const n = parseInt((hex || "#00ff00").slice(1, 7), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

/** Effective grading uniforms: the item's adjustments plus its filter scaled by the filter amount. */
function gradeUniforms(s) {
  const out = {};
  for (const k of Object.keys(ADJUST)) out[k] = s.adjust?.[k] || 0;
  let gray = 0, sepia = 0, sh = [0, 0, 0], hi = [0, 0, 0];
  const f = s.filter?.type && FILTERS[s.filter.type];
  if (f) {
    const a = s.filter.amount ?? 1;
    for (const [k, v] of Object.entries(f.p)) out[k] += v * a;
    gray = (f.gray || 0) * a;
    sepia = (f.sepia || 0) * a;
    sh = (f.sh || sh).map((x) => x * a);
    hi = (f.hi || hi).map((x) => x * a);
  }
  return { out, gray, sepia, sh, hi };
}

/**
 * Runs the effect chain over `source` (a W×H canvas/image) and returns the GL canvas holding the result.
 * `s` = { adjust, filter: {type, amount}, fx: [{type, amount}], chroma: {on, color, similarity, smoothness, spill} }.
 * `time` drives animated effects (seconds since the item started).
 */
export function applyFx(source, s, time, W, H) {
  if (!gl) init(W, H);
  resize(W, H);
  gl.viewport(0, 0, W, H);
  gl.disable(gl.BLEND);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, srcTex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

  const passes = [];
  const g = gradeUniforms(s);
  const needGrade = s.chroma?.on || g.gray || g.sepia || Object.values(g.out).some((v) => v) || g.sh.some((v) => v) || g.hi.some((v) => v);
  if (needGrade) passes.push({ prog: progs.grade, set: (P) => {
    for (const [k, v] of Object.entries(g.out)) gl.uniform1f(P.u(k), v);
    gl.uniform1f(P.u("gray"), g.gray);
    gl.uniform1f(P.u("sepia"), g.sepia);
    gl.uniform3fv(P.u("shTint"), g.sh);
    gl.uniform3fv(P.u("hiTint"), g.hi);
    const ck = s.chroma || {};
    gl.uniform1i(P.u("keyOn"), ck.on ? 1 : 0);
    gl.uniform3fv(P.u("keyColor"), hex3(ck.color));
    gl.uniform1f(P.u("keySim"), ck.similarity ?? 0.12);
    gl.uniform1f(P.u("keySmooth"), ck.smoothness ?? 0.08);
    gl.uniform1f(P.u("keySpill"), ck.spill ?? 0.5);
  } });
  for (const f of s.fx || []) {
    const def = EFFECTS[f.type];
    if (!def || !(f.amount > 0)) continue;
    passes.push({ prog: progs.effect, set: (P) => {
      gl.uniform1i(P.u("mode"), def.mode);
      gl.uniform1f(P.u("amount"), Math.min(1, f.amount));
      gl.uniform1f(P.u("time"), time * (f.speed ?? 1)); // the effect's own speed
      const v = fxParams(f);
      gl.uniform3f(P.u("P"), v[0] ?? 0, v[1] ?? 0, v[2] ?? 0);
      const q = fxPlace(f);
      gl.uniform3f(P.u("Q"), q[0], 1 - q[1], q[2]); // y measured from the top in the panel, from the bottom in the shader
    } });
  }
  if (!passes.length) passes.push({ prog: progs.copy, set: () => {} });

  let input = srcTex;
  passes.forEach((pass, i) => {
    const last = i === passes.length - 1;
    const out = targets[i % 2];
    gl.bindFramebuffer(gl.FRAMEBUFFER, last ? null : out.fb);
    gl.useProgram(pass.prog.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, input);
    gl.uniform1i(pass.prog.u("T"), 0);
    gl.uniform2f(pass.prog.u("res"), W, H);
    gl.uniform1f(pass.prog.u("time"), time);
    pass.set(pass.prog);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    input = out.tex;
  });
  const hud = (s.fx || []).find((f) => EFFECTS[f.type]?.hud && f.amount > 0 && f.hud !== false);
  return hud ? withHud(gl.canvas, time, W, H) : gl.canvas;
}

let hudCanvas = null;
/** The VCR on-screen display (PLAY ▶, battery, tape counter and date) over the effect result. */
function withHud(src, time, W, H) {
  if (!hudCanvas || hudCanvas.width !== W || hudCanvas.height !== H) hudCanvas = new OffscreenCanvas(W, H);
  const c = hudCanvas.getContext("2d");
  c.clearRect(0, 0, W, H);
  c.drawImage(src, 0, 0);
  const u = Math.min(W, H) / 100, m = 6 * u;
  c.save();
  c.font = `bold ${(6 * u).toFixed(1)}px "Courier New", monospace`;
  c.textBaseline = "top";
  c.fillStyle = "#f4f4f4";
  c.shadowColor = "rgba(0,0,0,0.75)"; c.shadowOffsetX = u * 0.4; c.shadowOffsetY = u * 0.4; c.shadowBlur = u * 0.6;
  c.fillText("PLAY \u25B6", m, m);
  // battery: outline, tip and level bars (the last bar blinks)
  const bw = 12 * u, bh = 5.5 * u, bx = W - m - bw - u, by = m + 0.5 * u;
  c.lineWidth = u * 0.7; c.strokeStyle = "#f4f4f4";
  c.strokeRect(bx, by, bw, bh);
  c.fillRect(bx + bw, by + bh * 0.3, u, bh * 0.4);
  const bars = Math.floor(time * 2) % 2 ? 3 : 2;
  for (let i = 0; i < bars; i++) c.fillRect(bx + u + i * (bw - u) / 3, by + u, (bw - u) / 3 - u, bh - 2 * u);
  c.textBaseline = "bottom";
  const t = Math.max(0, time), hh = Math.floor(t / 3600), mm = Math.floor(t / 60) % 60, ss = Math.floor(t) % 60;
  c.fillText(`SP  ${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`, m, H - m);
  const d = new Date();
  const date = `${d.toLocaleString("en", { month: "short" }).toUpperCase()}. ${String(d.getDate()).padStart(2, "0")} ${d.getFullYear()}`;
  c.textAlign = "right";
  c.fillText(date, W - m, H - m);
  c.restore();
  return hudCanvas;
}

/** Renders a small preview card of an effect or filter over `source` (for the catalogue). */
export function fxThumbnail(source, s, time = 1.2, W = 160, H = 90) {
  const c = new OffscreenCanvas(W, H);
  const cx = c.getContext("2d");
  cx.drawImage(source, 0, 0, W, H);
  const out = applyFx(c, s, time, W, H);
  cx.clearRect(0, 0, W, H);
  cx.drawImage(out, 0, 0);
  return c;
}
