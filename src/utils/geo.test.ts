import test from 'node:test';
import assert from 'node:assert/strict';
import {
  haversineDistance,
  distanceToSegmentMeters,
  detectRouteDeviation,
  calculateEstimatedWalkingDuration,
  interpolateRoutePoint,
} from './geo';

test('haversineDistance calculates realistic geographical distance', () => {
  // Distance between San Francisco (37.7749, -122.4194) and Oakland (37.8044, -122.2712) ~ 13.5 km
  const p1 = { lat: 37.7749, lng: -122.4194 };
  const p2 = { lat: 37.8044, lng: -122.2712 };
  const dist = haversineDistance(p1, p2);
  assert.ok(dist > 13000 && dist < 14500, `Expected ~13.5km, got ${dist}`);
});

test('haversineDistance between identical coordinates is 0', () => {
  const p = { lat: 51.5074, lng: -0.1278 };
  assert.equal(haversineDistance(p, p), 0);
});

test('distanceToSegmentMeters finds perpendicular distance correctly', () => {
  // Vertical segment on lng 0 from lat 0 to lat 1
  const v = { lat: 0, lng: 0 };
  const w = { lat: 1, lng: 0 };
  // Point p is at lat 0.5, lng 0.001 (approx 111 meters away)
  const p = { lat: 0.5, lng: 0.001 };
  const dist = distanceToSegmentMeters(p, v, w);
  assert.ok(dist > 100 && dist < 125, `Expected ~111m, got ${dist}`);
});

test('detectRouteDeviation correctly flags deviations above threshold', () => {
  const waypoints = [
    { lat: 40.7128, lng: -74.006 },
    { lat: 40.7138, lng: -74.006 },
    { lat: 40.7148, lng: -74.006 },
  ];

  // Point on route
  const onRoute = { lat: 40.7133, lng: -74.006 };
  const check1 = detectRouteDeviation(onRoute, waypoints, 50);
  assert.equal(check1.isDeviated, false);
  assert.ok(check1.distanceMeters < 10);

  // Point significantly off-route (e.g. 300 meters away)
  const offRoute = { lat: 40.7133, lng: -74.01 };
  const check2 = detectRouteDeviation(offRoute, waypoints, 100);
  assert.equal(check2.isDeviated, true);
  assert.ok(check2.distanceMeters > 100);
});

test('calculateEstimatedWalkingDuration computes walking minutes', () => {
  // 1350 meters at 1.35 m/s is 1000 seconds = ~16.66 min => 17 mins
  const duration = calculateEstimatedWalkingDuration(1350, 1.35);
  assert.equal(duration, 17);
});

test('interpolateRoutePoint interpolates accurately', () => {
  const waypoints = [
    { lat: 10, lng: 10 },
    { lat: 10, lng: 20 },
  ];
  const mid = interpolateRoutePoint(waypoints, 0.5);
  assert.equal(mid.lat, 10);
  assert.ok(Math.abs(mid.lng - 15) < 0.1);
});
