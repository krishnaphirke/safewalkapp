import React, { useState } from 'react';
import {
  ShieldCheck,
  Volume2,
  VolumeX,
  AlertOctagon,
  HeartHandshake,
  Lock,
  FileText,
  CheckCircle,
  Eye,
  Activity,
  Sliders,
} from 'lucide-react';
import { audioBeacon } from '../services/audioBeacon';
import { UserProfile } from '../types';

interface SafetyScreenProps {
  user: UserProfile;
  onOpenSOS: () => void;
}

export const SafetyScreen: React.FC<SafetyScreenProps> = ({ user, onOpenSOS }) => {
  const [sirenActive, setSirenActive] = useState<boolean>(false);
  const [showMedicalCard, setShowMedicalCard] = useState<boolean>(false);
  const [defaultInterval, setDefaultInterval] = useState<number>(10);
  const [showPrivacyAudit, setShowPrivacyAudit] = useState<boolean>(false);

  const toggleSiren = () => {
    if (sirenActive) {
      audioBeacon.stopSiren();
      setSirenActive(false);
    } else {
      audioBeacon.startSiren();
      setSirenActive(true);
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#F7F5EF] select-none"
      data-testid="safety-screen"
    >
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-xl font-extrabold text-[#173F33] tracking-tight">
          Safety Intelligence
        </h1>
        <p className="text-xs text-[#737A74] font-medium">
          Personal protection tools & safety protocols
        </p>
      </div>

      {/* Primary Emergency Tools Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E7E1] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#C84C4C] flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[#252B27]">Emergency Hub</h2>
          </div>
          <span className="text-[10px] font-bold text-[#C84C4C] uppercase bg-red-50 px-2.5 py-1 rounded-full">
            Immediate Response
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Practice/Trigger SOS */}
          <button
            type="button"
            onClick={onOpenSOS}
            className="p-3.5 rounded-2xl bg-[#C84C4C] hover:bg-[#b03d3d] text-white flex flex-col items-center justify-center text-center shadow-md transition-all cursor-pointer group"
          >
            <AlertOctagon className="w-6 h-6 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Trigger SOS</span>
            <span className="text-[10px] text-white/80">Dispatches alerts</span>
          </button>

          {/* Audible Siren Beacon */}
          <button
            type="button"
            onClick={toggleSiren}
            className={`p-3.5 rounded-2xl flex flex-col items-center justify-center text-center shadow-md transition-all cursor-pointer ${
              sirenActive
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-[#173F33] hover:bg-[#103329] text-white'
            }`}
          >
            {sirenActive ? (
              <VolumeX className="w-6 h-6 mb-1.5" />
            ) : (
              <Volume2 className="w-6 h-6 mb-1.5" />
            )}
            <span className="text-xs font-bold">
              {sirenActive ? 'Stop Siren' : 'Personal Siren'}
            </span>
            <span className="text-[10px] text-white/80">Loud audible deterrent</span>
          </button>
        </div>
      </div>

      {/* Safety Intelligence Radar: Safe Corridors */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E7E1] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E7F0E8] text-[#173F33] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#252B27]">Corridor Intelligence</h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-[#E7F0E8] px-2 py-0.5 rounded-full">
            Safe Score: 94%
          </span>
        </div>

        <p className="text-xs text-[#737A74] leading-relaxed">
          SafeWalk identifies monitored pedestrian corridors, street lighting coverage, and proximity to active transit hubs.
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-[#F7F5EF] border border-[#E5E7E1]">
            <p className="text-[10px] font-bold text-[#737A74] uppercase">Street Illumination</p>
            <p className="font-bold text-[#173F33] mt-0.5">High Coverage (88%)</p>
          </div>
          <div className="p-3 rounded-xl bg-[#F7F5EF] border border-[#E5E7E1]">
            <p className="text-[10px] font-bold text-[#737A74] uppercase">Transit Corridors</p>
            <p className="font-bold text-[#173F33] mt-0.5">Verified Safe Paths</p>
          </div>
        </div>
      </div>

      {/* Offline Medical Emergency Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E7E1] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#252B27]">Emergency Safety Card</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowMedicalCard(!showMedicalCard)}
            className="text-xs font-bold text-[#173F33] hover:underline"
          >
            {showMedicalCard ? 'Hide' : 'View Card'}
          </button>
        </div>

        <p className="text-xs text-[#737A74]">
          Offline-available health info for first responders during an active SOS event.
        </p>

        {showMedicalCard && (
          <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5E7E1] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="font-bold text-[#737A74]">Full Name:</span>
              <span className="font-bold text-[#252B27]">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-[#737A74]">Blood Type:</span>
              <span className="font-bold text-[#252B27]">{user.bloodType || 'O+'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-[#737A74]">Medical Notes:</span>
              <span className="font-medium text-[#252B27] text-right max-w-[200px]">
                {user.emergencyMedicalNotes || 'No known allergies'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Safety Check-in Default Configuration */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E7E1] shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E7F0E8] text-[#173F33] flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-[#252B27]">Default Check-in Interval</h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[5, 10, 15].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setDefaultInterval(val)}
              className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                defaultInterval === val
                  ? 'bg-[#173F33] text-white border-[#173F33]'
                  : 'bg-[#F7F5EF] text-[#252B27] border-[#E5E7E1]'
              }`}
            >
              Every {val} min
            </button>
          ))}
        </div>
      </div>

      {/* Location Privacy & Zero-Tracking Guarantee */}
      <div className="p-4 rounded-2xl bg-[#E7F0E8] border border-[#D5E2D7] text-xs text-[#173F33] space-y-1.5">
        <div className="flex items-center gap-2 font-bold">
          <Lock className="w-4 h-4 text-[#173F33]" />
          <span>Privacy & Location Transparency</span>
        </div>
        <p className="text-[11px] text-[#173F33]/80 leading-relaxed">
          SafeWalk only accesses GPS location while a journey is actively running. Your data is end-to-end encrypted and never sold or shared with commercial ad networks.
        </p>
      </div>
    </div>
  );
};
