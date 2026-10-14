import React from 'react';
import { Meal, Activity, Task } from '../../types';
import { PageHeader } from '../common/PageHeader';
import { StatCard } from '../common/StatCard';
import {
  Flame,
  Activity as ActivityIcon,
  CheckCircle2,
  Trophy,
} from 'lucide-react';

interface ProgressOverviewProps {
  meals: Meal[];
  activities: Activity[];
  todos: Task[];
  calorieGoal?: number;
  activeGoal?: number;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  meals,
  activities,
  todos,
  calorieGoal = 2000,
  activeGoal = 30,
}) => {
  // Compute real metrics from data
  const totalCaloriesAllTime = meals.reduce((sum, m) => sum + Number(m.calories || 0), 0);
  const totalActiveMinutesAllTime = activities.reduce((sum, a) => sum + Number(a.duration || 0), 0);
  const totalBurnedCaloriesAllTime = Math.round(totalActiveMinutesAllTime * 7.2);
  const completedTasks = todos.filter((t) => t.completed).length;
  const taskCompletionRate = todos.length > 0 ? Math.round((completedTasks / todos.length) * 100) : 0;

  // Build 7-day recent calorie and active time series from real data
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const isoDate = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
    const formattedDate = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    const dayMeals = meals.filter((m) => m.created_at && m.created_at.startsWith(isoDate));
    const dayCalories = dayMeals.reduce((sum, m) => sum + Number(m.calories || 0), 0);

    const dayActivities = activities.filter((a) => a.created_at && a.created_at.startsWith(isoDate));
    const dayMinutes = dayActivities.reduce((sum, a) => sum + Number(a.duration || 0), 0);

    return {
      date: isoDate,
      dayName,
      formattedDate,
      calories: dayCalories,
      minutes: dayMinutes,
    };
  });

  const maxCalorieValue = Math.max(calorieGoal, ...past7Days.map((d) => d.calories), 1000);
  const maxMinuteValue = Math.max(activeGoal * 2, ...past7Days.map((d) => d.minutes), 60);

  // 7-day averages from real logs
  const total7DayCalories = past7Days.reduce((acc, d) => acc + d.calories, 0);
  const total7DayMinutes = past7Days.reduce((acc, d) => acc + d.minutes, 0);
  const avg7DayCalories = Math.round(total7DayCalories / 7);
  const avg7DayMinutes = Math.round(total7DayMinutes / 7);

  // Consistency Score calculation based on active logging
  const daysWithLogs = past7Days.filter((d) => d.calories > 0 || d.minutes > 0).length;
  const consistencyScore =
    daysWithLogs >= 5 ? 'High' : daysWithLogs >= 2 ? 'Building' : meals.length > 0 ? 'Active' : 'Starting';

  return (
    <div className="space-y-7 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Progress & Health Analytics"
        subtitle="Comprehensive trends computed from your real food journal, workouts, and daily habits"
        badgeText="Real-time Trends"
      />

      {/* High-level All-Time Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="All-Time Calories"
          value={totalCaloriesAllTime.toLocaleString()}
          unit="kcal"
          subtitle={`Across ${meals.length} meal entries`}
          icon={Flame}
          variant="amber"
        />

        <StatCard
          title="Total Active Time"
          value={totalActiveMinutesAllTime.toLocaleString()}
          unit="mins"
          subtitle={`~${totalBurnedCaloriesAllTime.toLocaleString()} kcal est. burned`}
          icon={ActivityIcon}
          variant="blue"
        />

        <StatCard
          title="Habit Completion"
          value={`${taskCompletionRate}%`}
          subtitle={`${completedTasks} of ${todos.length} habits done`}
          icon={CheckCircle2}
          variant="purple"
          progress={taskCompletionRate}
        />

        <StatCard
          title="Consistency Rating"
          value={consistencyScore}
          subtitle={`${daysWithLogs} of 7 days logged`}
          icon={Trophy}
          variant="emerald"
        />
      </div>

      {/* 7-Day Calorie Intake Bar Chart */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2 font-display">
              <Flame className="w-5 h-5 text-amber-600" />
              7-Day Nutrition & Calorie Trend
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Daily calories consumed vs. your {calorieGoal.toLocaleString()} kcal target
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold flex-wrap">
            <span className="flex items-center gap-1.5 text-stone-600">
              <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block" /> Logged kcal
            </span>
            <span className="flex items-center gap-1.5 text-stone-400">
              <span className="w-3 h-0.5 bg-stone-300 inline-block" /> Target ({calorieGoal} kcal)
            </span>
            <span className="text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full text-[11px] font-bold">
              Avg: {avg7DayCalories.toLocaleString()} kcal/day
            </span>
          </div>
        </div>

        {/* Bar Visualizer */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-52 sm:h-60 pt-6 px-1 sm:px-4">
          {past7Days.map((day, idx) => {
            const heightPercent = Math.min(100, Math.round((day.calories / maxCalorieValue) * 100));
            const isToday = idx === 6;

            return (
              <div key={day.date} className="flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] sm:text-xs font-bold bg-stone-900 text-white px-2.5 py-1 rounded-xl mb-1.5 pointer-events-none whitespace-nowrap shadow-md z-10">
                  {day.formattedDate}: {day.calories.toLocaleString()} kcal
                </div>

                {/* The Bar */}
                <div className="w-full max-w-[44px] bg-stone-100/90 rounded-2xl h-full flex items-end p-1 relative overflow-hidden">
                  <div
                    className={`w-full rounded-xl transition-all duration-700 ${
                      isToday
                        ? 'bg-gradient-to-t from-emerald-700 to-emerald-500 shadow-emerald-sm'
                        : day.calories > 0
                        ? 'bg-emerald-500/80 hover:bg-emerald-600'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${Math.max(4, heightPercent)}%` }}
                  />
                </div>

                {/* Day label */}
                <div className="mt-2 text-center">
                  <span
                    className={`text-[11px] sm:text-xs font-bold block ${
                      isToday ? 'text-emerald-700 font-extrabold' : 'text-stone-500'
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <span className="text-[10px] text-stone-400 hidden sm:block font-medium">
                    {day.calories > 0 ? `${day.calories}` : '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Day Activity & Exercise Minutes Visualizer */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2 font-display">
              <ActivityIcon className="w-5 h-5 text-sky-600" />
              7-Day Active Movement
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Duration of workouts recorded over the past week vs. your {activeGoal} min goal
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold flex-wrap">
            <span className="flex items-center gap-1.5 text-stone-600">
              <span className="w-3 h-3 rounded-md bg-sky-600 inline-block" /> Active minutes
            </span>
            <span className="text-sky-800 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full text-[11px] font-bold">
              Avg: {avg7DayMinutes} min/day
            </span>
          </div>
        </div>

        {/* Activity Bar Visualizer */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 sm:h-52 pt-6 px-1 sm:px-4">
          {past7Days.map((day, idx) => {
            const heightPercent = Math.min(100, Math.round((day.minutes / maxMinuteValue) * 100));
            const isToday = idx === 6;

            return (
              <div key={day.date} className="flex flex-col items-center h-full justify-end group relative">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] sm:text-xs font-bold bg-stone-900 text-white px-2.5 py-1 rounded-xl mb-1.5 pointer-events-none whitespace-nowrap shadow-md z-10">
                  {day.formattedDate}: {day.minutes} min
                </div>

                <div className="w-full max-w-[44px] bg-stone-100/90 rounded-2xl h-full flex items-end p-1 relative overflow-hidden">
                  <div
                    className={`w-full rounded-xl transition-all duration-700 ${
                      isToday
                        ? 'bg-gradient-to-t from-sky-700 to-sky-500'
                        : day.minutes > 0
                        ? 'bg-sky-500/80 hover:bg-sky-600'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${Math.max(4, heightPercent)}%` }}
                  />
                </div>

                <div className="mt-2 text-center">
                  <span
                    className={`text-[11px] sm:text-xs font-bold block ${
                      isToday ? 'text-sky-700 font-extrabold' : 'text-stone-500'
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <span className="text-[10px] text-stone-400 hidden sm:block font-medium">
                    {day.minutes > 0 ? `${day.minutes}m` : '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
