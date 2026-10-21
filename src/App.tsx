/**
 * SafeWalk - Complete Mobile Application
 * @license Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MobileFrame } from './components/MobileFrame';
import { BottomNavigation, TabKey } from './components/BottomNavigation';
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ActiveJourneyScreen } from './screens/ActiveJourneyScreen';
import { StartJourneyModal } from './screens/StartJourneyModal';
import { SOSScreen } from './screens/SOSScreen';
import { JourneysScreen } from './screens/JourneysScreen';
import { SafetyScreen } from './screens/SafetyScreen';
import { ContactsScreen } from './screens/ContactsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { NotificationsModal } from './components/NotificationsModal';
import { StorageService } from './services/storage';
import { LocationService } from './services/locationService';
import {
  UserProfile,
  Journey,
  TrustedContact,
  SavedPlace,
  NotificationItem,
  Coordinates,
  EmergencyEvent,
  CheckInEvent,
} from './types';

export default function App() {
  // Check for ?autostart=1 in URL
  const queryParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const autostart = queryParams.get('autostart') === '1';

  // Core App Flow State: 'splash' | 'onboarding' | 'auth' | 'app'
  const [appState, setAppState] = useState<'splash' | 'onboarding' | 'auth' | 'app'>(() => {
    if (autostart) return 'app';
    if (!StorageService.isOnboardingCompleted()) return 'splash';
    if (!StorageService.isAuthenticated()) return 'auth';
    return 'app';
  });

  // Active Tab: 'home' | 'journeys' | 'safety' | 'contacts' | 'profile'
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    return (
      StorageService.getUser() || {
        id: 'usr_maya',
        name: 'Maya Lin',
        email: 'maya.lin@example.com',
        phone: '+1 (555) 349-8821',
        demoMode: true,
        locationPermission: 'granted',
        backgroundTrackingEnabled: true,
      }
    );
  });

  // Data Collections
  const [contacts, setContacts] = useState<TrustedContact[]>(() => StorageService.getContacts());
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(() => StorageService.getSavedPlaces());
  const [journeys, setJourneys] = useState<Journey[]>(() => StorageService.getJourneys());
  const [activeJourney, setActiveJourney] = useState<Journey | null>(() => StorageService.getActiveJourney());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => StorageService.getNotifications());

  // Modal & Screen Overlays
  const [isStartModalOpen, setIsStartModalOpen] = useState<boolean>(false);
  const [preselectedPlace, setPreselectedPlace] = useState<SavedPlace | undefined>(undefined);
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isJourneyExpanded, setIsJourneyExpanded] = useState<boolean>(false);

  // Active Journey Tracking State
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [currentLocation, setCurrentLocation] = useState<Coordinates>({
    lat: 37.7891,
    lng: -122.3984,
    accuracy: 12,
  });

  // Sync state to local storage when collections change
  useEffect(() => {
    StorageService.saveContacts(contacts);
  }, [contacts]);

  useEffect(() => {
    StorageService.saveSavedPlaces(savedPlaces);
  }, [savedPlaces]);

  useEffect(() => {
    StorageService.saveJourneys(journeys);
  }, [journeys]);

  useEffect(() => {
    StorageService.saveActiveJourney(activeJourney);
  }, [activeJourney]);

  useEffect(() => {
    StorageService.saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    StorageService.saveUser(user);
  }, [user]);

  // Request browser location permission on mount
  useEffect(() => {
    LocationService.requestPermission().then((status) => {
      setUser((u) => ({ ...u, locationPermission: status }));
    });
    LocationService.getCurrentPosition().then((pos) => {
      setCurrentLocation(pos);
    });
  }, []);

  // Timer loop for active journey
  useEffect(() => {
    if (!activeJourney) {
      setElapsedSeconds(0);
      return;
    }

    const startMs = activeJourney.startedAt;
    const updateElapsed = () => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - startMs) / 1000));
      setElapsedSeconds(diffSecs);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeJourney]);

  // Auth flow callbacks
  const handleSplashContinue = () => {
    if (StorageService.isOnboardingCompleted()) {
      setAppState('auth');
    } else {
      setAppState('onboarding');
    }
  };

  const handleOnboardingComplete = () => {
    StorageService.setOnboardingCompleted(true);
    setAppState('auth');
  };

  const handleLoginSuccess = (newUser: UserProfile) => {
    setUser(newUser);
    StorageService.saveUser(newUser);
    StorageService.setAuthToken('token_' + Date.now());
    setAppState('app');
  };

  const handleLogout = () => {
    StorageService.setAuthToken(null);
    setAppState('auth');
  };

  // Journey lifecycle handlers
  const handleStartJourneyClick = (place?: SavedPlace) => {
    setPreselectedPlace(place);
    setIsStartModalOpen(true);
  };

  const handleStartJourney = (newJourney: Journey) => {
    setActiveJourney(newJourney);
    setIsJourneyExpanded(true); // Open directly to dedicated active journey screen

    // Push notification
    const newNotice: NotificationItem = {
      id: 'ntf_' + Date.now(),
      title: 'Journey Started',
      message: `Your journey to ${newJourney.destination.name} is active. ${newJourney.sharedContactIds.length} contacts notified.`,
      timestamp: Date.now(),
      type: 'journey',
      read: false,
    };
    setNotifications((prev) => [newNotice, ...prev]);
  };

  const handleCheckIn = (message: string) => {
    if (!activeJourney) return;

    const now = Date.now();
    const checkInEvent: CheckInEvent = {
      id: 'chk_' + now,
      timestamp: now,
      location: currentLocation,
      message,
      type: 'manual_ok',
      deliveredContacts: activeJourney.sharedContactIds,
    };

    const updatedJourney: Journey = {
      ...activeJourney,
      lastCheckInAt: now,
      checkInCount: (activeJourney.checkInCount || 0) + 1,
      checkIns: [...(activeJourney.checkIns || []), checkInEvent],
    };

    setActiveJourney(updatedJourney);

    const newNotice: NotificationItem = {
      id: 'ntf_' + now,
      title: "Check-In Verified: I'm OK",
      message: `Safety confirmation sent to ${activeJourney.sharedContactIds.length} contacts.`,
      timestamp: now,
      type: 'checkin',
      read: false,
    };
    setNotifications((prev) => [newNotice, ...prev]);
  };

  const handleArrival = () => {
    if (!activeJourney) return;

    const now = Date.now();
    const completedJourney: Journey = {
      ...activeJourney,
      status: 'completed',
      completedAt: now,
      actualDurationSeconds: elapsedSeconds || 1200,
    };

    setJourneys((prev) => [completedJourney, ...prev]);
    setActiveJourney(null);
    setIsJourneyExpanded(false);

    const newNotice: NotificationItem = {
      id: 'ntf_' + now,
      title: 'Safe Arrival Confirmed',
      message: `You arrived safely at ${completedJourney.destination.name}. Your trusted contacts were notified.`,
      timestamp: now,
      type: 'journey',
      read: false,
    };
    setNotifications((prev) => [newNotice, ...prev]);
  };

  const handleEndEarly = () => {
    if (!activeJourney) return;

    const now = Date.now();
    const endedJourney: Journey = {
      ...activeJourney,
      status: 'cancelled',
      completedAt: now,
      actualDurationSeconds: elapsedSeconds || 300,
    };

    setJourneys((prev) => [endedJourney, ...prev]);
    setActiveJourney(null);
    setIsJourneyExpanded(false);

    const newNotice: NotificationItem = {
      id: 'ntf_' + now,
      title: 'Journey Ended Early',
      message: `Your journey to ${endedJourney.destination.name} was stopped early.`,
      timestamp: now,
      type: 'journey',
      read: false,
    };
    setNotifications((prev) => [newNotice, ...prev]);
  };

  // SOS Emergency handlers
  const handleTriggerSOS = () => {
    setIsSOSOpen(true);

    const now = Date.now();
    const emergencyEvent: EmergencyEvent = {
      id: 'emg_' + now,
      journeyId: activeJourney?.id,
      timestamp: now,
      location: currentLocation,
      addressApprox: 'Market Street Corridor, San Francisco, CA',
      status: 'dispatching',
      batteryLevel: 88,
      notifiedContactIds: contacts.map((c) => c.id),
    };

    const existingEvents = StorageService.getEmergencyEvents();
    StorageService.saveEmergencyEvents([emergencyEvent, ...existingEvents]);

    const newNotice: NotificationItem = {
      id: 'ntf_' + now,
      title: 'EMERGENCY SOS Triggered',
      message: 'Emergency broadcast dispatched to your emergency network.',
      timestamp: now,
      type: 'emergency',
      read: false,
    };
    setNotifications((prev) => [newNotice, ...prev]);
  };

  const handleCancelSOS = (reason: string) => {
    const now = Date.now();
    const existingEvents = StorageService.getEmergencyEvents();
    if (existingEvents.length > 0) {
      existingEvents[0].status = 'cancelled';
      existingEvents[0].resolvedAt = now;
      existingEvents[0].reason = reason;
      StorageService.saveEmergencyEvents(existingEvents);
    }

    const newNotice: NotificationItem = {
      id: 'ntf_' + now,
      title: 'SOS Emergency Cancelled',
      message: `Emergency marked resolved: "${reason}". Safe status sent to contacts.`,
      timestamp: now,
      type: 'system',
      read: false,
    };
    setNotifications((prev) => [newNotice, ...prev]);
  };

  // Contacts management
  const handleAddContact = (contact: TrustedContact) => {
    setContacts((prev) => [...prev, contact]);
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleTogglePriority = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPriority: !c.isPriority } : c))
    );
  };

  // Saved places management
  const handleAddPlace = (place: SavedPlace) => {
    setSavedPlaces((prev) => [...prev, place]);
  };

  const handleDeletePlace = (id: string) => {
    setSavedPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <MobileFrame>
      {/* 1. Splash Screen */}
      {appState === 'splash' && <SplashScreen onContinue={handleSplashContinue} />}

      {/* 2. Onboarding Screen */}
      {appState === 'onboarding' && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}

      {/* 3. Authentication Screen */}
      {appState === 'auth' && <AuthScreen onLoginSuccess={handleLoginSuccess} />}

      {/* 4. Authenticated Main Application Flow */}
      {appState === 'app' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Main Tab Screen Switcher */}
          <main className="flex-1 flex flex-col overflow-hidden relative">
            {activeTab === 'home' && (
              <HomeScreen
                user={user}
                activeJourney={activeJourney}
                savedPlaces={savedPlaces}
                recentJourneys={journeys}
                notifications={notifications}
                elapsedSeconds={elapsedSeconds}
                onStartJourneyClick={handleStartJourneyClick}
                onViewActiveJourney={() => setIsJourneyExpanded(true)}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'journeys' && <JourneysScreen journeys={journeys} />}

            {activeTab === 'safety' && (
              <SafetyScreen user={user} onOpenSOS={handleTriggerSOS} />
            )}

            {activeTab === 'contacts' && (
              <ContactsScreen
                contacts={contacts}
                onAddContact={handleAddContact}
                onDeleteContact={handleDeleteContact}
                onTogglePriority={handleTogglePriority}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileScreen
                user={user}
                savedPlaces={savedPlaces}
                onUpdateUser={setUser}
                onAddPlace={handleAddPlace}
                onDeletePlace={handleDeletePlace}
                onLogout={handleLogout}
              />
            )}
          </main>

          {/* Bottom Tab Bar with Active Journey Persistent Mini-Banner */}
          <BottomNavigation
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
            }}
            activeJourney={activeJourney}
            onExpandActiveJourney={() => setIsJourneyExpanded(true)}
            elapsedSeconds={elapsedSeconds}
          />

          {/* Dedicated Active Journey Screen (when expanded) */}
          {activeJourney && isJourneyExpanded && (
            <div className="absolute inset-0 z-40 bg-[#F7F5EF] flex flex-col animate-slideUp">
              <ActiveJourneyScreen
                journey={activeJourney}
                contacts={contacts}
                elapsedSeconds={elapsedSeconds}
                onCheckIn={handleCheckIn}
                onArrival={handleArrival}
                onEndEarly={handleEndEarly}
                onTriggerSOS={handleTriggerSOS}
                onMinimize={() => setIsJourneyExpanded(false)}
              />
            </div>
          )}

          {/* Start A Journey 5-Step Modal */}
          <StartJourneyModal
            isOpen={isStartModalOpen}
            onClose={() => setIsStartModalOpen(false)}
            savedPlaces={savedPlaces}
            contacts={contacts}
            currentLocation={currentLocation}
            onStartJourney={handleStartJourney}
            preselectedPlace={preselectedPlace}
          />

          {/* SOS Emergency Workflow Overlay */}
          {isSOSOpen && (
            <SOSScreen
              currentLocation={currentLocation}
              contacts={contacts}
              activeJourney={activeJourney}
              onCancelSOS={handleCancelSOS}
              onClose={() => setIsSOSOpen(false)}
            />
          )}

          {/* Notifications Modal */}
          <NotificationsModal
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            notifications={notifications}
            onMarkAllRead={handleMarkAllNotificationsRead}
          />
        </div>
      )}
    </MobileFrame>
  );
}
