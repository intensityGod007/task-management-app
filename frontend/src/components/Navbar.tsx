'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { LogOut, User, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="border-b border-bg-border bg-bg-primary/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <span className="font-display text-xl text-text-primary tracking-tight">
          Momentum<span className="text-accent-amber">.</span>
        </span>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-bg-elevated transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-accent-amber/15 border border-accent-amber/30 flex items-center justify-center">
              <span className="text-xs font-semibold text-accent-amber font-mono">{initials}</span>
            </div>
            <span className="text-sm text-text-secondary hidden sm:block">{user?.name}</span>
            <ChevronDown size={14} className={`text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-bg-card border border-bg-border rounded-xl shadow-2xl z-50 overflow-hidden animate-scale-in">
                <div className="px-4 py-3 border-b border-bg-border">
                  <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary rounded-lg hover:bg-bg-elevated transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <User size={14} />
                    Profile
                  </button>
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-accent-red rounded-lg hover:bg-red-950/40 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
