'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { Mail, Lock, Eye, EyeOff, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface ClinicData {
  name: string;
  slug: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  backgroundImage: string | null;
  themeColor: string | null;
}

export default function ClinicDeleteAccountClient({ clinic }: { clinic: ClinicData }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const brandColor = clinic.themeColor || '#0d9488'; // fallback to teal

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmCheckbox) {
      setError('You must confirm that you understand this action is permanent.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 1. Authenticate user credentials first under specific clinic scope
      const authRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          clinicSlug: clinic.slug 
        }),
      });

      const authData = await authRes.json();
      if (!authRes.ok) {
        throw new Error(authData.error || 'Authentication failed. Please verify your email and password.');
      }

      // 2. Double check with confirmation popup
      const result = await Swal.fire({
        title: 'Are you absolutely sure?',
        text: "This will permanently purge your patient profile, diagnostics, photos, and consultation records. This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete my account permanently!',
        cancelButtonText: 'Cancel',
      });

      if (!result.isConfirmed) {
        setIsLoading(false);
        return;
      }

      // 3. Request account deletion
      const deleteRes = await fetch('/api/auth/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const deleteData = await deleteRes.json();
      if (!deleteRes.ok) {
        throw new Error(deleteData.error || 'Failed to delete account.');
      }

      await Swal.fire({
        title: 'Account Deleted Successfully',
        text: 'Your patient account and clinical records have been purged from our servers.',
        icon: 'success',
        confirmButtonColor: brandColor,
      });

      // Redirect back to clinic homepage
      window.location.href = `/clinics/${clinic.slug}`;
    } catch (err: any) {
      setError(err.message || 'An error occurred during account deletion.');
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
            <p className="text-xs text-slate-500 font-semibold mt-1">Self-Service Account Deletion Tool</p>
          </div>
        </div>

        {/* Warning card */}
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex gap-3 text-xs leading-relaxed text-rose-800 font-semibold">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-950 mb-1">Warning: Permanent Deletion</p>
            <p>
              Deleting your patient account permanently purges your diagnostics, Norwood classification reports, and medical consultations. This cannot be recovered.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-100 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email Address</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
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

          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={confirmCheckbox}
              onChange={(e) => setConfirmCheckbox(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
            />
            <span className="text-[11px] leading-relaxed text-slate-600 font-medium select-none">
              I understand that my scalp photos and diagnostic records will be deleted forever and cannot be retrieved.
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isLoading ? 'Purging Account...' : 'Delete My Account Permanently'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href={`/clinics/${clinic.slug}`} className="inline-flex items-center justify-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel and Go Back</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
