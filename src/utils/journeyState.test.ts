import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDuration,
  formatDistance,
  formatTime,
  getRemainingCheckInSeconds,
  isCheckInOverdue,
} from './journeyState';

test('formatDuration formats mm:ss and hh:mm', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(65), '01:05');
  assert.equal(formatDuration(3665), '1h 01m');
});

test('formatDistance formats meters and kilometers', () => {
  assert.equal(formatDistance(0), '0 m');
  assert.equal(formatDistance(450), '450 m');
  assert.equal(formatDistance(1200), '1.2 km');
  assert.equal(formatDistance(3850), '3.9 km');
});

test('getRemainingCheckInSeconds and isCheckInOverdue work consistently', () => {
  const startedAt = 1000000;
  const intervalMins = 10; // 600,000 ms

  // When 4 minutes have passed
  const nowNormal = startedAt + 4 * 60 * 1000;
  assert.equal(isCheckInOverdue(undefined, startedAt, intervalMins, nowNormal), false);
  const remaining = getRemainingCheckInSeconds(undefined, startedAt, intervalMins, nowNormal);
  assert.equal(remaining, 6 * 60);

  // When 11 minutes have passed
  const nowOverdue = startedAt + 11 * 60 * 1000;
  assert.equal(isCheckInOverdue(undefined, startedAt, intervalMins, nowOverdue), true);
  assert.equal(getRemainingCheckInSeconds(undefined, startedAt, intervalMins, nowOverdue), 0);
});
