import React from 'react';
import { Activity } from '../../types';
import {
  Activity as GenericActivity,
  Flame,
  Clock,
  Trash2,
  Dumbbell,
  Bike,
  Footprints,
  HeartPulse,
  Waves,
} from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onDelete: (id: string, name: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onDelete }) => {
  const nameLower = activity.name.toLowerCase();

  // Smart Icon & Calorie estimation based on activity type
  let ActivityIcon = GenericActivity;
  let iconBg = 'bg-sky-50 text-sky-700 border-sky-100/80';
  let metFactor = 6.5; // ~6.5 kcal per min average

  if (nameLower.includes('run') || nameLower.includes('jog')) {
    ActivityIcon = Footprints;
    iconBg = 'bg-emerald-50 text-emerald-700 border-emerald-100/80';
    metFactor = 9.5;
  } else if (nameLower.includes('cycl') || nameLower.includes('bike')) {
    ActivityIcon = Bike;
    iconBg = 'bg-teal-50 text-teal-700 border-teal-100/80';
    metFactor = 7.5;
  } else if (nameLower.includes('gym') || nameLower.includes('weight') || nameLower.includes('lift')) {
    ActivityIcon = Dumbbell;
    iconBg = 'bg-purple-50 text-purple-700 border-purple-100/80';
    metFactor = 6.0;
  } else if (nameLower.includes('swim')) {
    ActivityIcon = Waves;
    iconBg = 'bg-blue-50 text-blue-700 border-blue-100/80';
    metFactor = 8.0;
  } else if (nameLower.includes('walk') || nameLower.includes('step')) {
    ActivityIcon = Footprints;
    iconBg = 'bg-amber-50 text-amber-700 border-amber-100/80';
    metFactor = 4.0;
  } else if (nameLower.includes('yoga') || nameLower.includes('stretch') || nameLower.includes('pilates')) {
    ActivityIcon = HeartPulse;
    iconBg = 'bg-rose-50 text-rose-700 border-rose-100/80';
    metFactor = 3.5;
  }

  const estimatedBurned = Math.round(activity.duration * metFactor);

  const dateObj = activity.created_at ? new Date(activity.created_at) : new Date();
  const dateFormatted = dateObj.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-stone-200/80 shadow-card hover:shadow-card-hover hover:border-sky-200 transition-all duration-200 flex items-center justify-between gap-3.5 group">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${iconBg}`}>
          <ActivityIcon className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <h4 className="text-sm sm:text-base font-bold text-stone-900 truncate font-display">{activity.name}</h4>
          <div className="flex items-center gap-3 text-xs text-stone-400 mt-1 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {dateFormatted}, {timeFormatted}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        <div className="flex items-center gap-2">
          {/* Duration Badge */}
          <span className="text-xs sm:text-sm font-bold text-sky-800 bg-sky-50 border border-sky-100 px-3 py-1.5 rounded-xl font-display">
            {activity.duration} min
          </span>

          {/* Calorie Burned Estimate */}
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-xl" title="Estimated energetic burn">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            ~{estimatedBurned} kcal
          </span>
        </div>

        <div className="border-l border-stone-100 pl-2 sm:pl-3">
          <button
            onClick={() => onDelete(activity.id, activity.name)}
            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors active:scale-95"
            title="Delete Activity"
            aria-label={`Delete ${activity.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
