import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../common/PageHeader';
import {
  Mail,
  ShieldCheck,
  Target,
  Flame,
  Activity as ActivityIcon,
  LogOut,
  Save,
  Check,
  RotateCcw,
} from 'lucide-react';

interface ProfileViewProps {
  calorieGoal: number;
  activeGoal: number;
  onUpdateGoals: (calorieGoal: number, activeGoal: number) => void;
  totalMeals: number;
  totalActivities: number;
  totalTasks: number;
  onToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  calorieGoal,
  activeGoal,
  onUpdateGoals,
  totalMeals,
  totalActivities,
  totalTasks,
  onToast,
}) => {
  const { user, signOut } = useAuth();

  const [inputCalorieGoal, setInputCalorieGoal] = useState(calorieGoal);
  const [inputActiveGoal, setInputActiveGoal] = useState(activeGoal);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  const userName =
    user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Member');

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCalorie = Math.max(500, Math.min(10000, Number(inputCalorieGoal) || 2000));
    const finalActive = Math.max(5, Math.min(300, Number(inputActiveGoal) || 30));

    onUpdateGoals(finalCalorie, finalActive);
    setSavedSuccess(true);
    onToast?.('Daily health targets saved successfully', 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setInputCalorieGoal(calorieGoal);
    setInputActiveGoal(activeGoal);
  };

  return (
    <div className="space-y-7 sm:space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <PageHeader
        title="Profile & Target Goals"
        subtitle="Manage your personal health benchmarks and account preferences"
      />

      {/* User Identity Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-card">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-700 to-forest-800 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-emerald-sm ring-4 ring-emerald-50 shrink-0 font-display">
            {userInitial}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-extrabold text-stone-900 capitalize tracking-tight font-display">
                  {userName}
                </h3>
                <p className="text-xs text-stone-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1 font-medium">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{user?.email}</span>
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold self-center sm:self-start">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Account</span>
              </span>
            </div>

            {/* Quick summary stats in profile */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-6 pt-5 border-t border-stone-100">
              <div className="bg-stone-50/80 rounded-2xl p-3 text-center border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Meals
                </span>
                <span className="text-sm sm:text-base font-extrabold text-stone-900 font-display">
                  {totalMeals}
                </span>
              </div>
              <div className="bg-stone-50/80 rounded-2xl p-3 text-center border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Workouts
                </span>
                <span className="text-sm sm:text-base font-extrabold text-stone-900 font-display">
                  {totalActivities}
                </span>
              </div>
              <div className="bg-stone-50/80 rounded-2xl p-3 text-center border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Habits
                </span>
                <span className="text-sm sm:text-base font-extrabold text-stone-900 font-display">
                  {totalTasks}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Settings Form */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-stone-200/80 shadow-card">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-stone-900 font-display">
                Daily Health Targets
              </h4>
              <p className="text-xs text-stone-400">
                Configure your daily calorie intake and physical activity goals
              </p>
            </div>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Targets Saved!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveGoals} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Calorie Goal Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Daily Calorie Target (kcal)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="500"
                  max="10000"
                  step="50"
                  required
                  value={inputCalorieGoal}
                  onChange={(e) => setInputCalorieGoal(Number(e.target.value))}
                  className="w-full pl-4 pr-14 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none text-sm text-stone-900 font-semibold transition-all"
                  placeholder="2000"
                />
                <span className="absolute right-4 top-3.5 text-xs font-bold text-stone-400">
                  kcal
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium">
                Standard baseline for adults is typically 1,800 to 2,500 kcal/day.
              </p>
            </div>

            {/* Active Time Goal Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <ActivityIcon className="w-4 h-4 text-sky-500" />
                <span>Daily Active Time Target (mins)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="300"
                  step="5"
                  required
                  value={inputActiveGoal}
                  onChange={(e) => setInputActiveGoal(Number(e.target.value))}
                  className="w-full pl-4 pr-16 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none text-sm text-stone-900 font-semibold transition-all"
                  placeholder="30"
                />
                <span className="absolute right-4 top-3.5 text-xs font-bold text-stone-400">
                  mins
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium">
                Health guidelines recommend 30 minutes of moderate activity per day.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-emerald-sm active:scale-95 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Goal Preferences</span>
            </button>
          </div>
        </form>
      </div>

      {/* Account & Session Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-stone-900 font-display">Account Session</h4>
          <p className="text-xs text-stone-400 mt-0.5">
            Signed in as <strong className="text-stone-700 font-semibold">{user?.email}</strong>
          </p>
        </div>

        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs shadow-xs transition-colors active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Fit Arc</span>
        </button>
      </div>
    </div>
  );
};
