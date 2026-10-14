import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Lock,
  Mail,
  UserPlus,
  LogIn,
  AlertCircle,
  MailCheck,
  CheckCircle2,
  Sparkles,
  Flame,
  Activity,
  ShieldCheck,
} from 'lucide-react';

export const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSentEmail, setVerificationSentEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVerificationSentEmail(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        // If a session was automatically returned by Supabase, sign out immediately
        // so the user stays on the auth page until their email is verified.
        if (data.session) {
          await supabase.auth.signOut();
        }

        const registeredEmail = email;
        setVerificationSentEmail(registeredEmail);
        setPassword('');
        setIsSignUp(false); // Switch to Login view for convenience after verifying
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        // Check if user email is verified (if Supabase requires confirmation)
        if (signInData.user && !signInData.user.email_confirmed_at) {
          await supabase.auth.signOut();
          setVerificationSentEmail(signInData.user.email || email);
          return;
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An authentication error occurred.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-stone-200/50 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl bg-white rounded-3xl sm:rounded-4xl shadow-floating border border-stone-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-fade-in">
        {/* Left Side Value Props & Branding Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-800 via-forest-800 to-emerald-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xs">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12h3.5l2.5-6 4 12 3-8 2 4H21" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Fit <span className="text-emerald-300">Arc</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white">
              Your premium health & wellness platform.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-3 leading-relaxed">
              Track your daily nutrition, monitor physical workouts, build consistency habits, and visualize your progress with ease.
            </p>
          </div>

          {/* Key Feature Badges */}
          <div className="mt-8 space-y-3 pt-6 border-t border-white/15">
            <div className="flex items-center gap-3 text-xs font-semibold text-emerald-50">
              <div className="p-1.5 rounded-lg bg-white/15 text-emerald-200">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <span>Accurate Calorie & Meal Tracker</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-emerald-50">
              <div className="p-1.5 rounded-lg bg-white/15 text-emerald-200">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <span>Workout & Exercise Active Minutes</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-emerald-50">
              <div className="p-1.5 rounded-lg bg-white/15 text-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Daily Wellness Tasks & Habits</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-emerald-50">
              <div className="p-1.5 rounded-lg bg-white/15 text-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span>Private & Secure Cloud Sync</span>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isSignUp ? 'Join Fit Arc Today' : 'Welcome Back'}</span>
            </div>
            <h3 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {isSignUp ? 'Create your account' : 'Sign in to Fit Arc'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              {isSignUp
                ? 'Enter your credentials to start your fitness journey'
                : 'Access your daily calorie targets and workout logs'}
            </p>
          </div>

          {/* Verification Sent Banner */}
          {verificationSentEmail && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-xs">
              <div className="flex items-start gap-3">
                <MailCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-900 text-sm">Account created successfully!</h4>
                  <p className="text-xs text-emerald-800">
                    We've sent a confirmation email to <strong className="font-semibold underline">{verificationSentEmail}</strong>.
                  </p>
                  <p className="text-xs text-emerald-700">
                    Please verify your email via the link, then return here to log in.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-2xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none text-sm text-stone-900 transition-all font-medium"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none text-sm text-stone-900 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-emerald-sm active:scale-98 transition-all disabled:opacity-50 text-sm mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Processing...</span>
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle between Sign In and Register */}
          <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs sm:text-sm text-stone-500 font-medium">
            {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setVerificationSentEmail(null);
              }}
              className="text-emerald-700 font-bold hover:text-emerald-800 hover:underline focus:outline-none transition-colors ml-1"
            >
              {isSignUp ? 'Sign In here' : 'Register now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

