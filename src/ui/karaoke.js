// Lyrics & karaoke looks for normal texts (Text › Style), and the sung / unsung colour choices shared with Titles.
import { edit, findItem, getState, setState, uid } from "../store.js";
import { html, Field, Section, Slider, Icon } from "./kit.js";
import { toast } from "../actions.js";

/** Sung / not-yet-sung colour pairs: [name, sung, unsung, outline]. */
export const KARAOKE_PAIRS = [
  ["Cyan", "#3df2ff", "#ffffff", "#0a1a3a"], ["Pink", "#ff3cac", "#ffffff", "#2a0a1e"], ["Gold", "#ffd23f", "#ffffff", "#2b1a00"],
  ["Lime", "#9dff3d", "#ffffff", "#0f2a00"], ["Red", "#ff3b3b", "#ffffff", "#2a0000"], ["Purple", "#b46bff", "#ffffff", "#1a0a33"],
  ["Orange", "#ff8a1f", "#ffffff", "#2a1200"], ["Sky", "#4da3ff", "#ffffff", "#001433"], ["Classic", "#ffffff", "#4da3ff", "#001a4d"],
  ["Yellow on blue", "#ffe14d", "#5ec8ff", "#001433"], ["White on grey", "#ffffff", "#8a8f98", "#000000"], ["Gold on grey", "#ffd23f", "#9aa0a6", "#000000"],
  ["Pink on lilac", "#ff3cac", "#e3c8ff", "#2a0a1e"], ["Mint on white", "#1fcf9a", "#ffffff", "#002a1c"], ["Red on yellow", "#ff2d2d", "#ffe14d", "#2a0000"],
  ["Neon green", "#39ff14", "#d9ffd0", "#002200"], ["Ice", "#ffffff", "#9fdcff", "#0a2a40"], ["Dark ink", "#111111", "#ffffff", "#ffffff"],
];
export const SUNG_SWATCHES = ["#3df2ff", "#ff3cac", "#ffd23f", "#9dff3d", "#ff3b3b", "#b46bff", "#ff8a1f", "#4da3ff", "#39ff14", "#ffffff", "#111111"];
export const UNSUNG_SWATCHES = ["#ffffff", "#e6e6e6", "#9aa0a6", "#5ec8ff", "#ffe14d", "#e3c8ff", "#ffc2d9", "#d9ffd0", "#9fdcff", "#555a63", "#111111"];

/** A colour box with quick swatches beside it. */
export function SwatchPicker({ label, value, colors, onPick }) {
  return html`<div class="swatch-pick">
    <${Field} label=${label}><input type="color" value=${value} onChange=${(e) => onPick(e.target.value)} /><//>
    <div class="swatches">${colors.map((c) => html`<button key=${c} class=${"swatch" + (c.toLowerCase() === (value || "").toLowerCase() ? " on" : "")}
      style=${{ background: c }} title=${c} aria-label=${`${label}: ${c}`} onClick=${() => onPick(c)} />`)}</div>
  </div>`;
}

/** A small "Sing" sample: half sung, half not yet sung. */
export function PairChip({ name, sung, unsung, outline, on, onClick }) {
  return html`<button class=${"pair-chip" + (on ? " on" : "")} title=${`${name}: sung ${sung}, not sung yet ${unsung}`} onClick=${onClick}>
    <span class="pair-sample" style=${{ "--sung": sung, "--unsung": unsung, "--ol": outline }}>Sing</span><span>${name}</span>
  </button>`;
}

// ---------- normal text presets ----------

const K = (sung, unsung, extra = {}) => ({ karaoke: { on: true, sung, unsung, mode: "word", ...extra } });
const OUTLINE = (c, w) => ({ stroke: c, strokeWidth: w });
const SHADOW = { shadow: { color: "#000000aa", blur: 10, x: 0, y: 4 } };
/** [group, [[name, style patch]]]. A patch replaces only the style keys it names; `karaoke` merges with the text's own. */
export const TEXT_STYLE_PRESETS = [
  ["Lyrics", [
    ["Lyrics classic", { color: "#ffffff", ...OUTLINE("#000000", 5), ...SHADOW, glow: { on: false }, bg: "", karaoke: { on: false } }],
    ["Lyrics soft", { color: "#ffffff", strokeWidth: 0, shadow: undefined, glow: { on: true, color: "#000000", size: 22, strength: 3 }, bg: "", karaoke: { on: false } }],
    ["Lyrics neon", { color: "#ffffff", strokeWidth: 0, shadow: undefined, glow: { on: true, color: "#ff3cac", size: 26, strength: 2 }, bg: "", karaoke: { on: false } }],
    ["Lyrics yellow", { color: "#ffe14d", ...OUTLINE("#1a1a1a", 6), shadow: undefined, glow: { on: false }, bg: "", karaoke: { on: false } }],
    ["Lyrics box", { color: "#ffffff", strokeWidth: 0, shadow: undefined, glow: { on: false }, bg: "#000000aa", bgPad: 0.5, bgRadius: 0.3, karaoke: { on: false } }],
    ["Lyrics cyan glow", { color: "#e8fdff", strokeWidth: 0, shadow: undefined, glow: { on: true, color: "#00f0ff", size: 30, strength: 2 }, bg: "", karaoke: { on: false } }],
  ]],
  ["Karaoke", [
    ["Karaoke blue", { color: "#ffffff", ...OUTLINE("#0a1a3a", 6), ...SHADOW, glow: { on: false }, bg: "", ...K("#3df2ff", "#ffffff") }],
    ["Karaoke pink", { color: "#ffffff", ...OUTLINE("#2a0a1e", 6), ...SHADOW, glow: { on: false }, bg: "", ...K("#ff3cac", "#ffffff") }],
    ["Karaoke gold", { color: "#ffffff", ...OUTLINE("#2b1a00", 6), ...SHADOW, glow: { on: false }, bg: "", ...K("#ffd23f", "#ffffff") }],
    ["Karaoke classic", { color: "#4da3ff", ...OUTLINE("#ffffff", 4), ...SHADOW, glow: { on: false }, bg: "", ...K("#ffffff", "#4da3ff", { sungOutline: "#001a4d" }) }],
    ["Karaoke neon", { color: "#ffffff", strokeWidth: 0, shadow: undefined, glow: { on: false }, bg: "", ...K("#39ff14", "#d9ffd0", { glow: true }) }],
    ["Karaoke grey", { color: "#9aa0a6", ...OUTLINE("#000000", 5), ...SHADOW, glow: { on: false }, bg: "", ...K("#ffffff", "#9aa0a6") }],
    ["Karaoke sweep", { color: "#ffffff", ...OUTLINE("#000000", 5), ...SHADOW, glow: { on: false }, bg: "", ...K("#ffe14d", "#ffffff", { mode: "sweep" }) }],
    ["Karaoke box", { color: "#ffffff", strokeWidth: 0, shadow: undefined, glow: { on: false }, bg: "#000000aa", bgPad: 0.5, bgRadius: 0.3, ...K("#ff3cac", "#ffffff") }],
  ]],
  ["Outlines & glows", [
    ["No outline", { strokeWidth: 0 }], ["Thin black", OUTLINE("#000000", 3)], ["Thick black", OUTLINE("#000000", 10)], ["White outline", OUTLINE("#ffffff", 6)],
    ["No glow", { glow: { on: false } }], ["White glow", { glow: { on: true, color: "#ffffff", size: 24, strength: 2 } }],
    ["Pink glow", { glow: { on: true, color: "#ff3cac", size: 30, strength: 2 } }], ["Drop shadow", { shadow: { color: "#000000aa", blur: 10, x: 6, y: 8 } }],
  ]],
];

/** A CSS preview of a text style (and its karaoke colours, half sung). */
function presetPreview(st) {
  const k = st.karaoke?.on ? st.karaoke : null;
  const glow = st.glow?.on ? `0 0 ${Math.round((st.glow.size || 24) / 4)}px ${st.glow.color}` : "";
  const shadow = st.shadow ? `1px 2px 3px ${st.shadow.color}` : "";
  const stroke = st.strokeWidth > 0 ? `${Math.min(2, st.strokeWidth / 4).toFixed(1)}px ${st.stroke}` : undefined;
  const text = k
    ? { "--sung": k.sung, "--unsung": k.unsung, "-webkit-text-stroke": stroke,
        filter: k.glow ? `drop-shadow(0 0 4px ${k.sung})` : glow ? `drop-shadow(0 0 4px ${st.glow.color})` : shadow ? "drop-shadow(1px 2px 2px #000a)" : undefined }
    : { color: st.color, "-webkit-text-stroke": stroke, textShadow: [glow, shadow].filter(Boolean).join(", ") || undefined };
  return html`<span class="tp-sample" style=${st.bg ? { background: st.bg } : undefined}>
    <span class=${k ? "kara" : ""} style=${text}>${k ? "Sing" : "Aa"}</span></span>`;
}

/** Style presets for a normal text: click one to apply. */
export function TextStylePresets({ st, setStyle }) {
  return TEXT_STYLE_PRESETS.map(([group, list]) => html`<${Section} key=${group} title=${group} open=${group !== "Outlines & glows"}>
    <div class="style-grid">
      ${list.map(([name, patch]) => html`<button key=${name} class="style-chip tp-chip" title=${`${group}: ${name}`} onClick=${() => setStyle(patch)}>
        ${presetPreview({ ...st, ...patch, karaoke: patch.karaoke ? { ...(st.karaoke || {}), ...patch.karaoke } : st.karaoke })}<span>${name}</span></button>`)}
    </div>
  <//>`);
}

/** Outer glow for a normal text. */
export function TextGlowSection({ st, setSt }) {
  const g = st.glow || {};
  const put = (k, v, live) => setSt("glow", { color: "#ffffff", size: 24, strength: 2, ...g, [k]: v }, live);
  return html`<${Section} title="Glow" open=${!!g.on}>
    <label class="check"><input type="checkbox" checked=${!!g.on} onChange=${(e) => put("on", e.target.checked)} /> Outer glow</label>
    ${g.on && html`<${Field} label="Colour"><input type="color" value=${g.color || "#ffffff"} onChange=${(e) => put("color", e.target.value)} /><//>
      <${Slider} label="Size" value=${g.size ?? 24} min=${0} max=${80} step=${1} format=${(v) => String(Math.round(v))} onChange=${(v, live) => put("size", v, live)} />
      <${Slider} label="Strength" value=${g.strength ?? 2} min=${1} max=${4} step=${1} format=${(v) => String(Math.round(v))} onChange=${(v, live) => put("strength", Math.round(v), live)} />`}
  <//>`;
}

/** Karaoke for a normal text: the words change from the unsung to the sung colour as they're sung, with 1–4 lines on screen. */
export function KaraokeSection({ t, st, setSt }) {
  const k = st.karaoke || {};
  const put = (patch, live) => setSt("karaoke", { sung: "#3df2ff", unsung: st.color || "#ffffff", mode: "word", lines: 4, ...k, ...patch }, live);
  const timed = !!t.words?.length;
  return html`<${Section} title="Karaoke (unsung → sung)" open=${!!k.on}>
    <label class="check"><input type="checkbox" checked=${!!k.on} onChange=${(e) => put({ on: e.target.checked })} /> Karaoke highlight</label>
    ${k.on && html`
      <p class="muted small">Words change from the “not sung yet” colour to the sung colour as they're sung. ${timed
        ? "This text has word timing from auto lyrics or captions, so the highlight follows the singing."
        : "The words are spread evenly over the text's time on the timeline: put each lyric line on its own line (Enter) and trim the text to the verse."}</p>
      <div class="pair-grid">
        ${KARAOKE_PAIRS.map(([name, sung, unsung, outline]) => html`<${PairChip} key=${name} name=${name} sung=${sung} unsung=${unsung} outline=${outline}
          on=${(k.sung || "").toLowerCase() === sung && (k.unsung || "").toLowerCase() === unsung}
          onClick=${() => put({ sung, unsung })} />`)}
      </div>
      <${SwatchPicker} label="Sung" value=${k.sung || "#3df2ff"} colors=${SUNG_SWATCHES} onPick=${(c) => put({ sung: c })} />
      <${SwatchPicker} label="Not sung yet" value=${k.unsung || "#ffffff"} colors=${UNSUNG_SWATCHES} onPick=${(c) => put({ unsung: c })} />
      <div class="grid2">
        <${Field} label="Highlight">
          <select value=${k.mode || "word"} onChange=${(e) => put({ mode: e.target.value })}>
            <option value="word">Word by word</option><option value="sweep">Smooth sweep</option>
          </select>
        <//>
        <${Field} label="Lines move">
          <select value=${k.scroll ? "line" : "page"} onChange=${(e) => put({ scroll: e.target.value === "line" })}>
            <option value="page">Page by page</option><option value="line">One line at a time</option>
          </select>
        <//>
      </div>
      <div class="kara-lines" role="group" aria-label="Lines on screen">
        <span>Lines on screen</span>
        ${[[0, "All"], [1, "1"], [2, "2"], [3, "3"], [4, "4"]].map(([n, label]) => html`<button key=${label} class=${"chip" + ((k.lines || 0) === n ? " on" : "")}
          title=${n ? `Show ${n} line${n > 1 ? "s" : ""} at a time` : "Show every line"} onClick=${() => put({ lines: n })}>${label}</button>`)}
      </div>
      <label class="check"><input type="checkbox" checked=${!!k.glow} onChange=${(e) => put({ glow: e.target.checked })} /> Glow on sung words</label>
      <label class="check"><input type="checkbox" checked=${!!k.sungOutline} onChange=${(e) => put({ sungOutline: e.target.checked ? "#000000" : undefined })} /> Different outline when sung</label>
      ${k.sungOutline && html`<${Field} label="Sung outline"><input type="color" value=${k.sungOutline} onChange=${(e) => put({ sungOutline: e.target.value })} /><//>`}
      ${!timed && html`
        <${Slider} label="Start singing after" value=${k.lead || 0} min=${0} max=${Math.max(1, Math.min(10, t.dur - 0.5))} step=${0.05} format=${(v) => `${v.toFixed(2)} s`}
          onChange=${(v, live) => put({ lead: v }, live)} />
        <${Slider} label="Finish before the end" value=${k.tail ?? 0.3} min=${0} max=${Math.max(1, Math.min(10, t.dur - 0.5))} step=${0.05} format=${(v) => `${v.toFixed(2)} s`}
          onChange=${(v, live) => put({ tail: v }, live)} />`}`}
  <//>`;
}

/** Applies a style patch to texts (one undo step); `karaoke` merges with each text's own settings. */
export const setStyleOf = (ids) => (patch) => edit((p) => {
  for (const x of p.texts) {
    if (!ids.has(x.id)) continue;
    const { karaoke, ...rest } = structuredClone(patch);
    for (const [key, v] of Object.entries(rest)) { if (v === undefined) delete x.style[key]; else x.style[key] = v; }
    if (karaoke) x.style.karaoke = { mode: "word", lines: 4, ...(x.style.karaoke || {}), ...karaoke };
  }
});

/**
 * Joins several text lines (e.g. auto lyrics) into one karaoke text that shows a few lines at a time.
 * Each line keeps its timing: word timing if it has it, otherwise its words spread over its own time.
 */
export function joinIntoKaraoke(ids) {
  const list = getState().project.texts.filter((x) => ids.has(x.id) && !x.title && !x.viz && !x.shape && !x.frame).sort((a, b) => a.start - b.start);
  if (list.length < 2) return toast("Select two or more text lines first");
  const words = list.flatMap((x, i) => {
    let ws = x.words?.length ? x.words.map((w) => ({ ...w }))
      : (() => {
          const toks = x.text.replace(/\n/g, " ").match(/\s*\S+/g) || [];
          const letters = toks.reduce((a, w) => a + w.trim().length, 0) || 1;
          const a = x.start, b = x.start + Math.max(0.3, x.dur - 0.2);
          let c = 0;
          return toks.map((w) => { const t0 = a + ((b - a) * c) / letters; c += w.trim().length; return { w, t0, t1: a + ((b - a) * c) / letters }; });
        })();
    if (ws.length) ws[0] = { ...ws[0], w: (i ? "\n" : "") + ws[0].w.trimStart() };
    return ws;
  });
  const first = list[0];
  const end = Math.max(...list.map((x) => x.start + x.dur));
  const id = uid();
  edit((p) => {
    const joined = { ...structuredClone(findItem(p, "text", first.id)), id, start: first.start, dur: end - first.start, words, text: words.map((w) => w.w).join("") };
    delete joined.spans; delete joined.keyframes;
    joined.style.karaoke = { sung: first.style.highlight && first.style.highlight !== first.style.color ? first.style.highlight : "#3df2ff",
      unsung: first.style.color || "#ffffff", mode: "word", ...(first.style.karaoke || {}), on: true, lines: Math.min(first.style.karaoke?.lines || 4, 4) || 4 };
    p.texts = p.texts.filter((x) => !ids.has(x.id)).concat(joined);
  });
  setState({ selection: [{ kind: "text", id }] });
  toast(`Joined ${list.length} lines into one karaoke text. Choose 1–4 “Lines on screen” in Style.`);
}
