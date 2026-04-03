'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-bg-card border border-bg-border rounded-2xl shadow-2xl animate-scale-in p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-all"
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-900/50 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-accent-red" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{title}</h3>
            <p className="text-sm text-text-muted mt-1">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-accent-red text-white font-medium px-4 py-2.5 rounded-lg
              hover:bg-red-400 active:scale-[0.98] transition-all duration-150
              disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : 'Delete'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
