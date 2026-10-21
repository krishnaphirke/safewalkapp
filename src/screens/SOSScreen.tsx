import React, { useState, useEffect } from 'react';
import {
  EmergencyEvent,
  Coordinates,
  TrustedContact,
  Journey,
} from '../types';
import {
  AlertOctagon,
  Volume2,
  VolumeX,
  Phone,
  ShieldAlert,
  CheckCircle2,
  Clock,
  MapPin,
  Share2,
  Copy,
  X,
  AlertTriangle,
} from 'lucide-react';
import { audioBeacon } from '../services/audioBeacon';
import { formatTime } from '../utils/journeyState';

interface SOSScreenProps {
  currentLocation: Coordinates;
  contacts: TrustedContact[];
  activeJourney: Journey | null;
  onCancelSOS: (reason: string) => void;
  onClose: () => void;
}

export const SOSScreen: React.FC<SOSScreenProps> = ({
  currentLocation,
  contacts,
  activeJourney,
  onCancelSOS,
  onClose,
}) => {
  const [sirenActive, setSirenActive] = useState<boolean>(false);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);
  const [dispatchStage, setDispatchStage] = useState<number>(1);
  const [showCancelPrompt, setShowCancelPrompt] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Accidental trigger');
  const [activatedTime] = useState<number>(Date.now());

  // Priority contacts notified
  const notifiedContacts = contacts.filter((c) => c.notifyOnSOS || c.isPriority);

  // Advance dispatch pipeline status smoothly
  useEffect(() => {
    const t1 = setTimeout(() => setDispatchStage(2), 700);
    const t2 = setTimeout(() => setDispatchStage(3), 1600);
    const t3 = setTimeout(() => setDispatchStage(4), 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      audioBeacon.stopSiren();
    };
  }, []);

  const toggleSiren = () => {
    if (sirenActive) {
      audioBeacon.stopSiren();
      setSirenActive(false);
    } else {
      audioBeacon.startSiren();
      setSirenActive(true);
    }
  };

  const handleCopyLocation = () => {
    const text = `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`;
    navigator.clipboard?.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const stages = [
    { id: 1, label: 'Emergency event recorded locally' },
    { id: 2, label: 'GPS coordinates locked (Accuracy ±12m)' },
    { id: 3, label: `Dispatching SMS & alerts to ${notifiedContacts.length} trusted contacts` },
    { id: 4, label: 'Live location tracking beacon streaming' },
  ];

  return (
    <div
      className="absolute inset-0 z-50 bg-[#C84C4C] text-white flex flex-col justify-between p-6 select-none overflow-y-auto animate-fadeIn"
      data-testid="sos-screen"
    >
      {/* Top Bar with Dismiss / Cancel button */}
      <div className="flex items-center justify-between pt-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-white animate-ping" />
          <span className="text-xs font-black uppercase tracking-wider text-white/90">
            Emergency Mode Active
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowCancelPrompt(true)}
          className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Cancel SOS
        </button>
      </div>

      {/* Center Alert Shield & Siren */}
      <div className="my-auto flex flex-col items-center text-center py-4">
        <div className="relative mb-5">
          <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#C84C4C] shadow-2xl">
              <AlertOctagon className="w-12 h-12" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-tight mb-1">
          EMERGENCY SOS
        </h1>
        <p className="text-xs text-white/80 max-w-xs">
          Triggered at {formatTime(activatedTime)} • Location shared with emergency contacts
        </p>

        {/* Audible Siren Simulation Button */}
        <button
          type="button"
          onClick={toggleSiren}
          className={`mt-4 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-lg transition-all cursor-pointer ${
            sirenActive
              ? 'bg-white text-[#C84C4C] animate-bounce'
              : 'bg-black/30 text-white hover:bg-black/40 border border-white/20'
          }`}
        >
          {sirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{sirenActive ? 'Silence Loud Siren' : 'Play Loud Siren Alarm'}</span>
        </button>

        {/* GPS Coordinates Box */}
        <div className="w-full max-w-xs bg-black/25 rounded-2xl p-3 mt-4 border border-white/15 text-left">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-white/60 uppercase">
              Current GPS Coordinates
            </span>
            <button
              type="button"
              onClick={handleCopyLocation}
              className="text-[10px] font-bold text-white/90 hover:text-white flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedCoords ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-sm font-mono font-bold text-white">
            {currentLocation.lat.toFixed(5)}° N, {currentLocation.lng.toFixed(5)}° W
          </p>
          <p className="text-[11px] text-white/70 mt-0.5">
            Near Market Street Corridor • Battery 88%
          </p>
        </div>

        {/* Live Dispatch Pipeline Tracker */}
        <div className="w-full max-w-xs bg-black/20 rounded-2xl p-4 mt-3 border border-white/10 text-left space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
            Dispatch Status
          </p>
          {stages.map((stage) => {
            const isCompleted = dispatchStage >= stage.id;
            return (
              <div key={stage.id} className="flex items-center gap-2.5 text-xs">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/40 shrink-0 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  </div>
                )}
                <span className={isCompleted ? 'text-white font-medium' : 'text-white/50'}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Trusted Contacts Alerted */}
        <div className="w-full max-w-xs mt-3 flex items-center justify-between text-xs text-white/80 px-1">
          <span>Alerted Contacts:</span>
          <span className="font-bold text-white">
            {notifiedContacts.map((c) => c.name.split(' ')[0]).join(', ')}
          </span>
        </div>
      </div>

      {/* Demonstration Mode & Safety Warning Banner */}
      <div className="shrink-0 space-y-3 pt-2">
        <div className="p-3 rounded-2xl bg-black/35 border border-white/20 text-center">
          <p className="text-[11px] font-bold text-white">
            Demonstration Mode
          </p>
          <p className="text-[10px] text-white/70 mt-0.5 leading-snug">
            Simulated emergency broadcast for user testing. To call local 911 directly, dial from your phone dialer.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCancelPrompt(true)}
          className="w-full bg-white text-[#C84C4C] hover:bg-white/90 font-bold py-3.5 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>I am Safe / Cancel SOS</span>
        </button>
      </div>

      {/* Cancel Emergency Modal */}
      {showCancelPrompt && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-[#252B27] shadow-2xl">
            <h3 className="text-base font-bold text-[#173F33] mb-1">
              Cancel Emergency SOS?
            </h3>
            <p className="text-xs text-[#737A74] mb-3">
              Confirm you are safe. A resolution update will be sent to your trusted contacts.
            </p>

            <div className="mb-4">
              <label className="block text-[11px] font-bold text-[#737A74] uppercase mb-1">
                Reason for cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-[#F7F5EF] border border-[#E5E7E1] rounded-xl p-2.5 text-xs text-[#252B27] font-medium"
              >
                <option value="Accidental trigger">Accidental trigger (False alarm)</option>
                <option value="Situation resolved safely">Situation resolved safely</option>
                <option value="Reached destination or safe place">Reached safe location</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCancelPrompt(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E7E1] text-xs font-bold text-[#737A74]"
              >
                Stay in SOS
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelPrompt(false);
                  audioBeacon.stopSiren();
                  onCancelSOS(cancelReason);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#173F33] text-white text-xs font-bold shadow-md hover:bg-[#103329]"
              >
                Confirm I'm Safe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
