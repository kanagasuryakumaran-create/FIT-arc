import React from 'react';
import { Flame, Target, Zap, ArrowRight, Plus } from 'lucide-react';

interface MealBreakdown {
  breakfast: number;
  lunch: number;
  dinner: number;
  snacks: number;
}

interface CalorieProgressProps {
  consumed: number;
  goal: number;
  burned?: number;
  breakdown?: MealBreakdown;
  className?: string;
  onAddMeal?: () => void;
  onViewMeals?: () => void;
}

export const CalorieProgress: React.FC<CalorieProgressProps> = ({
  consumed,
  goal,
  burned = 0,
  breakdown,
  className = '',
  onAddMeal,
  onViewMeals,
}) => {
  const safeGoal = goal > 0 ? goal : 2000;
  const isExceeded = consumed > safeGoal;
  const remaining = Math.max(0, safeGoal - consumed);
  const exceededBy = isExceeded ? consumed - safeGoal : 0;
  const percentage = Math.min(100, Math.round((consumed / safeGoal) * 100));

  // Circular progress math
  const radius = 68;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Percentage helper for meal distribution
  const getMealPct = (cal: number) => {
    if (consumed <= 0 || cal <= 0) return 0;
    return Math.round((cal / consumed) * 100);
  };

  return (
    <div
      className={`bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-card transition-all ${className}`}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left: Main Progress Details */}
        <div className="flex-1 w-full text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2.5 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100/80 text-xs font-bold tracking-tight">
              <Flame className="w-3.5 h-3.5 text-emerald-600" />
              Daily Calorie Budget
            </span>

            {onViewMeals && (
              <button
                onClick={onViewMeals}
                className="text-xs font-semibold text-stone-500 hover:text-emerald-700 flex items-center gap-1 transition-colors group"
              >
                <span>Food Journal</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          <div className="flex items-baseline justify-center lg:justify-start gap-2.5 mb-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight font-display">
              {consumed.toLocaleString()}
            </span>
            <span className="text-base sm:text-lg font-bold text-stone-400">
              / {safeGoal.toLocaleString()} <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">kcal</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
            {isExceeded ? (
              <span className="text-amber-800 font-bold inline-flex items-center gap-1">
                Calorie budget exceeded by {exceededBy.toLocaleString()} kcal today ({consumed.toLocaleString()} kcal logged).
              </span>
            ) : remaining > 0 ? (
              <>
                You have <strong className="text-emerald-700 font-bold">{remaining.toLocaleString()} kcal</strong> remaining for today's healthy target.
              </>
            ) : (
              <span className="text-emerald-700 font-bold">
                Daily calorie target reached perfectly! ({consumed.toLocaleString()} kcal logged)
              </span>
            )}
          </p>

          {/* Quick Metrics Pods */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-6">
            <div
              className={`bg-stone-50/80 rounded-2xl p-3 sm:p-3.5 text-center border border-stone-100 transition-all ${
                onAddMeal ? 'cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-200 group' : ''
              }`}
              onClick={onAddMeal}
              title={onAddMeal ? 'Log a meal' : undefined}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  Consumed
                </span>
                {onAddMeal && <Plus className="w-2.5 h-2.5 text-stone-400 group-hover:text-emerald-600 transition-colors" />}
              </div>
              <div className="text-base sm:text-lg font-extrabold text-stone-900 mt-0.5 font-display">
                {consumed.toLocaleString()}
              </div>
              <span className="text-[10px] text-stone-400 font-medium">kcal</span>
            </div>

            <div className="bg-stone-50/80 rounded-2xl p-3 sm:p-3.5 text-center border border-stone-100">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                Burned
              </span>
              <div className="text-base sm:text-lg font-extrabold text-sky-700 mt-0.5 flex items-center justify-center gap-1 font-display">
                <Zap className="w-3.5 h-3.5 text-sky-500" />
                {burned.toLocaleString()}
              </div>
              <span className="text-[10px] text-stone-400 font-medium">est. kcal</span>
            </div>

            <div className="bg-stone-50/80 rounded-2xl p-3 sm:p-3.5 text-center border border-stone-100">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                Remaining
              </span>
              <div
                className={`text-base sm:text-lg font-extrabold mt-0.5 flex items-center justify-center gap-1 font-display ${
                  isExceeded ? 'text-amber-700' : 'text-emerald-700'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                {remaining.toLocaleString()}
              </div>
              <span className="text-[10px] text-stone-400 font-medium">
                {isExceeded ? 'over target' : 'kcal'}
              </span>
            </div>
          </div>

          {/* Supporting Nutrition Meal Breakdown */}
          {breakdown && (
            <div className="mt-5 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider mb-2.5">
                <span>Meal Distribution</span>
                <span className="text-stone-500 font-semibold normal-case">Today's breakdown</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="px-3 py-2 rounded-xl bg-orange-50/60 border border-orange-100/70 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">Breakfast</span>
                    {breakdown.breakfast > 0 && (
                      <span className="text-[10px] font-bold text-orange-600">{getMealPct(breakdown.breakfast)}%</span>
                    )}
                  </div>
                  <span className="text-xs font-extrabold text-stone-800 font-display">{breakdown.breakfast} kcal</span>
                </div>

                <div className="px-3 py-2 rounded-xl bg-amber-50/60 border border-amber-100/70 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Lunch</span>
                    {breakdown.lunch > 0 && (
                      <span className="text-[10px] font-bold text-amber-600">{getMealPct(breakdown.lunch)}%</span>
                    )}
                  </div>
                  <span className="text-xs font-extrabold text-stone-800 font-display">{breakdown.lunch} kcal</span>
                </div>

                <div className="px-3 py-2 rounded-xl bg-indigo-50/60 border border-indigo-100/70 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">Dinner</span>
                    {breakdown.dinner > 0 && (
                      <span className="text-[10px] font-bold text-indigo-600">{getMealPct(breakdown.dinner)}%</span>
                    )}
                  </div>
                  <span className="text-xs font-extrabold text-stone-800 font-display">{breakdown.dinner} kcal</span>
                </div>

                <div className="px-3 py-2 rounded-xl bg-emerald-50/60 border border-emerald-100/70 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Snacks</span>
                    {breakdown.snacks > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600">{getMealPct(breakdown.snacks)}%</span>
                    )}
                  </div>
                  <span className="text-xs font-extrabold text-stone-800 font-display">{breakdown.snacks} kcal</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Circular Progress Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <div className="w-44 h-44 sm:w-52 sm:h-52 relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 170 170">
              {/* Background ring */}
              <circle
                cx="85"
                cy="85"
                r={radius}
                className="text-stone-100"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress ring with smooth stroke */}
              <circle
                cx="85"
                cy="85"
                r={radius}
                className={`${
                  isExceeded ? 'text-amber-500' : 'text-emerald-600'
                } transition-all duration-1000 ease-out`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Inner Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 leading-none tracking-tight font-display">
                {percentage}%
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400 mt-1.5">
                {isExceeded ? 'Target Exceeded' : 'Target Met'}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 border ${
                  isExceeded
                    ? 'text-amber-800 bg-amber-50 border-amber-200'
                    : 'text-emerald-800 bg-emerald-50 border-emerald-100'
                }`}
              >
                {consumed > 0 ? `${consumed.toLocaleString()} kcal` : 'Log a meal'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
