// Auto-captions: mix timeline audio at 16 kHz, run Whisper, group words into caption segments.
import { mixAudio } from "./export.js";
import { defaultTextStyle, uid } from "./store.js";

export const CAPTION_MODELS = {
  "Xenova/whisper-tiny.en": "English (tiny, ~40 MB, fastest)",
  "Xenova/whisper-base": "Multilingual (base, ~80 MB)",
};

let worker = null;

export async function transcribe(project, { model, language }, onProgress) {
  onProgress?.({ stage: "audio" });
  const mix = await mixAudio(project, 16000, 1);
  return runWhisper(mix.getChannelData(0).slice(), { model, language }, onProgress);
}

function runWhisper(audio, { model, language }, onProgress) {
  worker ??= new Worker(new URL("./whisper-worker.js", import.meta.url), { type: "module" });
  return new Promise((resolve, reject) => {
    worker.onmessage = ({ data }) => {
      if (data.type === "progress") onProgress?.(data);
      else if (data.type === "result") resolve(data.chunks);
      else if (data.type === "error") reject(new Error(data.message));
    };
    worker.postMessage({ audio, model, language }, [audio.buffer]);
  });
}

// ---------- auto lyrics (Audio clip › Lyrics) ----------

export const LYRICS_LANGUAGES = { english: "English", tagalog: "Tagalog (Filipino)" };
/** Whisper models for lyrics: "better" is larger but hears sung words much more reliably. */
export function lyricsModel(language, quality) {
  if (language === "english") return quality === "fast" ? "Xenova/whisper-base.en" : "Xenova/whisper-small.en";
  return quality === "fast" ? "Xenova/whisper-base" : "Xenova/whisper-small";
}

/**
 * Listens to one audio clip on its own (not the whole mix, so voice-overs and video sound stay out) and
 * returns its words timed on the timeline.
 */
export async function transcribeClip(project, item, { model, language }, onProgress) {
  onProgress?.({ stage: "audio" });
  const solo = { ...project, main: [], overlays: [], texts: [], effects: [], trackState: {}, audio: [{ ...item, start: 0, mute: false }] };
  const mix = await mixAudio(solo, 16000, 1);
  const chunks = await runWhisper(mix.getChannelData(0).slice(), { model, language: model.endsWith(".en") ? null : language }, onProgress);
  return chunks.map((c) => ({ ...c, timestamp: c.timestamp?.map((t) => (t == null ? t : t + item.start)) }));
}

/**
 * Listens to just part of one audio clip (from s0 to s1 on the timeline), so timing one verse doesn't
 * mean transcribing the whole song. Returns words timed on the timeline.
 */
export async function transcribeRange(project, item, s0, s1, opts, onProgress) {
  const a0 = Math.max(s0, item.start), a1 = Math.min(s1, item.start + item.dur);
  const speed = item.speed || 1;
  if (a1 - a0 < 0.3 || item.speedCurve?.points?.length >= 2) return transcribeClip(project, item, opts, onProgress);
  const part = { ...item, start: 0, dur: a1 - a0, in: (item.in || 0) + (a0 - item.start) * speed, audio: { ...(item.audio || {}), fadeIn: 0, fadeOut: 0 }, keyframes: undefined };
  const chunks = await transcribeClip(project, part, opts, onProgress);
  return chunks.map((c) => ({ ...c, timestamp: c.timestamp?.map((t) => (t == null ? t : t + a0)) }));
}

const norm = (w) => w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}]/gu, "");
function similar(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[m][n] / Math.max(m, n);
}

/**
 * Times the words of a text (as the user wrote them) from what was heard: the two word lists are lined up
 * (allowing for misheard, missing or extra words), heard words give their times, and words that weren't
 * heard are spread between their neighbours. Returns [{ w, t0, t1 }] whose w's join back to exactly `text`.
 */
export function alignWords(text, chunks, start, end) {
  const toks = text.match(/\s*\S+/g) || [];
  if (!toks.length) return null;
  const tail = text.slice(toks.join("").length);
  if (tail) toks[toks.length - 1] += tail;
  const heard = chunks.filter((c) => c.text?.trim() && c.timestamp?.[0] != null && !noise(c.text))
    .map((c) => ({ n: norm(c.text), t0: c.timestamp[0], t1: c.timestamp[1] ?? c.timestamp[0] + 0.3 }))
    .filter((h) => h.n && h.t1 > start - 0.5 && h.t0 < end + 0.5);
  const A = toks.map(norm), m = A.length, n = heard.length;
  // Needleman–Wunsch: best line-up of the written words with the heard ones.
  const GAP = -0.35, S = Array.from({ length: m + 1 }, () => new Float32Array(n + 1)), B = Array.from({ length: m + 1 }, () => new Uint8Array(n + 1));
  for (let i = 1; i <= m; i++) { S[i][0] = i * GAP; B[i][0] = 1; }
  for (let j = 1; j <= n; j++) { S[0][j] = j * GAP; B[0][j] = 2; }
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const sim = similar(A[i - 1], heard[j - 1].n);
    const diag = S[i - 1][j - 1] + (sim >= 0.5 ? sim : sim - 0.4), up = S[i - 1][j] + GAP, left = S[i][j - 1] + GAP;
    if (diag >= up && diag >= left) { S[i][j] = diag; B[i][j] = 0; } else if (up >= left) { S[i][j] = up; B[i][j] = 1; } else { S[i][j] = left; B[i][j] = 2; }
  }
  const at = new Array(m).fill(null);
  for (let i = m, j = n; i > 0 || j > 0;) {
    const b = i && j ? B[i][j] : i ? 1 : 2;
    if (b === 0) { if (similar(A[i - 1], heard[j - 1].n) >= 0.34) at[i - 1] = heard[j - 1]; i--; j--; } else if (b === 1) i--; else j--;
  }
  const found = at.filter(Boolean).length;
  // Words that weren't heard: spread between the nearest timed words (by letters).
  const out = toks.map((w, i) => ({ w, t0: at[i]?.t0, t1: at[i]?.t1 }));
  let i = 0;
  while (i < m) {
    if (out[i].t0 != null) { i++; continue; }
    let j = i; while (j < m && out[j].t0 == null) j++;
    const from = i ? out[i - 1].t1 : start, to = j < m ? out[j].t0 : end;
    const letters = out.slice(i, j).reduce((a, x) => a + Math.max(1, norm(x.w).length), 0);
    let c = 0;
    for (let k = i; k < j; k++) {
      const l = Math.max(1, norm(out[k].w).length);
      out[k].t0 = from + ((to - from) * c) / letters; c += l; out[k].t1 = from + ((to - from) * c) / letters;
    }
    i = j;
  }
  for (let k = 1; k < m; k++) if (out[k].t0 < out[k - 1].t0) out[k].t0 = out[k - 1].t0; // keep the order
  for (const x of out) x.t1 = Math.max(x.t1, x.t0 + 0.05);
  return { words: out, found, total: m, heard: n };
}

/** Not lyrics: Whisper's notes for music or silence ("[Music]", "♪", "(instrumental)"). */
const noise = (w) => /^\s*[\[(♪♫*]/.test(w) || /^\s*(music|instrumental|applause|silence)\W*$/i.test(w);

/**
 * Words → lyric lines: a new line at a pause in the singing, at the end of a sentence, or when a line gets
 * long. karaoke: each word lights up as it's sung.
 */
export function wordsToLyrics(chunks, { karaoke = true, block = 1, forId } = {}) {
  const words = chunks
    .filter((c) => c.text?.trim() && c.timestamp?.[0] != null && !noise(c.text))
    .map((c) => ({ w: c.text, t0: c.timestamp[0], t1: c.timestamp[1] ?? c.timestamp[0] + 0.3 }));
  const lines = [];
  let cur = [];
  for (const w of words) {
    const last = cur[cur.length - 1];
    const len = cur.reduce((a, x) => a + x.w.length, 0);
    if (cur.length && (cur.length >= 8 || len > 34 || (last && w.t0 - last.t1 > 0.7) || /[.!?,]$/.test(last.w.trim()))) { lines.push(cur); cur = []; }
    cur.push(w);
  }
  if (cur.length) lines.push(cur);
  // Karaoke blocks: up to `block` lines shown together in one text (a long pause in the singing starts a new block).
  const groups = [];
  for (const line of lines) {
    const g = groups[groups.length - 1];
    if (g && g.length < block && line[0].t0 - g[g.length - 1][g[g.length - 1].length - 1].t1 < 3) g.push(line);
    else groups.push([line]);
  }
  const style = {
    ...defaultTextStyle(), size: 70, weight: 800, color: "#ffffff", stroke: "#000000", strokeWidth: 5,
    shadow: { color: "#000000aa", blur: 10, x: 0, y: 4 }, highlight: "#ffffff",
    ...(karaoke ? { karaoke: { on: true, sung: "#3df2ff", unsung: "#ffffff", mode: "word", lines: Math.max(1, block) } } : {}),
  };
  return groups.map((grp, i) => {
    const g = grp.flatMap((line, li) => line.map((w, j) => (j ? { ...w } : { ...w, w: (li ? "\n" : "") + w.w.trimStart() })));
    // Karaoke blocks appear a moment before the singing, so all their lines can be read first.
    const prevEnd = i ? groups[i - 1].at(-1).at(-1).t1 + 0.2 : 0;
    const start = karaoke && block > 1 ? Math.max(prevEnd, g[0].t0 - 1.2, 0) : g[0].t0;
    // Each block stays up until the next one appears (or a moment after its last word).
    const nextGroup = groups[i + 1];
    const next = nextGroup && (karaoke && block > 1 ? Math.max(g[g.length - 1].t1 + 0.2, nextGroup[0][0].t0 - 1.2) : nextGroup[0][0].t0);
    const end = Math.max(g[g.length - 1].t1 + 0.4, start + 0.6);
    return {
      id: uid(), caption: true, lyricsFor: forId, start, dur: (next != null ? Math.min(end, next) : end) - start,
      text: g.map((w) => w.w).join(""), words: g, x: 0.5, y: grp.length > 2 ? 0.75 : 0.84, scale: 1, style: structuredClone(style),
      anim: { in: { type: "fade", dur: 0.15 }, out: { type: "none", dur: 0.2 } },
    };
  });
}

/** Turns Whisper word chunks into caption text segments of a few words each. */
export function wordsToCaptions(chunks, { maxWords = 5, maxGap = 0.6 } = {}) {
  const words = chunks
    .filter((c) => c.text?.trim() && c.timestamp?.[0] != null)
    .map((c) => ({ w: c.text, t0: c.timestamp[0], t1: c.timestamp[1] ?? c.timestamp[0] + 0.3 }));
  const groups = [];
  let cur = [];
  for (const w of words) {
    const last = cur[cur.length - 1];
    const breakHere = cur.length >= maxWords || (last && w.t0 - last.t1 > maxGap) || (last && /[.!?]$/.test(last.w.trim()));
    if (breakHere && cur.length) { groups.push(cur); cur = []; }
    cur.push(w);
  }
  if (cur.length) groups.push(cur);
  return groups.map((g) => {
    g[0] = { ...g[0], w: g[0].w.trimStart() };
    const start = g[0].t0;
    const end = Math.max(g[g.length - 1].t1, start + 0.3);
    return {
      id: uid(),
      caption: true,
      start,
      dur: end - start,
      text: g.map((w) => w.w).join(""),
      words: g,
      x: 0.5,
      y: 0.82,
      scale: 1,
      style: { ...defaultTextStyle(), size: 64 },
      anim: { in: { type: "pop", dur: 0.2 }, out: { type: "none", dur: 0.2 } },
    };
  });
}
