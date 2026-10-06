// Navigation bridge. Components call navigate()/goBack() (as in the prototype); the real Next.js
// router is injected once by <RouterBridge/> so these work from event handlers and store actions.
let router = null;
export function bindRouter(r) { router = r; }

export function navigate(path, opts) {
  if (!router) { if (typeof window !== "undefined") window.location.assign(path); return; }
  if (opts && opts.replace) router.replace(path); else router.push(path);
}
export function goBack() {
  if (typeof window !== "undefined" && window.history.length > 1 && router) router.back();
  else navigate("/");
}