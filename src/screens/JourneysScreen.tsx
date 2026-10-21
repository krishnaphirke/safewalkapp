import React, { useState } from 'react';
import { Journey } from '../types';
import {
  History,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  ChevronRight,
  X,
  Share2,
  Calendar,
  Compass,
} from 'lucide-react';
import { SafeWalkMap } from '../components/SafeWalkMap';
import { formatDate, formatTime, formatDuration, formatDistance } from '../utils/journeyState';

interface JourneysScreenProps {
  journeys: Journey[];
}

export const JourneysScreen: React.FC<JourneysScreenProps> = ({ journeys }) => {
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);

  // Compute aggregate stats
  const totalWalkedMeters = journeys.reduce(
    (acc, j) => acc + (j.totalDistanceMeters || 0),
    0
  );
  const totalCheckIns = journeys.reduce((acc, j) => acc + (j.checkInCount || 0), 0);

  return (
    <div
      className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#F7F5EF] select-none"
      data-testid="journeys-screen"
    >
      {/* Top Header */}
      <div className="pt-1">
        <h1 className="text-xl font-extrabold text-[#173F33] tracking-tight">
          Journey History
        </h1>
        <p className="text-xs text-[#737A74] font-medium">
          Retrospective logs & SafeWalk Intelligence archive
        </p>
      </div>

      {/* Aggregate Stats Summary Card */}
      <div className="grid grid-cols-3 gap-2.5 bg-[#173F33] text-white p-4 rounded-3xl shadow-md">
        <div className="text-center">
          <span className="text-[10px] font-semibold uppercase text-emerald-300">
            Total Walks
          </span>
          <p className="text-lg font-bold mt-0.5">{journeys.length}</p>
        </div>
        <div className="text-center border-x border-white/10">
          <span className="text-[10px] font-semibold uppercase text-emerald-300">
            Distance
          </span>
          <p className="text-lg font-bold mt-0.5">{(totalWalkedMeters / 1000).toFixed(1)} km</p>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-semibold uppercase text-emerald-300">
            Check-Ins
          </span>
          <p className="text-lg font-bold mt-0.5">{totalCheckIns} OK</p>
        </div>
      </div>

      {/* Journey List */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#737A74]">
          Completed Journeys
        </h2>

        {journeys.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-[#E5E7E1] text-[#737A74]">
            <History className="w-8 h-8 text-[#173F33]/40 mx-auto mb-2" />
            <p className="text-sm font-semibold">No journey history yet</p>
            <p className="text-xs mt-1">Start a journey from Home to log safe tracking.</p>
          </div>
        ) : (
          journeys.map((journey) => (
            <button
              key={journey.id}
              type="button"
              onClick={() => setSelectedJourney(journey)}
              className="w-full bg-white rounded-2xl p-4 border border-[#E5E7E1] hover:border-[#173F33]/40 shadow-2xs transition-all text-left flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E7F0E8] text-[#173F33] flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-[#173F33]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#252B27] truncate group-hover:text-[#173F33]">
                      {journey.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#737A74] mt-0.5 truncate">
                    To {journey.destination.name} • {formatDate(journey.startedAt)}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-[#737A74] mt-1.5 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#173F33]" />
                      {formatDuration(journey.actualDurationSeconds || 1200)}
                    </span>
                    <span>•</span>
                    <span>{formatDistance(journey.totalDistanceMeters)}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{journey.checkInCount} check-ins</span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-[#737A74] group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
            </button>
          ))
        )}
      </div>

      {/* Retrospective Journey Detail Replay Modal */}
      {selectedJourney && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white rounded-t-[36px] sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#E5E7E1]">
            <div className="px-5 py-4 border-b border-[#E5E7E1] flex items-center justify-between bg-[#F7F5EF] shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-[#173F33]">
                  {selectedJourney.title}
                </h3>
                <p className="text-xs text-[#737A74]">
                  {formatDate(selectedJourney.startedAt)} at {formatTime(selectedJourney.startedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJourney(null)}
                className="p-2 rounded-full hover:bg-black/5 text-[#737A74]"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Route Replay Map */}
              <div className="h-48 rounded-2xl overflow-hidden border border-[#E5E7E1] shadow-inner relative">
                <SafeWalkMap
                  origin={selectedJourney.origin.coords}
                  destination={selectedJourney.destination.coords}
                  waypoints={selectedJourney.waypoints}
                  currentPos={selectedJourney.destination.coords}
                  interactive={true}
                />
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-[#F7F5EF] rounded-2xl text-center border border-[#E5E7E1]">
                <div>
                  <p className="text-[10px] text-[#737A74] uppercase font-bold">Duration</p>
                  <p className="text-sm font-bold text-[#173F33] mt-0.5">
                    {formatDuration(selectedJourney.actualDurationSeconds || 1200)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#737A74] uppercase font-bold">Distance</p>
                  <p className="text-sm font-bold text-[#173F33] mt-0.5">
                    {formatDistance(selectedJourney.totalDistanceMeters)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#737A74] uppercase font-bold">Safety Score</p>
                  <p className="text-sm font-bold text-emerald-700 mt-0.5">100% OK</p>
                </div>
              </div>

              {/* Waypoints & Check-in Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#737A74] mb-2">
                  Check-in Event Timeline
                </h4>
                <div className="space-y-2">
                  {selectedJourney.checkIns && selectedJourney.checkIns.length > 0 ? (
                    selectedJourney.checkIns.map((chk, idx) => (
                      <div
                        key={chk.id || idx}
                        className="p-3 rounded-xl bg-[#F7F5EF] border border-[#E5E7E1] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-semibold text-[#252B27]">{chk.message}</p>
                            <p className="text-[10px] text-[#737A74]">
                              Delivered to {chk.deliveredContacts.length} contacts
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-[#737A74]">
                          {formatTime(chk.timestamp)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-xl bg-[#F7F5EF] text-xs text-[#737A74]">
                      No custom check-ins recorded.
                    </div>
                  )}
                </div>
              </div>

              {/* SafeWalk Safety Intelligence Sync Note */}
              <div className="p-3 rounded-xl bg-[#E7F0E8] border border-[#D5E2D7] text-xs text-[#173F33] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#173F33] shrink-0" />
                <span>
                  Synchronized with SafeWalk Safety Intelligence Platform for long-term pattern analysis.
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E7E1] bg-white shrink-0">
              <button
                type="button"
                onClick={() => setSelectedJourney(null)}
                className="w-full py-3 rounded-xl bg-[#173F33] text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
