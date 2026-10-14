import React from 'react';
import { Meal, Activity, Task, TabType } from '../../types';
import { PageHeader } from '../common/PageHeader';
import { CalorieProgress } from '../common/CalorieProgress';
import { StatCard } from '../common/StatCard';
import { QuickAction } from '../common/QuickAction';
import {
  UtensilsCrossed,
  Activity as ActivityIcon,
  CheckCircle2,
  ArrowRight,
  Clock,
  Plus,
  TrendingUp,
  Apple,
  Coffee,
  Sun,
  Moon,
} from 'lucide-react';

interface DashboardProps {
  meals: Meal[];
  activities: Activity[];
  todos: Task[];
  calorieGoal?: number;
  activeGoal?: number;
  onNavigate: (tab: TabType) => void;
  onOpenAddMeal: () => void;
  onOpenAddActivity: () => void;
  onOpenAddTask: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  meals,
  activities,
  todos,
  calorieGoal = 2000,
  activeGoal = 30,
  onNavigate,
  onOpenAddMeal,
  onOpenAddActivity,
  onOpenAddTask,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter today's real items
  const todayMeals = meals.filter((meal) =>
    meal.created_at ? meal.created_at.startsWith(todayStr) : true
  );
  const todayActivities = activities.filter((act) =>
    act.created_at ? act.created_at.startsWith(todayStr) : true
  );

  const totalCaloriesToday = todayMeals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
  const totalActiveMinutes = todayActivities.reduce((sum, act) => sum + Number(act.duration || 0), 0);

  // Approximate burned energy based on logged workout minutes (~7.2 kcal/min)
  const estimatedBurnedCalories = Math.round(totalActiveMinutes * 7.2);

  const completedTodos = todos.filter((t) => t.completed);
  const taskProgressPercent = todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0;

  // Real meal breakdown calculation for supporting nutrition summary
  const mealBreakdown = todayMeals.reduce(
    (acc, meal) => {
      const d = meal.created_at ? new Date(meal.created_at) : new Date();
      const h = d.getHours();
      const c = Number(meal.calories || 0);
      if (h >= 5 && h < 11) acc.breakfast += c;
      else if (h >= 11 && h < 16) acc.lunch += c;
      else if (h >= 16 && h < 22) acc.dinner += c;
      else acc.snacks += c;
      return acc;
    },
    { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 }
  );

  // Compute 7-day mini trend from real user data
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const isoDate = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'narrow' });
    const dayCalories = meals
      .filter((m) => m.created_at && m.created_at.startsWith(isoDate))
      .reduce((s, m) => s + Number(m.calories || 0), 0);
    return { date: isoDate, dayLabel, calories: dayCalories };
  });

  const maxCal = Math.max(calorieGoal, ...past7Days.map((d) => d.calories), 500);

  // Helper for meal category representation
  const getMealCategoryInfo = (dateStr?: string) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const h = d.getHours();
    if (h >= 5 && h < 11) return { icon: Coffee, label: 'Breakfast', color: 'text-orange-700 bg-orange-50 border-orange-100' };
    if (h >= 11 && h < 16) return { icon: Sun, label: 'Lunch', color: 'text-amber-700 bg-amber-50 border-amber-100' };
    if (h >= 16 && h < 22) return { icon: Moon, label: 'Dinner', color: 'text-indigo-700 bg-indigo-50 border-indigo-100' };
    return { icon: Apple, label: 'Snack', color: 'text-emerald-700 bg-emerald-50 border-emerald-100' };
  };

  return (
    <div className="space-y-6 sm:space-y-7 animate-fade-in">
      {/* Top Greeting Header with Quick Action Bar */}
      <PageHeader
        showGreeting={true}
        badgeText="Today's Wellness"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <QuickAction
              label="Log Meal"
              icon={UtensilsCrossed}
              onClick={onOpenAddMeal}
              variant="emerald"
            />
            <QuickAction
              label="Log Workout"
              icon={ActivityIcon}
              onClick={onOpenAddActivity}
              variant="blue"
            />
            <QuickAction
              label="Add Habit"
              icon={CheckCircle2}
              onClick={onOpenAddTask}
              variant="purple"
            />
          </div>
        }
      />

      {/* Hero Calorie Progress Ring & Nutrition Summary */}
      <CalorieProgress
        consumed={totalCaloriesToday}
        goal={calorieGoal}
        burned={estimatedBurnedCalories}
        breakdown={todayMeals.length > 0 ? mealBreakdown : undefined}
        onAddMeal={onOpenAddMeal}
        onViewMeals={() => onNavigate('meals')}
      />

      {/* Supporting KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Meals Intake */}
        <StatCard
          title="Nutrition Intake"
          value={totalCaloriesToday.toLocaleString()}
          unit="kcal"
          subtitle={`${todayMeals.length} ${todayMeals.length === 1 ? 'meal' : 'meals'} logged today`}
          icon={UtensilsCrossed}
          variant="amber"
          badge={todayMeals.length > 0 ? `${todayMeals.length} logged` : '0 logged'}
          onClick={() => onNavigate('meals')}
        />

        {/* Active Minutes */}
        <StatCard
          title="Active Workout"
          value={totalActiveMinutes}
          unit="mins"
          subtitle={`~${estimatedBurnedCalories} kcal burned in ${todayActivities.length} logs`}
          icon={ActivityIcon}
          variant="blue"
          badge={
            totalActiveMinutes >= activeGoal
              ? 'Goal Reached'
              : `${Math.max(0, activeGoal - totalActiveMinutes)}m to goal`
          }
          onClick={() => onNavigate('activities')}
        />

        {/* Tasks Progress */}
        <StatCard
          title="Daily Habits"
          value={`${completedTodos.length} / ${todos.length}`}
          subtitle={`${todos.length - completedTodos.length} pending habits remaining`}
          icon={CheckCircle2}
          variant="purple"
          progress={taskProgressPercent}
          badge={`${taskProgressPercent}% done`}
          onClick={() => onNavigate('todos')}
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      {/* Two Column Layout: Today's Meals & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Today's Meals Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 font-display">Today's Meals</h3>
                  <p className="text-xs text-stone-400">Recent food journal entries</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('meals')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline transition-colors"
              >
                <span>View journal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4">
              {todayMeals.length === 0 ? (
                <div className="py-7 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-100">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-stone-500 font-medium">No meals logged for today yet.</p>
                  <button
                    onClick={onOpenAddMeal}
                    className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log First Meal</span>
                  </button>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {todayMeals.slice(0, 4).map((meal) => {
                    const cat = getMealCategoryInfo(meal.created_at);
                    const CatIcon = cat.icon;
                    return (
                      <li
                        key={meal.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-stone-50/70 hover:bg-stone-100/70 border border-stone-100 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                          <div className={`p-1.5 rounded-xl border shrink-0 ${cat.color}`}>
                            <CatIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold text-stone-800 truncate">
                              {meal.name}
                            </p>
                            <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5 font-medium">
                              <Clock className="w-3 h-3 text-stone-400" />
                              {meal.created_at
                                ? new Date(meal.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Today'}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-amber-800 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-xl shrink-0">
                          {meal.calories} kcal
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {todayMeals.length > 0 && (
            <div className="pt-3.5 mt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>{todayMeals.length} total logged today</span>
              <button
                onClick={onOpenAddMeal}
                className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Log meal</span>
              </button>
            </div>
          )}
        </div>

        {/* Today's Activity Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                  <ActivityIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 font-display">Recent Activity</h3>
                  <p className="text-xs text-stone-400">Workouts & physical movement</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('activities')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline transition-colors"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4">
              {todayActivities.length === 0 ? (
                <div className="py-7 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2 border border-sky-100">
                    <ActivityIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-stone-500 font-medium">No workouts recorded today yet.</p>
                  <button
                    onClick={onOpenAddActivity}
                    className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-800 hover:bg-sky-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Workout</span>
                  </button>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {todayActivities.slice(0, 4).map((act) => (
                    <li
                      key={act.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-stone-50/70 hover:bg-stone-100/70 border border-stone-100 transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs sm:text-sm font-bold text-stone-800 truncate">
                          {act.name}
                        </p>
                        <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5 font-medium">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {act.created_at
                            ? new Date(act.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Today'}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-sky-800 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-xl shrink-0">
                        {act.duration} min
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {todayActivities.length > 0 && (
            <div className="pt-3.5 mt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>{totalActiveMinutes} minutes active today</span>
              <button
                onClick={onOpenAddActivity}
                className="text-sky-700 font-bold hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Log activity</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 7-Day Consistency Snapshot & Habits Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* 7-Day Quick Intake Visualizer */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900 font-display">7-Day Consistency Snapshot</h3>
                <p className="text-xs text-stone-400">Calories logged over the past week</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('progress')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline transition-colors"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mini 7-Day Bar Display */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-28 pt-4">
            {past7Days.map((d, idx) => {
              const hPct = Math.min(100, Math.round((d.calories / maxCal) * 100));
              const isToday = idx === 6;
              return (
                <div key={d.date} className="flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-bold text-stone-400 group-hover:text-stone-800 transition-colors mb-1">
                    {d.calories > 0 ? `${d.calories}` : '-'}
                  </div>
                  <div className="w-full max-w-[28px] bg-stone-100 rounded-xl h-full flex items-end p-0.5">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-emerald-600'
                          : d.calories > 0
                          ? 'bg-emerald-400'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${Math.max(4, hPct)}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold mt-1.5 ${
                      isToday ? 'text-emerald-700 font-extrabold' : 'text-stone-400'
                    }`}
                  >
                    {d.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Habit Completion Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-purple-50 text-purple-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 font-display">Habit Progress</h3>
                  <p className="text-xs text-stone-400">Daily wellness routine</p>
                </div>
              </div>

              <span className="text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full font-display">
                {taskProgressPercent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mb-3.5">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${taskProgressPercent}%` }}
              />
            </div>

            {todos.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-xs text-stone-500 font-medium">No habits configured yet.</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Track daily water, steps, or sleep.</p>
                <button
                  onClick={onOpenAddTask}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-800 hover:bg-purple-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Habit</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  {completedTodos.length === todos.length
                    ? 'All completed today!'
                    : `Pending Habits (${todos.length - completedTodos.length})`}
                </div>
                {todos
                  .filter((t) => !t.completed)
                  .slice(0, 3)
                  .map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onNavigate('todos')}
                      className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 hover:bg-stone-100/80 border border-stone-100 transition-colors cursor-pointer group"
                    >
                      <div className="w-4 h-4 rounded-full border-2 border-stone-300 group-hover:border-purple-600 transition-colors shrink-0" />
                      <span className="text-xs font-semibold text-stone-800 truncate">
                        {task.title}
                      </span>
                    </div>
                  ))}
                {completedTodos.length === todos.length && (
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-800 font-medium">
                    Awesome dedication! You completed all {todos.length} habits for today.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-3.5 border-t border-stone-100 mt-3 flex items-center justify-between">
            <span className="text-[11px] text-stone-400 font-medium">
              {completedTodos.length} of {todos.length} done
            </span>
            <button
              onClick={() => onNavigate('todos')}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 hover:underline flex items-center gap-1 transition-colors"
            >
              <span>Manage Habits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
