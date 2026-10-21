import React, { useState, useEffect, useMemo } from 'react';
import {
  Journey,
  TrustedContact,
  Coordinates,
  CheckInEvent,
} from '../types';
import {
  Shield,
  AlertOctagon,
  CheckCircle,
  Clock,
  MapPin,
  ChevronDown,
  Navigation,
  Users,
  Compass,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { SafeWalkMap } from '../components/SafeWalkMap';
import { LocationService } from '../services/locationService';
import {
  formatDuration,
  formatDistance,
  formatTime,
  getRemainingCheckInSeconds,
  isCheckInOverdue,
} from '../utils/journeyState';
import { detectRouteDeviation } from '../utils/geo';

interface ActiveJourneyScreenProps {
  journey: Journey;
  contacts: TrustedContact[];
  elapsedSeconds: number;
  onCheckIn: (message: string) => void;
  onArrival: () => void;
  onEndEarly: () => void;
  onTriggerSOS: () => void;
  onMinimize: () => void;
}

export const ActiveJourneyScreen: React.FC<ActiveJourneyScreenProps> = ({
  journey,
  contacts,
  elapsedSeconds,
  onCheckIn,
  onArrival,
  onEndEarly,
  onTriggerSOS,
  onMinimize,
}) => {
  const [showEndConfirm, setShowEndConfirm] = useState<boolean>(false);
  const [showArrivalModal, setShowArrivalModal] = useState<boolean>(false);
  const [justCheckedIn, setJustCheckedIn] = useState<boolean>(false);
  const [progressFraction, setProgressFraction] = useState<number>(0.25);
  const [isSimulatedDeviated, setIsSimulatedDeviated] = useState<boolean>(false);
  const [showDeviationAlert, setShowDeviationAlert] = useState<boolean>(false);

  // Advance simulation slightly over time
  useEffect(() => {
    const totalExpectedSecs = journey.expectedDurationMinutes * 60;
    const computedProg = Math.min(0.95, (elapsedSeconds + 120) / totalExpectedSecs);
    setProgressFraction(computedProg);
  }, [elapsedSeconds, journey.expectedDurationMinutes]);

  // Compute live position
  const currentPos: Coordinates = useMemo(() => {
    return LocationService.getSimulatedPosition(
      journey.waypoints,
      progressFraction,
      isSimulatedDeviated
    );
  }, [journey.waypoints, progressFraction, isSimulatedDeviated]);

  // Deviation check
  const deviationResult = useMemo(() => {
    return detectRouteDeviation(
      currentPos,
      journey.waypoints,
      journey.deviationAlertThresholdMeters || 120
    );
  }, [currentPos, journey.waypoints, journey.deviationAlertThresholdMeters]);

  // Check-in countdown
  const remainingCheckInSecs = getRemainingCheckInSeconds(
    journey.lastCheckInAt,
    journey.startedAt,
    journey.checkInIntervalMinutes
  );
  const checkInOverdue = isCheckInOverdue(
    journey.lastCheckInAt,
    journey.startedAt,
    journey.checkInIntervalMinutes
  );

  const sharedContacts = contacts.filter((c) =>
    journey.sharedContactIds.includes(c.id)
  );

  const handleManualCheckIn = () => {
    if (justCheckedIn) return;
    onCheckIn("I'm OK. On track along safe corridor.");
    setJustCheckedIn(true);
    setTimeout(() => setJustCheckedIn(false), 3000);
  };

  const handleToggleDeviationSimulation = () => {
    const nextState = !isSimulatedDeviated;
    setIsSimulatedDeviated(nextState);
    if (nextState) {
      setShowDeviationAlert(true);
    } else {
      setShowDeviationAlert(false);
    }
  };

  const distanceRemaining = Math.max(
    0,
    Math.round(journey.totalDistanceMeters * (1 - progressFraction))
  );

  return (
    <div
      className="flex-1 flex flex-col bg-[#F7F5EF] relative select-none overflow-hidden"
      data-testid="active-journey-screen"
    >
      {/* Top Header Bar */}
      <div className="px-4 py-3 bg-white/90 backdrop-blur-md border-b border-[#E5E7E1] flex items-center justify-between z-20 shrink-0">
        <button
          type="button"
          onClick={onMinimize}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E7F0E8] text-[#173F33] text-xs font-bold hover:bg-[#d8e6da] transition-colors cursor-pointer"
          aria-label="Minimize journey"
        >
          <ChevronDown className="w-4 h-4" />
          <span>Minimize</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#173F33]">
            Tracking Live
          </span>
        </div>

        {/* SOS Emergency Trigger */}
        <button
          type="button"
          onClick={onTriggerSOS}
          className="px-3.5 py-1.5 rounded-full bg-[#C84C4C] hover:bg-[#b03d3d] text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer animate-sos"
          aria-label="Trigger SOS Emergency"
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>SOS</span>
        </button>
      </div>

      {/* Map View Area (Takes top 46% of viewport) */}
      <div className="relative w-full h-[46%] min-h-[220px] shrink-0 border-b border-[#E5E7E1]">
        <SafeWalkMap
          currentPos={currentPos}
          origin={journey.origin.coords}
          destination={journey.destination.coords}
          waypoints={journey.waypoints}
          isDeviated={isSimulatedDeviated}
          deviationMeters={deviationResult.distanceMeters}
          interactive={true}
        />

        {/* Developer / Demo Route Deviation Simulation Pill */}
        <div className="absolute left-3 bottom-3 z-10">
          <button
            type="button"
            onClick={handleToggleDeviationSimulation}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold shadow-md border transition-all cursor-pointer flex items-center gap-1.5 ${
              isSimulatedDeviated
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-white/95 text-[#252B27] border-[#E5E7E1] hover:bg-white'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>{isSimulatedDeviated ? 'Resume Route' : 'Simulate Deviation'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Information & Control Tray */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3.5">
        {/* Destination & Key Metric Card */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#E5E7E1]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#173F33]" />
              <p className="text-xs font-bold uppercase tracking-wider text-[#737A74]">
                Destination
              </p>
            </div>
            <span className="text-xs text-[#737A74]">
              {formatDuration(elapsedSeconds)} elapsed
            </span>
          </div>

          <h3 className="text-lg font-bold text-[#252B27] truncate mb-0.5">
            {journey.destination.name}
          </h3>
          <p className="text-xs text-[#737A74] truncate mb-3">
            {journey.destination.address}
          </p>

          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-[#F7F5EF] rounded-2xl text-center border border-[#E5E7E1]">
            <div>
              <p className="text-[10px] text-[#737A74] font-semibold uppercase">Remaining</p>
              <p className="text-sm font-bold text-[#173F33] mt-0.5">
                {formatDistance(distanceRemaining)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#737A74] font-semibold uppercase">Est. Arrival</p>
              <p className="text-sm font-bold text-[#173F33] mt-0.5">
                {formatTime(journey.startedAt + journey.expectedDurationMinutes * 60000)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#737A74] font-semibold uppercase">Check-ins</p>
              <p className="text-sm font-bold text-[#173F33] mt-0.5">
                {journey.checkInCount} OK
              </p>
            </div>
          </div>
        </div>

        {/* Safety Check-In Action Card */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#E5E7E1]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#173F33]" />
              <span className="text-xs font-bold text-[#252B27]">Safety Check-in</span>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                checkInOverdue
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-[#E7F0E8] text-[#173F33]'
              }`}
            >
              {checkInOverdue
                ? 'Check-in due now'
                : `Next prompt in ${formatDuration(remainingCheckInSecs)}`}
            </span>
          </div>

          <button
            type="button"
            onClick={handleManualCheckIn}
            disabled={justCheckedIn}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              justCheckedIn
                ? 'bg-emerald-600 text-white'
                : 'bg-[#173F33] text-white hover:bg-[#103329]'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{justCheckedIn ? "Checked In — You're OK!" : "I'm OK (Check-In)"}</span>
          </button>

          <p className="text-center text-[11px] text-[#737A74] mt-2">
            Last check-in: {formatTime(journey.lastCheckInAt || journey.startedAt)} • Notified {sharedContacts.length} contacts
          </p>
        </div>

        {/* Trusted Contacts Live Sharing Status */}
        {sharedContacts.length > 0 && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#E5E7E1]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#737A74] uppercase tracking-wider">
                Live Contact Sharing
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Feed Active
              </span>
            </div>

            <div className="space-y-2">
              {sharedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#F7F5EF]"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={contact.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}
                      alt={contact.name}
                      className="w-8 h-8 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#252B27]">{contact.name}</p>
                      <p className="text-[10px] text-[#737A74]">{contact.relationship}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#173F33] bg-[#E7F0E8] px-2 py-0.5 rounded-full">
                    GPS Connected
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Arrival & End Actions */}
        <div className="space-y-2 pt-1 pb-4">
          <button
            type="button"
            onClick={() => setShowArrivalModal(true)}
            className="w-full bg-[#173F33] text-white hover:bg-[#103329] font-bold py-3.5 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>I've Arrived Safely</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEndConfirm(true)}
            className="w-full bg-transparent text-[#737A74] hover:text-[#C84C4C] font-semibold py-2.5 text-xs transition-colors cursor-pointer"
          >
            End Journey Early
          </button>
        </div>
      </div>

      {/* Arrival Confirmation Modal */}
      {showArrivalModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#E5E7E1] text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[#173F33]" />
            </div>

            <h3 className="text-lg font-bold text-[#173F33] mb-1">
              Confirm Safe Arrival?
            </h3>
            <p className="text-xs text-[#737A74] mb-5">
              We will mark this journey as safely completed and send an arrival notification to your {sharedContacts.length} trusted contacts.
            </p>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowArrivalModal(false)}
                className="flex-1 py-3 rounded-xl border border-[#E5E7E1] text-xs font-bold text-[#737A74]"
              >
                Not Yet
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowArrivalModal(false);
                  onArrival();
                }}
                className="flex-1 py-3 rounded-xl bg-[#173F33] text-white text-xs font-bold shadow-md hover:bg-[#103329]"
              >
                Yes, I've Arrived
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Journey Early Confirmation */}
      {showEndConfirm && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#E5E7E1] text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 mx-auto mb-3 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            </div>

            <h3 className="text-base font-bold text-[#252B27] mb-1">
              End Journey Early?
            </h3>
            <p className="text-xs text-[#737A74] mb-4">
              Tracking will stop. Your trusted contacts will be informed that the journey ended early.
            </p>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-[#E5E7E1] text-xs font-bold text-[#737A74]"
              >
                Keep Tracking
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEndConfirm(false);
                  onEndEarly();
                }}
                className="flex-1 py-3 rounded-xl bg-[#C84C4C] text-white text-xs font-bold shadow-md hover:bg-[#a83c3c]"
              >
                End Journey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen 8: Route Deviation Alert Modal */}
      {showDeviationAlert && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-2 border-amber-500 text-center animate-bounce-short">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 mx-auto mb-3 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              Route Deviation Detected
            </span>

            <h3 className="text-lg font-bold text-[#252B27] mt-2 mb-1">
              Are you OK?
            </h3>
            <p className="text-xs text-[#737A74] mb-4">
              Your location is approximately {deviationResult.distanceMeters || 185}m away from your planned corridor.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeviationAlert(false);
                  onCheckIn("I'm OK (Updating route path)");
                }}
                className="w-full py-3 rounded-xl bg-[#173F33] text-white text-xs font-bold hover:bg-[#103329]"
              >
                I'm Safe (Update Route)
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowDeviationAlert(false);
                  onTriggerSOS();
                }}
                className="w-full py-3 rounded-xl bg-[#C84C4C] text-white text-xs font-bold hover:bg-[#a83c3c]"
              >
                Trigger SOS Emergency
              </button>

              <button
                type="button"
                onClick={() => setShowDeviationAlert(false)}
                className="w-full py-2 text-xs font-semibold text-[#737A74]"
              >
                Dismiss Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
