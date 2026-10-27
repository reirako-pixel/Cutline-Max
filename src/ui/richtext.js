// A Text box where you can select letters or words and give them their own colour and size
// (used by Text › Text and by Title › Text). The styles are runs over the text (see ../spans.js).
import { useState, useRef } from "react";
import { checkpoint } from "../store.js";
import { styleRange, adjustRuns, styleAt } from "../spans.js";
import { html, Slider, Icon } from "./kit.js";

/**
 * value / runs: the text and its styled parts. onChange(value, runs, live): typing (runs follow the letters).
 * onRuns(runs, live): styling the selection. baseColor: the text's normal colour (for the picker's start).
 */
export function RichText({ value, runs, onChange, onRuns, multiline = false, baseColor = "#ffffff", rows = 3, onFocus }) {
  const [sel, setSel] = useState(null); // [start, end) of the last selection in the box
  const ref = useRef();
  const read = () => {
    const el = ref.current;
    if (!el) return;
    const a = el.selectionStart ?? 0, b = el.selectionEnd ?? 0;
    setSel(b > a ? [a, b] : null);
  };
  const props = {
    ref, value, rows, class: multiline ? "rich-text" : "rich-text title-line",
    onInput: (e) => { const v = e.target.value; onChange(v, adjustRuns(value, v, runs) || runs, true); setSel(null); },
    onSelect: read, onKeyUp: read, onMouseUp: read,
    onFocus: () => { checkpoint(); onFocus?.(); },
  };
  const box = multiline ? html`<textarea ...${props} />` : html`<input ...${props} />`;
  const cur = sel ? styleAt(runs, sel[0]) : null;
  const picked = sel ? value.slice(sel[0], sel[1]) : "";
  const apply = (patch, live) => sel && onRuns(styleRange(runs, value.length, sel[0], sel[1], patch), live);
  return html`<div class="rich">
    ${box}
    <div class=${"rich-bar" + (sel ? " on" : "")}>
      ${sel ? html`
        <span class="rich-sel ell" title=${picked}>“${picked}”</span>
        <label class="rich-color" title="Colour of the selected letters"><${Icon} n="palette" />
          <input type="color" value=${cur?.color || baseColor} onChange=${(e) => apply({ color: e.target.value })} /></label>
        <button class="mini" title="Back to the normal colour and size for the selected letters" onClick=${() => apply({ color: null, scale: null })}>Clear</button>`
        : html`<span class="muted small">Select letters or words above to give them their own colour or size.</span>`}
    </div>
    ${sel && html`<${Slider} label="Selected size" value=${cur?.scale || 1} min=${0.3} max=${3} step=${0.01} format=${(v) => `${Math.round(v * 100)}%`}
      onChange=${(v, live) => apply({ scale: v }, live)} />`}
    ${runs?.length > 0 && html`<div class="rich-preview" title="How the styled words look">
      ${preview(value, runs, baseColor)}
      <button class="mini" title="Remove all word colours and sizes" onClick=${() => onRuns([])}>Clear all</button>
    </div>`}
  </div>`;
}

/** The text as coloured / sized spans, so you can see which words are styled. */
function preview(text, runs, baseColor) {
  const parts = [];
  let i = 0;
  for (const r of [...runs].sort((a, b) => a.start - b.start)) {
    if (r.start > i) parts.push(html`<span style=${{ color: baseColor }}>${text.slice(i, r.start)}</span>`);
    parts.push(html`<span style=${{ color: r.color || baseColor, fontSize: `${Math.round(13 * Math.min(2.2, r.scale || 1))}px` }}>${text.slice(r.start, r.end)}</span>`);
    i = r.end;
  }
  if (i < text.length) parts.push(html`<span style=${{ color: baseColor }}>${text.slice(i)}</span>`);
  return html`<span class="rich-preview-text">${parts}</span>`;
}
