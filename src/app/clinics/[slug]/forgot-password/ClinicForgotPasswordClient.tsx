'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface ClinicData {
  name: string;
  slug: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  backgroundImage: string | null;
  themeColor: string | null;
}

export default function ClinicForgotPasswordClient({ clinic }: { clinic: ClinicData }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [debugLink, setDebugLink] = useState('');

  const brandColor = clinic.themeColor || '#0d9488'; // fallback to teal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset instructions.');
      }

      setSubmitted(true);
      if (data.debugLink) {
        setDebugLink(data.debugLink);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
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
            <p className="text-xs text-slate-500 font-semibold mt-1">Patient Portal Password Reset</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Password Reset Requested</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              If an account exists for <span className="text-slate-900 font-bold">{email}</span>, you will receive a secure reset link shortly.
            </p>
            {debugLink && (
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-left text-xs font-semibold text-slate-700">
                <span className="font-bold block text-slate-800 mb-1">🛠️ Developer Reset Link:</span>
                <Link href={debugLink} className="underline break-all hover:text-slate-900 text-[10px]">
                  {debugLink}
                </Link>
              </div>
            )}
            <Link 
              href={`/clinics/${clinic.slug}/login`}
              style={{ color: brandColor }}
              className="inline-block text-xs font-bold hover:underline pt-2"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-100 rounded-lg text-rose-600 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="patient@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: brandColor }}
              className="w-full py-3 rounded-xl hover:opacity-90 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <span>{isLoading ? 'Sending...' : 'Send Reset Instructions'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link href={`/clinics/${clinic.slug}/login`} className="text-xs text-slate-500 hover:text-slate-900 transition-colors font-semibold flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
