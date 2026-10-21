import { Coordinates, RouteWaypoint } from '../types';
import { interpolateRoutePoint } from '../utils/geo';

export class LocationService {
  /**
   * Request browser geolocation permission.
   */
  static async requestPermission(): Promise<'granted' | 'prompt' | 'denied'> {
    if (!navigator.geolocation) {
      return 'denied';
    }

    try {
      if (navigator.permissions && navigator.permissions.query) {
        const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        return status.state as 'granted' | 'prompt' | 'denied';
      }
    } catch {
      // permissions API not supported, fall through
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve('granted'),
        () => resolve('denied'),
        { timeout: 5000 }
      );
    });
  }

  /**
   * Obtain current real position or fall back to default SF coordinate.
   */
  static getCurrentPosition(fallback: Coordinates = { lat: 37.7891, lng: -122.3984 }): Promise<Coordinates> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(fallback);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          });
        },
        () => {
          resolve(fallback);
        },
        {
          enableHighAccuracy: true,
          timeout: 4000,
          maximumAge: 10000,
        }
      );
    });
  }

  /**
   * Generates intermediate route waypoints between origin and destination coordinates
   * simulating realistic urban grid walking corridors.
   */
  static generateWalkingRoute(
    origin: Coordinates,
    destination: Coordinates
  ): RouteWaypoint[] {
    // Generate realistic walking waypoints:
    // Urban grid usually moves along Lat then Lng or through an intermediate intersection
    const mid1 = {
      lat: origin.lat + (destination.lat - origin.lat) * 0.35,
      lng: origin.lng + (destination.lng - origin.lng) * 0.15,
      name: 'Corridor Turn 1',
    };
    const mid2 = {
      lat: origin.lat + (destination.lat - origin.lat) * 0.7,
      lng: origin.lng + (destination.lng - origin.lng) * 0.85,
      name: 'Corridor Turn 2',
    };

    return [
      { lat: origin.lat, lng: origin.lng, name: 'Starting Point' },
      mid1,
      mid2,
      { lat: destination.lat, lng: destination.lng, name: 'Destination' },
    ];
  }

  /**
   * Computes position at progress (0 to 1) with optional deviation offset.
   */
  static getSimulatedPosition(
    waypoints: RouteWaypoint[],
    progressFraction: number,
    isDeviated: boolean = false
  ): Coordinates {
    const point = interpolateRoutePoint(waypoints, progressFraction);
    if (!isDeviated) {
      return point;
    }
    // Add deviation offset of ~250m (approx 0.0025 deg)
    return {
      lat: point.lat + 0.0022,
      lng: point.lng + 0.0018,
      accuracy: 15,
      timestamp: Date.now(),
    };
  }
}
