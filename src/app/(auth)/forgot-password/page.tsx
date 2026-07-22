'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-sans bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80')" }}
    >
      <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-xs z-0" />
      <div className="w-full max-w-md rounded-3xl bg-white/95 border border-white/60 p-8 shadow-2xl space-y-6 relative z-10 backdrop-blur-md">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-bold flex items-center justify-center shadow-md shadow-teal-500/20">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Graft<span className="text-teal-600">Desk</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500 font-medium">Reset your clinic account password</p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Password Reset Email Sent</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              If an account exists for <span className="text-slate-900 font-bold">{email}</span>, you will receive a secure reset link shortly.
            </p>
            <Link href="/login" className="inline-block text-xs font-bold text-teal-600 hover:underline pt-2">
              Return to Login
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@apexhair.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>Send Reset Instructions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link href="/login" className="text-xs text-slate-500 hover:text-slate-900 transition-colors font-semibold">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
