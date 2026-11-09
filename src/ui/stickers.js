// Library › Stickers: animated emoji and text stickers (see ../stickers.js), and the panel for one.
import { useEffect, useRef, useState } from "react";
import { getState, setState, edit, editLive, uid, findItem, defaultTextStyle, freeTrack } from "../store.js";
import { EMOJI_GROUPS, TEXT_STICKERS, STICKER_ANIMS, STICKER_SHAPES, STICKER_FONTS, drawStickerAt, stickerSize, newEmojiSticker, newTextSticker,
  PREMIUM_FACES, ANIMATED_ELEMENTS, ELEMENT_CATEGORIES, ELEGANT_STICKERS, newFaceSticker, newSceneSticker, newElegantSticker } from "../stickers.js";
import { FACE_SHAPES, FACE_MOODS, FACE_PALETTES, SCENE_FX, ELEGANT_PALETTES, ELEGANT_FX, ELEGANT_FONTS } from "../stickerart.js";
import { loadFont } from "./fonts.js";
import { html, Field, Section, Slider } from "./kit.js";
import { setting } from "../settings.js";

const loadStickerFonts = () => {
  for (const [css, w] of Object.values(STICKER_FONTS)) loadFont(css, w);
  loadFont("'Great Vibes', cursive", 400); loadFont("'Dancing Script', cursive", 700); loadFont("'Playfair Display', serif", 700, true);
};

/** Adds a sticker at the playhead, in the middle of the picture (selected, ready to move and edit). */
export function addSticker(sticker) {
  loadStickerFonts();
  const { time } = getState();
  const id = uid();
  const dur = Math.max(1, setting("textDur") || 3);
  edit((p) => p.texts.push({
    id, start: time, dur, text: "", x: 0.5, y: 0.45, scale: 1, rotation: 0, opacity: 1, track: freeTrack(p.texts, time, dur),
    sticker, style: defaultTextStyle(), anim: { in: { type: "none", dur: 0.3 }, out: { type: "fade", dur: 0.25 } },
  }));
  setState({ selection: [{ kind: "text", id }] });
}

/** A sticker preview that plays its animation while the pointer is over it. */
function StickerThumb({ sticker, size = 64, still = 0.25 }) {
  const ref = useRef();
  const [hover, setHover] = useState(false);
  useEffect(() => {
    const cv = ref.current, c = cv.getContext("2d");
    const z = stickerSize(sticker), fit = Math.min((size * 0.82) / z.w, (size * 0.82) / z.h);
    let raf = 0, t0 = performance.now();
    const draw = (t) => {
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
      c.translate(cv.width / 2, cv.height / 2);
      drawStickerAt(c, { ...sticker, popIn: false }, t, 3, fit * 2);
    };
    if (!hover) draw(still);
    else { const tick = (now) => { draw((now - t0) / 1000); raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick); }
    return () => cancelAnimationFrame(raf);
  }, [hover, JSON.stringify(sticker)]);
  // Drawn at twice the size for sharp edges.
  return html`<canvas ref=${ref} width=${size * 2} height=${size * 2} class="sticker-thumb" style=${{ width: size, height: size }}
    onPointerEnter=${() => setHover(true)} onPointerLeave=${() => setHover(false)} aria-hidden="true" />`;
}

export function StickersTab({ part = "emoji" }) {
  useEffect(loadStickerFonts, []);
  if (part === "text") return html`<div>
    <b class="lib-title">Elegant words</b>
    <p class="muted small">Script words in gold, rose gold, silver and more that write themselves, glitter or glow. Point at one to see it.</p>
    <div class="sticker-grid elegant">
      ${ELEGANT_STICKERS.map((d) => html`<button key=${d[0]} class="sticker-btn" title=${`Add “${d[0]}”`} onClick=${() => addSticker(newElegantSticker(d))}>
        <${StickerThumb} sticker=${newElegantSticker(d)} size=${110} still=${3.2} /></button>`)}
    </div>
    <b class="lib-title">Text stickers</b>
    <p class="muted small">Click to add one at the playhead. Point at a sticker to see it move. Change the words, colours and animation on the right.</p>
    <div class="sticker-grid wide">
      ${TEXT_STICKERS.map((d) => html`<button key=${d[0]} class="sticker-btn" title=${`Add “${d[0]}”`} onClick=${() => addSticker(newTextSticker(d))}>
        <${StickerThumb} sticker=${newTextSticker(d)} size=${72} /></button>`)}
    </div>
  </div>`;
  return html`<div>
    <b class="lib-title">Emoji stickers</b>
    <p class="muted small">Click to add one at the playhead; point at one to see its animation. Each has its own move (change it on the right).</p>
    <div class="sticker-group">Premium faces</div>
    <div class="sticker-grid">
      ${PREMIUM_FACES.map((d, i) => html`<button key=${i} class="sticker-btn" title="Add this premium face" onClick=${() => addSticker(newFaceSticker(d))}>
        <${StickerThumb} sticker=${newFaceSticker(d)} size=${48} /></button>`)}
    </div>
    ${EMOJI_GROUPS.map(([group, list]) => html`<div key=${group}>
      <div class="sticker-group">${group}</div>
      <div class="sticker-grid">
        ${list.map(([e, anim]) => html`<button key=${e} class="sticker-btn" title=${`Add ${e}`} onClick=${() => addSticker(newEmojiSticker(e, anim))}>
          <${StickerThumb} sticker=${newEmojiSticker(e, anim)} size=${48} /></button>`)}
      </div>
    </div>`)}
  </div>`;
}

/** Elements › animated elements ("GIFs"): colourful moving emoji scenes by category. */
export function AnimatedElementsTab({ part }) {
  const list = ANIMATED_ELEMENTS[part] || ANIMATED_ELEMENTS.emotions;
  const name = ELEMENT_CATEGORIES.find(([k]) => k === part)?.[1] || "Emotions";
  return html`<div>
    <b class="lib-title">${name}</b>
    <p class="muted small">Animated, colourful elements. Point at one to see it move; click to add it at the playhead. Change its move, effect and glow on the right.</p>
    <div class="sticker-grid scene">
      ${list.map((d) => html`<button key=${d[0]} class="sticker-btn" title=${`Add ${d[0]}`} onClick=${() => addSticker(newSceneSticker(d))}>
        <${StickerThumb} sticker=${newSceneSticker(d)} size=${76} still=${0.6} /></button>`)}
    </div>
  </div>`;
}

/** Inspector for a sticker. */
export function StickerFields({ t }) {
  const s = t.sticker;
  const set = (fn, live) => (live ? editLive : edit)((p) => { const x = findItem(p, "text", t.id); if (x) { x.sticker = { ...x.sticker }; fn(x.sticker); } });
  const allEmoji = EMOJI_GROUPS.flatMap(([, l]) => l);
  return html`<div>
    <${Section} title=${s.kind === "emoji" ? "Emoji" : s.kind === "face" ? "Premium face" : "Words & look"}>
      ${s.kind === "face" ? html`
        <${Field} label="Shape">
          <select value=${s.shape} onChange=${(e) => set((x) => (x.shape = e.target.value))}>${FACE_SHAPES.map(([k, n]) => html`<option key=${k} value=${k}>${n}</option>`)}</select>
        <//>
        <${Field} label="Expression">
          <div class="anim-chips">${FACE_MOODS.map(([k, n]) => html`<button key=${k} class=${"chip" + (s.mood === k ? " on" : "")} onClick=${() => set((x) => (x.mood = k))}>${n}</button>`)}</div>
        <//>
        <${Field} label="Colour">
          <div class="anim-chips">${Object.entries(FACE_PALETTES).map(([k, [l, m, d]]) => html`<button key=${k} class=${"swatch" + (s.palette === k ? " on" : "")} title=${k}
            style=${{ background: `radial-gradient(circle at 35% 30%, ${l}, ${m} 55%, ${d})`, width: "26px", height: "26px" }} onClick=${() => set((x) => (x.palette = k))} />`)}</div>
        <//>`
      : s.shape === "elegant" ? html`
        <${Field} label="Words (Enter for a new line)">
          <textarea rows="2" value=${s.text} onInput=${(e) => set((x) => (x.text = e.target.value), true)} />
        <//>
        <${Field} label="Effect">
          <div class="anim-chips">${ELEGANT_FX.map(([k, n]) => html`<button key=${k} class=${"chip" + ((s.effect || "write") === k ? " on" : "")} onClick=${() => set((x) => (x.effect = k))}>${n}</button>`)}</div>
        <//>
        ${(s.effect || "write") === "write" && html`<${Slider} label="Writing time" value=${s.writeDur ?? 1.8} min=${0.4} max=${6} step=${0.1} format=${(v) => `${v.toFixed(1)} s`}
          onChange=${(v, live) => set((x) => (x.writeDur = v), live)} />`}
        <${Field} label="Finish">
          <div class="anim-chips">${Object.entries(ELEGANT_PALETTES).map(([k, [l, m, d]]) => html`<button key=${k} class=${"swatch" + (s.palette === k ? " on" : "")} title=${k}
            style=${{ background: `linear-gradient(180deg, ${l}, ${m} 50%, ${d})`, width: "26px", height: "26px" }} onClick=${() => set((x) => (x.palette = k))} />`)}</div>
        <//>
        <${Field} label="Font">
          <select value=${s.font} onChange=${(e) => set((x) => (x.font = e.target.value))}>
            <option value="vibes">Great Vibes (script)</option><option value="dancing">Dancing Script</option><option value="playfair">Playfair Display italic</option>
          </select>
        <//>`
      : s.kind === "emoji" ? html`
        <div class="emoji-pick">
          ${allEmoji.map(([e, anim]) => html`<button key=${e} class=${"chip" + (s.emoji === e ? " on" : "")} onClick=${() => set((x) => (x.emoji = e))} title="Use this emoji">${e}</button>`)}
        </div>
        <${Field} label="Or type / paste any emoji">
          <input value=${s.emoji} maxlength="16" onInput=${(e) => set((x) => (x.emoji = e.target.value || "😀"), true)} />
        <//>
        <label class="check"><input type="checkbox" checked=${s.shadow !== false} onChange=${(e) => set((x) => (x.shadow = e.target.checked))} /> Soft shadow</label>
        <${Field} label="Effect around it">
          <select value=${s.scene || "none"} onChange=${(e) => set((x) => { if (e.target.value === "none") delete x.scene; else x.scene = e.target.value; })}>
            ${SCENE_FX.map(([k, n]) => html`<option key=${k} value=${k}>${n}</option>`)}
          </select>
        <//>
        <div class="row">
          <label class="check"><input type="checkbox" checked=${!!s.glow} onChange=${(e) => set((x) => { if (e.target.checked) x.glow = "#ff3c6e"; else delete x.glow; })} /> Colour glow behind</label>
          ${s.glow && html`<input type="color" value=${s.glow} onChange=${(e) => set((x) => (x.glow = e.target.value))} />`}
        </div>`
      : html`
        <${Field} label="Words (Enter for a new line)">
          <textarea rows="2" value=${s.text} onInput=${(e) => set((x) => (x.text = e.target.value), true)} />
        <//>
        <${Field} label="Shape">
          <select value=${s.shape} onChange=${(e) => set((x) => (x.shape = e.target.value))}>
            ${STICKER_SHAPES.map(([k, n]) => html`<option key=${k} value=${k}>${n}</option>`)}
          </select>
        <//>
        <div class="grid2">
          <${Field} label=${s.shape === "none" ? "—" : "Shape colour"}><input type="color" value=${s.fill} disabled=${s.shape === "none"} onChange=${(e) => set((x) => (x.fill = e.target.value))} /><//>
          <${Field} label="Words colour"><input type="color" value=${s.color} onChange=${(e) => set((x) => (x.color = e.target.value))} /><//>
          <${Field} label="Outline"><input type="color" value=${s.outline} onChange=${(e) => set((x) => (x.outline = e.target.value))} /><//>
          <${Field} label="Font">
            <select value=${s.font} onChange=${(e) => set((x) => (x.font = e.target.value))}>
              <option value="comic">Comic (Bangers)</option><option value="round">Round bold (Poppins)</option>
            </select>
          <//>
        </div>
        <label class="check"><input type="checkbox" checked=${!!s.textOutline} onChange=${(e) => set((x) => (x.textOutline = e.target.checked ? x.outline || "#111111" : undefined))} /> Outline the words too</label>`}
      <${Slider} label="Size" value=${s.size ?? 220} min=${60} max=${900} step=${1} format=${(v) => String(Math.round(v))}
        onChange=${(v, live) => set((x) => (x.size = Math.round(v)), live)} />
    <//>
    <${Section} title="Sticker animation">
      <div class="anim-chips">
        ${STICKER_ANIMS.map(([k, n]) => html`<button key=${k} class=${"chip" + ((s.anim || "bounce") === k ? " on" : "")} onClick=${() => set((x) => (x.anim = k))}>${n}</button>`)}
      </div>
      <${Slider} label="Speed" value=${s.speed ?? 1} min=${0.2} max=${3} step=${0.05} format=${(v) => `${v.toFixed(2)}×`}
        onChange=${(v, live) => set((x) => (x.speed = v), live)} />
      <label class="check"><input type="checkbox" checked=${s.popIn !== false} onChange=${(e) => set((x) => (x.popIn = e.target.checked))} /> Pop in when it appears</label>
      <label class="check"><input type="checkbox" checked=${!!s.sparkles} onChange=${(e) => set((x) => (x.sparkles = e.target.checked))} /> Sparkles around it</label>
      <p class="muted small">The sticker keeps moving for as long as it's on the timeline. The Animation tab adds a way in and out (fade, slide…).</p>
    <//>
  </div>`;
}
