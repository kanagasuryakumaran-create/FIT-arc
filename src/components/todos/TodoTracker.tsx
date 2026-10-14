import React, { useState } from 'react';
import { Task } from '../../types';
import { api } from '../../services/api';
import { PageHeader } from '../common/PageHeader';
import { TaskCard } from './TaskCard';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import {
  CheckCircle2,
  Plus,
  Droplets,
  Heart,
  Moon,
  Footprints,
  Pill,
} from 'lucide-react';

interface TodoTrackerProps {
  todos: Task[];
  onRefresh: () => void;
  onToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const HEALTH_HABIT_PRESETS = [
  { title: 'Drink 2.5 Liters of Water', icon: Droplets, color: 'text-sky-600 bg-sky-50' },
  { title: 'Walk 8,000 Daily Steps', icon: Footprints, color: 'text-amber-600 bg-amber-50' },
  { title: 'Take Vitamins & Minerals', icon: Pill, color: 'text-emerald-600 bg-emerald-50' },
  { title: '10 Min Post-Workout Stretch', icon: Heart, color: 'text-rose-600 bg-rose-50' },
  { title: 'Sleep 7 to 8 Hours Tonight', icon: Moon, color: 'text-indigo-600 bg-indigo-50' },
];

export const TodoTracker: React.FC<TodoTrackerProps> = ({ todos, onRefresh, onToast }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'completed'>('all');

  // Delete target state for confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const pendingTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);
  const progressPercent = todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0;

  const handleAddTodo = async (taskTitle: string) => {
    if (!taskTitle.trim()) return;

    setLoading(true);
    try {
      await api.addTodo(taskTitle.trim());
      setTitle('');
      setIsAddModalOpen(false);
      onToast?.('Wellness habit added', 'success');
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add habit';
      onToast?.(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddTodo(title);
  };

  const handleToggle = async (task: Task) => {
    try {
      await api.toggleTodo(task.id, !task.completed);
      onToast?.(
        !task.completed ? `Completed "${task.title}"!` : `Marked "${task.title}" as pending`,
        'success'
      );
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update habit';
      onToast?.(message, 'error');
    }
  };

  const handleUpdate = async (id: string, newTitle: string) => {
    try {
      await api.updateTodoTitle(id, newTitle);
      onToast?.('Habit updated', 'success');
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update habit';
      onToast?.(message, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.deleteTodo(deleteTarget.id);
      setDeleteTarget(null);
      onToast?.(`Removed "${deleteTarget.title}"`, 'info');
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete habit';
      onToast?.(message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const displayedTodos = todos.filter((t) => {
    if (filterTab === 'pending') return !t.completed;
    if (filterTab === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="space-y-7 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Wellness Habits & Tasks"
        subtitle="Build healthy daily routines, track consistency, and stay accountable"
        actions={
          <button
            onClick={() => {
              setTitle('');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Habit</span>
          </button>
        }
      />

      {/* Progress Overview Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Habit Completion Rate
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
                  {completedTodos.length} / {todos.length}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-stone-400">habits completed</span>
              </div>
              <p className="text-xs text-stone-500 mt-1 font-medium">
                {todos.length === 0 ? (
                  'Create your first daily wellness habit below.'
                ) : completedTodos.length === todos.length ? (
                  <span className="text-emerald-700 font-bold">
                    All habits completed today! Fantastic consistency!
                  </span>
                ) : (
                  `${pendingTodos.length} ${
                    pendingTodos.length === 1 ? 'habit' : 'habits'
                  } remaining for today.`
                )}
              </p>
            </div>
          </div>

          <div className="w-full md:w-64 bg-stone-50/80 rounded-2xl p-4 border border-stone-100 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-stone-500">Daily Progress</span>
              <span className="text-purple-700 font-extrabold font-display">{progressPercent}%</span>
            </div>
            <div className="w-full bg-stone-200/70 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-stone-400 mt-2 block text-center font-medium">
              {completedTodos.length} of {todos.length} habits checked
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Items List */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-stone-100/80 rounded-2xl border border-stone-200/60">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              All ({todos.length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'pending'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Pending ({pendingTodos.length})
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'completed'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Completed ({completedTodos.length})
            </button>
          </div>

          <button
            onClick={() => {
              setTitle('');
              setIsAddModalOpen(true);
            }}
            className="text-xs font-bold text-purple-700 hover:text-purple-800 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create new habit</span>
          </button>
        </div>

        {displayedTodos.length === 0 ? (
          <EmptyState
            title={
              filterTab === 'completed'
                ? 'No completed tasks yet'
                : filterTab === 'pending'
                ? 'No pending tasks left'
                : 'No habits added yet'
            }
            description={
              filterTab === 'completed'
                ? 'Check off habits as you complete them throughout the day.'
                : 'Add daily wellness goals like drinking water, walking steps, or taking supplements.'
            }
            icon={CheckCircle2}
            actionLabel="Add Habit"
            variant="purple"
            onAction={() => {
              setTitle('');
              setIsAddModalOpen(true);
            }}
          />
        ) : (
          <div className="space-y-2.5">
            {displayedTodos.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={(id, taskTitle) => setDeleteTarget({ id, title: taskTitle })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Wellness Habit or Task"
        subtitle="Stay consistent with daily healthy routines"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Habit / Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Drink 2.5L water, 10 min morning stretch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-purple-600 focus:bg-white outline-none transition-all font-medium"
            />
          </div>

          {/* Quick Habit Presets */}
          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Popular Wellness Habits
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HEALTH_HABIT_PRESETS.map((preset, idx) => {
                const PresetIcon = preset.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddTodo(preset.title)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl text-left bg-stone-50 hover:bg-purple-50 hover:border-purple-200 border border-stone-100 transition-colors text-xs font-semibold text-stone-800 active:scale-95"
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${preset.color}`}>
                      <PresetIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{preset.title}</span>
                  </button>
                );
              })}
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
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Add Habit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Habit"
        message={`Are you sure you want to delete "${deleteTarget?.title || 'this habit'}"?`}
        confirmLabel="Remove Habit"
        isDestructive={true}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
