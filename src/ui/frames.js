// Library › Frames: decorative borders over the whole picture (see ../frames.js), and the panel for one.
import { useEffect, useRef } from "react";
import { getState, setState, edit, editLive, uid, findItem, defaultTextStyle, projectDuration, freeTrack } from "../store.js";
import { FRAMES, frameDef, frameImage, newFrameLook, ANIMATED_FRAMES, MOTIFS, METALS } from "../frames.js";
import { html, Icon, Field, Section, Slider } from "./kit.js";

/** Adds a frame from the playhead to the end of the video (at least 3 seconds), selected and ready to edit. */
export function addFrame(type) {
  const { time, project } = getState();
  const id = uid();
  const dur = Math.max(3, projectDuration(project) - time);
  edit((p) => p.texts.push({
    id, start: time, dur, text: "", x: 0.5, y: 0.5, scale: 1, rotation: 0, opacity: 1, track: freeTrack(p.texts, time, dur),
    frame: newFrameLook(type), style: defaultTextStyle(),
    anim: { in: { type: "fade", dur: 0.5 }, out: { type: "none", dur: 0.4 } },
  }));
  setState({ selection: [{ kind: "text", id }] });
}

/** A preview of a frame over a sample picture. */
function FrameThumb({ type }) {
  const ref = useRef();
  useEffect(() => {
    const cv = ref.current, c = cv.getContext("2d"), W = cv.width, H = cv.height;
    const g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#37507a"); g.addColorStop(0.55, "#7a5a9a"); g.addColorStop(1, "#d98a6a");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = "rgba(255,220,150,0.85)"; c.beginPath(); c.arc(W * 0.68, H * 0.38, H * 0.14, 0, 6.283); c.fill();
    c.fillStyle = "#2a2140"; c.beginPath(); c.moveTo(0, H); c.lineTo(W * 0.3, H * 0.55); c.lineTo(W * 0.55, H * 0.8); c.lineTo(W * 0.8, H * 0.5); c.lineTo(W, H * 0.75); c.lineTo(W, H); c.fill();
    // drawn at a bigger size and shrunk, so the thumbnail shows the frame at its real proportions
    c.drawImage(frameImage({ ...newFrameLook(type), seed: 7 }, 640, 360, 1.3), 0, 0, W, H);
  }, [type]);
  return html`<canvas ref=${ref} width="160" height="90" class="frame-thumb" aria-hidden="true" />`;
}

export function FramesTab() {
  return html`<div>
    <b class="lib-title">Frames & borders</b>
    <p class="muted small">Click a frame to add it over the video from the playhead to the end. Trim it on the timeline, and change its colours in the panel on the right.</p>
    <div class="cards">
      ${FRAMES.map(([k, name]) => html`<button key=${k} class="card" title=${`Add the ${name.toLowerCase()} frame`} onClick=${() => addFrame(k)}>
        <${FrameThumb} type=${k} /><span>${name}</span></button>`)}
    </div>
  </div>`;
}

/** Inspector for a frame layer. */
export function FrameFields({ t }) {
  const f = t.frame;
  const set = (fn, live) => (live ? editLive : edit)((p) => { const x = findItem(p, "text", t.id); if (x) { x.frame = { ...x.frame }; fn(x.frame); } });
  const def = frameDef(f.type)[3];
  const labels = {
    torn: ["Paper", "Under-layer"], stars: ["Main colour", "Second colour"], burnt: ["Char", "Embers"], filmburn: ["Scorch", "Light leak"],
    papercut: ["Top layer", "Bottom layer"], deckled: ["Paper", "Fibres & line"], floral: ["Flowers", "Leaves"], lace: ["Lace", "Edge line"],
    foil: ["", ""], guilloche: ["Lines", "Paper"],
  }[f.type] || ["Colour", "Accent"];
  return html`<div>
    <${Section} title="Frame">
      <${Field} label="Style">
        <select value=${f.type} onChange=${(e) => set((x) => { const n = newFrameLook(e.target.value); Object.keys(x).forEach((k) => delete x[k]); Object.assign(x, n, { seed: f.seed }); })}>
          ${FRAMES.map(([k, name]) => html`<option key=${k} value=${k}>${name}</option>`)}
        </select>
      <//>
      ${f.type === "foil" ? html`<${Field} label="Metal">
          <select value=${f.metal || "gold"} onChange=${(e) => set((x) => (x.metal = e.target.value))}>
            ${Object.keys(METALS).map((m) => html`<option key=${m} value=${m}>${{ gold: "Gold", silver: "Silver", rose: "Rose gold" }[m]}</option>`)}
          </select><//>`
        : html`<div class="grid2">
          <${Field} label=${labels[0]}><input type="color" value=${f.color || def.color} onChange=${(e) => set((x) => (x.color = e.target.value))} /><//>
          <${Field} label=${labels[1]}><input type="color" value=${f.color2 || def.color2} onChange=${(e) => set((x) => (x.color2 = e.target.value))} /><//>
        </div>`}
      ${f.type === "stars" && html`<${Field} label="Pattern">
        <select value=${f.motif || "stars"} onChange=${(e) => set((x) => (x.motif = e.target.value))}>
          ${MOTIFS.map(([k, n]) => html`<option key=${k} value=${k}>${n}</option>`)}
        </select><//>`}
      ${f.type === "floral" && html`<${Field} label="Corners">
        <select value=${f.corners || "two"} onChange=${(e) => set((x) => (x.corners = e.target.value))}>
          <option value="two">Two corners</option><option value="four">All four corners</option>
        </select><//>`}
      <${Slider} label="Thickness" value=${f.size ?? 1} min=${0.3} max=${2.5} step=${0.01} format=${(v) => `${Math.round(v * 100)}%`}
        onChange=${(v, live) => set((x) => (x.size = v), live)} />
      <${Slider} label="Opacity" value=${t.opacity ?? 1} min=${0} max=${1} step=${0.01} format=${(v) => `${Math.round(v * 100)}%`}
        onChange=${(v, live) => (live ? editLive : edit)((p) => { const x = findItem(p, "text", t.id); if (x) x.opacity = v; })} />
      ${ANIMATED_FRAMES.has(f.type) && html`
        <label class="check"><input type="checkbox" checked=${!!f.animate} onChange=${(e) => set((x) => (x.animate = e.target.checked))} />
          ${{ stars: "Twinkle", burnt: "Embers flicker", filmburn: "Light leaks move", foil: "Shine sweeps across" }[f.type]}</label>
        ${f.animate && html`<${Slider} label="Speed" value=${f.speed ?? 1} min=${0.2} max=${3} step=${0.05} format=${(v) => `${v.toFixed(2)}×`}
          onChange=${(v, live) => set((x) => (x.speed = v), live)} />`}`}
      <div class="action-row">
        <button onClick=${() => set((x) => (x.seed = 1 + Math.floor(Math.random() * 9999)))} title="Same style, a different random edge / pattern"><${Icon} n="shuffle" /> New variation</button>
        <button onClick=${() => set((x) => { const keep = { type: x.type, seed: x.seed }; Object.keys(x).forEach((k) => delete x[k]); Object.assign(x, structuredClone(def), keep); })}>Default colours</button>
      </div>
    <//>
  </div>`;
}
