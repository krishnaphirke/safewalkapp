import React, { useMemo, useState } from 'react';
import { Coordinates, RouteWaypoint } from '../types';
import { Navigation, Shield, Compass, Plus, Minus, MapPin, AlertTriangle } from 'lucide-react';

interface SafeWalkMapProps {
  currentPos?: Coordinates;
  origin?: Coordinates;
  destination?: Coordinates;
  waypoints?: RouteWaypoint[];
  isDeviated?: boolean;
  deviationMeters?: number;
  interactive?: boolean;
  className?: string;
}

export const SafeWalkMap: React.FC<SafeWalkMapProps> = ({
  currentPos,
  origin,
  destination,
  waypoints = [],
  isDeviated = false,
  deviationMeters = 0,
  interactive = true,
  className = '',
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [centerOffset, setCenterOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculate bounding box of all points
  const bounds = useMemo(() => {
    const allPoints: { lat: number; lng: number }[] = [];
    if (origin) allPoints.push(origin);
    if (destination) allPoints.push(destination);
    if (currentPos) allPoints.push(currentPos);
    waypoints.forEach((w) => allPoints.push(w));

    if (allPoints.length === 0) {
      return {
        minLat: 37.77,
        maxLat: 37.79,
        minLng: -122.42,
        maxLng: -122.4,
      };
    }

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    for (const p of allPoints) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    }

    // Add padding (at least 0.005 margin)
    const latSpan = Math.max(maxLat - minLat, 0.008);
    const lngSpan = Math.max(maxLng - minLng, 0.008);
    const padFactor = 0.25;

    return {
      minLat: minLat - latSpan * padFactor,
      maxLat: maxLat + latSpan * padFactor,
      minLng: minLng - lngSpan * padFactor,
      maxLng: maxLng + lngSpan * padFactor,
    };
  }, [origin, destination, currentPos, waypoints]);

  // Project lat/lng to SVG viewBox (0,0) to (500, 500)
  const project = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 500;
    // Invert Y because latitude increases northward (upward)
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 500;
    return { x, y };
  };

  const polylinePoints = useMemo(() => {
    if (waypoints.length < 2) return '';
    return waypoints
      .map((w) => {
        const p = project(w.lat, w.lng);
        return `${p.x},${p.y}`;
      })
      .join(' ');
  }, [waypoints, bounds]);

  const originPoint = origin ? project(origin.lat, origin.lng) : null;
  const destPoint = destination ? project(destination.lat, destination.lng) : null;
  const userPoint = currentPos ? project(currentPos.lat, currentPos.lng) : null;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.3, 2.4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.3, 0.8));
  const handleRecenter = () => {
    setZoom(1);
    setCenterOffset({ x: 0, y: 0 });
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#F2F4EE] select-none ${className}`}
      data-testid="safewalk-map-container"
    >
      {/* Background stylized urban grid & street blocks */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-300"
        viewBox="0 0 500 500"
        style={{
          transform: `scale(${zoom}) translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          transformOrigin: 'center center',
        }}
      >
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#173F33" />
            <stop offset="100%" stopColor="#2E7D32" />
          </linearGradient>

          <pattern id="streetGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            {/* City block buildings */}
            <rect x="6" y="6" width="48" height="48" rx="6" fill="#E8ECE2" stroke="#DFE4D8" strokeWidth="1" />
            {/* Street walkways */}
            <line x1="0" y1="30" x2="60" y2="30" stroke="#FFFFFF" strokeWidth="4" />
            <line x1="30" y1="0" x2="30" y2="60" stroke="#FFFFFF" strokeWidth="4" />
          </pattern>

          {/* Safe Corridor glow filter */}
          <filter id="corridorGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#173F33" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Base Grid Layer */}
        <rect x="0" y="0" width="500" height="500" fill="url(#streetGrid)" opacity="0.85" />

        {/* Green Parks / Safety Zones */}
        <rect x="40" y="320" width="130" height="110" rx="16" fill="#E0EBE2" opacity="0.9" />
        <rect x="330" y="50" width="120" height="90" rx="16" fill="#E0EBE2" opacity="0.9" />

        {/* Street Labels / Landmarks */}
        <text x="105" y="380" fill="#7A9386" fontSize="10" fontWeight="600" textAnchor="middle">
          Civic Safe Park
        </text>
        <text x="390" y="100" fill="#7A9386" fontSize="10" fontWeight="600" textAnchor="middle">
          Plaza Corridor
        </text>

        {/* Route buffer shadow */}
        {polylinePoints && (
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#173F33"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.15"
          />
        )}

        {/* Planned Route Line */}
        {polylinePoints && (
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#corridorGlow)"
          />
        )}

        {/* Dashed route center line */}
        {polylinePoints && (
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#A3E635"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Origin Marker */}
        {originPoint && (
          <g transform={`translate(${originPoint.x}, ${originPoint.y})`}>
            <circle r="10" fill="#FFFFFF" stroke="#173F33" strokeWidth="3" />
            <circle r="4" fill="#173F33" />
            <text y="-14" textAnchor="middle" fill="#173F33" fontSize="11" fontWeight="700">
              Start
            </text>
          </g>
        )}

        {/* Destination Marker */}
        {destPoint && (
          <g transform={`translate(${destPoint.x}, ${destPoint.y})`}>
            {/* Pin shadow */}
            <ellipse cx="0" cy="4" rx="8" ry="4" fill="#000000" opacity="0.2" />
            {/* Pin icon */}
            <circle r="14" fill="#173F33" />
            <path
              d="M-4 -3 L4 -3 L2 4 L-2 4 Z"
              fill="#FFFFFF"
            />
            <circle cx="0" cy="-2" r="3" fill="#A3E635" />
            <text y="-18" textAnchor="middle" fill="#103329" fontSize="11" fontWeight="800">
              Destination
            </text>
          </g>
        )}

        {/* Deviation Line if off-track */}
        {isDeviated && userPoint && (
          <line
            x1={userPoint.x}
            y1={userPoint.y}
            x2={userPoint.x - 30}
            y2={userPoint.y + 25}
            stroke="#D99A2B"
            strokeWidth="2.5"
            strokeDasharray="3 3"
          />
        )}

        {/* Current User Live Location Marker */}
        {userPoint && (
          <g transform={`translate(${userPoint.x}, ${userPoint.y})`}>
            {/* Pulsing Radar Ring */}
            <circle
              r="24"
              fill={isDeviated ? '#D99A2B' : '#173F33'}
              opacity="0.25"
              className="animate-radar"
            />
            <circle
              r="14"
              fill={isDeviated ? '#D99A2B' : '#173F33'}
              opacity="0.35"
            />
            {/* Solid Core Dot */}
            <circle
              r="8"
              fill="#FFFFFF"
              stroke={isDeviated ? '#D99A2B' : '#173F33'}
              strokeWidth="3.5"
            />
            <circle
              r="3.5"
              fill={isDeviated ? '#D99A2B' : '#22C55E'}
            />

            {/* Label */}
            <rect
              x="-36"
              y="12"
              width="72"
              height="20"
              rx="10"
              fill={isDeviated ? '#D99A2B' : '#173F33'}
            />
            <text
              y="26"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="700"
            >
              {isDeviated ? 'Off Track' : 'You (Live)'}
            </text>
          </g>
        )}
      </svg>

      {/* Map Overlay Controls */}
      {interactive && (
        <div className="absolute right-3 top-3 flex flex-col gap-2 z-10">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in map"
            className="w-9 h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center text-[#173F33] hover:bg-[#E7F0E8] transition-colors border border-[#E5E7E1]"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out map"
            className="w-9 h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center text-[#173F33] hover:bg-[#E7F0E8] transition-colors border border-[#E5E7E1]"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRecenter}
            aria-label="Recenter map location"
            className="w-9 h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center text-[#173F33] hover:bg-[#E7F0E8] transition-colors border border-[#E5E7E1]"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live corridor safe status indicator */}
      <div className="absolute left-3 top-3 z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-sm border border-[#E5E7E1] text-xs font-semibold text-[#173F33]">
          <Shield className="w-3.5 h-3.5 text-[#173F33]" />
          <span>Safe Corridor</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        </div>
      </div>

      {/* Deviation alert badge on map */}
      {isDeviated && (
        <div className="absolute left-3 bottom-3 right-3 z-10">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500 text-white shadow-lg text-xs font-medium animate-bounce">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="flex-1">
              Location is {deviationMeters}m off planned route. Tap check-in below to verify safety.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
