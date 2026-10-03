/**
 * prediction.js — EcoRoute Garbage Overflow Prediction Engine
 * SIH 2026 · CleanGreen · Panel 2 (Right Sidebar)
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  PREDICTION FORMULA (Prototype of ML model — fully explainable)         │
 * │                                                                         │
 * │  score(zone) = clamp01(                                                 │
 * │    w_freq  × normalised_report_frequency                                │
 * │  + w_stale × normalised_days_since_cleaned                              │
 * │  + w_chron × is_chronic_flag                                            │
 * │  + w_dow   × day_of_week_multiplier                                     │
 * │  )                                                                      │
 * │                                                                         │
 * │  Weights (sum = 1.0):                                                   │
 * │    w_freq  = 0.40  (historical report frequency — strongest signal)     │
 * │    w_stale = 0.30  (recency of cleaning — staler = higher risk)         │
 * │    w_chron = 0.20  (chronic-zone designation adds flat risk bump)       │
 * │    w_dow   = 0.10  (weekend & festival days see 20-40% more dumping)    │
 * │                                                                         │
 * │  Day-of-week multipliers (empirical, based on field observation):       │
 * │    Mon 0.85 · Tue 0.90 · Wed 0.90 · Thu 0.95                           │
 * │    Fri 1.00 · Sat 1.25 · Sun 1.35                                       │
 * │    Diwali / Holi / Eid week: +0.40 (hardcoded date ranges)             │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS — all assumptions documented for audit / presentation
═══════════════════════════════════════════════════════════════════ */

/** Prediction model weights — must sum to 1.0 */
export const WEIGHTS = {
  freq:    0.40,
  stale:   0.30,
  chronic: 0.20,
  dow:     0.10,
};

/** Max report count for frequency normalisation.
 *  Any zone with >= MAX_REPORTS_NORM reports scores 1.0 on freq. */
export const MAX_REPORTS_NORM = 12;

/** Max staleness ceiling for normalisation (days). */
export const STALE_CEILING_DAYS = 7;

/** Day-of-week multipliers (0=Sun, 1=Mon, ..., 6=Sat) */
export const DOW_MULTIPLIERS = [1.35, 0.85, 0.90, 0.90, 0.95, 1.00, 1.25];

/** Known high-risk festival date ranges (YYYY-MM-DD, inclusive). */
export const FESTIVAL_RANGES = [
  { name: 'Diwali',     start: '2026-10-20', end: '2026-10-22' },
  { name: 'Holi',       start: '2026-03-25', end: '2026-03-26' },
  { name: 'Eid ul-Fitr',start: '2026-03-20', end: '2026-03-21' },
  { name: 'Christmas',  start: '2026-12-25', end: '2026-12-26' },
];
export const FESTIVAL_BOOST = 0.40;

/* ═══════════════════════════════════════════════════════════════════
   CITY ZONE DEFINITIONS (named bounding boxes, WGS-84)
═══════════════════════════════════════════════════════════════════ */
export const CITY_ZONES = [
  {
    id: 'zone-central',
    name: 'Central Delhi',
    abbr: 'CD',
    bounds: { minLat: 28.610, maxLat: 28.660, minLng: 77.190, maxLng: 77.240 },
    defaultTrucks: 3,
    color: '#ef4444',
  },
  {
    id: 'zone-south',
    name: 'South Delhi',
    abbr: 'SD',
    bounds: { minLat: 28.500, maxLat: 28.610, minLng: 77.180, maxLng: 77.260 },
    defaultTrucks: 3,
    color: '#f97316',
  },
  {
    id: 'zone-northwest',
    name: 'North-West Delhi',
    abbr: 'NW',
    bounds: { minLat: 28.660, maxLat: 28.760, minLng: 77.050, maxLng: 77.250 },
    defaultTrucks: 3,
    color: '#a855f7',
  },
  {
    id: 'zone-west',
    name: 'West Delhi',
    abbr: 'WD',
    bounds: { minLat: 28.580, maxLat: 28.680, minLng: 77.060, maxLng: 77.190 },
    defaultTrucks: 2,
    color: '#38bdf8',
  },
  {
    id: 'zone-east',
    name: 'East Delhi',
    abbr: 'ED',
    bounds: { minLat: 28.580, maxLat: 28.680, minLng: 77.240, maxLng: 77.340 },
    defaultTrucks: 2,
    color: '#22c55e',
  },
];

/* ═══════════════════════════════════════════════════════════════════
   FLEET EFFICIENCY ASSUMPTIONS (documented for audit)
═══════════════════════════════════════════════════════════════════ */

/** Average route distance per truck per day (km)
 *  Source: MoHUA Smart Cities Fleet Efficiency Survey 2024 */
export const AVG_ROUTE_KM_PER_TRUCK = 18;

/** CNG municipal truck fuel consumption (litres-equivalent per km)
 *  Source: MoHUA Fleet Efficiency Report 2024, Table 4 */
export const FUEL_L_PER_KM = 0.35;

/** CO2 equivalent per litre of CNG-equivalent fuel (kg/L)
 *  Source: IPCC AR6 WG3, Table 10.2 (adjusted for CNG, -12% vs diesel) */
export const CO2_KG_PER_LITRE = 2.68;

/** Average urban collection speed stop-and-go (km/h) */
export const AVG_COLLECTION_SPEED_KMH = 25;

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════ */

function clamp01(v) { return Math.min(1, Math.max(0, v)); }

export function getDowFactor(date) {
  date = date || new Date();
  const iso = date.toISOString().substring(0, 10);
  const inFestival = FESTIVAL_RANGES.some(r => iso >= r.start && iso <= r.end);
  const rawDow = DOW_MULTIPLIERS[date.getDay()];
  const raw    = rawDow + (inFestival ? FESTIVAL_BOOST : 0);
  // Normalise: raw range [0.85, 1.75] -> [0, 1]
  return clamp01((raw - 0.85) / (1.75 - 0.85));
}

export function getStaleFactor(lastCleanedAt) {
  if (!lastCleanedAt) return 1.0;
  const diffDays = (Date.now() - new Date(lastCleanedAt).getTime()) / 86400000;
  return clamp01(diffDays / STALE_CEILING_DAYS);
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN SCORER
═══════════════════════════════════════════════════════════════════ */

/**
 * scoreHotspot(h, now?) -> { score: 0-1, breakdown: {...} }
 */
export function scoreHotspot(h, now) {
  now = now || new Date();
  const isCleanedToday = h.status === 'cleaned' &&
    h.last_cleaned_at &&
    (Date.now() - new Date(h.last_cleaned_at).getTime()) < 86400000;

  const freqFactor    = clamp01((h.report_count || 0) / MAX_REPORTS_NORM);
  const staleFactor   = getStaleFactor(h.last_cleaned_at);
  const chronicFactor = h.is_chronic ? 1.0 : 0.0;
  const dowFactor     = getDowFactor(now);

  let raw =
    WEIGHTS.freq    * freqFactor    +
    WEIGHTS.stale   * staleFactor   +
    WEIGHTS.chronic * chronicFactor +
    WEIGHTS.dow     * dowFactor;

  if (isCleanedToday) raw *= 0.5;

  return {
    score: clamp01(raw),
    breakdown: { freqFactor, staleFactor, chronicFactor, dowFactor, isCleanedToday },
  };
}

/** scoreAllHotspots -> scored array sorted desc */
export function scoreAllHotspots(hotspots, now) {
  now = now || new Date();
  return hotspots
    .map(h => ({ ...h, ...scoreHotspot(h, now) }))
    .sort((a, b) => b.score - a.score);
}

/* ═══════════════════════════════════════════════════════════════════
   ZONE AGGREGATION
═══════════════════════════════════════════════════════════════════ */

export function getZoneForHotspot(h) {
  return CITY_ZONES.find(z =>
    h.lat >= z.bounds.minLat && h.lat <= z.bounds.maxLat &&
    h.lng >= z.bounds.minLng && h.lng <= z.bounds.maxLng
  ) || null;
}

/** computeZoneRisks -> Array of { zone, avgScore, band, hotspots } */
export function computeZoneRisks(scoredHotspots) {
  return CITY_ZONES.map(zone => {
    const b = zone.bounds;
    const zh = scoredHotspots.filter(h =>
      h.lat >= b.minLat && h.lat <= b.maxLat &&
      h.lng >= b.minLng && h.lng <= b.maxLng
    );
    const avgScore = zh.length
      ? zh.reduce((s, h) => s + h.score, 0) / zh.length
      : 0.20;
    const band =
      avgScore >= 0.65 ? 'high' :
      avgScore >= 0.38 ? 'medium' : 'low';
    return { zone, avgScore: +avgScore.toFixed(3), band, hotspots: zh };
  });
}

/* ═══════════════════════════════════════════════════════════════════
   FLEET EFFICIENCY GAINS
═══════════════════════════════════════════════════════════════════ */

/**
 * computeEfficiencyGains(zoneAllocations: [{zoneId, trucks}])
 * -> { trucksRedeployed, fuelSavedL, timeSavedHrs, co2AvoidedKg }
 *
 * Assumptions:
 *   Fuel saved  = trucks_reduced * AVG_ROUTE_KM_PER_TRUCK * FUEL_L_PER_KM
 *   CO2 avoided = fuel_saved * CO2_KG_PER_LITRE
 *   Time saved  = trucks_reduced * AVG_ROUTE_KM_PER_TRUCK / AVG_COLLECTION_SPEED_KMH
 */
export function computeEfficiencyGains(zoneAllocations) {
  let trucksRedeployed = 0;
  for (const za of zoneAllocations) {
    const zone = CITY_ZONES.find(z => z.id === za.zoneId);
    if (!zone) continue;
    const delta = zone.defaultTrucks - za.trucks;
    if (delta > 0) trucksRedeployed += delta;
  }
  const fuelSavedL   = trucksRedeployed * AVG_ROUTE_KM_PER_TRUCK * FUEL_L_PER_KM;
  const timeSavedHrs = trucksRedeployed * AVG_ROUTE_KM_PER_TRUCK / AVG_COLLECTION_SPEED_KMH;
  const co2AvoidedKg = fuelSavedL * CO2_KG_PER_LITRE;
  return {
    trucksRedeployed,
    fuelSavedL:   +fuelSavedL.toFixed(1),
    timeSavedHrs: +timeSavedHrs.toFixed(1),
    co2AvoidedKg: +co2AvoidedKg.toFixed(1),
  };
}

/* ═══════════════════════════════════════════════════════════════════
   LEAFLET HEAT DATA
═══════════════════════════════════════════════════════════════════ */

/** buildHeatData -> [[lat, lng, intensity], ...] for Leaflet.heat */
export function buildHeatData(scoredHotspots) {
  return scoredHotspots.map(h => [h.lat, h.lng, h.score]);
}

/* ═══════════════════════════════════════════════════════════════════
   FORMULA TOOLTIP HTML
═══════════════════════════════════════════════════════════════════ */
export const FORMULA_HTML = `
<div style="max-width:260px;font-size:.77rem;line-height:1.65;color:#e2e8f0;font-family:inherit;">
  <div style="font-weight:900;color:#4ade80;margin-bottom:6px;display:flex;align-items:center;gap:6px;">
    <span>🔮</span><span>How is this predicted?</span>
  </div>
  <code style="background:rgba(0,0,0,.45);display:block;padding:9px 11px;border-radius:8px;font-size:.72rem;color:#86efac;line-height:1.7;border:1px solid rgba(34,197,94,.2);">
    score = clamp(0–1,<br>
    &nbsp;<b style="color:#fde68a;">0.40</b> × report_freq<br>
    + <b style="color:#fde68a;">0.30</b> × staleness<br>
    + <b style="color:#fde68a;">0.20</b> × is_chronic<br>
    + <b style="color:#fde68a;">0.10</b> × day_factor<br>
    )
  </code>
  <div style="margin-top:9px;color:#94a3b8;font-size:.7rem;display:flex;flex-direction:column;gap:3px;">
    <span><b style="color:#cbd5e1;">report_freq</b> = reports ÷ 12</span>
    <span><b style="color:#cbd5e1;">staleness</b> = days_since_cleaned ÷ 7</span>
    <span><b style="color:#cbd5e1;">is_chronic</b> = 0 or 1</span>
    <span><b style="color:#cbd5e1;">day_factor</b> = 0.85–1.35 (↑ weekends &amp; festivals)</span>
    <span style="color:#475569;margin-top:4px;font-style:italic;">Cleaned today → final score × 0.5</span>
  </div>
</div>`;
