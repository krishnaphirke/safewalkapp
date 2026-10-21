import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Smartphone, Maximize2 } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [usePhoneFrame, setUsePhoneFrame] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen sm:min-h-screen bg-[#103329] flex flex-col items-center justify-center p-0 sm:p-4 select-none font-sans overflow-hidden">
      {/* Desktop Top Bar Controls (Hidden on small screens) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[430px] mb-2 px-2 text-xs text-[#E7F0E8]/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-medium tracking-wide">SafeWalk Mobile OS</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setUsePhoneFrame(!usePhoneFrame)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white font-medium"
            title="Toggle Device Frame"
            aria-label="Toggle device frame"
          >
            {usePhoneFrame ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone Shell</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`w-full h-full transition-all duration-300 relative flex flex-col bg-[#F7F5EF] overflow-hidden ${
          usePhoneFrame
            ? 'sm:max-w-[400px] sm:h-[860px] sm:rounded-[44px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)] sm:border-[10px] sm:border-[#1a2e26]'
            : 'max-w-2xl h-screen sm:rounded-2xl shadow-xl'
        }`}
      >
        {/* iOS Dynamic Island & Status Bar */}
        <div className="w-full pt-3 px-6 pb-2 flex items-center justify-between z-30 shrink-0 bg-[#F7F5EF]">
          <span className="text-[14px] font-bold text-[#252B27] tracking-tight">
            {currentTime}
          </span>

          {/* Dynamic Island Pill */}
          <div className="w-24 h-5 bg-black rounded-full flex items-center justify-end px-2 gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60"></span>
          </div>

          <div className="flex items-center gap-1.5 text-[#252B27]">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Screen Content Wrapper */}
        <div className="relative flex-1 flex flex-col overflow-hidden bg-[#F7F5EF]">
          {children}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="w-full pb-2 pt-1 flex justify-center shrink-0 bg-[#F7F5EF]">
          <div className="w-32 h-1 bg-[#252B27]/25 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
