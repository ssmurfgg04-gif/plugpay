import { jsx as _jsx } from "react/jsx-runtime";
import { EMOJI_MAP, EMOJI_RE, ppIcon } from "@/lib/icons";

// Elements whose text content must stay plain strings (emoji are simply dropped if mapped).
const TEXT_ONLY = { option: 1, textarea: 1, title: 1, text: 1, tspan: 1, style: 1, script: 1 };

function fixString(str, type, keyBase) {
  EMOJI_RE.lastIndex = 0;
  if (!EMOJI_RE.test(str)) return str;
  EMOJI_RE.lastIndex = 0;
  if (TEXT_ONLY[type]) return str.replace(EMOJI_RE, (m, c) => (EMOJI_MAP[c] ? "" : m));
  const out = [];
  let last = 0, m, n = 0;
  while ((m = EMOJI_RE.exec(str))) {
    const name = EMOJI_MAP[m[1]];
    if (!name) continue;
    if (m.index > last) out.push(str.slice(last, m.index));
    out.push(_jsx("span", { className: "pp-ic", dangerouslySetInnerHTML: { __html: ppIcon(name) } }, keyBase + "i" + n++));
    last = m.index + m[0].length;
  }
  if (n === 0) return str;
  if (last < str.length) out.push(str.slice(last));
  return out;
}

export function fixChildren(ch, type) {
  if (typeof ch === "string") return fixString(ch, type, "e");
  if (Array.isArray(ch)) {
    let changed = false;
    const r = ch.map((c, i) => {
      if (typeof c === "string") {
        const f = fixString(c, type, "e" + i);
        if (f !== c) changed = true;
        return f;
      }
      return c;
    });
    return changed ? r : ch;
  }
  return ch;
}

export function fixConfig(type, config) {
  if (config && config.children != null && typeof type === "string") {
    const c = fixChildren(config.children, type);
    if (c !== config.children) return Object.assign({}, config, { children: c });
  }
  return config;
}