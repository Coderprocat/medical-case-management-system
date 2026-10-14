import React, { useState } from 'react';
import { User, UserRole } from '../types.ts';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { SEED_USERS } from '../data/initialData.ts';

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await onLogin(email.trim(), password);
    setLoading(false);

    if (!res.success) {
      setError(res.message || 'Invalid email or password.');
    }
  };

  const handleQuickLogin = async (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
    setLoading(true);
    const res = await onLogin(userEmail, userPass);
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        {/* Minimal Logo */}
        <div className="mx-auto w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-bold text-sm mb-3">
          J
        </div>
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
          Jajal Medical
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Implant Case Management Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white py-6 px-6 sm:px-8 shadow-xs rounded-xl border border-zinc-200/80 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="name@jajalmedical.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white font-medium text-xs transition-colors shadow-xs"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Logins for Reviewers */}
          <div className="pt-4 border-t border-zinc-100">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              1-Click Demo Accounts:
            </span>

            <div className="space-y-1.5">
              {SEED_USERS.map((seed) => (
                <button
                  key={seed.id}
                  type="button"
                  onClick={() => handleQuickLogin(seed.email, seed.passwordHash)}
                  className="w-full p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-left transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-medium text-zinc-900">
                        {seed.name}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded uppercase bg-zinc-100 text-zinc-700">
                        {seed.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      {seed.email}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-800 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-zinc-400">
          Medical Device Case Management Assignment • Oct 8, 2026 @Jajal Medical
        </p>
      </div>
    </div>
  );
};
