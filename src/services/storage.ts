import {
  UserProfile,
  TrustedContact,
  SavedPlace,
  Journey,
  EmergencyEvent,
  NotificationItem,
} from '../types';

const STORAGE_KEYS = {
  USER: 'safewalk_user',
  CONTACTS: 'safewalk_contacts',
  SAVED_PLACES: 'safewalk_saved_places',
  JOURNEYS: 'safewalk_journeys',
  ACTIVE_JOURNEY: 'safewalk_active_journey',
  EMERGENCY_EVENTS: 'safewalk_emergencies',
  NOTIFICATIONS: 'safewalk_notifications',
  ONBOARDING_DONE: 'safewalk_onboarded',
  AUTH_TOKEN: 'safewalk_auth_token',
};

const DEFAULT_USER: UserProfile = {
  id: 'usr_maya_01',
  name: 'Maya Lin',
  email: 'maya.lin@example.com',
  phone: '+1 (555) 349-8821',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  bloodType: 'O+',
  emergencyMedicalNotes: 'Allergic to penicillin. Carries inhaler for mild asthma.',
  demoMode: true,
  locationPermission: 'granted',
  backgroundTrackingEnabled: true,
};

const DEFAULT_CONTACTS: TrustedContact[] = [
  {
    id: 'cnt_01',
    name: 'Sarah Davis',
    relationship: 'Sister',
    phone: '+1 (555) 234-5678',
    email: 'sarah.davis@example.com',
    isPriority: true,
    notifyOnStart: true,
    notifyOnArrival: true,
    notifyOnDeviation: true,
    notifyOnSOS: true,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'cnt_02',
    name: 'David Kim',
    relationship: 'Partner',
    phone: '+1 (555) 345-6789',
    email: 'david.kim@example.com',
    isPriority: true,
    notifyOnStart: true,
    notifyOnArrival: true,
    notifyOnDeviation: true,
    notifyOnSOS: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'cnt_03',
    name: 'Elena Rostova',
    relationship: 'Roommate',
    phone: '+1 (555) 456-7890',
    email: 'elena.r@example.com',
    isPriority: false,
    notifyOnStart: false,
    notifyOnArrival: true,
    notifyOnDeviation: true,
    notifyOnSOS: true,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
  },
];

const DEFAULT_SAVED_PLACES: SavedPlace[] = [
  {
    id: 'plc_01',
    name: 'Home',
    address: '742 Evergreen Terrace, San Francisco, CA',
    category: 'home',
    coords: { lat: 37.7749, lng: -122.4194 },
    iconName: 'Home',
  },
  {
    id: 'plc_02',
    name: 'Work — FinTech Tower',
    address: '500 Howard Street, Suite 1400, San Francisco',
    category: 'work',
    coords: { lat: 37.7891, lng: -122.3984 },
    iconName: 'Briefcase',
  },
  {
    id: 'plc_03',
    name: 'Apex Fitness Hub',
    address: '220 9th Street, SOMA',
    category: 'gym',
    coords: { lat: 37.7765, lng: -122.411 },
    iconName: 'Dumbbell',
  },
  {
    id: 'plc_04',
    name: 'Civic Center Metro Station',
    address: 'Market & 8th Street',
    category: 'other',
    coords: { lat: 37.7792, lng: -122.4158 },
    iconName: 'Train',
  },
];

const DEFAULT_PAST_JOURNEYS: Journey[] = [
  {
    id: 'jrn_prev_01',
    title: 'Walk from Work to Home',
    origin: {
      name: 'Work — FinTech Tower',
      coords: { lat: 37.7891, lng: -122.3984 },
    },
    destination: {
      name: 'Home',
      address: '742 Evergreen Terrace',
      coords: { lat: 37.7749, lng: -122.4194 },
    },
    waypoints: [
      { lat: 37.7891, lng: -122.3984 },
      { lat: 37.7845, lng: -122.4072 },
      { lat: 37.7798, lng: -122.4145 },
      { lat: 37.7749, lng: -122.4194 },
    ],
    startedAt: Date.now() - 86400000 + 3600000 * 2, // yesterday
    completedAt: Date.now() - 86400000 + 3600000 * 2 + 1320000, // 22 mins later
    expectedDurationMinutes: 25,
    actualDurationSeconds: 1320,
    totalDistanceMeters: 2150,
    status: 'completed',
    sharedContactIds: ['cnt_01', 'cnt_02'],
    checkInIntervalMinutes: 10,
    checkInCount: 2,
    deviationAlertThresholdMeters: 120,
    deviations: [],
    checkIns: [
      {
        id: 'chk_101',
        timestamp: Date.now() - 86400000 + 3600000 * 2 + 600000,
        location: { lat: 37.7845, lng: -122.4072 },
        message: 'Midway on Market St, well-lit path.',
        type: 'manual_ok',
        deliveredContacts: ['cnt_01', 'cnt_02'],
      },
      {
        id: 'chk_102',
        timestamp: Date.now() - 86400000 + 3600000 * 2 + 1200000,
        location: { lat: 37.7765, lng: -122.4172 },
        message: 'Turned onto my block safely.',
        type: 'manual_ok',
        deliveredContacts: ['cnt_01', 'cnt_02'],
      },
    ],
  },
  {
    id: 'jrn_prev_02',
    title: 'Evening walk from Apex Gym',
    origin: {
      name: 'Apex Fitness Hub',
      coords: { lat: 37.7765, lng: -122.411 },
    },
    destination: {
      name: 'Home',
      address: '742 Evergreen Terrace',
      coords: { lat: 37.7749, lng: -122.4194 },
    },
    waypoints: [
      { lat: 37.7765, lng: -122.411 },
      { lat: 37.7758, lng: -122.4155 },
      { lat: 37.7749, lng: -122.4194 },
    ],
    startedAt: Date.now() - 86400000 * 3,
    completedAt: Date.now() - 86400000 * 3 + 780000,
    expectedDurationMinutes: 15,
    actualDurationSeconds: 780,
    totalDistanceMeters: 980,
    status: 'completed',
    sharedContactIds: ['cnt_01'],
    checkInIntervalMinutes: 10,
    checkInCount: 1,
    deviationAlertThresholdMeters: 120,
    deviations: [],
    checkIns: [
      {
        id: 'chk_201',
        timestamp: Date.now() - 86400000 * 3 + 450000,
        location: { lat: 37.7758, lng: -122.4155 },
        message: 'Checked in OK at Mission & 9th.',
        type: 'manual_ok',
        deliveredContacts: ['cnt_01'],
      },
    ],
  },
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'ntf_01',
    title: 'Journey completed safely',
    message: 'Your contacts Sarah Davis and David Kim were notified of your safe arrival.',
    timestamp: Date.now() - 86400000 + 3600000 * 2 + 1400000,
    type: 'journey',
    read: true,
  },
  {
    id: 'ntf_02',
    title: 'SafeWalk Intelligence Sync',
    message: 'Your safe walking routes and check-in score are synchronized with Safety Intelligence Platform.',
    timestamp: Date.now() - 86400000 * 2,
    type: 'system',
    read: true,
  },
];

export class StorageService {
  static getUser(): UserProfile | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      // Auto initialize default demo user
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_USER;
    }
  }

  static saveUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static getContacts(): TrustedContact[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(DEFAULT_CONTACTS));
      return DEFAULT_CONTACTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_CONTACTS;
    }
  }

  static saveContacts(contacts: TrustedContact[]): void {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  }

  static getSavedPlaces(): SavedPlace[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_PLACES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SAVED_PLACES, JSON.stringify(DEFAULT_SAVED_PLACES));
      return DEFAULT_SAVED_PLACES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SAVED_PLACES;
    }
  }

  static saveSavedPlaces(places: SavedPlace[]): void {
    localStorage.setItem(STORAGE_KEYS.SAVED_PLACES, JSON.stringify(places));
  }

  static getJourneys(): Journey[] {
    const raw = localStorage.getItem(STORAGE_KEYS.JOURNEYS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.JOURNEYS, JSON.stringify(DEFAULT_PAST_JOURNEYS));
      return DEFAULT_PAST_JOURNEYS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PAST_JOURNEYS;
    }
  }

  static saveJourneys(journeys: Journey[]): void {
    localStorage.setItem(STORAGE_KEYS.JOURNEYS, JSON.stringify(journeys));
  }

  static getActiveJourney(): Journey | null {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_JOURNEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static saveActiveJourney(journey: Journey | null): void {
    if (!journey) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_JOURNEY);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_JOURNEY, JSON.stringify(journey));
    }
  }

  static getEmergencyEvents(): EmergencyEvent[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EMERGENCY_EVENTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveEmergencyEvents(events: EmergencyEvent[]): void {
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_EVENTS, JSON.stringify(events));
  }

  static getNotifications(): NotificationItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  }

  static saveNotifications(notifications: NotificationItem[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }

  static isOnboardingCompleted(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE) === 'true';
  }

  static setOnboardingCompleted(completed: boolean): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, completed ? 'true' : 'false');
  }

  static isAuthenticated(): boolean {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) !== null;
  }

  static setAuthToken(token: string | null): void {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  }
}
