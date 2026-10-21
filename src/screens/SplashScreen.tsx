import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onContinue: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-between p-8 bg-[#103329] text-white select-none animate-fadeIn"
      data-testid="splash-screen"
    >
      <div className="w-full flex justify-end">
        <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold px-2.5 py-1 rounded-full bg-white/10">
          Mobile v2.4
        </span>
      </div>

      <div className="flex flex-col items-center text-center my-auto">
        {/* Authentic SafeWalk Emblem Badge */}
        <div className="relative mb-6 group">
          <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/20 via-purple-500/30 to-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
          <img
            src="/assets/aistudio/IMG-20261021-WA0024_c24bf2b5.jpg"
            alt="SafeWalk Official Shield Emblem"
            className="w-48 h-48 rounded-full shadow-2xl border-4 border-white/20 object-cover relative z-10 transition-transform duration-500 hover:scale-105"
          />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            SafeWalk
          </h1>
        </div>

        <p className="text-base text-[#E7F0E8]/85 font-medium tracking-wide max-w-xs">
          Walk safer. Stay connected.
        </p>

        <p className="text-xs text-[#E7F0E8]/60 mt-3 max-w-[260px] leading-relaxed">
          Real-world journey monitoring, trusted contact tracking, and proactive check-ins.
        </p>
      </div>

      <div className="w-full space-y-3">
        <button
          type="button"
          onClick={onContinue}
          className="w-full bg-[#E7F0E8] text-[#103329] hover:bg-white font-bold py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
          aria-label="Enter SafeWalk app"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-center text-[11px] text-[#E7F0E8]/50">
          Encrypted & private. Your location is never sold.
        </p>
      </div>
    </div>
  );
};
