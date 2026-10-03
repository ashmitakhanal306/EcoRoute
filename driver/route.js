/**
 * /driver/route.js
 * Route Planning, Nearest-Neighbor TSP Optimizer, and OSRM Road Geometry Integration
 * EcoRoute Municipal Driver Console
 */

/**
 * Haversine formula to calculate great-circle distance between two points in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Seeded fallback hotspots for testing or offline evaluation
 */
export const MOCK_HOTSPOTS = [
  {
    id: 'h0000001-0000-0000-0000-000000000001',
    name: 'Connaught Place Market — Bin Overflow',
    lat: 28.63150,
    lng: 77.21670,
    is_chronic: true,
    status: 'reported',
    report_count: 8,
    type: 'chronic',
    tag: 'Chronic'
  },
  {
    id: 'h0000001-0000-0000-0000-000000000005',
    name: 'Rajiv Chowk Metro Exit B Corner',
    lat: 28.63280,
    lng: 77.21950,
    is_chronic: false,
    status: 'reported',
    report_count: 5,
    type: 'verified_report',
    tag: 'Citizen Report'
  },
  {
    id: 'h0000001-0000-0000-0000-000000000002',
    name: 'Paharganj Market Back Alley Pole 4',
    lat: 28.64380,
    lng: 77.21280,
    is_chronic: true,
    status: 'reported',
    report_count: 10,
    type: 'chronic',
    tag: 'Chronic'
  },
  {
    id: 'h0000001-0000-0000-0000-000000000006',
    name: 'Karol Bagh Sabzi Mandi Dumpsite',
    lat: 28.65080,
    lng: 77.18920,
    is_chronic: false,
    status: 'reported',
    report_count: 4,
    type: 'verified_report',
    tag: 'Citizen Report'
  },
  {
    id: 'h0000001-0000-0000-0000-000000000007',
    name: 'Janpath Road Footpath Clearance',
    lat: 28.62300,
    lng: 77.21470,
    is_chronic: false,
    status: 'reported',
    report_count: 3,
    type: 'verified_report',
    tag: 'Citizen Report'
  }
];

/**
 * Fetch daily eligible stops from Supabase:
 * - All hotspots where is_chronic = true and not cleaned
 * - Plus hotspots that have verified reports and not cleaned
 */
export async function fetchDailyStops(supabase) {
  const fetchFromDb = async () => {
    // 1. Fetch uncleaned chronic hotspots
    const { data: chronicHotspots, error: cErr } = await supabase
      .from('hotspots')
      .select('id, name, lat, lng, is_chronic, status, report_count')
      .neq('status', 'cleaned')
      .eq('is_chronic', true);

    if (cErr) throw cErr;

    // 2. Fetch hotspots with verified reports
    const { data: verifiedReports, error: rErr } = await supabase
      .from('reports')
      .select('hotspot_id')
      .eq('status', 'verified');

    if (rErr) throw rErr;

    const verifiedHotspotIds = new Set((verifiedReports || []).map(r => r.hotspot_id).filter(Boolean));

    let verifiedHotspots = [];
    if (verifiedHotspotIds.size > 0) {
      const { data: vhData } = await supabase
        .from('hotspots')
        .select('id, name, lat, lng, is_chronic, status, report_count')
        .neq('status', 'cleaned')
        .in('id', Array.from(verifiedHotspotIds));
      verifiedHotspots = vhData || [];
    }

    // Merge and deduplicate by id
    const stopsMap = new Map();

    (chronicHotspots || []).forEach(h => {
      stopsMap.set(h.id, {
        ...h,
        type: 'chronic',
        tag: 'Chronic'
      });
    });

    (verifiedHotspots || []).forEach(h => {
      if (!stopsMap.has(h.id)) {
        stopsMap.set(h.id, {
          ...h,
          type: 'verified_report',
          tag: 'Citizen Report'
        });
      }
    });

    const stops = Array.from(stopsMap.values());
    if (stops.length > 0) {
      return stops;
    }
    return null;
  };

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Supabase fetch timed out')), 2000)
    );
    const result = await Promise.race([fetchFromDb(), timeoutPromise]);
    if (result && result.length > 0) return result;
  } catch (err) {
    console.warn('[route] Using fallback hotspots:', err.message);
  }

  // Fallback to seeded demo hotspots
  return JSON.parse(JSON.stringify(MOCK_HOTSPOTS));
}

/**
 * Nearest-Neighbor TSP optimization starting from driver location
 * @param {{lat: number, lng: number}} driverLocation
 * @param {Array} stops
 * @returns {Array} ordered stops with distance and estimated ETA
 */
export function orderStopsNearestNeighbor(driverLocation, stops) {
  if (!stops || stops.length === 0) return [];
  if (!driverLocation || isNaN(driverLocation.lat) || isNaN(driverLocation.lng)) {
    return stops.map((s, idx) => ({ ...s, stop_order: idx + 1, distance_km: 0, eta_mins: 3 }));
  }

  const unvisited = [...stops];
  const ordered = [];
  let currentLat = driverLocation.lat;
  let currentLng = driverLocation.lng;

  let stopNum = 1;
  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = haversineDistance(currentLat, currentLng, unvisited[i].lat, unvisited[i].lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    const nextStop = unvisited.splice(nearestIdx, 1)[0];
    const distKm = Math.round(minDistance * 10) / 10;
    // Estimated ETA: 25 km/h average speed in municipal traffic (~2.4 mins per km) + 1 min buffer
    const etaMins = Math.max(2, Math.round(distKm * 2.4 + 1));

    ordered.push({
      ...nextStop,
      stop_order: stopNum++,
      distance_km: distKm,
      eta_mins: etaMins
    });

    currentLat = nextStop.lat;
    currentLng = nextStop.lng;
  }

  return ordered;
}

/**
 * Fetches real road-following polyline coordinates using the OSRM public demo API
 * Falls back to straight lines if the request fails or is rate-limited.
 * @param {{lat: number, lng: number}} startLocation
 * @param {Array} orderedStops
 * @returns {Promise<{coordinates: Array<[number, number]>, distanceKm: number, durationMins: number, isRoadNetwork: boolean}>}
 */
export async function getRouteGeometryOSRM(startLocation, orderedStops) {
  if (!orderedStops || orderedStops.length === 0) {
    return {
      coordinates: [],
      distanceKm: 0,
      durationMins: 0,
      isRoadNetwork: false
    };
  }

  // Waypoints in [longitude, latitude] for OSRM
  const waypoints = [
    [startLocation.lng, startLocation.lat],
    ...orderedStops.map(s => [s.lng, s.lat])
  ];

  const coordsString = waypoints.map(w => `${w[0].toFixed(5)},${w[1].toFixed(5)}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
        const latLngs = route.geometry.coordinates.map(c => [c[1], c[0]]);
        return {
          coordinates: latLngs,
          distanceKm: Math.round((route.distance / 1000) * 10) / 10,
          durationMins: Math.round(route.duration / 60),
          isRoadNetwork: true
        };
      }
    }
  } catch (err) {
    console.warn('[route] OSRM routing failed or timed out, falling back to straight polyline', err);
  }

  // Straight polyline fallback
  const straightCoords = [
    [startLocation.lat, startLocation.lng],
    ...orderedStops.map(s => [s.lat, s.lng])
  ];

  let totalDist = 0;
  for (let i = 0; i < straightCoords.length - 1; i++) {
    totalDist += haversineDistance(
      straightCoords[i][0], straightCoords[i][1],
      straightCoords[i + 1][0], straightCoords[i + 1][1]
    );
  }

  return {
    coordinates: straightCoords,
    distanceKm: Math.round(totalDist * 10) / 10,
    durationMins: Math.round(totalDist * 2.5),
    isRoadNetwork: false
  };
}
