// Library › Titles: ready-made animated titles and lower thirds (templates in ../titles.js), and the panel
// for editing one. A title is a layer on the text tracks: drag it in the player, trim it on the timeline.
import { useEffect, useRef } from "react";
import { getState, setState, edit, editLive, uid, findItem, defaultTextStyle, checkpoint } from "../store.js";
import { TITLE_TEMPLATES, TITLE_CATEGORIES, titleTemplate, newTitle, titlePos, titleFonts, drawTitle, titleBox, resetTitleBoxes } from "../titles.js";
import { FONTS, loadFont } from "./fonts.js";
import { html, Field, Section, Slider } from "./kit.js";
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
        <input class="title-line" value=${T.lines?.[i] ?? ""} onFocus=${() => checkpoint()} onInput=${(e) => set((x) => (x.lines[i] = e.target.value), true)} />
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
