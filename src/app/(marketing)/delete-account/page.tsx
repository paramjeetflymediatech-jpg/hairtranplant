'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Authenticate the user first to make sure they own the account
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(loginData.error || 'Invalid credentials. Please verify your email and password.');
      }

      // 2. Perform Account Deletion (this endpoint deletes patient record, user record, and clears session cookie)
      const deleteRes = await fetch('/api/auth/me', {
        method: 'DELETE',
      });

      const deleteData = await deleteRes.json();

      if (!deleteRes.ok) {
        throw new Error(deleteData.error || 'Authentication succeeded, but failed to perform account deletion.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during account deletion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <Link href="/privacy" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-semibold mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Privacy Policy</span>
      </Link>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-rose-50 text-rose-600 mb-6">
          <Trash2 className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-2">Delete Your Account</h1>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Permamently delete your ASG Hair Transplant patient portal account and all associated medical data.
        </p>

        {success ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm flex gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Account Successfully Deleted</p>
                <p className="mt-1 text-xs opacity-90">
                  Your profile, uploaded scalp photos, hair analyses, and medical history have been permanently purged from our database.
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="block w-full py-3 rounded-xl bg-slate-950 text-white font-bold text-center text-sm hover:bg-slate-900 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-xs flex gap-3 mb-2 leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Warning:</strong> This action is permanent. All hair analyses, photo records, and details will be destroyed and cannot be recovered.
              </p>
            </div>

            {error && (
              <div className="p-3 text-xs bg-rose-50 text-rose-600 border border-rose-100 rounded-lg font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-500/20 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? 'Processing Deletion...' : 'Permanently Delete Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
