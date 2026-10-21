import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('maya.lin@example.com');
  const [password, setPassword] = useState<string>('safewalk2026');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [resetEmailSent, setResetEmailSent] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isSignUp) {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name');
        return;
      }
      if (!email || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        return;
      }
    } else {
      if (!email || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter your password');
        return;
      }
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        id: 'usr_' + Date.now(),
        name: isSignUp ? name : 'Maya Lin',
        email: email,
        phone: '+1 (555) 349-8821',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        bloodType: 'O+',
        emergencyMedicalNotes: 'Allergic to penicillin. Carries inhaler for mild asthma.',
        demoMode: true,
        locationPermission: 'granted',
        backgroundTrackingEnabled: true,
      };
      onLoginSuccess(user);
    }, 600);
  };

  const handleQuickDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        id: 'usr_demo_01',
        name: 'Maya Lin',
        email: 'maya.lin@example.com',
        phone: '+1 (555) 349-8821',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        bloodType: 'O+',
        emergencyMedicalNotes: 'Allergic to penicillin. Carries inhaler for mild asthma.',
        demoMode: true,
        locationPermission: 'granted',
        backgroundTrackingEnabled: true,
      };
      onLoginSuccess(user);
    }, 400);
  };

  return (
    <div
      className="flex-1 flex flex-col justify-between p-6 bg-[#F7F5EF] overflow-y-auto select-none"
      data-testid="auth-screen"
    >
      {/* Brand Header */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#173F33] flex items-center justify-center text-white">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#173F33] tracking-tight">SafeWalk</h1>
            <p className="text-[11px] text-[#737A74] font-medium">Walk safer. Stay connected.</p>
          </div>
        </div>

        {/* Demo Mode Notice Banner */}
        <div className="mt-3 p-2.5 rounded-xl bg-[#E7F0E8] border border-[#D5E2D7] text-xs text-[#173F33] flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Demonstration Mode Active</span>
          </div>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="text-[11px] font-bold text-[#173F33] underline hover:text-[#103329]"
          >
            Quick Sign In
          </button>
        </div>
      </div>

      {/* Auth Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E7E1] my-4">
        {/* Tab switch */}
        <div className="flex bg-[#F7F5EF] p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              !isSignUp ? 'bg-white text-[#173F33] shadow-sm' : 'text-[#737A74] hover:text-[#252B27]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              isSignUp ? 'bg-white text-[#173F33] shadow-sm' : 'text-[#737A74] hover:text-[#252B27]'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#C84C4C] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-[#252B27] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#737A74] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full bg-[#F7F5EF] border border-[#E5E7E1] rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#173F33] text-[#252B27]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#252B27] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#737A74] absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#F7F5EF] border border-[#E5E7E1] rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#173F33] text-[#252B27]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#252B27]">
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-[#173F33] font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#737A74] absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F7F5EF] border border-[#E5E7E1] rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#173F33] text-[#252B27]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-3.5 text-[#737A74] hover:text-[#252B27]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-[#252B27] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#737A74] absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F7F5EF] border border-[#E5E7E1] rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#173F33] text-[#252B27]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#173F33] text-white hover:bg-[#103329] font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>{isSignUp ? 'Create SafeWalk Account' : 'Sign In'}</span>
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#E5E7E1]">
            <h3 className="text-base font-bold text-[#173F33] mb-2">Reset Password</h3>
            <p className="text-xs text-[#737A74] mb-4">
              Enter your email and we’ll send a link to securely reset your credentials.
            </p>

            {resetEmailSent ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Reset link sent to {email}. Check your inbox.</span>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F7F5EF] border border-[#E5E7E1] rounded-xl px-3 py-2.5 text-sm"
                  placeholder="name@example.com"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#E5E7E1] text-xs font-bold text-[#737A74]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetEmailSent(true)}
                    className="flex-1 py-2.5 rounded-xl bg-[#173F33] text-white text-xs font-bold"
                  >
                    Send Link
                  </button>
                </div>
              </div>
            )}

            {resetEmailSent && (
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmailSent(false);
                }}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#173F33] text-white text-xs font-bold"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-[11px] text-[#737A74] py-1">
        SafeWalk Personal Safety Ecosystem • End-to-end Protected
      </div>
    </div>
  );
};
