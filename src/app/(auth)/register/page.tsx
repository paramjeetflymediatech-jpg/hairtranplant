'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, ArrowRight, CheckCircle2, Building2, User, CreditCard, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState<'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'>('PROFESSIONAL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, clinicName, phone, plan }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80')" }}
    >
      <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-xs z-0" />
      
      <div className="w-full max-w-5xl rounded-3xl bg-white/95 border border-white/60 shadow-2xl relative z-10 backdrop-blur-md grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Column: Image (Visible on md screens and up) */}
        <div 
          className="hidden md:block relative bg-cover bg-center min-h-[520px]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-teal-950/90 via-teal-900/40 to-transparent flex flex-col justify-end p-8 text-white">
            <h3 className="text-xl font-extrabold tracking-tight">Modernize Your Hair Clinic</h3>
            <p className="text-xs text-slate-200 mt-2 font-medium leading-relaxed">
              Get started with GraftDesk's AI-assisted hair loss Norwood scale analysis, precision graft counters, and automated post-op follow-ups.
            </p>
          </div>
        </div>

        {/* Right Column: Register Form */}
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
            <p className="text-xs text-slate-500 font-medium">Register your clinic operating system</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs font-semibold">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-teal-600 font-bold' : 'text-slate-400'}`}>
              <User className="w-4 h-4" /> <span>1. Account</span>
            </div>
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-teal-600 font-bold' : 'text-slate-400'}`}>
              <Building2 className="w-4 h-4" /> <span>2. Clinic</span>
            </div>
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-teal-600 font-bold' : 'text-slate-400'}`}>
              <CreditCard className="w-4 h-4" /> <span>3. Plan</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* STEP 1: Account Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  placeholder="Dr. Sarah Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  placeholder="dr.vance@beverlyhair.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
              <button
                onClick={() => {
                  if (name && email && password) setStep(2);
                  else setError('Please fill out all fields');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Next: Clinic Information</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Clinic Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinic / Medical Practice Name</label>
                <input
                  type="text"
                  placeholder="Beverly Hills Hair Institute"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinic Phone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (clinicName) setStep(3);
                    else setError('Clinic name is required');
                  }}
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Next: Select Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Select Plan */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div
                  onClick={() => setPlan('STARTER')}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                    plan === 'STARTER' ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 bg-slate-50/55'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900">Starter Plan</p>
                    <p className="text-[10px] text-slate-500 font-medium">Up to 2 Seats • $149/mo</p>
                  </div>
                  {plan === 'STARTER' && <CheckCircle2 className="w-5 h-5 text-teal-600 animate-scaleIn" />}
                </div>

                <div
                  onClick={() => setPlan('PROFESSIONAL')}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                    plan === 'PROFESSIONAL' ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 bg-slate-50/55'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      Professional Plan <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">Up to 10 Seats • Full AI Suite • $299/mo</p>
                  </div>
                  {plan === 'PROFESSIONAL' && <CheckCircle2 className="w-5 h-5 text-teal-600 animate-scaleIn" />}
                </div>

                <div
                  onClick={() => setPlan('ENTERPRISE')}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                    plan === 'ENTERPRISE' ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 bg-slate-50/55'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900">Enterprise Plan</p>
                    <p className="text-[10px] text-slate-500 font-medium">Custom Integrations • SLA • $599/mo</p>
                  </div>
                  {plan === 'ENTERPRISE' && <CheckCircle2 className="w-5 h-5 text-teal-600 animate-scaleIn" />}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Complete Register'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="text-center pt-2 space-y-2">
            <p className="text-xs text-slate-500 font-medium">
              Already registered?{' '}
              <Link href="/login" className="text-teal-600 font-bold hover:underline">
                Sign In
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
