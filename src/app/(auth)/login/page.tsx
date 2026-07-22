'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@apexhair.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user.role === 'SUPER_ADMIN') {
        router.push('/super-admin');
      } else if (data.user.role === 'PATIENT') {
        router.push('/portal');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setDemoRole = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-sans bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80')" }}
    >
      <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-xs z-0" />
      
      <div className="w-full max-w-4xl rounded-3xl bg-white/95 border border-white/60 shadow-2xl relative z-10 backdrop-blur-md grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Column: Image (Visible on md screens and up) */}
        <div 
          className="hidden md:block relative bg-cover bg-center min-h-[480px]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-teal-950/90 via-teal-900/40 to-transparent flex flex-col justify-end p-8 text-white">
            <h3 className="text-xl font-extrabold tracking-tight">Apex Hair Clinic OS</h3>
            <p className="text-xs text-slate-200 mt-2 font-medium leading-relaxed">
              Precision surgical counters, real-time follicular unit graft tracking, and AI-assisted scalp diagnostics designed for elite clinics.
            </p>
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="p-8 space-y-6 flex flex-col justify-center">
          {/* Brand Banner */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-bold flex items-center justify-center shadow-md shadow-teal-500/20">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                Graft<span className="text-teal-600">Desk</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 font-medium">Sign in to your clinic operating system</p>
          </div>

          {/* Demo Fast Login Selector */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
              ⚡ Demo Instant Sign-In Options:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setDemoRole('admin@apexhair.com')}
                className="p-2 rounded-xl bg-white hover:bg-teal-100 text-slate-800 text-left border border-slate-200 hover:border-teal-300 shadow-2xs"
              >
                👑 Clinic Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoRole('dr.smith@apexhair.com')}
                className="p-2 rounded-xl bg-white hover:bg-teal-100 text-slate-800 text-left border border-slate-200 hover:border-teal-300 shadow-2xs"
              >
                🩺 Lead Surgeon
              </button>
              <button
                type="button"
                onClick={() => setDemoRole('michael.patient@gmail.com')}
                className="p-2 rounded-xl bg-white hover:bg-teal-100 text-slate-800 text-left border border-slate-200 hover:border-teal-300 shadow-2xs"
              >
                🧑 Patient Portal
              </button>
              <button
                type="button"
                onClick={() => setDemoRole('superadmin@graftdesk.com')}
                className="p-2 rounded-xl bg-white hover:bg-rose-100 text-slate-800 text-left border border-slate-200 hover:border-rose-300 shadow-2xs"
              >
                🛡️ Super Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-[11px] text-teal-600 hover:underline font-bold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 space-y-2">
            <p className="text-xs text-slate-500 font-medium">
              Don&apos;t have a clinic account?{' '}
              <Link href="/register" className="text-teal-600 font-bold hover:underline">
                Register Clinic
              </Link>
            </p>
            <Link href="/" className="inline-block text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
