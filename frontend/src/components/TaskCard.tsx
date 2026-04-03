'use client';

import { Task } from '@/types';
import { format, isAfter, parseISO } from 'date-fns';
import { Pencil, Trash2, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_CONFIG = {
  HIGH:   { label: 'High',   color: 'text-accent-red',   bg: 'bg-red-950/40',    dot: 'bg-accent-red' },
  MEDIUM: { label: 'Medium', color: 'text-accent-amber',  bg: 'bg-amber-950/40',  dot: 'bg-accent-amber' },
  LOW:    { label: 'Low',    color: 'text-text-secondary', bg: 'bg-bg-elevated',  dot: 'bg-bg-border' },
};

const STATUS_CONFIG = {
  PENDING:     { label: 'Pending',     color: 'text-text-muted',    bg: 'bg-bg-elevated' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-accent-blue',   bg: 'bg-blue-950/40' },
  COMPLETED:   { label: 'Completed',   color: 'text-accent-green',  bg: 'bg-green-950/40' },
};

export default function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const priority = PRIORITY_CONFIG[task.priority];
  const status = STATUS_CONFIG[task.status];
  const isCompleted = task.status === 'COMPLETED';
  const isOverdue = task.dueDate && !isCompleted && isAfter(new Date(), parseISO(task.dueDate));

  return (
    <div
      className={`card group relative transition-all duration-200 animate-slide-up
        ${isCompleted ? 'opacity-60' : 'hover:shadow-lg hover:shadow-black/20'}`}
    >
      {/* Priority bar */}
      <div className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full ${priority.dot}`} />

      <div className="pl-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggle(task.id)}
            className="mt-0.5 shrink-0 text-text-muted hover:text-accent-green transition-colors"
            title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            {isCompleted
              ? <CheckCircle2 size={18} className="text-accent-green" />
              : <Circle size={18} />
            }
          </button>

          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-sm leading-snug ${isCompleted ? 'line-through text-text-muted' : 'text-text-primary'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">{task.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-md transition-all"
              title="Edit task"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-text-muted hover:text-accent-red hover:bg-red-950/30 rounded-md transition-all"
              title="Delete task"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className={`badge ${status.bg} ${status.color}`}>
            {task.status === 'IN_PROGRESS' && <Clock size={10} />}
            {task.status === 'COMPLETED' && <CheckCircle2 size={10} />}
            {status.label}
          </span>

          <span className={`badge ${priority.bg} ${priority.color}`}>
            {priority.label}
          </span>

          {task.dueDate && (
            <span className={`badge flex items-center gap-1 ${isOverdue ? 'bg-red-950/40 text-accent-red' : 'bg-bg-elevated text-text-muted'}`}>
              <Calendar size={10} />
              {format(parseISO(task.dueDate), 'MMM d')}
              {isOverdue && ' · Overdue'}
            </span>
          )}

          <span className="ml-auto text-xs text-text-muted font-mono">
            {format(parseISO(task.createdAt), 'MMM d')}
          </span>
        </div>
      </div>
    </div>
  );
}
