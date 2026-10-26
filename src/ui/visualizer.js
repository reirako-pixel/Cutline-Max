// Audio visualizers (Library › Visualizer) and beat sync for clips. A visualizer is a layer on the text
// tracks, like a shape: move, resize, rotate, animate and trim it like any other layer. It moves with all
// the sound in the project (music, voice-overs, clip sound), read once by the analysis in vizdata.js.
import { useEffect, useRef } from "react";
import { getState, setState, edit, editLive, uid, findItem, defaultTextStyle, useStore, projectDuration } from "../store.js";
import { VIZ_STYLES, VIZ_PRESETS, newViz, drawVizStyle } from "../vizdraw.js";
import { demo } from "../vizdata.js";
import { BEAT_TYPES } from "../engine.js";
import { html, Icon, Field, Section, Slider } from "./kit.js";
import { setting } from "../settings.js";

const pct = (v) => `${Math.round(v * 100)}%`;
const BOTTOM_STYLES = new Set(["bars", "dots", "hills"]);
const ROUND_STYLES = new Set(["circle", "ring"]);

/**
 * Adds a visualizer at the playhead. It lasts as long as the music under the playhead (or to the end of
 * the project), and is selected so its settings open on the right.
 */
export function addVisualizer([name, style, colorA, colorB, extra]) {
  const { project, time } = getState();
  const song = (project.audio || []).find((a) => time >= a.start - 1e-3 && time < a.start + a.dur);
  const total = projectDuration(project);
  const start = song ? song.start : time;
  const dur = song ? song.dur : total - time > 1 ? total - time : Math.max(10, setting("textDur"));
  const id = uid();
  edit((p) => p.texts.push({
    id, start, dur, text: "", vizName: name, x: 0.5, y: BOTTOM_STYLES.has(style) ? 0.78 : 0.5, scale: 1, rotation: 0, opacity: 1,
    viz: newViz(style, colorA, colorB, extra),
    style: defaultTextStyle(),
    anim: { in: { type: "none", dur: 0.4 }, out: { type: "none", dur: 0.4 } },
  }));
  setState({ selection: [{ kind: "text", id }] });
}

// ---------- animated preview tiles (one shared loop, demo beat) ----------

const tiles = new Set();
let loop = 0;
function drawTiles(now) {
  loop = tiles.size ? requestAnimationFrame(drawTiles) : 0;
  const t = now / 1000;
  demo.on = true;
  try {
    for (const { canvas, v } of tiles) {
      const c = canvas.getContext("2d"), W = canvas.width, H = canvas.height;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, W, H);
      const k = Math.min((W * 0.86) / v.w, (H * 0.8) / v.h) * 1920 / 1920;
      const draw = () => { c.save(); c.translate(W / 2, H / 2); drawVizStyle(c, { ...v, w: v.w, h: v.h }, t, k); c.restore(); };
      if (v.glow > 0.01) { c.save(); c.filter = `blur(${2 + v.glow * 5}px)`; c.globalCompositeOperation = "lighter"; draw(); c.restore(); }
      draw();
    }
  } finally { demo.on = false; }
}
function VizTile({ v }) {
  const ref = useRef();
  useEffect(() => {
    const entry = { canvas: ref.current, v };
    tiles.add(entry);
    if (!loop) loop = requestAnimationFrame(drawTiles);
    return () => tiles.delete(entry);
  }, [v]);
  return html`<canvas ref=${ref} width="164" height="96" class="viz-tile-canvas" aria-hidden="true" />`;
}

const presetViz = new Map(VIZ_PRESETS.map((p) => [p[0], newViz(p[1], p[2], p[3], p[4])]));

/** Library › Visualizer: click a look to add it at the playhead. */
export function VisualizerTab({ part }) {
  const hasSound = useStore((s) => (s.project.audio || []).length > 0 || s.project.main.some((m) => s.project.media[m.mediaId]?.kind === "video"));
  const list = part === "all" ? VIZ_PRESETS : VIZ_PRESETS.filter((p) => (part === "round" ? ROUND_STYLES.has(p[1]) : part === "lines" ? ["wave", "hills"].includes(p[1]) : part === "bars" ? ["bars", "mirror", "dots"].includes(p[1]) : p[1] === "stardust"));
  return html`<div>
    <p class="muted small">Click a visualizer to add it at the playhead. It moves with the music and every other sound in your project, and lasts as long as the song under the playhead.</p>
    ${!hasSound && html`<p class="warn small">Add music or a video with sound first, or the visualizer stays still.</p>`}
    <div class="viz-grid">
      ${list.map((p) => html`<button key=${p[0]} class="viz-tile" title=${`Add “${p[0]}”`} onClick=${() => addVisualizer(p)}>
        <${VizTile} v=${presetViz.get(p[0])} /><span>${p[0]}</span></button>`)}
    </div>
  </div>`;
}

// ---------- inspector ----------

/** Settings of a visualizer layer (the panel on the right). */
export function VizFields({ t }) {
  const v = t.viz;
  const set = (fn, live) => (live ? editLive : edit)((p) => { const x = findItem(p, "text", t.id); if (x) { x.viz = { ...x.viz }; fn(x.viz); } });
  const num = (key, label, min, max, step, format) => html`<${Slider} label=${label} value=${v[key] ?? 0} min=${min} max=${max} step=${step}
    format=${format} onChange=${(val, live) => set((z) => (z[key] = val), live)} />`;
  const style = (id) => edit((p) => {
    const x = findItem(p, "text", t.id);
    if (!x) return;
    const keep = { glow: x.viz.glow, sens: x.viz.sens, smooth: x.viz.smooth, spin: x.viz.spin };
    x.viz = newViz(id, x.viz.colorA, x.viz.colorB, keep);
    delete x.vizName;
  });
  const hasSound = useStore((s) => (s.project.audio || []).length > 0 || s.project.main.some((m) => s.project.media[m.mediaId]?.kind === "video"));
  const counted = v.style !== "wave";
  return html`<div>
    ${!hasSound && html`<p class="warn small">There's no sound in the project yet, so the visualizer stays still. Add music or a video with sound.</p>`}
    <${Section} title="Style">
      <div class="viz-styles">
        ${VIZ_STYLES.map(([id, name, icon]) => html`<button key=${id} class=${"chip" + (v.style === id ? " on" : "")} onClick=${() => style(id)} title=${name}>
          <${Icon} n=${icon} /> ${name}</button>`)}
      </div>
    <//>
    <${Section} title="Colours">
      <div class="grid2 viz-colors">
        <${Field} label="Colour 1"><input type="color" value=${v.colorA} onChange=${(e) => set((z) => (z.colorA = e.target.value))} /><//>
        <${Field} label="Colour 2"><input type="color" value=${v.colorB} onChange=${(e) => set((z) => (z.colorB = e.target.value))} /><//>
      </div>
      <button class="mini" onClick=${() => set((z) => ([z.colorA, z.colorB] = [z.colorB, z.colorA]))}><${Icon} n="arrow-left-right" /> Swap colours</button>
      ${num("glow", "Glow", 0, 1, 0.01, pct)}
    <//>
    <${Section} title="Movement">
      ${num("sens", "Sensitivity", 0.3, 2.5, 0.05, pct)}
      ${num("smooth", "Smoothness", 0, 1, 0.05, pct)}
      ${(ROUND_STYLES.has(v.style) || v.style === "stardust") && num("spin", "Spin (°/s)", -90, 90, 1, (x) => `${Math.round(x)}°`)}
      ${["bars", "dots"].includes(v.style) && html`<label class="check"><input type="checkbox" checked=${!!v.mirror} onChange=${(e) => set((z) => (z.mirror = e.target.checked))} />
        Bass in the middle (mirrored)</label>`}
    <//>
    <${Section} title="Shape">
      ${counted && num("count", v.style === "stardust" ? "Specks" : v.style === "hills" || v.style === "ring" ? "Points" : "Bars", 8, v.style === "stardust" ? 400 : 160, 1, (x) => String(Math.round(x)))}
      ${num("thick", v.style === "wave" || v.style === "hills" || v.style === "ring" ? "Line width" : v.style === "stardust" ? "Speck size" : "Bar width", 0, 1, 0.01, pct)}
      ${ROUND_STYLES.has(v.style) && num("radius", "Inner circle", 0.15, 0.9, 0.01, pct)}
      ${num("w", "Width", 80, 3840, 10, (x) => `${Math.round(x)} px`)}
      ${!ROUND_STYLES.has(v.style) && num("h", "Height", 40, 2160, 10, (x) => `${Math.round(x)} px`)}
    <//>
  </div>`;
}

/** Image / video panel › Beat sync: the clip itself zooms, shakes, blurs, flashes or glitches with the music. */
export function BeatSyncSection({ kind, item }) {
  const b = item.beat || { type: "off", amount: 0.5, source: "beat" };
  const set = (patch, live) => (live ? editLive : edit)((p) => { const x = findItem(p, kind, item.id); if (x) x.beat = { ...b, ...(x.beat || {}), ...patch }; });
  const on = b.type && b.type !== "off";
  return html`<div>
    <p class="muted small">Makes this ${kind === "main" ? "clip" : "layer"} move with the music: every kick drum (or the loudness) drives the effect, in the preview and in the exported video.</p>
    <div class="viz-styles">
      ${BEAT_TYPES.map(([id, name]) => html`<button key=${id} class=${"chip" + ((b.type || "off") === id ? " on" : "")} onClick=${() => set({ type: id })}>${name}</button>`)}
    </div>
    ${on && html`
      <${Slider} label="Strength" value=${b.amount ?? 0.5} min=${0} max=${1} step=${0.01} format=${pct} onChange=${(v, live) => set({ amount: v }, live)} />
      <${Field} label="React to">
        <select value=${b.source || "beat"} onChange=${(e) => set({ source: e.target.value })}>
          <option value="beat">Bass hits (kick drums)</option>
          <option value="level">Loudness</option>
        </select>
      <//>`}
  </div>`;
}
