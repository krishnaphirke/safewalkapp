/**
 * SafeWalk - Core Type Definitions
 */

export interface Coordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export interface SavedPlace {
  id: string;
  name: string;
  address: string;
  category: 'home' | 'work' | 'gym' | 'school' | 'other';
  coords: Coordinates;
  iconName?: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isPriority: boolean;
  notifyOnStart: boolean;
  notifyOnArrival: boolean;
  notifyOnDeviation: boolean;
  notifyOnSOS: boolean;
  avatarUrl?: string;
}

export interface CheckInEvent {
  id: string;
  timestamp: number;
  location: Coordinates;
  message: string;
  type: 'manual_ok' | 'scheduled_prompt' | 'auto_geofence';
  deliveredContacts: string[];
}

export interface RouteDeviationEvent {
  id: string;
  timestamp: number;
  distanceFromRouteMeters: number;
  location: Coordinates;
  status: 'pending' | 'acknowledged_safe' | 'rerouted' | 'escalated';
}

export interface EmergencyEvent {
  id: string;
  journeyId?: string;
  timestamp: number;
  location: Coordinates;
  addressApprox: string;
  status: 'requested' | 'recorded' | 'dispatching' | 'delivered' | 'cancelled';
  batteryLevel?: number;
  reason?: string;
  notifiedContactIds: string[];
  resolvedAt?: number;
}

export type JourneyStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface RouteWaypoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface Journey {
  id: string;
  title: string;
  origin: {
    name: string;
    coords: Coordinates;
  };
  destination: {
    name: string;
    address: string;
    coords: Coordinates;
  };
  waypoints: RouteWaypoint[];
  startedAt: number;
  completedAt?: number;
  expectedDurationMinutes: number;
  actualDurationSeconds?: number;
  totalDistanceMeters: number;
  status: JourneyStatus;
  sharedContactIds: string[];
  checkInIntervalMinutes: number; // e.g. 5, 10, 15
  lastCheckInAt?: number;
  checkInCount: number;
  deviationAlertThresholdMeters: number; // e.g. 150m
  deviations: RouteDeviationEvent[];
  checkIns: CheckInEvent[];
  emergencyEventId?: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  bloodType?: string;
  emergencyMedicalNotes?: string;
  demoMode: boolean;
  locationPermission: 'granted' | 'prompt' | 'denied';
  backgroundTrackingEnabled: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: 'journey' | 'checkin' | 'emergency' | 'system';
  read: boolean;
}
