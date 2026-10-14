import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose' | 'teal';
  progress?: number; // 0 - 100
  onClick?: () => void;
  badge?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  variant = 'emerald',
  progress,
  onClick,
  badge,
  className = '',
}) => {
  const variantStyles = {
    emerald: {
      bgIcon: 'bg-emerald-50 text-emerald-700 ring-emerald-100/80',
      bar: 'bg-emerald-600',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-100',
      borderHover: 'hover:border-emerald-300',
    },
    amber: {
      bgIcon: 'bg-amber-50 text-amber-700 ring-amber-100/80',
      bar: 'bg-amber-500',
      badge: 'bg-amber-50 text-amber-800 border-amber-100',
      borderHover: 'hover:border-amber-300',
    },
    blue: {
      bgIcon: 'bg-sky-50 text-sky-700 ring-sky-100/80',
      bar: 'bg-sky-500',
      badge: 'bg-sky-50 text-sky-800 border-sky-100',
      borderHover: 'hover:border-sky-300',
    },
    purple: {
      bgIcon: 'bg-purple-50 text-purple-700 ring-purple-100/80',
      bar: 'bg-purple-500',
      badge: 'bg-purple-50 text-purple-800 border-purple-100',
      borderHover: 'hover:border-purple-300',
    },
    rose: {
      bgIcon: 'bg-rose-50 text-rose-700 ring-rose-100/80',
      bar: 'bg-rose-500',
      badge: 'bg-rose-50 text-rose-800 border-rose-100',
      borderHover: 'hover:border-rose-300',
    },
    teal: {
      bgIcon: 'bg-teal-50 text-teal-700 ring-teal-100/80',
      bar: 'bg-teal-500',
      badge: 'bg-teal-50 text-teal-800 border-teal-100',
      borderHover: 'hover:border-teal-300',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-card transition-all duration-200 ${
        onClick
          ? `cursor-pointer ${variantStyles.borderHover} hover:-translate-y-0.5 hover:shadow-card-hover group`
          : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-2xl ring-1 ${variantStyles.bgIcon} transition-colors`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">{title}</span>
        </div>

        {badge && (
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${variantStyles.badge}`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="mt-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-display">{value}</span>
          {unit && <span className="text-xs sm:text-sm font-semibold text-stone-400">{unit}</span>}
        </div>

        {subtitle && <p className="text-xs text-stone-500 mt-1 font-medium leading-relaxed">{subtitle}</p>}

        {typeof progress === 'number' && (
          <div className="mt-3.5 pt-0.5">
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${variantStyles.bar}`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
