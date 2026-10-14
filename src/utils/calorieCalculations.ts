import { Meal } from '../types';

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

/**
 * Calculates the total sum of calories from a list of meals.
 * Gracefully handles missing, zero, or decimal values according to app rules.
 */
export function calculateTotalCalories(meals: Array<{ calories?: number | null | undefined }>): number {
  return meals.reduce((sum, meal) => sum + Number(meal?.calories || 0), 0);
}

/**
 * Categorizes a meal based on hour of the day (24-hour format):
 * - 05:00 - 10:59: breakfast
 * - 11:00 - 15:59: lunch
 * - 16:00 - 21:59: dinner
 * - All other hours: snacks
 */
export function categorizeMeal(created_at?: string): MealCategory {
  const d = created_at ? new Date(created_at) : new Date();
  const h = d.getHours();
  if (h >= 5 && h < 11) return 'breakfast';
  if (h >= 11 && h < 16) return 'lunch';
  if (h >= 16 && h < 22) return 'dinner';
  return 'snacks';
}

export interface MealBreakdown {
  breakfast: number;
  lunch: number;
  dinner: number;
  snacks: number;
}

/**
 * Calculates category-specific calorie subtotals across meals.
 */
export function calculateMealBreakdown(meals: Meal[]): MealBreakdown {
  return meals.reduce(
    (acc, meal) => {
      const cat = categorizeMeal(meal.created_at);
      const c = Number(meal.calories || 0);
      acc[cat] += c;
      return acc;
    },
    { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 }
  );
}

export interface CalorieBudgetSummary {
  consumed: number;
  goal: number;
  safeGoal: number;
  remaining: number;
  isExceeded: boolean;
  exceededBy: number;
  percentage: number;
}

/**
 * Computes calorie budget balance, remaining calories, percentage,
 * and exceeded status against daily goal.
 */
export function calculateCalorieBudget(consumed: number, goal: number): CalorieBudgetSummary {
  const safeGoal = goal > 0 ? goal : 2000;
  const isExceeded = consumed > safeGoal;
  const remaining = Math.max(0, safeGoal - consumed);
  const exceededBy = isExceeded ? consumed - safeGoal : 0;
  const percentage = Math.min(100, Math.round((consumed / safeGoal) * 100));

  return {
    consumed,
    goal,
    safeGoal,
    remaining,
    isExceeded,
    exceededBy,
    percentage,
  };
}
