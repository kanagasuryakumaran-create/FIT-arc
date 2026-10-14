import React from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  showGreeting?: boolean;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badgeText,
  showGreeting = false,
  actions,
}) => {
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const userName =
    user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'there');

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/90 border border-stone-200/60 text-xs font-semibold text-stone-600">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>{todayFormatted}</span>
          </div>

          {badgeText && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>{badgeText}</span>
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight capitalize font-display">
          {showGreeting ? `${greeting}, ${userName}` : title}
        </h1>

        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal max-w-2xl leading-relaxed">
          {showGreeting
            ? "Track today's nutrition balance, record active workouts, and build lasting healthy habits."
            : subtitle}
        </p>
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0 pt-2 md:pt-0">
          {actions}
        </div>
      )}
    </div>
  );
};
