// App settings (Menu › Settings): where projects are saved, autosave, export defaults, encoder, preview and
// timeline defaults. Desktop: stored in prefs.json next to the app's other settings (survives updates);
// browser: local storage.
import { getState, setState } from "./store.js";

const desktop = typeof window !== "undefined" ? window.cutlineDesktop : null;
const KEY = "cutline.settings";

export const DEFAULTS = {
  projectsDir: "", // "" = Documents › Cutline Projects
  autosaveSec: 20, // 0 = only when closing
  startScreen: "home", // "home" | "last" (open the last project)
  exportRes: "project", // "project" or a short side in px (1080, 720…)
  exportFps: "project",
  exportCodec: "avc",
  exportQuality: "high",
  exportKbps: 40000, // custom bitrate
  encoder: "auto", // "auto" | "hardware" | "software"
  exportDir: "", // "" = ask / Downloads
  askExportPath: true,
  imageDur: 5,
  textDur: 3,
  gpu: true, // graphics acceleration for the whole app (restart needed)
  autoUpdate: true, // look for a new version when the app opens
  skin: "classic", // look of the whole app: "classic" or one of the neon skins (SKINS)
};

/** The app's skins: [id, name, accent, second accent, background] (colours are for the picker swatches). */
export const SKINS = [
  ["classic", "Classic", "#22d3c5", "#2f5d8a", "#111214"],
  ["cyber", "Neon Cyber", "#00f0ff", "#ff2bd6", "#070a16"],
  ["synthwave", "Synthwave", "#ff3cac", "#7b5cff", "#0f0620"],
  ["toxic", "Toxic", "#a6ff00", "#00ffa3", "#060d08"],
  ["ultraviolet", "Ultraviolet", "#b26bff", "#3d8bff", "#0a0716"],
  ["inferno", "Inferno", "#ff6a1a", "#ffd23f", "#120806"],
];

/** Puts the chosen skin on the page (CSS in src/skins.css keys off <html data-skin>). */
export function applySkin(id) {
  if (typeof document === "undefined") return;
  const known = SKINS.some(([k]) => k === id) ? id : "classic";
  if (known === "classic") delete document.documentElement.dataset.skin;
  else document.documentElement.dataset.skin = known;
}

export const settings = () => ({ ...DEFAULTS, ...(getState().settings || {}) });
export const setting = (k) => settings()[k];

export async function loadSettings() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { /* ignore */ }
  try { if (desktop?.loadPrefs) s = { ...s, ...((await desktop.loadPrefs())?.settings || {}) }; } catch { /* ignore */ }
  setState({ settings: s });
  applySkin(settings().skin);
  return settings();
}

export async function setSetting(k, v) {
  const s = { ...(getState().settings || {}), [k]: v };
  setState({ settings: s });
  if (k === "skin") applySkin(v);
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  try { if (desktop?.savePrefs) await desktop.savePrefs({ ...(await desktop.loadPrefs()), settings: s }); } catch { /* ignore */ }
}

// Last used durations (transitions, in / out animations): new ones start with what you used last.
const DUR_KEY = "cutline.lastDurations";
export function lastDur(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(DUR_KEY) || "{}")[key]; return typeof v === "number" ? v : fallback; } catch { return fallback; }
}
export function rememberDur(key, v) {
  try { const o = JSON.parse(localStorage.getItem(DUR_KEY) || "{}"); o[key] = v; localStorage.setItem(DUR_KEY, JSON.stringify(o)); } catch { /* ignore */ }
}
