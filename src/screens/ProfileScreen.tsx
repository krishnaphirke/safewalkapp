import React, { useState } from 'react';
import { UserProfile, SavedPlace } from '../types';
import {
  User,
  MapPin,
  Plus,
  Trash2,
  Shield,
  Smartphone,
  LogOut,
  RefreshCw,
  CheckCircle2,
  X,
  Compass,
  AlertCircle,
  Home,
  Briefcase,
  Dumbbell,
} from 'lucide-react';

interface ProfileScreenProps {
  user: UserProfile;
  savedPlaces: SavedPlace[];
  onUpdateUser: (user: UserProfile) => void;
  onAddPlace: (place: SavedPlace) => void;
  onDeletePlace: (id: string) => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  savedPlaces,
  onUpdateUser,
  onAddPlace,
  onDeletePlace,
  onLogout,
}) => {
  const [showAddPlace, setShowAddPlace] = useState<boolean>(false);
  const [placeName, setPlaceName] = useState<string>('');
  const [placeAddress, setPlaceAddress] = useState<string>('');
  const [placeCategory, setPlaceCategory] = useState<'home' | 'work' | 'gym' | 'other'>('home');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleToggleDemoMode = () => {
    onUpdateUser({
      ...user,
      demoMode: !user.demoMode,
    });
  };

  const handleToggleBackgroundTracking = () => {
    onUpdateUser({
      ...user,
      backgroundTrackingEnabled: !user.backgroundTrackingEnabled,
    });
  };

  const handleCreatePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeName.trim() || !placeAddress.trim()) {
      setErrorMsg('Please enter both name and address');
      return;
    }

    const newPlace: SavedPlace = {
      id: 'plc_' + Date.now(),
      name: placeName.trim(),
      address: placeAddress.trim(),
      category: placeCategory,
      coords: {
        lat: 37.7749 + (Math.random() - 0.5) * 0.02,
        lng: -122.4194 + (Math.random() - 0.5) * 0.02,
      },
      iconName: placeCategory,
    };

    onAddPlace(newPlace);
    setShowAddPlace(false);
    setPlaceName('');
    setPlaceAddress('');
    setErrorMsg('');
  };

  const handleSyncWebsite = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#F7F5EF] select-none"
      data-testid="profile-screen"
    >
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-xl font-extrabold text-[#173F33] tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-xs text-[#737A74] font-medium">
          Personal account, saved places & privacy preferences
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E7E1] shadow-2xs flex items-center gap-4">
        <img
          src={
            user.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
          }
          alt={user.name}
          className="w-16 h-16 rounded-2xl object-cover border-2 border-[#173F33]/20 shadow-xs shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-[#252B27] truncate">{user.name}</h2>
          <p className="text-xs text-[#737A74] truncate">{user.email}</p>
          <p className="text-xs text-[#737A74] truncate">{user.phone}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Verified User
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F7F5EF] text-[#173F33]">
              Blood {user.bloodType || 'O+'}
            </span>
          </div>
        </div>
      </div>

      {/* Saved Places Management */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E7E1] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#173F33]" />
            <h3 className="text-sm font-bold text-[#252B27]">Saved Places</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowAddPlace(true)}
            className="flex items-center gap-1 text-xs font-bold text-[#173F33] hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Place</span>
          </button>
        </div>

        <div className="space-y-2">
          {savedPlaces.map((place) => (
            <div
              key={place.id}
              className="p-3 rounded-2xl bg-[#F7F5EF] border border-[#E5E7E1] flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#173F33] shrink-0">
                  {place.category === 'home' && <Home className="w-4 h-4" />}
                  {place.category === 'work' && <Briefcase className="w-4 h-4" />}
                  {place.category === 'gym' && <Dumbbell className="w-4 h-4" />}
                  {place.category === 'other' && <MapPin className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#252B27] truncate">{place.name}</p>
                  <p className="text-[11px] text-[#737A74] truncate">{place.address}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeletePlace(place.id)}
                aria-label={`Remove saved place ${place.name}`}
                className="p-1.5 text-[#737A74] hover:text-[#C84C4C] rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions & Location Controls */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E7E1] shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-[#252B27]">Permissions & Sensors</h3>

        <div className="flex items-center justify-between py-2 border-b border-[#F7F5EF]">
          <div>
            <p className="text-xs font-bold text-[#252B27]">High-Precision GPS</p>
            <p className="text-[11px] text-[#737A74]">Active during journey routes</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            Granted
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-[#F7F5EF]">
          <div>
            <p className="text-xs font-bold text-[#252B27]">Background Location</p>
            <p className="text-[11px] text-[#737A74]">Tracks when app is minimized</p>
          </div>
          <button
            type="button"
            onClick={handleToggleBackgroundTracking}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              user.backgroundTrackingEnabled ? 'bg-[#173F33]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                user.backgroundTrackingEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-xs font-bold text-[#252B27]">Demonstration Mode</p>
            <p className="text-[11px] text-[#737A74]">Simulated contact delivery</p>
          </div>
          <button
            type="button"
            onClick={handleToggleDemoMode}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              user.demoMode ? 'bg-[#173F33]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                user.demoMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Safety Intelligence Platform Website Sync */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E7E1] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#173F33]" />
            <h3 className="text-sm font-bold text-[#252B27]">Safety Intelligence Sync</h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            Connected
          </span>
        </div>

        <p className="text-xs text-[#737A74] leading-relaxed">
          Synchronizes your journey history and safety check-in metrics with the SafeWalk Safety Intelligence Web Platform.
        </p>

        <button
          type="button"
          onClick={handleSyncWebsite}
          disabled={isSyncing}
          className="w-full py-3 px-4 rounded-xl bg-[#F7F5EF] hover:bg-[#E7F0E8] text-[#173F33] text-xs font-bold border border-[#E5E7E1] flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#173F33]" />
              <span>Synchronizing with Web Platform...</span>
            </>
          ) : syncSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Platform Synchronized Successfully!</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 text-[#173F33]" />
              <span>Sync with Safety Intelligence Website</span>
            </>
          )}
        </button>
      </div>

      {/* Logout Action */}
      <button
        type="button"
        onClick={onLogout}
        className="w-full py-3.5 px-4 rounded-2xl bg-white border border-[#E5E7E1] text-[#C84C4C] hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out of SafeWalk</span>
      </button>

      {/* Add Saved Place Modal */}
      {showAddPlace && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#E5E7E1]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#173F33]">Add Saved Place</h3>
              <button
                type="button"
                onClick={() => setShowAddPlace(false)}
                className="p-1 rounded-full text-[#737A74]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#C84C4C] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreatePlace} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#252B27] mb-1">
                  Place Label
                </label>
                <input
                  type="text"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder="e.g. University Campus, Coffee Shop"
                  className="w-full bg-[#F7F5EF] border border-[#E5E7E1] rounded-xl px-3 py-2.5 text-xs text-[#252B27]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#252B27] mb-1">
                  Address or Area
                </label>
                <input
                  type="text"
                  value={placeAddress}
                  onChange={(e) => setPlaceAddress(e.target.value)}
                  placeholder="e.g. 100 University Ave"
                  className="w-full bg-[#F7F5EF] border border-[#E5E7E1] rounded-xl px-3 py-2.5 text-xs text-[#252B27]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#252B27] mb-1">
                  Category
                </label>
                <select
                  value={placeCategory}
                  onChange={(e) => setPlaceCategory(e.target.value as 'home' | 'work' | 'gym' | 'other')}
                  className="w-full bg-[#F7F5EF] border border-[#E5E7E1] rounded-xl px-3 py-2.5 text-xs text-[#252B27]"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="gym">Gym / Sports</option>
                  <option value="other">Transit / Other</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlace(false)}
                  className="flex-1 py-3 rounded-xl border border-[#E5E7E1] text-xs font-bold text-[#737A74]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#173F33] text-white text-xs font-bold shadow-md hover:bg-[#103329]"
                >
                  Save Place
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
