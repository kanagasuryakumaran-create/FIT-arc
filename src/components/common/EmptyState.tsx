import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: 'emerald' | 'amber' | 'blue' | 'purple';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  className = '',
  variant = 'emerald',
}) => {
  const variantStyles = {
    emerald: {
      bgIcon: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-sm',
    },
    amber: {
      bgIcon: 'bg-amber-50 text-amber-700 ring-amber-100',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
    },
    blue: {
      bgIcon: 'bg-sky-50 text-sky-700 ring-sky-100',
      btn: 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs',
    },
    purple: {
      bgIcon: 'bg-purple-50 text-purple-700 ring-purple-100',
      btn: 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs',
    },
  }[variant];

  return (
    <div
      className={`p-8 sm:p-12 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-stone-200/90 shadow-subtle ${className}`}
    >
      <div className={`p-4 rounded-3xl ring-8 mb-4 ${variantStyles.bgIcon}`}>
        <Icon className="w-8 h-8" />
      </div>

      <h4 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">{title}</h4>
      <p className="text-xs sm:text-sm text-stone-500 mt-1.5 max-w-sm leading-relaxed">{description}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${variantStyles.btn}`}
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

