import { describe, it, expect } from 'vitest';
import {
  calculateTotalCalories,
  calculateCalorieBudget,
  categorizeMeal,
  calculateMealBreakdown,
} from '../utils/calorieCalculations';
import { Meal } from '../types';

describe('Calorie Calculations', () => {
  describe('calculateTotalCalories', () => {
    it('returns 0 when there are no meals', () => {
      expect(calculateTotalCalories([])).toBe(0);
    });

    it('calculates the total for a single meal correctly', () => {
      const meals = [{ calories: 450 }];
      expect(calculateTotalCalories(meals)).toBe(450);
    });

    it('calculates the correct sum for multiple meals', () => {
      const meals = [
        { calories: 350 },
        { calories: 600 },
        { calories: 250 },
      ];
      expect(calculateTotalCalories(meals)).toBe(1200);
    });

    it('handles zero-calorie meals correctly without corrupting total', () => {
      const meals = [
        { calories: 0 },
        { calories: 150 },
        { calories: 0 },
      ];
      expect(calculateTotalCalories(meals)).toBe(150);
    });

    it('handles decimal calorie values according to numeric rules', () => {
      const meals = [
        { calories: 250.5 },
        { calories: 149.5 },
      ];
      expect(calculateTotalCalories(meals)).toBe(400);
    });

    it('handles missing or undefined calorie properties safely', () => {
      const meals = [
        { calories: undefined },
        { calories: 300 },
        { calories: null as unknown as number },
        {} as { calories?: number },
      ];
      expect(calculateTotalCalories(meals)).toBe(300);
    });
  });

  describe('categorizeMeal & calculateMealBreakdown', () => {
    it('categorizes meals correctly by time of day', () => {
      // 08:30 -> Breakfast (5am - 11am)
      expect(categorizeMeal('2026-10-13T08:30:00')).toBe('breakfast');
      // 13:15 -> Lunch (11am - 4pm)
      expect(categorizeMeal('2026-10-13T13:15:00')).toBe('lunch');
      // 19:45 -> Dinner (4pm - 10pm)
      expect(categorizeMeal('2026-10-13T19:45:00')).toBe('dinner');
      // 23:30 -> Snacks (Late night / between windows)
      expect(categorizeMeal('2026-10-13T23:30:00')).toBe('snacks');
      // 03:00 -> Snacks (Early morning)
      expect(categorizeMeal('2026-10-13T03:00:00')).toBe('snacks');
    });

    it('calculates category subtotals accurately across multiple categories', () => {
      // Mock meals with explicit timestamps in local hours
      const baseDate = '2026-10-13';
      const meals: Meal[] = [
        { id: '1', user_id: 'u1', name: 'Oatmeal', calories: 300, created_at: `${baseDate}T08:00:00` },
        { id: '2', user_id: 'u1', name: 'Eggs', calories: 200, created_at: `${baseDate}T09:00:00` },
        { id: '3', user_id: 'u1', name: 'Salad Bowl', calories: 550, created_at: `${baseDate}T12:30:00` },
        { id: '4', user_id: 'u1', name: 'Grilled Salmon', calories: 650, created_at: `${baseDate}T19:00:00` },
        { id: '5', user_id: 'u1', name: 'Almonds', calories: 150, created_at: `${baseDate}T16:00:00` }, // dinner starts at 16:00
        { id: '6', user_id: 'u1', name: 'Late Yogurt', calories: 100, created_at: `${baseDate}T23:00:00` }, // snacks
      ];

      const breakdown = calculateMealBreakdown(meals);

      expect(breakdown.breakfast).toBe(500); // 300 + 200
      expect(breakdown.lunch).toBe(550);
      expect(breakdown.dinner).toBe(800); // 650 + 150
      expect(breakdown.snacks).toBe(100);

      // Verify category sum equals total calories
      const totalBreakdown = breakdown.breakfast + breakdown.lunch + breakdown.dinner + breakdown.snacks;
      expect(totalBreakdown).toBe(calculateTotalCalories(meals));
    });
  });

  describe('calculateCalorieBudget', () => {
    it('calculates remaining calories as target minus consumed when within goal', () => {
      const budget = calculateCalorieBudget(1400, 2000);
      expect(budget.consumed).toBe(1400);
      expect(budget.safeGoal).toBe(2000);
      expect(budget.remaining).toBe(600);
      expect(budget.isExceeded).toBe(false);
      expect(budget.exceededBy).toBe(0);
      expect(budget.percentage).toBe(70);
    });

    it('handles consumed calories equal to target perfectly', () => {
      const budget = calculateCalorieBudget(2000, 2000);
      expect(budget.remaining).toBe(0);
      expect(budget.isExceeded).toBe(false);
      expect(budget.exceededBy).toBe(0);
      expect(budget.percentage).toBe(100);
    });

    it('correctly handles consumed calories exceeding the target', () => {
      const budget = calculateCalorieBudget(2350, 2000);
      expect(budget.remaining).toBe(0); // Cannot be negative for remaining budget
      expect(budget.isExceeded).toBe(true);
      expect(budget.exceededBy).toBe(350);
      expect(budget.percentage).toBe(100); // Circular progress capped at 100%
    });

    it('falls back safely to default 2000 kcal when goal is zero or negative', () => {
      const zeroGoalBudget = calculateCalorieBudget(500, 0);
      expect(zeroGoalBudget.safeGoal).toBe(2000);
      expect(zeroGoalBudget.remaining).toBe(1500);

      const negativeGoalBudget = calculateCalorieBudget(500, -500);
      expect(negativeGoalBudget.safeGoal).toBe(2000);
      expect(negativeGoalBudget.remaining).toBe(1500);
    });

    it('handles 0 consumed calories', () => {
      const budget = calculateCalorieBudget(0, 1800);
      expect(budget.consumed).toBe(0);
      expect(budget.remaining).toBe(1800);
      expect(budget.isExceeded).toBe(false);
      expect(budget.exceededBy).toBe(0);
      expect(budget.percentage).toBe(0);
    });
  });
});
