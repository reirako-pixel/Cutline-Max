// Library › Titles: ready-made animated titles and lower thirds (templates in ../titles.js), and the panel
// for editing one. A title is a layer on the text tracks: drag it in the player, trim it on the timeline.
import { useEffect, useRef } from "react";
import { getState, setState, edit, editLive, uid, findItem, defaultTextStyle, checkpoint } from "../store.js";
import { TITLE_TEMPLATES, TITLE_CATEGORIES, titleTemplate, newTitle, titlePos, titleFonts, drawTitle, titleBox, resetTitleBoxes, TEXTURE_NAMES, drawStyleSample, titleIsBoxed } from "../titles.js";
import { FONTS, loadFont } from "./fonts.js";
import { html, Field, Section, Slider, KSlider, Icon } from "./kit.js";
import { RichText } from "./richtext.js";
import { setting } from "../settings.js";

// Text measured before a web font arrives has the wrong width: measure again once fonts load.
if (typeof document !== "undefined" && document.fonts?.addEventListener) document.fonts.addEventListener("loadingdone", () => resetTitleBoxes());

const loadTitleFonts = (T) => Promise.all(titleFonts(T).flatMap((css) => [400, 600, 700, 800].map((w) => loadFont(css, w)))).then(resetTitleBoxes);

/** Adds a title at the playhead (selected, ready to type into). */
export function addTitle(id) {
  const { time } = getState();
  const tid = uid();
  const T = newTitle(id);
  const [x, y] = titlePos(id);
  edit((p) => p.texts.push({
    id: tid, start: time, dur: Math.max(4, setting("textDur")), text: "", x, y, scale: 1, rotation: 0, opacity: 1,
    title: T, style: defaultTextStyle(), anim: { in: { type: "none", dur: 0.4 }, out: { type: "none", dur: 0.4 } },
  }));
  setState({ selection: [{ kind: "text", id: tid }] });
  loadTitleFonts(T);
}

// ---------- animated preview tiles (one shared loop) ----------

const tiles = new Set();
let loop = 0;
function drawTiles(now) {
  loop = tiles.size ? requestAnimationFrame(drawTiles) : 0;
  const lt = (now / 1000) % 4.2; // play the intro, hold, then the outro
  for (const { canvas, T } of tiles) {
    const c = canvas.getContext("2d"), W = canvas.width, H = canvas.height;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, W, H);
    const b = titleBox(T), bw = b.x1 - b.x0, bh = b.y1 - b.y0;
    const k = Math.min((W * 0.88) / bw, (H * 0.78) / bh);
    c.translate(W / 2 - ((b.x0 + b.x1) / 2) * k, H / 2 - ((b.y0 + b.y1) / 2) * k);
    drawTitle(c, T, lt, 4, k);
  }
}
function TitleTile({ T }) {
  const ref = useRef();
  useEffect(() => {
    const entry = { canvas: ref.current, T };
    tiles.add(entry);
    if (!loop) loop = requestAnimationFrame(drawTiles);
    return () => tiles.delete(entry);
  }, [T]);
  return html`<canvas ref=${ref} width="200" height="112" class="title-tile-canvas" aria-hidden="true" />`;
}

const sample = new Map(TITLE_TEMPLATES.map(([id]) => [id, newTitle(id)]));
let fontsAsked = false;

/** Library › Titles. */
export function TitlesTab({ part }) {
  useEffect(() => {
    if (fontsAsked) return;
    fontsAsked = true;
    Promise.all([...sample.values()].map(loadTitleFonts));
  }, []);
  const list = TITLE_TEMPLATES.filter((t) => part === "all" || !part || t[2] === part);
  return html`<div>
    <p class="muted small">Click a title to add it at the playhead. Then type your words in the panel on the right, and drag it in the player to place it. Each one animates in and out by itself.</p>
    <div class="title-grid">
      ${list.map(([id, name]) => html`<button key=${id} class="title-tile" title=${`Add “${name}”`} onClick=${() => addTitle(id)}>
        <${TitleTile} T=${sample.get(id)} /><span>${name}</span></button>`)}
    </div>
  </div>`;
}

// ---------- panel ----------

/** Words, colours, font and timing of a title (the panel on the right). */
export function TitleFields({ t }) {
  const T = t.title;
  const d = titleTemplate(T.tpl)[3];
  const set = (fn, live) => (live ? editLive : edit)((p) => { const x = findItem(p, "text", t.id); if (x) { x.title = { ...x.title, lines: [...(x.title.lines || [])] }; fn(x.title); } });
  const useTemplate = (id) => {
    const fresh = newTitle(id);
    edit((p) => {
      const x = findItem(p, "text", t.id);
      if (!x) return;
      // Keep the words you typed where the new template has the same number of lines.
      const keep = (x.title.lines || []).length === fresh.lines.length;
      x.title = { ...fresh, lines: keep ? [...x.title.lines] : fresh.lines, speed: x.title.speed, noOut: x.title.noOut };
    });
    loadTitleFonts(fresh);
  };
  const fontValue = T.font || "";
  return html`<div>
    <${Section} title="Template">
      <select class="wide-select" value=${T.tpl} onChange=${(e) => useTemplate(e.target.value)}>
        ${TITLE_CATEGORIES.filter(([k]) => k !== "all").map(([cat, label]) => html`<optgroup key=${cat} label=${label}>
          ${TITLE_TEMPLATES.filter((x) => x[2] === cat).map(([id, name]) => html`<option key=${id} value=${id}>${name}</option>`)}
        </optgroup>`)}
      </select>
    <//>
    <${Section} title="Text">
      ${d.lines.map((_, i) => html`<${Field} key=${i} label=${d.labels?.[i] || (d.lines.length > 1 ? `Line ${i + 1}` : "Text")}>
        <${RichText} value=${T.lines?.[i] ?? ""} runs=${T.spans?.[i]} baseColor=${T.lineColor?.[i] || T.colorA}
          onChange=${(v, runs, live) => set((x) => { x.lines[i] = v; const sp = [...(x.spans || [])]; sp[i] = runs?.length ? runs : null; x.spans = sp; }, live)}
          onRuns=${(runs, live) => set((x) => { const sp = [...(x.spans || [])]; sp[i] = runs.length ? runs : null; x.spans = sp; }, live)} />
      <//>`)}
      <${Field} label="Font">
        <select value=${fontValue} onChange=${(e) => { set((x) => { if (e.target.value) x.font = e.target.value; else delete x.font; }); loadFont(e.target.value || d.font, 700); loadFont(e.target.value || d.font, 800); setTimeout(resetTitleBoxes, 600); }}>
          <option value="">Template font</option>
          ${FONTS.map((f) => html`<option key=${f.name} value=${f.css}>${f.name}</option>`)}
        </select>
      <//>
    <//>
    <${Section} title="Colours">
      <div class="grid2">
        <${Field} label=${d.colorLabels?.[0] || "Colour 1"}><input type="color" value=${T.colorA} onChange=${(e) => set((x) => (x.colorA = e.target.value))} /><//>
        <${Field} label=${d.colorLabels?.[1] || "Colour 2"}><input type="color" value=${T.colorB} onChange=${(e) => set((x) => (x.colorB = e.target.value))} /><//>
      </div>
      <button class="mini" onClick=${() => set((x) => { const [a, b] = d.colors; x.colorA = a; x.colorB = b; })}>Template colours</button>
    <//>
    <${Section} title="Animation">
      <${Slider} label="Speed" value=${T.speed || 1} min=${0.5} max=${2} step=${0.05} format=${(v) => `${v.toFixed(2)}×`}
        onChange=${(v, live) => set((x) => (x.speed = v), live)} />
      <label class="check"><input type="checkbox" checked=${!T.noOut} onChange=${(e) => set((x) => { if (e.target.checked) delete x.noOut; else x.noOut = true; })} />
        Animate out at the end</label>
    <//>
  </div>`;
}

// ---------- Style tab: fills, outlines, shadows and glows ----------

const solid = (c1) => ({ fill: { type: "solid", c1 } });
const grad = (c1, c2, angle = 90) => ({ fill: { type: "gradient", c1, c2, angle } });
const karaoke = (c1, outline) => ({ fill: { type: "karaoke", c1, c2: "#ffffff" }, stroke: { on: true, color: outline, width: 6, blur: 0 },
  shadow: { on: true, color: "#000000", opacity: 0.5, angle: 90, dist: 4, blur: 6 }, glow: { on: false } });
/** Preset groups. Each preset only replaces the parts it names (fill / stroke / shadow / glow), so they combine. */
export const STYLE_PRESETS = [
  ["Fills & gradients", [
    ["Template", { fill: { type: "template" } }], ["White", solid("#ffffff")], ["Yellow", solid("#ffe14d")], ["Black", solid("#111111")],
    ["Sunset", grad("#ffb02e", "#ff3c8e")], ["Ocean", grad("#3df2ff", "#3d5bff")], ["Mint", grad("#d4ff6b", "#1fcf9a")],
    ["Candy", grad("#ff7ad9", "#8b6bff", 0)], ["Fire", grad("#ffe14d", "#ff2d2d")], ["Ice", grad("#ffffff", "#5ec8ff")],
  ]],
  ["Textures", TEXTURE_NAMES.map(([id, name]) => [name, { fill: { type: "texture", texture: id } }])],
  ["Lyrics & karaoke", [
    ["Lyrics classic", { ...solid("#ffffff"), stroke: { on: true, color: "#000000", width: 5, blur: 0 }, shadow: { on: true, color: "#000000", opacity: 0.6, angle: 90, dist: 4, blur: 8 }, glow: { on: false } }],
    ["Lyrics soft", { ...solid("#ffffff"), stroke: { on: false }, shadow: { on: false }, glow: { on: true, color: "#000000", size: 22, strength: 3 } }],
    ["Lyrics neon", { ...solid("#ffffff"), stroke: { on: false }, shadow: { on: false }, glow: { on: true, color: "#ff3cac", size: 26, strength: 2 } }],
    ["Lyrics yellow", { ...solid("#ffe14d"), stroke: { on: true, color: "#1a1a1a", width: 6, blur: 0 }, shadow: { on: false }, glow: { on: false } }],
    ["Karaoke blue", karaoke("#3df2ff", "#0a1a3a")], ["Karaoke pink", karaoke("#ff3cac", "#2a0a1e")], ["Karaoke gold", karaoke("#ffd23f", "#2b1a00")],
  ]],
  ["Outlines", [
    ["None", { stroke: { on: false } }], ["Thin black", { stroke: { on: true, color: "#000000", width: 3, blur: 0 } }],
    ["Thick black", { stroke: { on: true, color: "#000000", width: 10, blur: 0 } }], ["White", { stroke: { on: true, color: "#ffffff", width: 6, blur: 0 } }],
    ["Soft blur", { stroke: { on: true, color: "#000000", width: 8, blur: 6 } }], ["Neon", { stroke: { on: true, color: "#00f0ff", width: 4, blur: 3 } }],
  ]],
  ["Shadows & glows", [
    ["None", { shadow: { on: false }, glow: { on: false } }],
    ["Drop shadow", { shadow: { on: true, color: "#000000", opacity: 0.6, angle: 45, dist: 8, blur: 10 } }],
    ["Soft shadow", { shadow: { on: true, color: "#000000", opacity: 0.7, angle: 90, dist: 4, blur: 22 } }],
    ["Hard shadow", { shadow: { on: true, color: "#000000", opacity: 1, angle: 45, dist: 12, blur: 0 } }],
    ["White glow", { glow: { on: true, color: "#ffffff", size: 24, strength: 2 } }],
    ["Pink glow", { glow: { on: true, color: "#ff3cac", size: 30, strength: 2 } }],
    ["Cyan glow", { glow: { on: true, color: "#00f0ff", size: 30, strength: 2 } }],
  ]],
];

function StyleSwatch({ look }) {
  const ref = useRef();
  useEffect(() => { drawStyleSample(ref.current.getContext("2d"), look, 84, 46); }, [look]);
  return html`<canvas ref=${ref} width="84" height="46" class="style-swatch" aria-hidden="true" />`;
}
// Keyed by group too: "White" and "None" exist in more than one group.
const presetLooks = new Map(STYLE_PRESETS.flatMap(([group, list]) => list.map(([name, p]) => [`${group}|${name}`, { ...p }])));

/** The Style tab of a title: presets, then fill, outline, shadow and glow controls. */
export function TitleStyleFields({ t }) {
  const look = t.title.look || {};
  const set = (fn, live) => (live ? editLive : edit)((p) => {
    const x = findItem(p, "text", t.id);
    if (!x) return;
    const l = { ...(x.title.look || {}) };
    fn(l);
    x.title = { ...x.title, look: l };
  });
  const part = (key) => look[key] || {};
  const put = (key, k, v, live) => set((l) => (l[key] = { ...(l[key] || {}), [k]: v }), live);
  const apply = (p) => set((l) => Object.assign(l, structuredClone(p)));
  const fill = part("fill"), stroke = part("stroke"), shadow = part("shadow"), glow = part("glow");
  const ftype = fill.type || "template";
  const num = (key, k, label, min, max, step, def, format) => html`<${Slider} label=${label} value=${part(key)[k] ?? def} min=${min} max=${max} step=${step}
    format=${format || ((v) => String(Math.round(v)))} onChange=${(v, live) => put(key, k, v, live)} />`;
  const colour = (key, k, label, def) => html`<${Field} label=${label}><input type="color" value=${part(key)[k] || def} onChange=${(e) => put(key, k, e.target.value)} /><//>`;
  const toggle = (key, label, defaults) => html`<label class="check"><input type="checkbox" checked=${!!part(key).on}
    onChange=${(e) => set((l) => (l[key] = { ...defaults, ...(l[key] || {}), on: e.target.checked }))} /> ${label}</label>`;
  const d = titleTemplate(t.title.tpl)[3];
  const lineLabel = (i) => d.labels?.[i] || (d.lines.length > 1 ? `Line ${i + 1}` : "Text");
  const perLine = (key, i, v, live) => (live ? editLive : edit)((p) => {
    const x = findItem(p, "text", t.id);
    if (!x) return;
    const arr = [...(x.title[key] || [])];
    while (arr.length < d.lines.length) arr.push(key === "lineScale" ? 1 : null);
    arr[i] = v;
    x.title = { ...x.title, [key]: arr };
  });
  const boxed = titleIsBoxed(t.title.tpl);
  return html`<div class="title-style">
    <${Section} title="Size & colour">
      <${KSlider} kind="text" id=${t.id} path="scale" label="Size" min=${0.1} max=${4} fallback=${1} format=${(v) => `${Math.round(v * 100)}%`} />
      ${d.lines.length > 1 && !boxed && d.lines.map((_, i) => html`<${Slider} key=${"s" + i} label=${`${lineLabel(i)} size`} value=${t.title.lineScale?.[i] || 1}
        min=${0.3} max=${3} step=${0.01} format=${(v) => `${Math.round(v * 100)}%`} onChange=${(v, live) => perLine("lineScale", i, v, live)} />`)}
      ${d.lines.length > 1 && boxed && html`<p class="muted small">This design keeps its text in boxes, so its lines can't be sized or aligned one by one. Size above resizes the whole title.</p>`}
      ${d.lines.length > 1 && !boxed && html`<div class="title-align" role="group" aria-label="Align the title's lines">
        <span>Align</span>
        ${[[null, "Template", "layout-template"], ["left", "Left", "align-left"], ["center", "Center", "align-center"], ["right", "Right", "align-right"], ["justify", "Justify", "align-justify"]]
          .map(([v, label, icon]) => html`<button key=${label} class=${"ibtn" + ((t.title.align || null) === v ? " on" : "")} title=${v ? `${label}: ${{ left: "line up the lines on the left", center: "centre every line", right: "line up the lines on the right", justify: "stretch every line to the same width" }[v]}` : "The template's own layout"}
            onClick=${() => edit((p) => { const x = findItem(p, "text", t.id); if (x) { x.title = { ...x.title }; if (v) x.title.align = v; else delete x.title.align; } })}><${Icon} n=${icon} /></button>`)}
      </div>`}
      <div class="line-colors">
        ${d.lines.map((_, i) => html`<div key=${"c" + i} class="line-color">
          <span>${lineLabel(i)} colour</span>
          <input type="color" value=${t.title.lineColor?.[i] || "#ffffff"} onChange=${(e) => perLine("lineColor", i, e.target.value)} />
          ${t.title.lineColor?.[i] ? html`<button class="mini" title="Use the template's colour again" onClick=${() => perLine("lineColor", i, null)}>Reset</button>`
            : html`<span class="muted small">template</span>`}
        </div>`)}
      </div>
    <//>
    ${STYLE_PRESETS.map(([group, list]) => html`<${Section} key=${group} title=${group} open=${group !== "Textures"}>
      <div class="style-grid">
        ${list.map(([name]) => html`<button key=${name} class="style-chip" title=${`${group}: ${name}`} onClick=${() => apply(presetLooks.get(`${group}|${name}`))}>
          <${StyleSwatch} look=${presetLooks.get(`${group}|${name}`)} /><span>${name}</span></button>`)}
      </div>
    <//>`)}
    <${Section} title="Fill">
      <${Field} label="Fill">
        <select value=${ftype} onChange=${(e) => put("fill", "type", e.target.value)}>
          <option value="template">Template's own</option><option value="solid">Solid colour</option><option value="gradient">Two-colour gradient</option>
          <option value="texture">Texture</option><option value="karaoke">Karaoke (sung colour sweeps across)</option>
        </select>
      <//>
      ${ftype === "solid" && colour("fill", "c1", "Colour", "#ffffff")}
      ${ftype === "gradient" && html`<div class="grid2">${colour("fill", "c1", "From", "#ffb02e")}${colour("fill", "c2", "To", "#ff3c8e")}</div>
        ${num("fill", "angle", "Direction", 0, 360, 1, 90, (v) => `${Math.round(v)}°`)}`}
      ${ftype === "texture" && html`<${Field} label="Texture">
        <select value=${fill.texture || "gold"} onChange=${(e) => put("fill", "texture", e.target.value)}>
          ${TEXTURE_NAMES.map(([id, name]) => html`<option key=${id} value=${id}>${name}</option>`)}
        </select><//>`}
      ${ftype === "karaoke" && html`<div class="grid2">${colour("fill", "c1", "Sung", "#3df2ff")}${colour("fill", "c2", "Not sung yet", "#ffffff")}</div>
        <p class="muted small">The sung colour sweeps across the words during the title's time on the timeline: trim the title to the line's length (Match audio length helps).</p>`}
    <//>
    <${Section} title="Outline">
      ${toggle("stroke", "Outline", { color: "#000000", width: 6, blur: 0 })}
      ${stroke.on && html`${colour("stroke", "color", "Colour", "#000000")}
        ${num("stroke", "width", "Thickness", 0, 30, 0.5, 6)}${num("stroke", "blur", "Blur", 0, 20, 0.5, 0)}`}
    <//>
    <${Section} title="Shadow">
      ${toggle("shadow", "Drop shadow", { color: "#000000", opacity: 0.6, angle: 45, dist: 8, blur: 10 })}
      ${shadow.on && html`${colour("shadow", "color", "Colour", "#000000")}
        ${num("shadow", "opacity", "Opacity", 0, 1, 0.01, 0.6, (v) => `${Math.round(v * 100)}%`)}
        ${num("shadow", "angle", "Angle", -180, 180, 1, 45, (v) => `${Math.round(v)}°`)}
        ${num("shadow", "dist", "Distance", 0, 60, 0.5, 8)}${num("shadow", "blur", "Blur", 0, 60, 0.5, 10)}`}
    <//>
    <${Section} title="Glow">
      ${toggle("glow", "Outer glow", { color: "#ffffff", size: 24, strength: 2 })}
      ${glow.on && html`${colour("glow", "color", "Colour", "#ffffff")}
        ${num("glow", "size", "Size", 0, 80, 1, 24)}${num("glow", "strength", "Strength", 1, 4, 1, 2)}`}
    <//>
    ${(t.title.look || t.title.align || t.title.lineColor?.some(Boolean) || t.title.lineScale?.some((v) => v && v !== 1)) && html`<button class="wide" onClick=${() => edit((p) => {
      const x = findItem(p, "text", t.id);
      if (x) { x.title = { ...x.title }; delete x.title.look; delete x.title.lineColor; delete x.title.lineScale; delete x.title.align; }
    })}>Back to the template's own style</button>`}
  </div>`;
}
