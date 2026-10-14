import React, { useState } from 'react';
import { Activity } from '../../types';
import { api } from '../../services/api';
import { PageHeader } from '../common/PageHeader';
import { ActivityCard } from './ActivityCard';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import {
  Activity as ActivityIcon,
  Plus,
  Flame,
  Footprints,
  Bike,
  Dumbbell,
  Waves,
  HeartPulse,
} from 'lucide-react';

interface ActivityTrackerProps {
  activities: Activity[];
  onRefresh: () => void;
  activeGoal?: number;
  onToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const WORKOUT_PRESETS = [
  { name: 'Outdoor Running', defaultDuration: 30, icon: Footprints },
  { name: 'Brisk Walking', defaultDuration: 45, icon: Footprints },
  { name: 'Cycling & Spin', defaultDuration: 30, icon: Bike },
  { name: 'Strength & Weights', defaultDuration: 45, icon: Dumbbell },
  { name: 'Yoga & Flexibility', defaultDuration: 30, icon: HeartPulse },
  { name: 'Swimming Session', defaultDuration: 30, icon: Waves },
];

export const ActivityTracker: React.FC<ActivityTrackerProps> = ({
  activities,
  onRefresh,
  activeGoal = 30,
  onToast,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivities = activities.filter((act) =>
    act.created_at ? act.created_at.startsWith(todayStr) : true
  );

  const totalActiveMinutesToday = todayActivities.reduce(
    (sum, act) => sum + Number(act.duration || 0),
    0
  );
  const allTimeActiveMinutes = activities.reduce(
    (sum, act) => sum + Number(act.duration || 0),
    0
  );
  const estimatedCaloriesBurnedToday = Math.round(totalActiveMinutesToday * 7.2);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || duration === '' || duration <= 0) return;

    setLoading(true);
    try {
      await api.addActivity(name.trim(), Number(duration));
      setName('');
      setDuration('');
      setIsAddModalOpen(false);
      onToast?.('Workout logged successfully', 'success');
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to log activity';
      onToast?.(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.deleteActivity(deleteTarget.id);
      setDeleteTarget(null);
      onToast?.(`Removed "${deleteTarget.name}"`, 'info');
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete activity';
      onToast?.(message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSelectPreset = (preset: (typeof WORKOUT_PRESETS)[0]) => {
    setName(preset.name);
    setDuration(preset.defaultDuration);
  };

  return (
    <div className="space-y-7 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Physical Activity & Workouts"
        subtitle="Record workout sessions, track active time, and estimate energy expenditure"
        actions={
          <button
            onClick={() => {
              setName('');
              setDuration('');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Workout</span>
          </button>
        }
      />

      {/* Activity Summary Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center shrink-0">
              <ActivityIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Today's Movement
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
                  {totalActiveMinutesToday}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-stone-400">
                  / {activeGoal} mins target
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 font-medium">
                {totalActiveMinutesToday >= activeGoal ? (
                  <span className="text-emerald-700 font-bold">
                    Target achieved! Great workout dedication today.
                  </span>
                ) : (
                  <>
                    <span className="text-sky-700 font-bold">
                      {Math.max(0, activeGoal - totalActiveMinutesToday)} mins
                    </span>{' '}
                    remaining to reach your daily goal.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="bg-stone-50/80 rounded-2xl p-3 text-center border border-stone-100">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Today's Time</span>
              <span className="text-sm sm:text-base font-extrabold text-stone-900 font-display">
                {totalActiveMinutesToday} min
              </span>
            </div>
            <div className="bg-stone-50/80 rounded-2xl p-3 text-center border border-stone-100">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Est. Burn</span>
              <span className="text-sm sm:text-base font-extrabold text-amber-700 flex items-center justify-center gap-0.5 font-display">
                <Flame className="w-3.5 h-3.5" />
                ~{estimatedCaloriesBurnedToday} kcal
              </span>
            </div>
            <div className="bg-stone-50/80 rounded-2xl p-3 text-center border border-stone-100 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">All-Time Time</span>
              <span className="text-sm sm:text-base font-extrabold text-stone-900 font-display">
                {allTimeActiveMinutes} min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Activity History List */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            Workout History ({activities.length})
          </h3>
          <span className="text-xs text-stone-400 font-medium">Logged movements</span>
        </div>

        {activities.length === 0 ? (
          <EmptyState
            title="No workouts recorded yet"
            description="Log your daily run, walk, or gym workout to track your energetic burn and movement consistency."
            icon={ActivityIcon}
            actionLabel="Log First Workout"
            variant="blue"
            onAction={() => {
              setName('');
              setDuration('');
              setIsAddModalOpen(true);
            }}
          />
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onDelete={(id, actName) => setDeleteTarget({ id, name: actName })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Workout Activity"
        subtitle="Record workout minutes and estimate calories burned"
      >
        <form onSubmit={handleAddActivity} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Activity Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 5K Morning Run, Kettlebell Workout"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-sky-600 focus:bg-white outline-none transition-all font-medium"
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
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-sky-600 focus:bg-white outline-none transition-all font-medium"
              />
              <span className="absolute right-4 top-2.5 text-xs font-bold text-stone-400">
                minutes
              </span>
            </div>
          </div>

          {/* Quick Workout Presets */}
          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Popular Workout Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              {WORKOUT_PRESETS.map((preset, idx) => {
                const PresetIcon = preset.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-left bg-stone-50 hover:bg-sky-50 hover:border-sky-200 border border-stone-100 transition-colors text-xs active:scale-95"
                  >
                    <div className="p-1 rounded-lg bg-white text-sky-700 shadow-2xs">
                      <PresetIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-800 truncate">{preset.name}</p>
                      <p className="text-[10px] text-stone-400 font-medium">
                        {preset.defaultDuration} min
                      </p>
                    </div>
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
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Record Activity'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Activity Log"
        message={`Are you sure you want to delete "${deleteTarget?.name || 'this workout'}" from your activity logs?`}
        confirmLabel="Remove Workout"
        isDestructive={true}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
