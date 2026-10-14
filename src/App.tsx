import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthForm } from './components/auth/AuthForm';
import { Sidebar } from './components/common/Sidebar';
import { TopBar } from './components/common/TopBar';
import { MobileNav } from './components/common/MobileNav';
import { FitArcLogo } from './components/common/FitArcLogo';
import { Dashboard } from './components/dashboard/Dashboard';
import { MealTracker } from './components/meals/MealTracker';
import { ActivityTracker } from './components/activities/ActivityTracker';
import { TodoTracker } from './components/todos/TodoTracker';
import { ProgressOverview } from './components/progress/ProgressOverview';
import { ProfileView } from './components/profile/ProfileView';
import { ConfigWarning } from './components/common/ConfigWarning';
import { Modal } from './components/common/Modal';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { api } from './services/api';
import { Meal, Activity, Task, TabType } from './types';

const MainApp: React.FC = () => {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Supabase Data States
  const [meals, setMeals] = useState<Meal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [todos, setTodos] = useState<Task[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Toast notification state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // User Goals (stored in localStorage with fallback defaults)
  const [calorieGoal, setCalorieGoal] = useState<number>(() => {
    const saved = localStorage.getItem('fit_arc_calorie_goal');
    return saved ? Number(saved) : 2000;
  });

  const [activeGoal, setActiveGoal] = useState<number>(() => {
    const saved = localStorage.getItem('fit_arc_active_goal');
    return saved ? Number(saved) : 30;
  });

  const handleUpdateGoals = (newCalorieGoal: number, newActiveGoal: number) => {
    setCalorieGoal(newCalorieGoal);
    setActiveGoal(newActiveGoal);
    localStorage.setItem('fit_arc_calorie_goal', String(newCalorieGoal));
    localStorage.setItem('fit_arc_active_goal', String(newActiveGoal));
  };

  // Quick Action Modal States
  const [quickMealOpen, setQuickMealOpen] = useState(false);
  const [quickActivityOpen, setQuickActivityOpen] = useState(false);
  const [quickTaskOpen, setQuickTaskOpen] = useState(false);

  // Quick form input states
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState<number | ''>('');
  const [actName, setActName] = useState('');
  const [actDuration, setActDuration] = useState<number | ''>('');
  const [taskTitle, setTaskTitle] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!user || !isConfigured) return;
    setDataLoading(true);
    try {
      const [fetchedMeals, fetchedActivities, fetchedTodos] = await Promise.all([
        api.getMeals(),
        api.getActivities(),
        api.getTodos(),
      ]);
      setMeals(fetchedMeals);
      setActivities(fetchedActivities);
      setTodos(fetchedTodos);
    } catch (err: unknown) {
      console.error('Error fetching data from Supabase:', err);
      const message = err instanceof Error ? err.message : 'Failed to sync latest data';
      addToast(message, 'error');
    } finally {
      setDataLoading(false);
    }
  }, [user, isConfigured, addToast]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Supabase Realtime Subscriptions
  useEffect(() => {
    if (!user || !isConfigured) return;

    const unsubscribeMeals = api.subscribeToTable('meals', () => {
      api.getMeals().then(setMeals).catch(console.error);
    });

    const unsubscribeActivities = api.subscribeToTable('activities', () => {
      api.getActivities().then(setActivities).catch(console.error);
    });

    const unsubscribeTodos = api.subscribeToTable('todos', () => {
      api.getTodos().then(setTodos).catch(console.error);
    });

    return () => {
      unsubscribeMeals();
      unsubscribeActivities();
      unsubscribeTodos();
    };
  }, [user, isConfigured]);

  // Submit Quick Add Meal
  const handleQuickAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim() || mealCalories === '' || mealCalories < 0) return;
    setModalLoading(true);
    try {
      await api.addMeal(mealName.trim(), Number(mealCalories));
      setMealName('');
      setMealCalories('');
      setQuickMealOpen(false);
      addToast('Meal logged to food journal', 'success');
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add meal';
      addToast(message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Submit Quick Add Activity
  const handleQuickAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actName.trim() || actDuration === '' || actDuration <= 0) return;
    setModalLoading(true);
    try {
      await api.addActivity(actName.trim(), Number(actDuration));
      setActName('');
      setActDuration('');
      setQuickActivityOpen(false);
      addToast('Workout session recorded', 'success');
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to log activity';
      addToast(message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Submit Quick Add Task
  const handleQuickAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setModalLoading(true);
    try {
      await api.addTodo(taskTitle.trim());
      setTaskTitle('');
      setQuickTaskOpen(false);
      addToast('Wellness habit created', 'success');
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      addToast(message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Computations for today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter((meal) =>
    meal.created_at ? meal.created_at.startsWith(todayStr) : true
  );
  const totalCaloriesToday = todayMeals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
  const completedTasks = todos.filter((t) => t.completed).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-700 to-forest-800 flex items-center justify-center text-white shadow-emerald-sm animate-pulse">
          <FitArcLogo size="sm" showText={false} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
          Loading Fit Arc...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {!isConfigured && <ConfigWarning />}
        <AuthForm />
      </>
    );
  }

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col lg:flex-row text-stone-900 font-sans">
      {!isConfigured && <ConfigWarning />}

      {/* Desktop / Tablet Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        todayCalories={totalCaloriesToday}
        calorieGoal={calorieGoal}
        completedTasksCount={completedTasks}
        totalTasksCount={todos.length}
      />

      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white/90 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
        <FitArcLogo size="sm" />

        <div className="flex items-center gap-2">
          {dataLoading && (
            <span
              className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"
              title="Syncing..."
            />
          )}
          <button
            onClick={() => setActiveTab('profile')}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-forest-600 text-white font-bold text-xs flex items-center justify-center shadow-xs"
            title="Profile"
          >
            {userInitial}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-12">
        {/* Desktop Top Bar */}
        <TopBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddMeal={() => setQuickMealOpen(true)}
          onOpenAddActivity={() => setQuickActivityOpen(true)}
          onOpenAddTask={() => setQuickTaskOpen(true)}
          isSyncing={dataLoading}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              meals={meals}
              activities={activities}
              todos={todos}
              calorieGoal={calorieGoal}
              activeGoal={activeGoal}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenAddMeal={() => setQuickMealOpen(true)}
              onOpenAddActivity={() => setQuickActivityOpen(true)}
              onOpenAddTask={() => setQuickTaskOpen(true)}
            />
          )}

          {activeTab === 'meals' && (
            <MealTracker
              meals={meals}
              onRefresh={loadData}
              calorieGoal={calorieGoal}
              onToast={addToast}
            />
          )}

          {activeTab === 'activities' && (
            <ActivityTracker
              activities={activities}
              onRefresh={loadData}
              activeGoal={activeGoal}
              onToast={addToast}
            />
          )}

          {activeTab === 'todos' && (
            <TodoTracker
              todos={todos}
              onRefresh={loadData}
              onToast={addToast}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressOverview
              meals={meals}
              activities={activities}
              todos={todos}
              calorieGoal={calorieGoal}
              activeGoal={activeGoal}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              calorieGoal={calorieGoal}
              activeGoal={activeGoal}
              onUpdateGoals={handleUpdateGoals}
              totalMeals={meals.length}
              totalActivities={activities.length}
              totalTasks={todos.length}
              onToast={addToast}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Global Quick Add Meal Modal */}
      <Modal
        isOpen={quickMealOpen}
        onClose={() => setQuickMealOpen(false)}
        title="Quick Log Meal"
        subtitle="Record food item directly to your daily nutrition total"
      >
        <form onSubmit={handleQuickAddMeal} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Food / Meal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Greek Salad with Olive Oil"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Calories (kcal)
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                placeholder="350"
                value={mealCalories}
                onChange={(e) =>
                  setMealCalories(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none font-medium transition-all"
              />
              <span className="absolute right-4 top-2.5 text-xs font-bold text-stone-400">kcal</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setQuickMealOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-sm active:scale-95 transition-all disabled:opacity-50"
            >
              {modalLoading ? 'Saving...' : 'Add Meal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Global Quick Add Activity Modal */}
      <Modal
        isOpen={quickActivityOpen}
        onClose={() => setQuickActivityOpen(false)}
        title="Quick Log Workout"
        subtitle="Record workout minutes and estimate energy expenditure"
      >
        <form onSubmit={handleQuickAddActivity} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Workout / Activity Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 5K Morning Run, HIIT Session"
              value={actName}
              onChange={(e) => setActName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-sky-600 focus:bg-white outline-none font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Duration (minutes)
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                placeholder="30"
                value={actDuration}
                onChange={(e) =>
                  setActDuration(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-sky-600 focus:bg-white outline-none font-medium transition-all"
              />
              <span className="absolute right-4 top-2.5 text-xs font-bold text-stone-400">minutes</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setQuickActivityOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs active:scale-95 transition-all disabled:opacity-50"
            >
              {modalLoading ? 'Saving...' : 'Record Activity'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Global Quick Add Task Modal */}
      <Modal
        isOpen={quickTaskOpen}
        onClose={() => setQuickTaskOpen(false)}
        title="Quick Create Habit"
        subtitle="Add a wellness habit or task for today"
      >
        <form onSubmit={handleQuickAddTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Habit / Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Drink 2.5L water, 10 min stretch"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-purple-600 focus:bg-white outline-none font-medium transition-all"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setQuickTaskOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs active:scale-95 transition-all disabled:opacity-50"
            >
              {modalLoading ? 'Saving...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
