import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';

interface QuickActionProps {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'emerald' | 'amber' | 'blue' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

export const QuickAction: React.FC<QuickActionProps> = ({
  label,
  icon: Icon,
  onClick,
  variant = 'emerald',
  size = 'md',
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 border-emerald-200/80 active:bg-emerald-200/70',
    amber: 'bg-amber-50/90 hover:bg-amber-100 text-amber-800 border-amber-200/80 active:bg-amber-200/70',
    blue: 'bg-sky-50/90 hover:bg-sky-100 text-sky-800 border-sky-200/80 active:bg-sky-200/70',
    purple: 'bg-purple-50/90 hover:bg-purple-100 text-purple-800 border-purple-200/80 active:bg-purple-200/70',
  }[variant];

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5 font-semibold',
    md: 'px-3.5 py-2 text-xs sm:text-sm rounded-2xl gap-2 font-semibold',
    lg: 'px-5 py-2.5 text-sm rounded-2xl gap-2.5 font-bold',
  }[size];

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center border shadow-xs hover:shadow-subtle transition-all duration-150 active:scale-95 ${variantStyles} ${sizeStyles}`}
    >
      <div className="p-1 rounded-lg bg-white/90 shadow-2xs text-current">
        {Icon ? <Icon className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
      </div>
      <span>{label}</span>
    </button>
  );
};
