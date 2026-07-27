'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface ClinicData {
  name: string;
  slug: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  backgroundImage: string | null;
  themeColor: string | null;
}

export default function ClinicResetPasswordClient({ clinic }: { clinic: ClinicData }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const brandColor = clinic.themeColor || '#0d9488'; // fallback to teal

  useEffect(() => {
    if (!token) {
      setError('Invalid request. No password reset token was found in the link URL.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
            <p className="text-xs text-slate-500 font-semibold mt-1">Create your new password</p>
          </div>
        </div>

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm font-sans">Password Reset Completed</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Your password has been successfully updated. You can now use your new password to log in.
            </p>
            <Link 
              href={`/clinics/${clinic.slug}/login`}
              style={{ backgroundColor: brandColor }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-colors w-full"
            >
              <span>Return to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs flex gap-3 leading-relaxed font-semibold">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={!token}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  disabled={!token}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              style={{ backgroundColor: brandColor }}
              className="w-full py-3.5 rounded-xl hover:opacity-90 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Resetting password...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
