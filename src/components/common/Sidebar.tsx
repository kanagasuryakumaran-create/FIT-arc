import React from 'react';
import { TabType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { FitArcLogo } from './FitArcLogo';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Activity as ActivityIcon,
  CheckCircle2,
  TrendingUp,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  todayCalories: number;
  calorieGoal: number;
  completedTasksCount: number;
  totalTasksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  todayCalories,
  calorieGoal,
}) => {
  const { user, signOut } = useAuth();

  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meals' as TabType, label: 'Meals & Food', icon: UtensilsCrossed, badge: todayCalories > 0 ? `${todayCalories} kcal` : undefined },
    { id: 'activities' as TabType, label: 'Activities', icon: ActivityIcon },
    { id: 'todos' as TabType, label: 'Tasks & Habits', icon: CheckCircle2 },
    { id: 'progress' as TabType, label: 'Progress', icon: TrendingUp },
    { id: 'profile' as TabType, label: 'Profile & Settings', icon: Settings },
  ];

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  const userName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Member');
  const safeGoal = calorieGoal > 0 ? calorieGoal : 2000;
  const caloriePercent = Math.min(100, Math.round((todayCalories / safeGoal) * 100));

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-stone-200/80 h-screen sticky top-0 shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-6 pb-5 border-b border-stone-100 flex items-center justify-between">
        <FitArcLogo size="md" />
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-150 group relative ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-600 rounded-r-full" />
              )}

              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-emerald-sm'
                      : 'text-stone-400 group-hover:text-stone-700 group-hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </div>

              {item.badge && !isActive && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/50">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Daily Motivation / Calorie Meter Pod */}
        <div className="pt-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-stone-50/80 to-emerald-50/40 border border-emerald-100/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Daily Calorie Target
              </span>
              <span className="text-xs font-extrabold text-emerald-700 font-display">{caloriePercent}%</span>
            </div>
            <div className="w-full bg-stone-200/70 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-2 font-medium">
              {todayCalories.toLocaleString()} of {safeGoal.toLocaleString()} kcal consumed
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Card Footer */}
      <div className="p-4 border-t border-stone-100 bg-stone-50/50">
        <div className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-white hover:shadow-subtle transition-all border border-transparent hover:border-stone-200/60">
          <div
            className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
            onClick={() => setActiveTab('profile')}
            title="Open Profile Settings"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-forest-800 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ring-2 ring-white">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-stone-800 truncate capitalize font-display">{userName}</p>
              <p className="text-[11px] text-stone-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 active:scale-95"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
