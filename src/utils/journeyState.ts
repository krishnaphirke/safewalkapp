/**
 * Formatters and state helper functions for journey timing, distance, and check-in status.
 */

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hrs > 0) {
    return `${hrs}h ${remainingMins.toString().padStart(2, '0')}m`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDistance(meters: number): string {
  if (isNaN(meters) || meters < 0) return '0 m';
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatTime(timestamp: number): string {
  if (!timestamp) return '--:--';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getRemainingCheckInSeconds(
  lastCheckInAt: number | undefined,
  startedAt: number,
  intervalMinutes: number,
  nowTimestamp: number = Date.now()
): number {
  const referenceTime = lastCheckInAt || startedAt;
  const targetNextTime = referenceTime + intervalMinutes * 60 * 1000;
  const diffMs = targetNextTime - nowTimestamp;
  return Math.max(0, Math.floor(diffMs / 1000));
}

export function isCheckInOverdue(
  lastCheckInAt: number | undefined,
  startedAt: number,
  intervalMinutes: number,
  nowTimestamp: number = Date.now()
): boolean {
  const referenceTime = lastCheckInAt || startedAt;
  const targetNextTime = referenceTime + intervalMinutes * 60 * 1000;
  return nowTimestamp > targetNextTime;
}
