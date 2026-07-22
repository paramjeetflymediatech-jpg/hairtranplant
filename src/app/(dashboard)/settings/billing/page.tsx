'use client';

import React from 'react';
import { CreditCard, ShieldCheck, Check, Sparkles, Zap } from 'lucide-react';

export default function SubscriptionBillingPage() {
  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Subscription & Billing Management</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Manage your clinic plan, seat limits, storage tier, and invoice history.</p>
      </div>

      {/* Current Plan Overview */}
      <div className="p-6 rounded-3xl bg-white border border-teal-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">Current Active Plan</span>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            Professional Plan <Sparkles className="w-5 h-5 text-teal-600" />
          </h2>
          <p className="text-xs text-slate-500 font-medium">$299 / month • Renews annually on Jan 01, 2027</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20">
            Upgrade to Enterprise
          </button>
        </div>
      </div>

      {/* Usage meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">Doctor Seats Used</span>
            <span className="text-slate-900 font-bold">2 / 10 Seats</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full w-1/5" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">Patient Records</span>
            <span className="text-emerald-600 font-bold">428 / Unlimited</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full w-full" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">AI Scalp Scans</span>
            <span className="text-teal-600 font-bold">184 Scans</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
