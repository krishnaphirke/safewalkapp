import React, { useMemo } from 'react';
import {
  UserProfile,
  Journey,
  SavedPlace,
  NotificationItem,
} from '../types';
import {
  MapPin,
  Bell,
  ArrowRight,
  Shield,
  Clock,
  Bookmark,
  Users,
  History,
  CheckCircle,
  AlertTriangle,
  Play,
  Navigation,
} from 'lucide-react';
import { formatDuration, formatTime, formatDate } from '../utils/journeyState';

interface HomeScreenProps {
  user: UserProfile;
  activeJourney: Journey | null;
  savedPlaces: SavedPlace[];
  recentJourneys: Journey[];
  notifications: NotificationItem[];
  elapsedSeconds: number;
  onStartJourneyClick: (preselectedPlace?: SavedPlace) => void;
  onViewActiveJourney: () => void;
  onOpenNotifications: () => void;
  onNavigateTab: (tab: 'journeys' | 'safety' | 'contacts' | 'profile') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  activeJourney,
  savedPlaces,
  recentJourneys,
  notifications,
  elapsedSeconds,
  onStartJourneyClick,
  onViewActiveJourney,
  onOpenNotifications,
  onNavigateTab,
}) => {
  // Personalized greeting based on local time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const latestCompletedJourney = recentJourneys.length > 0 ? recentJourneys[0] : null;

  return (
    <div
      className="flex-1 overflow-y-auto px-5 py-4 space-y-5 bg-[#F7F5EF] select-none"
      data-testid="home-screen"
    >
      {/* 1. Header with greeting and notifications */}
      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user.name}
              className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-sm"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[#173F33] leading-tight">
              {greeting}, {user.name.split(' ')[0]}
            </h1>
            <p className="text-xs text-[#737A74] font-medium">
              Plan your journey. Stay connected.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label={`View notifications (${unreadCount} unread)`}
          className="relative w-10 h-10 rounded-2xl bg-white border border-[#E5E7E1] flex items-center justify-center text-[#173F33] hover:bg-[#E7F0E8] transition-colors shadow-xs"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C84C4C] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* 2. Primary Journey Card (Active vs Idle) */}
      {activeJourney ? (
        <section
          aria-label="Active Journey"
          className="bg-[#173F33] text-white rounded-3xl p-5 shadow-xl relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Journey Active
            </span>
            <span className="text-xs text-emerald-200/80 font-medium">
              Started {formatTime(activeJourney.startedAt)}
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight mb-1 text-white">
            Heading to {activeJourney.destination.name}
          </h2>
          <p className="text-xs text-[#E7F0E8]/70 mb-4 line-clamp-1">
            {activeJourney.destination.address}
          </p>

          <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-black/20 rounded-2xl mb-4 border border-white/10 text-center">
            <div>
              <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Elapsed</p>
              <p className="text-sm font-bold text-white mt-0.5">{formatDuration(elapsedSeconds)}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Est. Arrival</p>
              <p className="text-sm font-bold text-white mt-0.5">
                {formatTime(activeJourney.startedAt + activeJourney.expectedDurationMinutes * 60000)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Contacts</p>
              <p className="text-sm font-bold text-emerald-300 mt-0.5">
                {activeJourney.sharedContactIds.length} Live
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onViewActiveJourney}
            className="w-full bg-[#E7F0E8] text-[#103329] hover:bg-white font-bold py-3.5 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>View Active Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      ) : (
        <section
          aria-label="Start Journey"
          className="bg-white rounded-3xl p-5 shadow-sm border border-[#E5E7E1] relative overflow-hidden"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#E7F0E8] flex items-center justify-center text-[#173F33]">
              <Shield className="w-4 h-4 text-[#173F33]" />
            </div>
            <span className="text-xs font-bold text-[#173F33] uppercase tracking-wider">
              Safety First
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#252B27] mb-1">
            Where are you heading?
          </h2>

          <p className="text-sm text-[#737A74] mb-5 leading-relaxed">
            Start a journey and choose who can follow your progress in real time.
          </p>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => onStartJourneyClick()}
              className="w-full bg-[#173F33] text-white hover:bg-[#103329] font-bold py-3.5 px-5 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              aria-label="Start a Journey"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start a Journey</span>
            </button>

            {/* Saved Place Quick Chips */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-[#737A74] uppercase tracking-wider mb-2">
                Quick start to saved place:
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {savedPlaces.slice(0, 3).map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => onStartJourneyClick(place)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F5EF] hover:bg-[#E7F0E8] border border-[#E5E7E1] text-xs font-semibold text-[#252B27] transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#173F33]" />
                    <span>{place.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Quick Action Shortcuts */}
      <section aria-label="Quick Actions">
        <h3 className="text-xs font-bold text-[#737A74] uppercase tracking-wider mb-2.5">
          Quick Shortcuts
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('profile')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-[#E5E7E1] hover:border-[#173F33]/30 shadow-2xs transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E7F0E8] text-[#173F33] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#252B27]">Saved Places</span>
            <span className="text-[10px] text-[#737A74]">{savedPlaces.length} locations</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('contacts')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-[#E5E7E1] hover:border-[#173F33]/30 shadow-2xs transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E7F0E8] text-[#173F33] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#252B27]">Trusted Contacts</span>
            <span className="text-[10px] text-[#737A74]">Alert network</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('journeys')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-[#E5E7E1] hover:border-[#173F33]/30 shadow-2xs transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E7F0E8] text-[#173F33] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <History className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#252B27]">History</span>
            <span className="text-[10px] text-[#737A74]">Past logs</span>
          </button>
        </div>
      </section>

      {/* 4. Recent Activity */}
      <section aria-label="Recent Activity">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold text-[#737A74] uppercase tracking-wider">
            Recent Activity
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab('journeys')}
            className="text-xs font-bold text-[#173F33] hover:underline"
          >
            View all
          </button>
        </div>

        {latestCompletedJourney ? (
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7E1] shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-[#173F33]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#252B27] truncate">
                    {latestCompletedJourney.title}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E7F0E8] text-[#173F33]">
                    Completed
                  </span>
                </div>
                <p className="text-xs text-[#737A74] mt-0.5">
                  {formatDate(latestCompletedJourney.startedAt)} • {Math.round((latestCompletedJourney.actualDurationSeconds || 1200) / 60)} min walk • {latestCompletedJourney.checkInCount} check-ins
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('journeys')}
              className="p-1.5 text-[#737A74] hover:text-[#173F33]"
              aria-label="View recent journey details"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white border border-[#E5E7E1] text-center text-xs text-[#737A74]">
            No completed journeys yet. Start your first safe journey above!
          </div>
        )}
      </section>

      {/* 5. Safety Ecosystem Sync Banner */}
      <section className="p-3.5 rounded-2xl bg-[#E7F0E8] border border-[#D5E2D7] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-[#173F33] shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#173F33]">
              Safety Intelligence Sync
            </p>
            <p className="text-[11px] text-[#173F33]/70">
              Safe corridors & check-in analytics active
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('safety')}
          className="text-xs font-bold text-[#173F33] hover:underline"
        >
          Inspect
        </button>
      </section>
    </div>
  );
};
