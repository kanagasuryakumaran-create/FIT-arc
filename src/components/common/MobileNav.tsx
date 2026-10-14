import React from 'react';
import { TabType } from '../../types';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Activity as ActivityIcon,
  CheckCircle2,
  TrendingUp,
  Settings,
} from 'lucide-react';

interface MobileNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Home', icon: LayoutDashboard },
    { id: 'meals' as TabType, label: 'Meals', icon: UtensilsCrossed },
    { id: 'activities' as TabType, label: 'Activity', icon: ActivityIcon },
    { id: 'todos' as TabType, label: 'Habits', icon: CheckCircle2 },
    { id: 'progress' as TabType, label: 'Progress', icon: TrendingUp },
    { id: 'profile' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-1 py-1 safe-area-bottom shadow-floating">
      <nav className="flex items-center justify-around max-w-lg mx-auto" aria-label="Mobile Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[48px] rounded-2xl transition-all relative ${
                isActive
                  ? 'text-emerald-800 font-bold'
                  : 'text-stone-400 hover:text-stone-600 font-medium'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : 'text-stone-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
