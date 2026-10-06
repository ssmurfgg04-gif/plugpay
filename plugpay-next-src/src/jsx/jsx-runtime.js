// Custom JSX runtime (tsconfig "jsxImportSource": "@/jsx").
// Behaves exactly like React's runtime, plus: emoji inside text children render as SVG icons,
// which is how the PlugPay design system shows icons without an icon font.
import { Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { fixConfig } from "./fix";

export { Fragment };
export function jsx(type, config, key) { return _jsx(type, fixConfig(type, config), key); }
export function jsxs(type, config, key) { return _jsxs(type, fixConfig(type, config), key); }