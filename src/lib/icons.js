import { ICONS, EMOJI_MAP } from "@/lib/icon-data";

// Matches the emoji the prototype swaps for SVG icons (same ranges as the original runtime).
export const EMOJI_RE = /([\u{1F000}-\u{1FAFF}\u2300-\u23FF\u2600-\u27BF\uFF0B\u2295\u2299\u2190\u2192\u2713\u2715])\uFE0F?/gu;

// Returns the <svg> markup for an icon name (falls back to the package icon).
export function ppIcon(name) {
  var body = ICONS[name] || ICONS.package;
  return (
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    body +
    "</svg>"
  );
}
export { ICONS, EMOJI_MAP };