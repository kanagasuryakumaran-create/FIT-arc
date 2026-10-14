import React, { useState, useRef, useEffect } from 'react';
import { TabType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Plus,
  UtensilsCrossed,
  Activity as ActivityIcon,
  CheckCircle2,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';

interface TopBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenAddMeal: () => void;
  onOpenAddActivity: () => void;
  onOpenAddTask: () => void;
  isSyncing?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddMeal,
  onOpenAddActivity,
  onOpenAddTask,
  isSyncing = false,
}) => {
  const { user, signOut } = useAuth();
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const quickMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickMenuRef.current && !quickMenuRef.current.contains(e.target as Node)) {
        setQuickMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuickMenuOpen(false);
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const tabTitles: Record<TabType, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview & Daily Progress' },
    meals: { title: 'Meals & Nutrition', subtitle: 'Food Journal & Calorie Tracker' },
    activities: { title: 'Activity Tracker', subtitle: 'Workouts, Sports & Active Minutes' },
    todos: { title: 'Tasks & Habits', subtitle: 'Daily Wellness Routines' },
    progress: { title: 'Progress & Analytics', subtitle: '7-Day Insights & Health Trends' },
    profile: { title: 'Profile & Settings', subtitle: 'Daily Goals & Account Preferences' },
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  const userName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Member');

  return (
    <header className="hidden lg:flex items-center justify-between px-8 xl:px-10 py-3.5 bg-white/90 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-20">
      {/* Left: Active Section Info & Breadcrumb */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold text-stone-900 tracking-tight font-display">
              {tabTitles[activeTab]?.title || 'Dashboard'}
            </h1>
            <span className="text-stone-300">/</span>
            <span className="text-xs font-semibold text-stone-500">
              {tabTitles[activeTab]?.subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Date, Quick Add, Sync Badge, and User Menu */}
      <div className="flex items-center gap-3">
        {/* Sync Indicator */}
        {isSyncing && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-semibold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Syncing</span>
          </div>
        )}

        {/* Current Date Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100/90 border border-stone-200/70 text-xs font-semibold text-stone-600">
          <Calendar className="w-3.5 h-3.5 text-emerald-700" />
          <span>{todayFormatted}</span>
        </div>

        {/* Quick Log Action Dropdown */}
        <div className="relative" ref={quickMenuRef}>
          <button
            onClick={() => setQuickMenuOpen(!quickMenuOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-emerald-sm transition-all active:scale-95"
            aria-expanded={quickMenuOpen}
            aria-haspopup="true"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Log</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
          </button>

          {quickMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-floating border border-stone-100 p-1.5 z-30 animate-fade-in">
              <button
                onClick={() => {
                  setQuickMenuOpen(false);
                  onOpenAddMeal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
              >
                <div className="p-1 rounded-lg bg-amber-50 text-amber-600">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                </div>
                <span>Log Meal</span>
              </button>

              <button
                onClick={() => {
                  setQuickMenuOpen(false);
                  onOpenAddActivity();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-sky-50 hover:text-sky-800 transition-colors"
              >
                <div className="p-1 rounded-lg bg-sky-50 text-sky-600">
                  <ActivityIcon className="w-3.5 h-3.5" />
                </div>
                <span>Log Workout</span>
              </button>

              <button
                onClick={() => {
                  setQuickMenuOpen(false);
                  onOpenAddTask();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-purple-50 hover:text-purple-800 transition-colors"
              >
                <div className="p-1 rounded-lg bg-purple-50 text-purple-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Create Habit</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Menu Trigger */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-full border border-stone-200 hover:border-emerald-300 hover:bg-stone-50 transition-all active:scale-95"
            title="User Profile Menu"
            aria-expanded={profileMenuOpen}
            aria-haspopup="true"
          >
            <span className="text-xs font-semibold text-stone-700 max-w-[110px] truncate capitalize font-display">
              {userName}
            </span>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-700 to-forest-800 text-white font-bold text-xs flex items-center justify-center">
              {userInitial}
            </div>
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-floating border border-stone-100 p-2 z-30 animate-fade-in">
              <div className="px-3 py-2 border-b border-stone-100 mb-1">
                <p className="text-xs font-bold text-stone-900 truncate capitalize font-display">{userName}</p>
                <p className="text-[11px] text-stone-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  setActiveTab('profile');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-stone-500" />
                <span>Profile & Settings</span>
              </button>

              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
