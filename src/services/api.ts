import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Meal, Activity, Task } from '../types';

export const api = {
  // --- Meals ---
  async getMeals(): Promise<Meal[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addMeal(name: string, calories: number): Promise<Meal | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('meals')
      .insert([{ name, calories, user_id: userData.user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMeal(id: string, name: string, calories: number): Promise<Meal | null> {
    const { data, error } = await supabase
      .from('meals')
      .update({ name, calories })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMeal(id: string): Promise<void> {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- Activities ---
  async getActivities(): Promise<Activity[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addActivity(name: string, duration: number): Promise<Activity | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('activities')
      .insert([{ name, duration, user_id: userData.user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteActivity(id: string): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- Todos ---
  async getTodos(): Promise<Task[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addTodo(title: string): Promise<Task | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('todos')
      .insert([{ title, completed: false, user_id: userData.user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleTodo(id: string, completed: boolean): Promise<Task | null> {
    const { data, error } = await supabase
      .from('todos')
      .update({ completed })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTodoTitle(id: string, title: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('todos')
      .update({ title })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTodo(id: string): Promise<void> {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- Realtime Subscription Helper ---
  subscribeToTable(table: string, onChange: () => void) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
