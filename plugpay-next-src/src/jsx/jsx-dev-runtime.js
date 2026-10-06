import { Fragment, jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
import { fixConfig } from "./fix";

export { Fragment };
export function jsxDEV(type, config, key, isStatic, source, self) {
  return _jsxDEV(type, fixConfig(type, config), key, isStatic, source, self);
}