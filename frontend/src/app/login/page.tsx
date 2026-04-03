'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err) {
      const msg = (err as AxiosError<{ message: string }>)?.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg-primary flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-secondary border-r border-bg-border flex-col justify-between p-14">
        <div>
          <span className="font-display text-2xl text-text-primary tracking-tight">
            Momentum<span className="text-accent-amber">.</span>
          </span>
        </div>
        <div>
          <blockquote className="font-display text-4xl font-light italic text-text-primary leading-snug mb-6">
            "The secret of getting ahead is getting started."
          </blockquote>
          <p className="text-text-muted text-sm font-mono tracking-widest uppercase">— Mark Twain</p>
        </div>
        <div className="flex gap-3">
          {['bg-accent-amber', 'bg-bg-elevated', 'bg-bg-elevated'].map((c, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${c}`} />
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-10">
            <p className="text-text-muted text-sm font-mono mb-3 tracking-widest uppercase">Welcome back</p>
            <h1 className="font-display text-3xl font-semibold text-text-primary">
              Sign in to Momentum
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-text-secondary mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-11"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-accent-amber hover:text-amber-400 transition-colors font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
