import React from 'react';
import { Home, Footprints, ShieldCheck, Users, User, ChevronRight } from 'lucide-react';
import { Journey } from '../types';
import { formatDuration } from '../utils/journeyState';

export type TabKey = 'home' | 'journeys' | 'safety' | 'contacts' | 'profile';

interface BottomNavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  activeJourney: Journey | null;
  onExpandActiveJourney: () => void;
  elapsedSeconds: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  activeJourney,
  onExpandActiveJourney,
  elapsedSeconds,
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'journeys', label: 'Journeys', icon: Footprints },
    { id: 'safety', label: 'Safety', icon: ShieldCheck },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <div className="w-full shrink-0 flex flex-col z-20">
      {/* Floating Active Journey Mini-card if a journey is running in background */}
      {activeJourney && (
        <div className="px-4 pb-2">
          <button
            type="button"
            onClick={onExpandActiveJourney}
            className="w-full bg-[#173F33] text-white rounded-2xl p-3 shadow-lg flex items-center justify-between hover:bg-[#103329] transition-all cursor-pointer group"
            aria-label="Expand active journey"
          >
            <div className="flex items-center gap-3 text-left min-w-0">
              <div className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    Live Journey
                  </span>
                  <span className="text-xs text-white/60">• {formatDuration(elapsedSeconds)}</span>
                </div>
                <p className="text-sm font-semibold truncate text-white">
                  Heading to {activeJourney.destination.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white/15 px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 group-hover:bg-white/25 transition-colors">
              <span>View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* Main Tab Bar */}
      <nav
        aria-label="SafeWalk Bottom Navigation"
        className="w-full bg-white border-t border-[#E5E7E1] px-2 py-2 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id as TabKey)}
              aria-label={`Navigate to ${tab.label}`}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
                isActive ? 'text-[#173F33]' : 'text-[#737A74] hover:text-[#252B27]'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[#E7F0E8] text-[#173F33]' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span
                className={`text-[11px] mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-[#173F33]' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
