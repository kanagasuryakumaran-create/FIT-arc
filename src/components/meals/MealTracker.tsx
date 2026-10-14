import React, { useState } from 'react';
import { Meal } from '../../types';
import { api } from '../../services/api';
import { PageHeader } from '../common/PageHeader';
import { MealCard } from './MealCard';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import {
  UtensilsCrossed,
  Plus,
  Flame,
  Coffee,
  Sun,
  Moon,
  Apple,
  Calendar,
} from 'lucide-react';

interface MealTrackerProps {
  meals: Meal[];
  onRefresh: () => void;
  calorieGoal?: number;
  onToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

// Popular healthy food presets for fast 1-click logging
const POPULAR_PRESETS = [
  { name: 'Oatmeal with Fresh Berries', calories: 280, icon: '🥣' },
  { name: 'Scrambled Eggs with Multigrain Toast', calories: 340, icon: '🍳' },
  { name: 'Grilled Chicken & Quinoa Salad', calories: 420, icon: '🥗' },
  { name: 'Brown Rice & Spiced Paneer/Tofu', calories: 480, icon: '🍲' },
  { name: 'Greek Yogurt with Crushed Walnuts', calories: 190, icon: '🥛' },
  { name: 'Whey Protein Shake (Almond Milk)', calories: 150, icon: '🥤' },
];

export const MealTracker: React.FC<MealTrackerProps> = ({
  meals,
  onRefresh,
  calorieGoal = 2000,
  onToast,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form input states
  const [name, setName] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter((meal) =>
    meal.created_at ? meal.created_at.startsWith(todayStr) : true
  );
  const pastMeals = meals.filter((meal) =>
    meal.created_at ? !meal.created_at.startsWith(todayStr) : false
  );

  const totalCaloriesToday = todayMeals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
  const remainingCalories = Math.max(0, calorieGoal - totalCaloriesToday);

  // Group meals into Breakfast, Lunch, Dinner, Snacks
  const categorizeMeal = (meal: Meal) => {
    const d = meal.created_at ? new Date(meal.created_at) : new Date();
    const h = d.getHours();
    if (h >= 5 && h < 11) return 'breakfast';
    if (h >= 11 && h < 16) return 'lunch';
    if (h >= 16 && h < 22) return 'dinner';
    return 'snacks';
  };

  const breakfastMeals = todayMeals.filter((m) => categorizeMeal(m) === 'breakfast');
  const lunchMeals = todayMeals.filter((m) => categorizeMeal(m) === 'lunch');
  const dinnerMeals = todayMeals.filter((m) => categorizeMeal(m) === 'dinner');
  const snackMeals = todayMeals.filter((m) => categorizeMeal(m) === 'snacks');

  // Submit Add Meal
  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || calories === '' || calories < 0) return;

    setLoading(true);
    try {
      await api.addMeal(name.trim(), Number(calories));
      setName('');
      setCalories('');
      setIsAddModalOpen(false);
      onToast?.('Meal logged successfully to your journal', 'success');
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add meal';
      onToast?.(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Edit Meal
  const handleUpdateMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeal || !name.trim() || calories === '' || calories < 0) return;

    setLoading(true);
    try {
      await api.updateMeal(editingMeal.id, name.trim(), Number(calories));
      setEditingMeal(null);
      setName('');
      setCalories('');
      onToast?.('Meal updated successfully', 'success');
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update meal';
      onToast?.(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.deleteMeal(deleteTarget.id);
      setDeleteTarget(null);
      onToast?.(`Deleted "${deleteTarget.name}"`, 'info');
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete meal';
      onToast?.(message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (meal: Meal) => {
    setEditingMeal(meal);
    setName(meal.name);
    setCalories(meal.calories);
  };

  const handleSelectPreset = (preset: { name: string; calories: number }) => {
    setName(preset.name);
    setCalories(preset.calories);
  };

  return (
    <div className="space-y-7 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Meals & Nutrition"
        subtitle="Track your daily food journal and maintain mindful energy balance"
        actions={
          <button
            onClick={() => {
              setName('');
              setCalories('');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-emerald-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log a Meal</span>
          </button>
        }
      />

      {/* Daily Nutrition Summary Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Today's Calorie Total
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
                  {totalCaloriesToday.toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-stone-400">
                  / {calorieGoal.toLocaleString()} kcal goal
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 font-medium">
                {remainingCalories > 0 ? (
                  <>
                    <span className="text-emerald-700 font-bold">{remainingCalories.toLocaleString()} kcal</span>{' '}
                    remaining for your daily target.
                  </>
                ) : (
                  <span className="text-amber-800 font-bold">
                    Daily calorie target achieved ({totalCaloriesToday.toLocaleString()} kcal logged)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="bg-stone-50/80 rounded-2xl p-3 text-center border border-stone-100">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Consumed</span>
              <span className="text-sm sm:text-base font-extrabold text-stone-900 font-display">
                {totalCaloriesToday.toLocaleString()} kcal
              </span>
            </div>
            <div className="bg-stone-50/80 rounded-2xl p-3 text-center border border-stone-100">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Remaining</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-700 font-display">
                {remainingCalories.toLocaleString()} kcal
              </span>
            </div>
            <div className="bg-stone-50/80 rounded-2xl p-3 text-center border border-stone-100 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Logged Today</span>
              <span className="text-sm sm:text-base font-extrabold text-stone-900 font-display">
                {todayMeals.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Meal Sections by Time of Day */}
      {todayMeals.length === 0 ? (
        <EmptyState
          title="No meals logged today yet"
          description="Record breakfast, lunch, dinner, or snacks to track your calories and nutrients."
          icon={UtensilsCrossed}
          actionLabel="Log First Meal"
          variant="amber"
          onAction={() => {
            setName('');
            setCalories('');
            setIsAddModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Breakfast Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Breakfast
                </h3>
              </div>
              <span className="text-xs font-bold text-stone-500">
                {breakfastMeals.reduce((s, m) => s + m.calories, 0)} kcal
              </span>
            </div>
            {breakfastMeals.length === 0 ? (
              <div className="p-4 rounded-2xl bg-stone-50/60 border border-dashed border-stone-200 text-center text-xs text-stone-400 font-medium">
                No breakfast recorded today.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {breakfastMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onEdit={openEditModal}
                    onDelete={(id, mealName) => setDeleteTarget({ id, name: mealName })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Lunch Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Lunch
                </h3>
              </div>
              <span className="text-xs font-bold text-stone-500">
                {lunchMeals.reduce((s, m) => s + m.calories, 0)} kcal
              </span>
            </div>
            {lunchMeals.length === 0 ? (
              <div className="p-4 rounded-2xl bg-stone-50/60 border border-dashed border-stone-200 text-center text-xs text-stone-400 font-medium">
                No lunch recorded today.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lunchMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onEdit={openEditModal}
                    onDelete={(id, mealName) => setDeleteTarget({ id, name: mealName })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Dinner Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Dinner
                </h3>
              </div>
              <span className="text-xs font-bold text-stone-500">
                {dinnerMeals.reduce((s, m) => s + m.calories, 0)} kcal
              </span>
            </div>
            {dinnerMeals.length === 0 ? (
              <div className="p-4 rounded-2xl bg-stone-50/60 border border-dashed border-stone-200 text-center text-xs text-stone-400 font-medium">
                No dinner recorded today.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dinnerMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onEdit={openEditModal}
                    onDelete={(id, mealName) => setDeleteTarget({ id, name: mealName })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Snacks Section */}
          {snackMeals.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Apple className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Snacks & Other
                  </h3>
                </div>
                <span className="text-xs font-bold text-stone-500">
                  {snackMeals.reduce((s, m) => s + m.calories, 0)} kcal
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {snackMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onEdit={openEditModal}
                    onDelete={(id, mealName) => setDeleteTarget({ id, name: mealName })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Earlier Logs History Section (if any past meals exist) */}
      {pastMeals.length > 0 && (
        <div className="pt-6 border-t border-stone-200/80 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Calendar className="w-4 h-4 text-stone-500" />
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Previous Food Logs
            </h3>
            <span className="text-xs text-stone-400 font-medium">({pastMeals.length} entries)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pastMeals.slice(0, 10).map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onEdit={openEditModal}
                onDelete={(id, mealName) => setDeleteTarget({ id, name: mealName })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Meal Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Food or Meal"
        subtitle="Enter the meal details or choose a fast popular healthy preset"
      >
        <form onSubmit={handleAddMeal} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Food / Meal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Avocado Toast with Poached Egg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none transition-all font-medium"
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
                placeholder="320"
                value={calories}
                onChange={(e) =>
                  setCalories(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none transition-all font-medium"
              />
              <span className="absolute right-4 top-2.5 text-xs font-bold text-stone-400">
                kcal
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Popular Healthy Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="flex items-center gap-2 p-2 rounded-xl text-left bg-stone-50 hover:bg-emerald-50 hover:border-emerald-200 border border-stone-100 transition-colors text-xs active:scale-95"
                >
                  <span className="text-base">{preset.icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-800 truncate">{preset.name}</p>
                    <p className="text-[10px] text-stone-400 font-medium">{preset.calories} kcal</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-sm active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Add Meal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Meal Modal */}
      <Modal
        isOpen={!!editingMeal}
        onClose={() => setEditingMeal(null)}
        title="Edit Meal Record"
        subtitle="Update the food name or calorie count"
      >
        <form onSubmit={handleUpdateMeal} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Meal Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none transition-all font-medium"
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
                value={calories}
                onChange={(e) =>
                  setCalories(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none transition-all font-medium"
              />
              <span className="absolute right-4 top-2.5 text-xs font-bold text-stone-400">
                kcal
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setEditingMeal(null)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-sm active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Meal Record"
        message={`Are you sure you want to remove "${deleteTarget?.name || 'this meal'}" from your food journal?`}
        confirmLabel="Delete Meal"
        isDestructive={true}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
