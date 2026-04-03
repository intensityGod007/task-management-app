'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { AxiosError } from 'axios';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      router.replace('/dashboard');
    } catch (err) {
      const axErr = err as AxiosError<{ message: string }>;
      toast.error(axErr?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-accent-red', 'bg-amber-400', 'bg-accent-green'];

  return (
    <main className="min-h-screen bg-bg-primary flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-secondary border-r border-bg-border flex-col justify-between p-14">
        <div>
          <span className="font-display text-2xl text-text-primary tracking-tight">
            Momentum<span className="text-accent-amber">.</span>
          </span>
        </div>
        <div className="space-y-6">
          {[
            { label: 'Focused', desc: 'One place for every task, deadline, and idea.' },
            { label: 'Structured', desc: 'Priorities, statuses, and smart filtering built in.' },
            { label: 'Yours', desc: 'Private by design — your tasks, your space.' },
          ].map((f) => (
            <div key={f.label} className="flex gap-4 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-amber mt-2.5 shrink-0" />
              <div>
                <p className="text-text-primary font-medium text-sm">{f.label}</p>
                <p className="text-text-muted text-sm mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          {['bg-bg-elevated', 'bg-accent-amber', 'bg-bg-elevated'].map((c, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${c}`} />
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-10">
            <p className="text-text-muted text-sm font-mono mb-3 tracking-widest uppercase">Get started</p>
            <h1 className="font-display text-3xl font-semibold text-text-primary">
              Create your account
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-text-secondary mb-2">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Alex Johnson"
                required
                minLength={2}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
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
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? strengthColor[strength] : 'bg-bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-text-muted">{strengthLabel[strength]}</span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Create account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-accent-amber hover:text-amber-400 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
