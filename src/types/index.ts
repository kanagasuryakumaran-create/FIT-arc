export interface Meal {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  name: string;
  duration: number; // in minutes
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
}

export type TabType = 'dashboard' | 'meals' | 'activities' | 'todos' | 'progress' | 'profile';

export interface UserGoals {
  dailyCalorieGoal: number;
  dailyActiveMinutesGoal: number;
  dailyWaterGlassesGoal: number;
}
