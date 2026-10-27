// Styled parts of a text ("rich text"): select letters or words in the Text box and give them their own
// colour and size. Stored as runs over character offsets: [{ start, end, color?, scale? }] (end exclusive,
// offsets in the text's own characters, like a text box's selection). Runs never overlap.

const pick = (r) => {
  const o = {};
  if (r?.color) o.color = r.color;
  if (r?.scale && Math.abs(r.scale - 1) > 1e-3) o.scale = r.scale;
  return Object.keys(o).length ? o : null;
};

/** One entry per character: its own style, or null. */
export function charStyles(runs, n) {
  const a = new Array(Math.max(0, n)).fill(null);
  for (const r of runs || []) {
    const o = pick(r);
    if (!o) continue;
    for (let i = Math.max(0, r.start); i < Math.min(n, r.end); i++) a[i] = { ...(a[i] || {}), ...o };
  }
  return a;
}

/** Back from per-character styles to runs (neighbours with the same style join up). */
export function toRuns(a) {
  const runs = [];
  for (let i = 0; i < a.length; i++) {
    const o = a[i];
    if (!o) continue;
    const last = runs[runs.length - 1];
    if (last && last.end === i && last.color === o.color && (last.scale || 1) === (o.scale || 1)) last.end = i + 1;
    else runs.push({ start: i, end: i + 1, ...o });
  }
  return runs;
}

/** Sets (or, with null, removes) colour / scale on characters [a, b). */
export function styleRange(runs, n, a, b, patch) {
  const arr = charStyles(runs, n);
  for (let i = Math.max(0, a); i < Math.min(n, b); i++) {
    const o = { ...(arr[i] || {}) };
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || (k === "scale" && Math.abs(v - 1) < 1e-3)) delete o[k];
      else o[k] = v;
    }
    arr[i] = pick(o);
  }
  return toRuns(arr);
}

/**
 * Keeps styles on the same letters when the text is edited: the unchanged start and end keep theirs, and
 * typed letters take the style of the letter before them (as in a word processor).
 */
export function adjustRuns(oldS, newS, runs) {
  if (!runs?.length || oldS === newS) return runs;
  let p = 0;
  while (p < oldS.length && p < newS.length && oldS[p] === newS[p]) p++;
  let q = 0;
  while (q < oldS.length - p && q < newS.length - p && oldS[oldS.length - 1 - q] === newS[newS.length - 1 - q]) q++;
  const arr = charStyles(runs, oldS.length);
  const inherit = p > 0 ? arr[p - 1] : null;
  const next = [...arr.slice(0, p), ...new Array(Math.max(0, newS.length - p - q)).fill(inherit), ...arr.slice(oldS.length - q)];
  return toRuns(next);
}

/** The style of the first character of [a, b) (for showing the current colour / size of a selection). */
export function styleAt(runs, a) {
  for (const r of runs || []) if (a >= r.start && a < r.end) return r;
  return null;
}
