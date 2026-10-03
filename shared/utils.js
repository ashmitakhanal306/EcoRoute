/**
 * shared/utils.js
 *
 * Shared utility helpers used across citizen, driver, and admin pages.
 *
 * Exported API:
 *   showToast(message, type, duration)
 *   timeAgo(isoString)
 *   haversineDistance(lat1, lng1, lat2, lng2)  → metres
 *   getCurrentPosition(options)                → Promise<{lat, lng, accuracy}>
 *   formatCoords(lat, lng)                     → "28.63580° N, 77.22450° E"
 *   clamp(value, min, max)                     → number
 *   debounce(fn, wait)                         → debounced fn
 */


/* ════════════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
   Uses the .toast / .toast--show classes defined in theme.css.
   One toast is shown at a time; a new call replaces the previous.
   ════════════════════════════════════════════════════════════════ */

/** @type {HTMLElement|null} */
let _toastEl    = null;
/** @type {ReturnType<typeof setTimeout>|null} */
let _toastTimer = null;

/**
 * showToast(message, type, duration)
 *
 * @param {string}  message   — text to display
 * @param {'default'|'success'|'danger'|'warning'} type
 * @param {number}  duration  — ms before auto-dismiss (default 3 500)
 * @param {boolean} desktop   — use desktop (right-anchored) variant
 */
export function showToast(message, type = 'default', duration = 3500, desktop = false) {
  // ── Create the toast element once and reuse it ─────────────────
  if (!_toastEl) {
    _toastEl = document.createElement('div');
    document.body.appendChild(_toastEl);
  }

  // Icon per type
  const ICONS = { success: '✓', danger: '✕', warning: '⚠', default: 'ℹ' };
  const icon  = ICONS[type] ?? ICONS.default;

  // Build content
  _toastEl.innerHTML =
    `<span class="toast__icon" aria-hidden="true">${icon}</span>` +
    `<span class="toast__msg">${message}</span>`;

  // Reset classes then apply correct variant
  _toastEl.className = 'toast' + (desktop ? ' toast--desktop' : '');

  // Apply type-based accent border
  const COLORS = {
    success : 'rgba(22,163,74,.45)',
    danger  : 'rgba(220,38,38,.45)',
    warning : 'rgba(217,119,6,.45)',
    default : 'rgba(255,255,255,.12)',
  };
  _toastEl.style.borderColor = COLORS[type] ?? COLORS.default;

  // Trigger entrance animation (two rAF ensures transition fires)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      _toastEl.classList.add('toast--show');
    });
  });

  // Clear any existing dismiss timer
  clearTimeout(_toastTimer);

  // Auto-dismiss
  _toastTimer = setTimeout(() => {
    _toastEl?.classList.remove('toast--show');
    // Remove from DOM after CSS transition finishes (300 ms)
    setTimeout(() => {
      _toastEl?.remove();
      _toastEl = null;
    }, 350);
  }, duration);
}


/* ════════════════════════════════════════════════════════════════
   TIME-AGO FORMATTER
   ════════════════════════════════════════════════════════════════ */

/**
 * timeAgo(isoString) → human-readable relative time
 *
 * Examples:
 *   "just now"   (<60 s)
 *   "3m ago"     (<60 min)
 *   "2h ago"     (<24 h)
 *   "Yesterday"  (24–48 h)
 *   "3d ago"     (<7 d)
 *   "12 Jun"     (≥7 d)
 *
 * @param {string|Date} input — ISO 8601 string or Date object
 * @returns {string}
 */
export function timeAgo(input) {
  const date    = input instanceof Date ? input : new Date(input);
  const now     = Date.now();
  const seconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));

  if (seconds < 60)                return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)                return `${minutes}m ago`;
  const hours   = Math.floor(minutes / 60);
  if (hours   < 24)                return `${hours}h ago`;
  const days    = Math.floor(hours  / 24);
  if (days   === 1)                return 'Yesterday';
  if (days    < 7)                 return `${days}d ago`;

  // Older than a week → formatted date
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}


/* ════════════════════════════════════════════════════════════════
   HAVERSINE DISTANCE
   ════════════════════════════════════════════════════════════════ */

/** Earth's mean radius in metres */
const EARTH_RADIUS_M = 6_371_000;

/**
 * haversineDistance(lat1, lng1, lat2, lng2) → distance in metres
 *
 * Uses the numerically stable asin-sqrt form (avoids acos rounding
 * issues at very small distances).
 *
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number}  — metres
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_M * 2 * Math.asin(Math.sqrt(a));
}


/* ════════════════════════════════════════════════════════════════
   GEOLOCATION WRAPPER
   ════════════════════════════════════════════════════════════════ */

/**
 * getCurrentPosition(options)
 *
 * Wraps navigator.geolocation.getCurrentPosition in a Promise.
 * Rejects with a GeolocationPositionError or a plain Error if the
 * API is unavailable.
 *
 * @param {PositionOptions} [options]
 * @returns {Promise<{lat: number, lng: number, accuracy: number}>}
 *
 * Usage:
 *   const { lat, lng } = await getCurrentPosition();
 */
export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error(
        'Geolocation is not supported by your browser. ' +
        'Please use a modern browser or grant location permission.'
      ));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat      : pos.coords.latitude,
        lng      : pos.coords.longitude,
        accuracy : pos.coords.accuracy,   // metres
      }),
      (err) => {
        // Translate numeric error codes to readable messages
        const MESSAGES = {
          1: 'Location access denied. Please enable location permission.',
          2: 'Location unavailable. Check your device's GPS.',
          3: 'Location request timed out. Try again.',
        };
        reject(new Error(MESSAGES[err.code] ?? err.message));
      },
      {
        enableHighAccuracy : true,
        timeout            : 10_000,   // 10 s
        maximumAge         : 30_000,   // accept cached position up to 30 s old
        ...options,
      }
    );
  });
}


/* ════════════════════════════════════════════════════════════════
   SMALL HELPERS
   ════════════════════════════════════════════════════════════════ */

/**
 * formatCoords(lat, lng) → "28.63580° N, 77.22450° E"
 * Used in the citizen Report tab GPS display.
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {string}
 */
export function formatCoords(lat, lng) {
  const latStr = `${Math.abs(lat).toFixed(5)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(5)}° ${lng >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lngStr}`;
}

/**
 * clamp(value, min, max)
 * Constrain a number to a range — used for trust_score display.
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * debounce(fn, wait)
 * Returns a debounced version of fn that delays invocation by wait ms.
 * Used to throttle Realtime UI updates.
 *
 * @param {Function} fn
 * @param {number}   wait — ms
 * @returns {Function}
 */
export function debounce(fn, wait = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/**
 * makePinHTML(color, size, pulse)
 * Returns the HTML string for a Leaflet L.divIcon dump-site pin.
 *
 * @param {string}  color  — CSS colour (e.g. '#ef4444')
 * @param {number}  size   — diameter px (default 18)
 * @param {boolean} pulse  — whether to add a CSS pulse animation class
 * @returns {string}
 */
export function makePinHTML(color, size = 18, pulse = false) {
  const animClass = pulse
    ? (color.includes('22') || color.includes('05') ? 'animate-pulse-green' : 'animate-pulse-red')
    : '';
  return (
    `<div class="${animClass}" style="` +
      `width:${size}px;height:${size}px;` +
      `background:${color};` +
      `border:2.5px solid #fff;` +
      `border-radius:50%;` +
      `box-shadow:0 2px 8px rgba(0,0,0,.45)` +
    `"></div>`
  );
}
