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
    ...(karaoke ? { karaoke: { on: true, sung: "#3df2ff", unsung: "#ffffff", mode: "sweep", lines: Math.max(1, block) } } : {}),
  };
  return groups.map((grp, i) => {
    const g = grp.flatMap((line, li) => line.map((w, j) => (j ? { ...w } : { ...w, w: (li ? "\n" : "") + w.w.trimStart() })));
    const start = g[0].t0;
    // Each block stays up until the next one starts (or a moment after its last word).
    const next = groups[i + 1]?.[0]?.[0]?.t0;
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
