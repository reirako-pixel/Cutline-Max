// Audio analysis for visualizers and beat sync. The project's sound mix is analysed once, 60 times a second,
// into frequency bands, a waveform, loudness and bass hits. Drawing only reads these numbers, so the
// preview, scrubbing and the exported video all move exactly the same way.
// No imports on purpose: the engine reads from here, export.js fills it (see ensureVizAnalysis there).

export const VIZ_RATE = 60; // analysis frames per second
export const BANDS = 64; // frequency bands, 50 Hz – 10 kHz, log-spaced
export const WAVE = 96; // waveform points per frame
const FFT = 1024;

/** The current analysis: { key, frames, bands: Uint8Array, wave: Int8Array, level: Uint8Array, beat: Uint8Array } or null. */
export const viz = { data: null, pending: null, key: "" };

/** True when anything in the project needs the analysis (a visualizer layer or a beat-synced clip). */
export function vizUsed(project) {
  if (!project) return false;
  if ((project.texts || []).some((t) => t.viz)) return true;
  return [...(project.main || []), ...(project.overlays || [])].some((c) => c.beat?.type && c.beat.type !== "off");
}

/** Everything about the project that changes its sound. When this string changes, the analysis is redone. */
export function audioKey(project) {
  const pick = (x) => [x.mediaId, x.start, x.in, x.dur, x.gap, x.speed, x.speedCurve, x.mute, x.audio, x.keyframes?.volume, x.track];
  const ts = project.trackState || {};
  return JSON.stringify([
    (project.main || []).map(pick), (project.overlays || []).map(pick), (project.audio || []).map(pick),
    (project.texts || []).filter((t) => t.sound).map((t) => [t.start, t.sound]),
    Object.entries(ts).filter(([, v]) => v?.muted).map(([k]) => k),
  ]);
}

// ---------- analysis ----------

/** In-place radix-2 FFT (re, im of length FFT). */
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
}

const percentile = (arr, p) => {
  const s = Float32Array.from(arr).sort();
  return s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))] || 0;
};
const yieldNow = () => new Promise((r) => setTimeout(r, 0));

/** Turns mono samples into visualizer frames. `samples` Float32Array at `rate` Hz. */
export async function analyzeSamples(samples, rate, signal) {
  const frames = Math.max(1, Math.ceil((samples.length / rate) * VIZ_RATE));
  const hann = new Float32Array(FFT).map((_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (FFT - 1)));
  // Which FFT bins make each band (log-spaced, at least one bin each).
  const edges = [];
  for (let b = 0; b <= BANDS; b++) edges.push(50 * Math.pow(10000 / 50, b / BANDS));
  const binOf = (f) => Math.min(FFT / 2 - 1, Math.max(1, Math.round((f * FFT) / rate)));
  const ranges = [];
  for (let b = 0; b < BANDS; b++) { const lo = binOf(edges[b]); ranges.push([lo, Math.max(lo, binOf(edges[b + 1]) - 1)]); }
  const bassBands = edges.findIndex((f) => f > 160);

  const db = new Float32Array(frames * BANDS);
  const rms = new Float32Array(frames);
  const bass = new Float32Array(frames);
  const wave = new Int8Array(frames * WAVE);
  const re = new Float32Array(FFT), im = new Float32Array(FFT);
  const waveSpan = Math.round(rate * 0.06); // 60 ms of sound across the waveform
  let peak = 1e-6;
  for (let i = 0; i < samples.length; i += 7) peak = Math.max(peak, Math.abs(samples[i]));

  for (let f = 0; f < frames; f++) {
    if (f % 400 === 0) { await yieldNow(); if (signal?.aborted) throw new DOMException("Cancelled", "AbortError"); }
    const centre = Math.round((f / VIZ_RATE) * rate);
    const s0 = centre - FFT / 2;
    let sum = 0;
    for (let i = 0; i < FFT; i++) {
      const v = samples[s0 + i] || 0;
      sum += v * v;
      re[i] = v * hann[i]; im[i] = 0;
    }
    rms[f] = Math.sqrt(sum / FFT);
    fft(re, im);
    let bassE = 0;
    for (let b = 0; b < BANDS; b++) {
      const [lo, hi] = ranges[b];
      let m = 0;
      for (let k = lo; k <= hi; k++) m = Math.max(m, Math.hypot(re[k], im[k]));
      // Music has far less energy up high; tilt it ~4 dB per octave so treble bars move as much as bass.
      const d = 20 * Math.log10(m / (FFT / 4) + 1e-9) + 4 * Math.log2(Math.sqrt(edges[b] * edges[b + 1]) / 300);
      db[f * BANDS + b] = d;
      if (b < bassBands) bassE += m * m;
    }
    bass[f] = Math.sqrt(bassE);
    const w0 = centre - waveSpan / 2;
    for (let i = 0; i < WAVE; i++) {
      const v = samples[Math.round(w0 + (i / (WAVE - 1)) * waveSpan)] || 0;
      wave[f * WAVE + i] = Math.max(-127, Math.min(127, Math.round((v / peak) * 127)));
    }
  }

  // Loudness-independent: each project is scaled to its own loud parts, so quiet songs still move.
  const top = percentile(db.filter((_, i) => i % 3 === 0), 0.985);
  const floor = top - 48;
  const bands = new Uint8Array(frames * BANDS);
  const prev = new Float32Array(BANDS);
  for (let f = 0; f < frames; f++) {
    for (let b = 0; b < BANDS; b++) {
      let v = Math.max(0, Math.min(1, (db[f * BANDS + b] - floor) / (top - floor)));
      v = Math.pow(v, 1.6); // keep the quiet bins low so the shape reads clearly
      v = Math.max(v, prev[b] * 0.86); // fast rise, smooth fall
      prev[b] = v;
      bands[f * BANDS + b] = Math.round(v * 255);
    }
  }
  const rmsTop = percentile(rms, 0.95) || 1e-6;
  const level = new Uint8Array(frames);
  let lv = 0;
  for (let f = 0; f < frames; f++) { lv = Math.max(Math.min(1, rms[f] / rmsTop), lv * 0.9); level[f] = Math.round(lv * 255); }
  // Bass hits: bass energy jumping above its recent average.
  const flux = new Float32Array(frames);
  let avg = bass[0] || 0;
  for (let f = 0; f < frames; f++) { flux[f] = Math.max(0, bass[f] - avg * 1.3); avg = avg * 0.94 + bass[f] * 0.06; }
  const fluxTop = percentile(flux.filter((v) => v > 0), 0.9) || 1e-6;
  const beat = new Uint8Array(frames);
  let env = 0;
  for (let f = 0; f < frames; f++) { env = Math.max(Math.min(1, flux[f] / fluxTop), env * 0.86); beat[f] = Math.round(env * 255); }
  return { frames, bands, wave, level, beat };
}

// ---------- reading ----------

/** Demo mode (library preview tiles): readers return a made-up 120 bpm beat instead of the project's music. */
export const demo = { on: false };
const kick = (t) => Math.exp(-((t % 0.5) * 9));
const demoBand = (t, x) => Math.max(0, Math.min(1, 0.18 + 0.62 * kick(t) * Math.pow(1 - x, 1.4) + 0.22 * (0.5 + 0.5 * Math.sin(x * 9 + t * 4.3)) * (1 - x * 0.6)));

const frameAt = (t) => {
  const d = viz.data;
  return d ? Math.max(0, Math.min(d.frames - 1, Math.floor(t * VIZ_RATE))) : -1;
};

/** n band values 0..1 at time t (low to high frequency), averaged over `smooth` (0..1) of recent frames. */
export function bandsAt(t, n, smooth = 0.3, out = new Float32Array(n)) {
  const d = viz.data, f = frameAt(t);
  if (demo.on) { for (let i = 0; i < n; i++) out[i] = demoBand(t, i / Math.max(1, n - 1)); return out; }
  if (!d) { for (let i = 0; i < n; i++) out[i] = 0.06 + 0.04 * Math.sin(i * 0.7 + t * 2); return out; }
  const k = 1 + Math.round(smooth * 6);
  for (let i = 0; i < n; i++) {
    const pos = (i / Math.max(1, n - 1)) * (BANDS - 1), b = Math.floor(pos), fr = pos - b;
    let s = 0, c = 0;
    for (let j = 0; j < k; j++) {
      const ff = f - j;
      if (ff < 0) break;
      const o = ff * BANDS;
      s += (d.bands[o + b] * (1 - fr) + d.bands[o + Math.min(BANDS - 1, b + 1)] * fr) / 255;
      c++;
    }
    out[i] = c ? s / c : 0;
  }
  return out;
}

/** n waveform points -1..1 at time t. */
export function waveAt(t, n, out = new Float32Array(n)) {
  const d = viz.data, f = frameAt(t);
  if (demo.on) { const k = 0.25 + 0.75 * kick(t); for (let i = 0; i < n; i++) out[i] = k * (0.6 * Math.sin(i * 0.31 + t * 9) + 0.3 * Math.sin(i * 0.97 - t * 5)); return out; }
  if (!d) { for (let i = 0; i < n; i++) out[i] = 0.05 * Math.sin(i * 0.4 + t * 6); return out; }
  for (let i = 0; i < n; i++) {
    const pos = (i / Math.max(1, n - 1)) * (WAVE - 1), a = Math.floor(pos), fr = pos - a;
    out[i] = (d.wave[f * WAVE + a] * (1 - fr) + d.wave[f * WAVE + Math.min(WAVE - 1, a + 1)] * fr) / 127;
  }
  return out;
}

/** Loudness 0..1 at t. */
export const levelAt = (t) => (demo.on ? 0.45 + 0.45 * kick(t) : viz.data ? viz.data.level[frameAt(t)] / 255 : 0);
/** Bass hit strength 0..1 at t (jumps on a kick, then falls off). */
export const beatAt = (t) => (demo.on ? kick(t) : viz.data ? viz.data.beat[frameAt(t)] / 255 : 0);
