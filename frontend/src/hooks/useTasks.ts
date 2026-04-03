import { useState, useCallback, useEffect, useRef } from 'react';
import { tasksApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Task, TasksResponse, TaskFilters } from '@/types';
import toast from 'react-hot-toast';

export function useTasks() {
  const { loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<TasksResponse['pagination'] | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({ page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTasks = useCallback(async (f: TaskFilters) => {
    // Don't fetch if auth is still loading
    if (authLoading) return;

    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page: f.page || 1, limit: 10 };
      if (f.status) params.status = f.status;
      if (f.priority) params.priority = f.priority;
      if (f.search?.trim()) params.search = f.search.trim();

      const { data } = await tasksApi.getAll(params);
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [authLoading]);

  useEffect(() => {
    if (authLoading) return;
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchTasks(filters), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters, fetchTasks, authLoading]);

  const updateFilters = useCallback((updates: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }));
  }, []);

  const createTask = useCallback(async (data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string | null;
  }) => {
    const { data: task } = await tasksApi.create(data);
    toast.success('Task created');
    fetchTasks(filters);
    return task as Task;
  }, [filters, fetchTasks]);

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    const { data: task } = await tasksApi.update(id, data as never);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    toast.success('Task updated');
    return task as Task;
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await tasksApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success('Task deleted');
    if (pagination) {
      setPagination((p) => p ? { ...p, total: p.total - 1 } : p);
    }
  }, [pagination]);

  const toggleTask = useCallback(async (id: string) => {
    const { data: task } = await tasksApi.toggle(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    toast.success(task.status === 'COMPLETED' ? 'Task completed! ✓' : 'Task reopened');
    return task as Task;
  }, []);

  return {
    tasks,
    pagination,
    filters,
    loading,
    error,
    updateFilters,
    refetch: () => fetchTasks(filters),
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
}
