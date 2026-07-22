'use client';

import React from 'react';
import { BeforeAfterSlider } from '@/components/gallery/BeforeAfterSlider';
import { ShieldCheck, Sparkles, Eye, CheckCircle2 } from 'lucide-react';

export default function GalleryPage() {
  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Before & After Surgical Outcome Showcase</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">High-definition patient photo outcomes & marketing privacy consent management.</p>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Patient: Michael Vance</h3>
            <p className="text-xs text-slate-500 font-medium">FUE 3,120 Grafts • Motorized Sapphire Technique</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Public Marketing Consent Signed
          </span>
        </div>

        <BeforeAfterSlider
          beforeUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80"
          afterUrl="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80"
          beforeLabel="Day 0 Hairline Marking (Norwood IV)"
          afterLabel="Month 6 Full Density Maturation"
        />
      </div>
    </div>
  );
}
