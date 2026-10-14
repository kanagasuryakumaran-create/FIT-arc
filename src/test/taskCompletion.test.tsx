import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '../components/todos/TaskCard';
import { TodoTracker } from '../components/todos/TodoTracker';
import { api } from '../services/api';
import { Task } from '../types';

// Mock the API layer
vi.mock('../services/api', () => ({
  api: {
    toggleTodo: vi.fn(),
    addTodo: vi.fn(),
    updateTodoTitle: vi.fn(),
    deleteTodo: vi.fn(),
  },
}));

// Mock AuthContext for PageHeader
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'test@example.com' },
    session: null,
    loading: false,
    signOut: vi.fn(),
    isConfigured: true,
  }),
}));

describe('Task Completion and Status Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      user_id: 'u1',
      title: 'Drink 2.5L Water',
      completed: false,
      created_at: '2026-10-13T09:00:00Z',
    },
    {
      id: 'task-2',
      user_id: 'u1',
      title: 'Morning Yoga 15m',
      completed: true,
      created_at: '2026-10-13T07:30:00Z',
    },
    {
      id: 'task-3',
      user_id: 'u1',
      title: 'Take Multivitamins',
      completed: false,
      created_at: '2026-10-13T10:00:00Z',
    },
  ];

  describe('TaskCard Component', () => {
    it('renders a pending task with appropriate toggle action', async () => {
      const handleToggle = vi.fn();
      const handleUpdate = vi.fn();
      const handleDelete = vi.fn();

      render(
        <TaskCard
          task={mockTasks[0]} // completed: false
          onToggle={handleToggle}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      );

      expect(screen.getByText('Drink 2.5L Water')).toBeInTheDocument();
      const toggleBtn = screen.getByRole('button', { name: /mark as completed/i });
      expect(toggleBtn).toBeInTheDocument();

      await userEvent.click(toggleBtn);
      expect(handleToggle).toHaveBeenCalledTimes(1);
      expect(handleToggle).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('renders a completed task with line-through text and allows marking as pending again', async () => {
      const handleToggle = vi.fn();
      const handleUpdate = vi.fn();
      const handleDelete = vi.fn();

      render(
        <TaskCard
          task={mockTasks[1]} // completed: true
          onToggle={handleToggle}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      );

      const titleEl = screen.getByText('Morning Yoga 15m');
      expect(titleEl).toHaveClass('line-through');

      const toggleBtn = screen.getByRole('button', { name: /mark as pending/i });
      expect(toggleBtn).toBeInTheDocument();

      await userEvent.click(toggleBtn);
      expect(handleToggle).toHaveBeenCalledTimes(1);
      expect(handleToggle).toHaveBeenCalledWith(mockTasks[1]);
    });
  });

  describe('TodoTracker Component', () => {
    it('displays overall habit progress and status summary correctly', () => {
      render(
        <TodoTracker
          todos={mockTasks}
          onRefresh={vi.fn()}
          onToast={vi.fn()}
        />
      );

      // 1 of 3 completed -> 33%
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
      expect(screen.getByText('33%')).toBeInTheDocument();
      expect(screen.getByText('2 habits remaining for today.')).toBeInTheDocument();
    });

    it('successfully calls api.toggleTodo with true when completing a pending task', async () => {
      const onRefresh = vi.fn();
      const onToast = vi.fn();

      vi.mocked(api.toggleTodo).mockResolvedValueOnce({
        ...mockTasks[0],
        completed: true,
      });

      render(
        <TodoTracker
          todos={mockTasks}
          onRefresh={onRefresh}
          onToast={onToast}
        />
      );

      // Find toggle button for task-1 (Drink 2.5L Water)
      const pendingTaskToggle = screen.getAllByRole('button', { name: /mark as completed/i })[0];
      await userEvent.click(pendingTaskToggle);

      expect(api.toggleTodo).toHaveBeenCalledTimes(1);
      expect(api.toggleTodo).toHaveBeenCalledWith('task-1', true);

      await waitFor(() => {
        expect(onToast).toHaveBeenCalledWith('Completed "Drink 2.5L Water"!', 'success');
        expect(onRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it('successfully calls api.toggleTodo with false when marking a completed task as pending', async () => {
      const onRefresh = vi.fn();
      const onToast = vi.fn();

      vi.mocked(api.toggleTodo).mockResolvedValueOnce({
        ...mockTasks[1],
        completed: false,
      });

      render(
        <TodoTracker
          todos={mockTasks}
          onRefresh={onRefresh}
          onToast={onToast}
        />
      );

      // Find toggle button for task-2 (Morning Yoga 15m)
      const completedTaskToggle = screen.getByRole('button', { name: /mark as pending/i });
      await userEvent.click(completedTaskToggle);

      expect(api.toggleTodo).toHaveBeenCalledTimes(1);
      expect(api.toggleTodo).toHaveBeenCalledWith('task-2', false);

      await waitFor(() => {
        expect(onToast).toHaveBeenCalledWith('Marked "Morning Yoga 15m" as pending', 'success');
        expect(onRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it('handles api failure gracefully without calling onRefresh (preserving rollback state)', async () => {
      const onRefresh = vi.fn();
      const onToast = vi.fn();

      vi.mocked(api.toggleTodo).mockRejectedValueOnce(new Error('Network error: connection lost'));

      render(
        <TodoTracker
          todos={mockTasks}
          onRefresh={onRefresh}
          onToast={onToast}
        />
      );

      const pendingTaskToggle = screen.getAllByRole('button', { name: /mark as completed/i })[0];
      await userEvent.click(pendingTaskToggle);

      expect(api.toggleTodo).toHaveBeenCalledWith('task-1', true);

      await waitFor(() => {
        expect(onToast).toHaveBeenCalledWith('Network error: connection lost', 'error');
        // Critical: onRefresh must NOT be called on failure so unpersisted changes are not falsely shown
        expect(onRefresh).not.toHaveBeenCalled();
      });
    });

    it('filters tasks correctly when switching between All, Pending, and Completed tabs', async () => {
      render(
        <TodoTracker
          todos={mockTasks}
          onRefresh={vi.fn()}
          onToast={vi.fn()}
        />
      );

      // Initially on 'All (3)'
      expect(screen.getByText('Drink 2.5L Water')).toBeInTheDocument();
      expect(screen.getByText('Morning Yoga 15m')).toBeInTheDocument();
      expect(screen.getByText('Take Multivitamins')).toBeInTheDocument();

      // Click 'Pending (2)' filter
      const pendingFilterBtn = screen.getByRole('button', { name: /pending \(2\)/i });
      fireEvent.click(pendingFilterBtn);

      expect(screen.getByText('Drink 2.5L Water')).toBeInTheDocument();
      expect(screen.getByText('Take Multivitamins')).toBeInTheDocument();
      expect(screen.queryByText('Morning Yoga 15m')).not.toBeInTheDocument();

      // Click 'Completed (1)' filter
      const completedFilterBtn = screen.getByRole('button', { name: /completed \(1\)/i });
      fireEvent.click(completedFilterBtn);

      expect(screen.getByText('Morning Yoga 15m')).toBeInTheDocument();
      expect(screen.queryByText('Drink 2.5L Water')).not.toBeInTheDocument();
      expect(screen.queryByText('Take Multivitamins')).not.toBeInTheDocument();

      // Switch back to 'All (3)'
      const allFilterBtn = screen.getByRole('button', { name: /all \(3\)/i });
      fireEvent.click(allFilterBtn);

      expect(screen.getByText('Drink 2.5L Water')).toBeInTheDocument();
      expect(screen.getByText('Morning Yoga 15m')).toBeInTheDocument();
      expect(screen.getByText('Take Multivitamins')).toBeInTheDocument();
    });

    it('shows useful empty state when no tasks match a filter', () => {
      // Pass list with only completed tasks
      const completedOnly: Task[] = [mockTasks[1]];

      render(
        <TodoTracker
          todos={completedOnly}
          onRefresh={vi.fn()}
          onToast={vi.fn()}
        />
      );

      // Switch to Pending (0)
      const pendingFilterBtn = screen.getByRole('button', { name: /pending \(0\)/i });
      fireEvent.click(pendingFilterBtn);

      expect(screen.getByText('No pending tasks left')).toBeInTheDocument();
    });
  });
});
