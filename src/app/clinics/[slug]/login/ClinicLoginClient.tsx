'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface ClinicData {
  name: string;
  slug: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  backgroundImage: string | null;
  themeColor: string | null;
}

export default function ClinicLoginClient({ clinic }: { clinic: ClinicData }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const brandColor = clinic.themeColor || '#0d9488'; // fallback to teal

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          clinicSlug: clinic.slug 
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Redirect depending on user role
      if (data.user.role === 'SUPER_ADMIN') {
        router.push('/super-admin');
      } else if (data.user.role === 'PATIENT') {
        router.push('/portal');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-sans bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: clinic.backgroundImage 
          ? `url('${clinic.backgroundImage}')` 
          : "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80')" 
      }}
    >
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-xs z-0" />
      
      <div className="w-full max-w-md rounded-3xl bg-white/95 border border-white/60 p-8 shadow-2xl space-y-6 relative z-10 backdrop-blur-md">
        
        {/* Clinic branding details */}
        <div className="text-center space-y-3">
          {clinic.logo ? (
            <img 
              src={clinic.logo} 
              alt={`${clinic.name} Logo`} 
              className="h-16 mx-auto object-contain max-w-[200px]"
            />
          ) : (
            <div 
              style={{ backgroundColor: brandColor }}
              className="w-12 h-12 rounded-xl text-white font-black flex items-center justify-center shadow-lg mx-auto"
            >
              {clinic.name.charAt(0)}
            </div>
          )}
          
          <div>
            <h1 className="font-extrabold text-2xl tracking-tight text-slate-900">
              {clinic.name}
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">Sign in to your patient & staff portal</p>
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
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <Link 
                href={`/clinics/${clinic.slug}/forgot-password`}
                style={{ color: brandColor }}
                className="text-[11px] hover:underline font-bold"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: brandColor }}
            className="w-full py-3.5 rounded-xl hover:opacity-90 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href={`/clinics/${clinic.slug}`} className="inline-block text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
