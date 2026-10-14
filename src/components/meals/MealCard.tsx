import React from 'react';
import { Meal } from '../../types';
import { Edit3, Trash2, Clock, Coffee, Sun, Moon, Apple } from 'lucide-react';

interface MealCardProps {
  meal: Meal;
  onEdit: (meal: Meal) => void;
  onDelete: (id: string, name: string) => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onEdit, onDelete }) => {
  // Determine smart meal category based on time of day
  const dateObj = meal.created_at ? new Date(meal.created_at) : new Date();
  const hour = dateObj.getHours();

  let category = 'Snack';
  let CategoryIcon = Apple;
  let categoryColor = 'bg-emerald-50 text-emerald-700 border-emerald-100/80';

  if (hour >= 5 && hour < 11) {
    category = 'Breakfast';
    CategoryIcon = Coffee;
    categoryColor = 'bg-orange-50 text-orange-700 border-orange-100/80';
  } else if (hour >= 11 && hour < 16) {
    category = 'Lunch';
    CategoryIcon = Sun;
    categoryColor = 'bg-amber-50 text-amber-700 border-amber-100/80';
  } else if (hour >= 16 && hour < 22) {
    category = 'Dinner';
    CategoryIcon = Moon;
    categoryColor = 'bg-indigo-50 text-indigo-700 border-indigo-100/80';
  }

  const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-stone-200/80 shadow-card hover:shadow-card-hover hover:border-emerald-200 transition-all duration-200 flex items-center justify-between gap-3.5 group">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${categoryColor}`}>
          <CategoryIcon className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm sm:text-base font-bold text-stone-900 truncate font-display">{meal.name}</h4>
            <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/60">
              {category}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-400 mt-1 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {timeFormatted}
            </span>
            <span className="sm:hidden text-stone-300">•</span>
            <span className="sm:hidden font-bold text-amber-700">{meal.calories} kcal</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-base font-extrabold text-stone-900 tracking-tight font-display">
            {meal.calories}
          </span>
          <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">kcal</span>
        </div>

        <div className="flex items-center gap-1 border-l border-stone-100 pl-2 sm:pl-3">
          <button
            onClick={() => onEdit(meal)}
            className="p-2 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors active:scale-95"
            title="Edit Meal"
            aria-label={`Edit ${meal.name}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(meal.id, meal.name)}
            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors active:scale-95"
            title="Delete Meal"
            aria-label={`Delete ${meal.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
