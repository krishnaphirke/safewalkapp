import { Coordinates, RouteWaypoint } from '../types';

/**
 * Calculates Haversine distance between two coordinates in meters.
 */
export function haversineDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (coord1.lat * Math.PI) / 180;
  const phi2 = (coord2.lat * Math.PI) / 180;
  const deltaPhi = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLambda = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculates perpendicular or nearest distance from a coordinate point to a route segment (v to w) in meters.
 */
export function distanceToSegmentMeters(
  p: { lat: number; lng: number },
  v: { lat: number; lng: number },
  w: { lat: number; lng: number }
): number {
  // Use local projection approximation for small distances
  const avgLat = ((v.lat + w.lat) / 2) * (Math.PI / 180);
  const metersPerDegLat = 111320;
  const metersPerDegLng = 111320 * Math.cos(avgLat);

  const px = p.lng * metersPerDegLng;
  const py = p.lat * metersPerDegLat;
  const vx = v.lng * metersPerDegLng;
  const vy = v.lat * metersPerDegLat;
  const wx = w.lng * metersPerDegLng;
  const wy = w.lat * metersPerDegLat;

  const l2 = (wx - vx) * (wx - vx) + (wy - vy) * (wy - vy);
  if (l2 === 0) {
    const dx = px - vx;
    const dy = py - vy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Projection parameter t
  let t = ((px - vx) * (wx - vx) + (py - vy) * (wy - vy)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projX = vx + t * (wx - vx);
  const projY = vy + t * (wy - vy);

  const dx = px - projX;
  const dy = py - projY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Evaluates whether current location is deviated from polyline route.
 */
export function detectRouteDeviation(
  currentPos: Coordinates,
  routeWaypoints: RouteWaypoint[],
  thresholdMeters: number = 120
): { isDeviated: boolean; distanceMeters: number } {
  if (!routeWaypoints || routeWaypoints.length < 2) {
    return { isDeviated: false, distanceMeters: 0 };
  }

  let minDistance = Infinity;

  for (let i = 0; i < routeWaypoints.length - 1; i++) {
    const v = routeWaypoints[i];
    const w = routeWaypoints[i + 1];
    const dist = distanceToSegmentMeters(currentPos, v, w);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  return {
    isDeviated: minDistance > thresholdMeters,
    distanceMeters: Math.round(minDistance),
  };
}

/**
 * Calculates estimated walking time based on average walking speed (default 1.35 m/s = 4.86 km/h).
 */
export function calculateEstimatedWalkingDuration(
  distanceMeters: number,
  speedMps: number = 1.35
): number {
  if (distanceMeters <= 0) return 0;
  return Math.round(distanceMeters / speedMps / 60); // in minutes
}

/**
 * Interpolates point along a multi-segment route given a fraction from 0.0 to 1.0.
 */
export function interpolateRoutePoint(
  waypoints: RouteWaypoint[],
  progressFraction: number
): Coordinates {
  if (!waypoints || waypoints.length === 0) {
    return { lat: 0, lng: 0 };
  }
  if (waypoints.length === 1 || progressFraction <= 0) {
    return { lat: waypoints[0].lat, lng: waypoints[0].lng };
  }
  if (progressFraction >= 1) {
    const last = waypoints[waypoints.length - 1];
    return { lat: last.lat, lng: last.lng };
  }

  // Calculate cumulative segment lengths
  const segmentLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const d = haversineDistance(waypoints[i], waypoints[i + 1]);
    segmentLengths.push(d);
    totalLength += d;
  }

  if (totalLength === 0) {
    return { lat: waypoints[0].lat, lng: waypoints[0].lng };
  }

  const targetDist = totalLength * progressFraction;
  let accumulated = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i];
    if (accumulated + segLen >= targetDist) {
      const segT = (targetDist - accumulated) / segLen;
      const v = waypoints[i];
      const w = waypoints[i + 1];
      return {
        lat: v.lat + segT * (w.lat - v.lat),
        lng: v.lng + segT * (w.lng - v.lng),
      };
    }
    accumulated += segLen;
  }

  const last = waypoints[waypoints.length - 1];
  return { lat: last.lat, lng: last.lng };
}
