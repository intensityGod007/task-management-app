'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskStatus, Priority } from '@/types';
import Navbar from '@/components/Navbar';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    tasks, pagination, filters, loading, error,
    updateFilters, createTask, updateTask, deleteTask, toggleTask,
  } = useTasks();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => updateFilters({ search: searchInput }), 400);
    return () => clearTimeout(t);
  }, [searchInput, updateFilters]);

  const handleCreate = async (data: Parameters<typeof createTask>[0]) => {
    try {
      await createTask(data);
    } catch {
      toast.error('Failed to create task');
      throw new Error('Failed to create task');
    }
  };

  const handleUpdate = async (data: Parameters<typeof createTask>[0]) => {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, data as Partial<Task>);
    } catch {
      toast.error('Failed to update task');
      throw new Error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await deleteTask(deletingId);
      setDeletingId(null);
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleTask(id);
    } catch {
      toast.error('Failed to update task');
    }
  };

  const openCreate = () => { setEditingTask(null); setModalOpen(true); };
  const openEdit = (task: Task) => { setEditingTask(task); setModalOpen(true); };

  const stats = {
    total: pagination?.total ?? 0,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    high: tasks.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED').length,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-amber border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-text-muted text-sm font-mono tracking-widest uppercase mb-1">Dashboard</p>
            <h1 className="font-display text-3xl font-semibold text-text-primary">
              Good day, {user?.name?.split(' ')[0]}<span className="text-accent-amber">.</span>
            </h1>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 shrink-0">
            <Plus size={16} />
            <span className="hidden sm:inline">New task</span>
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total tasks', value: pagination?.total ?? '–', sub: 'in current view' },
            { label: 'Completed', value: stats.completed, sub: 'this page' },
            { label: 'In progress', value: stats.inProgress, sub: 'active' },
            { label: 'High priority', value: stats.high, sub: 'need attention' },
          ].map((s) => (
            <div key={s.label} className="bg-bg-card border border-bg-border rounded-xl p-4">
              <p className="text-2xl font-display font-semibold text-text-primary">{s.value}</p>
              <p className="text-xs text-text-secondary mt-1">{s.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tasks…"
              className="input-field pl-9"
            />
          </div>

          <div className="flex gap-2 items-center">
            <SlidersHorizontal size={14} className="text-text-muted shrink-0" />
            <select
              value={filters.status || ''}
              onChange={(e) => updateFilters({ status: e.target.value as TaskStatus | '' })}
              className="input-field w-auto"
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select
              value={filters.priority || ''}
              onChange={(e) => updateFilters({ priority: e.target.value as Priority | '' })}
              className="input-field w-auto"
            >
              <option value="">All priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Task list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-accent-amber animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-accent-red text-sm">{error}</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-card border border-bg-border flex items-center justify-center mb-4">
              <ClipboardList size={24} className="text-text-muted" />
            </div>
            <h3 className="font-display text-lg font-medium text-text-secondary mb-1">No tasks yet</h3>
            <p className="text-sm text-text-muted mb-5">
              {filters.search || filters.status || filters.priority
                ? 'No tasks match your current filters'
                : 'Create your first task to get started'}
            </p>
            {!filters.search && !filters.status && !filters.priority && (
              <button onClick={openCreate} className="btn-primary flex items-center gap-2">
                <Plus size={14} /> Create task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={openEdit}
                onDelete={(id) => setDeletingId(id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-bg-border">
            <p className="text-sm text-text-muted font-mono">
              Page {pagination.page} of {pagination.totalPages}
              <span className="ml-2 text-text-muted/60">· {pagination.total} total</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => updateFilters({ page: pagination.page - 1 })}
                disabled={!pagination.hasPrev}
                className="btn-ghost flex items-center gap-1.5 text-sm disabled:opacity-30"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => updateFilters({ page: pagination.page + 1 })}
                disabled={!pagination.hasNext}
                className="btn-ghost flex items-center gap-1.5 text-sm disabled:opacity-30"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <TaskModal
        open={modalOpen}
        task={editingTask}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSubmit={editingTask ? handleUpdate : handleCreate}
      />

      <ConfirmDialog
        open={!!deletingId}
        title="Delete task"
        message="This task will be permanently deleted. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
