import React from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import { ScrollBackground } from '@/components/layout/ScrollBackground';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-x-hidden">
      {/* Scroll React Background Parallax & Gradients */}
      <ScrollBackground />
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-teal-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-10 w-[350px] h-[350px] bg-teal-100/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none -z-20" />
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-bold flex items-center justify-center shadow-md shadow-teal-500/20">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
                Graft<span className="text-teal-600">Desk</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">
                Clinic OS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/features" className="hover:text-teal-600 transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-teal-600 transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-teal-600 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-teal-600 transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-teal-600 transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-sm shadow-md shadow-teal-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16 text-slate-600">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-slate-900">GraftDesk</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              The premier operating system for hair transplant clinics worldwide. Streamline consultations, AI analysis, graft tracking, and post-op care.
            </p>
          </div>
          <div>
            <p className="font-extrabold text-slate-900 mb-4 uppercase text-xs tracking-wider">Product</p>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/features" className="hover:text-teal-600 font-medium">Graft Tracker</Link></li>
              <li><Link href="/features" className="hover:text-teal-600 font-medium">AI Scalp Analysis</Link></li>
              <li><Link href="/features" className="hover:text-teal-600 font-medium">Patient CRM 360</Link></li>
              <li><Link href="/pricing" className="hover:text-teal-600 font-medium">Plans & Pricing</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-extrabold text-slate-900 mb-4 uppercase text-xs tracking-wider">Company</p>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/about" className="hover:text-teal-600 font-medium">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-teal-600 font-medium">Book Demo</Link></li>
              <li><a href="#" className="hover:text-teal-600 font-medium">Security & Compliance</a></li>
              <li><a href="#" className="hover:text-teal-600 font-medium">HIPAA Readiness</a></li>
            </ul>
          </div>
          <div>
            <p className="font-extrabold text-slate-900 mb-4 uppercase text-xs tracking-wider">Medical Trust</p>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-50 border border-teal-100 text-xs text-teal-800 font-semibold">
              <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
              <span>HIPAA Compliant Security & Encrypted Medical Data</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} GraftDesk SaaS Technologies, Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
