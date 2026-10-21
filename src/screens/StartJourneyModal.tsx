import React, { useState } from 'react';
import {
  SavedPlace,
  TrustedContact,
  Journey,
  Coordinates,
} from '../types';
import {
  X,
  MapPin,
  Clock,
  Users,
  Shield,
  ArrowRight,
  ArrowLeft,
  Search,
  Check,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { SafeWalkMap } from '../components/SafeWalkMap';
import { LocationService } from '../services/locationService';
import { haversineDistance, calculateEstimatedWalkingDuration } from '../utils/geo';

interface StartJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlaces: SavedPlace[];
  contacts: TrustedContact[];
  currentLocation: Coordinates;
  onStartJourney: (newJourney: Journey) => void;
  preselectedPlace?: SavedPlace;
}

export const StartJourneyModal: React.FC<StartJourneyModalProps> = ({
  isOpen,
  onClose,
  savedPlaces,
  contacts,
  currentLocation,
  onStartJourney,
  preselectedPlace,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<number>(preselectedPlace ? 2 : 1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<{
    name: string;
    address: string;
    coords: Coordinates;
  }>(() => {
    if (preselectedPlace) {
      return {
        name: preselectedPlace.name,
        address: preselectedPlace.address,
        coords: preselectedPlace.coords,
      };
    }
    return {
      name: savedPlaces[0]?.name || 'Home',
      address: savedPlaces[0]?.address || '742 Evergreen Terrace',
      coords: savedPlaces[0]?.coords || { lat: 37.7749, lng: -122.4194 },
    };
  });

  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(
    contacts.filter((c) => c.isPriority).map((c) => c.id)
  );
  const [checkInInterval, setCheckInInterval] = useState<number>(10); // minutes
  const [deviationThreshold, setDeviationThreshold] = useState<number>(120); // meters
  const [isStarting, setIsStarting] = useState<boolean>(false);

  // Compute realistic route polyline
  const routeWaypoints = React.useMemo(() => {
    return LocationService.generateWalkingRoute(currentLocation, selectedDestination.coords);
  }, [currentLocation, selectedDestination.coords]);

  const totalDistanceMeters = React.useMemo(() => {
    let dist = 0;
    for (let i = 0; i < routeWaypoints.length - 1; i++) {
      dist += haversineDistance(routeWaypoints[i], routeWaypoints[i + 1]);
    }
    return Math.max(Math.round(dist), 800);
  }, [routeWaypoints]);

  const estimatedMinutes = React.useMemo(() => {
    return calculateEstimatedWalkingDuration(totalDistanceMeters);
  }, [totalDistanceMeters]);

  const toggleContact = (id: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectSavedPlace = (place: SavedPlace) => {
    setSelectedDestination({
      name: place.name,
      address: place.address,
      coords: place.coords,
    });
    setStep(2);
  };

  const handleCustomSearchSelect = () => {
    if (!searchQuery.trim()) return;
    // Generate simulated coordinate near destination
    const customCoords: Coordinates = {
      lat: currentLocation.lat + 0.012,
      lng: currentLocation.lng - 0.009,
    };
    setSelectedDestination({
      name: searchQuery.trim(),
      address: `${searchQuery.trim()}, Metro Corridor`,
      coords: customCoords,
    });
    setStep(2);
  };

  const handleStartSafeJourney = () => {
    if (isStarting) return;
    setIsStarting(true);

    const now = Date.now();
    const journey: Journey = {
      id: 'jrn_' + now,
      title: `Walk to ${selectedDestination.name}`,
      origin: {
        name: 'Current Location (Financial District)',
        coords: currentLocation,
      },
      destination: {
        name: selectedDestination.name,
        address: selectedDestination.address,
        coords: selectedDestination.coords,
      },
      waypoints: routeWaypoints,
      startedAt: now,
      expectedDurationMinutes: estimatedMinutes || 20,
      totalDistanceMeters: totalDistanceMeters,
      status: 'active',
      sharedContactIds: selectedContactIds,
      checkInIntervalMinutes: checkInInterval,
      lastCheckInAt: now,
      checkInCount: 1, // starting check-in
      deviationAlertThresholdMeters: deviationThreshold,
      deviations: [],
      checkIns: [
        {
          id: 'chk_init_' + now,
          timestamp: now,
          location: currentLocation,
          message: `Journey started toward ${selectedDestination.name}`,
          type: 'auto_geofence',
          deliveredContacts: selectedContactIds,
        },
      ],
    };

    setTimeout(() => {
      onStartJourney(journey);
      onClose();
      setIsStarting(false);
    }, 400);
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 select-none"
      data-testid="start-journey-modal"
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-[36px] sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#E5E7E1]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E5E7E1] flex items-center justify-between shrink-0 bg-[#F7F5EF]">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="p-1 -ml-1 text-[#737A74] hover:text-[#173F33]"
                aria-label="Back step"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-base font-extrabold text-[#173F33]">
                {step === 1 && 'Where are you heading?'}
                {step === 2 && 'Review Route & Safety'}
                {step === 3 && 'Share with Trusted Contacts'}
                {step === 4 && 'Check-in & Deviation Preferences'}
                {step === 5 && 'Confirm & Start Journey'}
              </h2>
              <p className="text-[11px] text-[#737A74] font-medium">Step {step} of 5</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-[#737A74]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* STEP 1: Select Destination */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#252B27] mb-1.5">
                  Search Destination or Address
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#737A74] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCustomSearchSelect()}
                      placeholder="e.g. Ferry Building, Library, Market St"
                      className="w-full bg-[#F7F5EF] border border-[#E5E7E1] rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#173F33] text-[#252B27]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCustomSearchSelect}
                    disabled={!searchQuery.trim()}
                    className="px-4 py-3 rounded-xl bg-[#173F33] text-white text-xs font-bold disabled:opacity-40"
                  >
                    Set
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#737A74] uppercase tracking-wider mb-2">
                  Saved Places
                </label>
                <div className="space-y-2">
                  {savedPlaces.map((place) => (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => handleSelectSavedPlace(place)}
                      className="w-full p-3 rounded-2xl bg-[#F7F5EF] hover:bg-[#E7F0E8] border border-[#E5E7E1] flex items-center justify-between text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#173F33] shadow-2xs shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#252B27] truncate">{place.name}</p>
                          <p className="text-xs text-[#737A74] truncate">{place.address}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#737A74]" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Current start point info */}
              <div className="p-3 rounded-xl bg-white border border-[#E5E7E1] flex items-center gap-2.5 text-xs text-[#737A74]">
                <Compass className="w-4 h-4 text-[#173F33] shrink-0" />
                <span>Starting from your verified location: Financial District, Market St</span>
              </div>
            </div>
          )}

          {/* STEP 2: Review Route & Distance */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Mini Map Preview */}
              <div className="h-44 rounded-2xl overflow-hidden border border-[#E5E7E1] shadow-inner relative">
                <SafeWalkMap
                  currentPos={currentLocation}
                  origin={currentLocation}
                  destination={selectedDestination.coords}
                  waypoints={routeWaypoints}
                  interactive={false}
                />
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#F7F5EF] border border-[#E5E7E1]">
                  <span className="text-[10px] font-bold text-[#737A74] uppercase tracking-wider">
                    Estimated Distance
                  </span>
                  <p className="text-lg font-bold text-[#173F33] mt-0.5">
                    {(totalDistanceMeters / 1000).toFixed(1)} km
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[#F7F5EF] border border-[#E5E7E1]">
                  <span className="text-[10px] font-bold text-[#737A74] uppercase tracking-wider">
                    Estimated Walk Time
                  </span>
                  <p className="text-lg font-bold text-[#173F33] mt-0.5">
                    ~{estimatedMinutes} minutes
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7E1] space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#173F33] mt-1 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-[#737A74]">STARTING POINT</p>
                    <p className="text-xs font-semibold text-[#252B27]">Current Location (Financial District)</p>
                  </div>
                </div>
                <div className="w-0.5 h-4 bg-[#E5E7E1] ml-1.5" />
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-[#173F33] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-[#737A74]">DESTINATION</p>
                    <p className="text-xs font-semibold text-[#252B27]">{selectedDestination.name}</p>
                    <p className="text-[11px] text-[#737A74]">{selectedDestination.address}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Select Trusted Contacts */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#E7F0E8] text-xs text-[#173F33] flex items-center gap-2">
                <Users className="w-4 h-4 shrink-0" />
                <span>Selected contacts will receive real-time updates and arrival notifications.</span>
              </div>

              <div className="space-y-2">
                {contacts.map((contact) => {
                  const isChecked = selectedContactIds.includes(contact.id);
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => toggleContact(contact.id)}
                      className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left cursor-pointer ${
                        isChecked
                          ? 'bg-[#F0F7F1] border-[#173F33]'
                          : 'bg-white border-[#E5E7E1] hover:bg-[#F7F5EF]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={contact.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}
                          alt={contact.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#E5E7E1]"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-[#252B27]">{contact.name}</p>
                            {contact.isPriority && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Priority
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#737A74]">{contact.relationship} • {contact.phone}</p>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                          isChecked
                            ? 'bg-[#173F33] border-[#173F33] text-white'
                            : 'border-[#CBD5E1] bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedContactIds.length === 0 && (
                <p className="text-xs text-amber-600 font-medium">
                  Note: Solo journey without live contact notifications.
                </p>
              )}
            </div>
          )}

          {/* STEP 4: Safety & Check-in Preferences */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#252B27] mb-2">
                  Safety Check-in Interval
                </label>
                <p className="text-xs text-[#737A74] mb-2.5">
                  SafeWalk prompts you with a 1-tap "I'm OK" check-in to confirm all is well.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setCheckInInterval(mins)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                        checkInInterval === mins
                          ? 'bg-[#173F33] text-white border-[#173F33] shadow-xs'
                          : 'bg-[#F7F5EF] text-[#252B27] border-[#E5E7E1] hover:bg-white'
                      }`}
                    >
                      Every {mins} min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#252B27] mb-2">
                  Route Deviation Detection Threshold
                </label>
                <p className="text-xs text-[#737A74] mb-2.5">
                  Alerts you if your GPS position departs from your corridor.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Strict (80m)', val: 80 },
                    { label: 'Normal (120m)', val: 120 },
                    { label: 'Relaxed (200m)', val: 200 },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setDeviationThreshold(item.val)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                        deviationThreshold === item.val
                          ? 'bg-[#173F33] text-white border-[#173F33] shadow-xs'
                          : 'bg-[#F7F5EF] text-[#252B27] border-[#E5E7E1] hover:bg-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Final Review & Confirmation */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#E7F0E8] border border-[#D5E2D7] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#173F33]">Destination</span>
                  <span className="text-xs font-bold text-[#252B27]">{selectedDestination.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#173F33]">Expected Distance</span>
                  <span className="text-xs text-[#252B27]">{(totalDistanceMeters / 1000).toFixed(1)} km (~{estimatedMinutes} min)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#173F33]">Check-in Frequency</span>
                  <span className="text-xs text-[#252B27]">Every {checkInInterval} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#173F33]">Shared Contacts</span>
                  <span className="text-xs text-[#252B27]">{selectedContactIds.length} recipients</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E5E7E1] flex items-center gap-2 text-xs text-[#737A74]">
                <Shield className="w-4 h-4 text-[#173F33] shrink-0" />
                <span>
                  Background location tracking active with high accuracy for this journey session only.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-[#E5E7E1] bg-white shrink-0">
          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="w-full bg-[#173F33] text-white hover:bg-[#103329] font-bold py-3.5 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartSafeJourney}
              disabled={isStarting}
              className="w-full bg-[#173F33] text-white hover:bg-[#103329] font-bold py-3.5 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isStarting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Start Safe Journey</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
