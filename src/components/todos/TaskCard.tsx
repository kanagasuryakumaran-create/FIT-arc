import React, { useState } from 'react';
import { Task } from '../../types';
import { Check, CheckCircle2, Circle, Edit3, Trash2, X } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggle: (task: Task) => void;
  onUpdate: (id: string, newTitle: string) => Promise<void>;
  onDelete: (id: string, title: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggle,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!editTitle.trim() || editTitle.trim() === task.title) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      await onUpdate(task.id, editTitle.trim());
      setIsEditing(false);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl p-4 border transition-all duration-200 flex items-center justify-between gap-3 ${
        task.completed
          ? 'border-stone-200/60 bg-stone-50/60'
          : 'border-stone-200/80 shadow-card hover:shadow-card-hover hover:border-emerald-200'
      }`}
    >
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none font-medium"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setIsEditing(false);
            }}
          />
          <button
            onClick={handleSave}
            disabled={loading}
            className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors active:scale-95"
            title="Save changes"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 text-stone-400 hover:bg-stone-100 rounded-xl transition-colors active:scale-95"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <button
              onClick={() => onToggle(task)}
              className={`p-1 rounded-xl transition-all shrink-0 active:scale-90 ${
                task.completed
                  ? 'text-emerald-700 hover:text-emerald-800 bg-emerald-50'
                  : 'text-stone-300 hover:text-emerald-600 hover:bg-stone-100'
              }`}
              title={task.completed ? 'Mark as pending' : 'Mark as completed'}
              aria-label={task.completed ? 'Mark as pending' : 'Mark as completed'}
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 fill-emerald-100 text-emerald-600" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>

            <span
              className={`text-sm font-semibold truncate select-none transition-colors ${
                task.completed
                  ? 'line-through text-stone-400 font-normal'
                  : 'text-stone-900 font-display'
              }`}
            >
              {task.title}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!task.completed && (
              <button
                onClick={() => {
                  setEditTitle(task.title);
                  setIsEditing(true);
                }}
                className="p-2 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors active:scale-95"
                title="Edit Habit Title"
                aria-label={`Edit ${task.title}`}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onDelete(task.id, task.title)}
              className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors active:scale-95"
              title="Delete Habit"
              aria-label={`Delete ${task.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
