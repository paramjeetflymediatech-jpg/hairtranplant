import React from 'react';
import Link from 'next/link';
import { Activity, UserCheck } from 'lucide-react';

export default function PatientPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/portal" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-bold flex items-center justify-center shadow-md shadow-teal-500/20">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                Graft<span className="text-teal-600">Desk</span>
              </span>
              <span className="text-[9px] uppercase font-bold text-teal-700">Patient Portal</span>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline text-slate-500 font-semibold">Apex Hair Institute</span>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-8">{children}</main>
    </div>
  );
}
