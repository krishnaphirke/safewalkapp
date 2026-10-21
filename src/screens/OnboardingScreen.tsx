import React, { useState } from 'react';
import { Shield, Users, MapPin, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    {
      id: 1,
      title: 'Your journey, your choice',
      tagline: 'Private by default, shared on demand',
      description:
        'Start a journey anytime and decide who can follow your route in real time. You remain in total control of your location sharing.',
      icon: MapPin,
      badge: 'Step 1 of 3',
      color: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 2,
      title: 'Stay connected & verified',
      tagline: 'Scheduled check-ins keeping you safe',
      description:
        'Receive gentle check-in reminders like "I\'m OK" along your route. If an unexpected delay or deviation occurs, designated contacts are updated.',
      icon: Users,
      badge: 'Step 2 of 3',
      color: 'bg-teal-100 text-teal-800',
    },
    {
      id: 3,
      title: 'Know when you’ve arrived',
      tagline: 'Automatic arrival confirmation',
      description:
        'SafeWalk sends an instant safe arrival notice to your chosen friends or family, records completed journey history, and logs peace of mind.',
      icon: CheckCircle,
      badge: 'Step 3 of 3',
      color: 'bg-green-100 text-green-800',
    },
  ];

  const current = steps[currentStep];
  const IconComponent = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col justify-between p-6 bg-[#F7F5EF] text-[#252B27] select-none"
      data-testid="onboarding-screen"
    >
      {/* Top Header & Skip */}
      <div className="flex items-center justify-between pt-2">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 text-[#737A74] hover:text-[#173F33] transition-colors"
            aria-label="Previous slide"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-5" />
        )}

        <div className="flex items-center gap-1.5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-6 bg-[#173F33]' : 'w-2 bg-[#E5E7E1]'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onComplete}
          className="text-xs font-semibold text-[#737A74] hover:text-[#173F33] px-2 py-1 rounded"
          aria-label="Skip onboarding"
        >
          Skip
        </button>
      </div>

      {/* Center Illustration & Content */}
      <div className="my-auto flex flex-col items-center text-center px-2">
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-3xl bg-[#E7F0E8] border border-[#D5E2D7] flex items-center justify-center shadow-inner">
            <IconComponent className="w-14 h-14 text-[#173F33]" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#173F33] text-white flex items-center justify-center shadow">
            <Shield className="w-4 h-4" />
          </div>
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-[#173F33] bg-[#E7F0E8] px-3 py-1 rounded-full mb-3">
          {current.badge}
        </span>

        <h2 className="text-2xl font-bold tracking-tight text-[#252B27] mb-2">
          {current.title}
        </h2>

        <p className="text-sm font-semibold text-[#173F33]/80 mb-3">
          {current.tagline}
        </p>

        <p className="text-sm text-[#737A74] leading-relaxed max-w-xs">
          {current.description}
        </p>
      </div>

      {/* Bottom CTA controls */}
      <div className="w-full space-y-3 pb-2">
        <button
          type="button"
          onClick={handleNext}
          className="w-full bg-[#173F33] text-white hover:bg-[#103329] font-bold py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          aria-label={currentStep === steps.length - 1 ? 'Get Started with SafeWalk' : 'Continue to next step'}
        >
          <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-center text-[11px] text-[#737A74]">
          Location permissions are requested only when a journey starts.
        </p>
      </div>
    </div>
  );
};
