/**
 * shared/paths.js
 *
 * Computes the app BASE path at runtime so the app works correctly on:
 *   - localhost / 127.0.0.1   (e.g. npx serve .)      -> BASE = "/"
 *   - GitHub Pages subdirectory                        -> BASE = "/repo-name/"
 *   - Any root-domain host                             -> BASE = "/"
 *
 * Strategy: walk import.meta.url backwards to the known root.
 * This file lives at <BASE>/shared/paths.js, so stripping "/shared/paths.js"
 * from import.meta.url gives us the BASE URL.
 *
 * Exported helpers
 * ────────────────
 *   BASE        – absolute URL of the app root, e.g. "https://host/repo/"
 *   basePath    – path-only base,               e.g. "/repo/"
 *   url(path)   – returns BASE + path (no leading slash needed in path)
 *   goTo(path)  – navigates to url(path) using location.replace
 */

// Derive BASE from the URL of this module itself.
// import.meta.url = "https://host/base/shared/paths.js"
// Strip "/shared/paths.js" to get "https://host/base/"
const _moduleUrl = new URL(import.meta.url);
const _modulePath = _moduleUrl.pathname; // e.g. "/repo/shared/paths.js"
const _basePathname = _modulePath.slice(0, _modulePath.lastIndexOf('/shared/paths.js') + 1);

export const BASE     = _moduleUrl.origin + _basePathname; // full URL
export const basePath = _basePathname;                     // path only, e.g. "/repo/"

/**
 * url(path) → full URL string
 * path should NOT start with "/"
 * Examples:
 *   url("citizen/")   → "https://host/repo/citizen/"
 *   url("index.html") → "https://host/repo/index.html"
 */
export function url(path) {
  return BASE + path;
}

/**
 * goTo(path) — navigate (replaces history entry so back button doesn't loop)
 */
export function goTo(path) {
  window.location.replace(url(path));
}
