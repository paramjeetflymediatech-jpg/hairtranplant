'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Scissors,
  Users,
  GitMerge,
  ShieldCheck,
  Clock,
  Award,
  CheckCircle,
  Play
} from 'lucide-react';
import { BeforeAfterSlider } from '@/components/gallery/BeforeAfterSlider';

export default function MarketingLandingPage() {
  const [severity, setSeverity] = useState<'moderate' | 'severe'>('moderate');
  const features = [
    {
      title: 'AI Hair Loss & Graft Calculator',
      desc: 'Instant computer-vision analysis determining Norwood stage, donor area density, and precise graft requirements.',
      icon: Sparkles,
    },
    {
      title: 'Surgical Graft Precision Counter',
      desc: 'Real-time extraction & implantation tracking across Single, Double, Triple, and Multi-follicular units.',
      icon: Scissors,
    },
    {
      title: 'Patient CRM & 360 Timeline',
      desc: 'Track patient journey from initial ad lead to consultation, procedure, and 12-month post-op results.',
      icon: Users,
    },
    {
      title: 'Kanban Lead Pipeline',
      desc: 'Convert high-ticket hair restoration leads with automated stage updates, SMS reminders, and consultation booking.',
      icon: GitMerge,
    },
    {
      title: 'Automated Post-Op Follow-Up Engine',
      desc: 'Scheduled check-ins at Day 1, 7, 15, Month 1, 3, 6, 9, and 12 with photo submission requests.',
      icon: Clock,
    },
    {
      title: 'HIPAA & GDPR Compliant Storage',
      desc: 'End-to-end encrypted medical photo vaults with patient privacy consent management.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-24 py-12">
      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 pt-12 pb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold shadow-xs">
          <Award className="w-4 h-4 text-teal-600" />
          <span>The World&apos;s #1 Clinic OS for Hair Restoration Specialists</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Run Your Hair Transplant Clinic Like a <span className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 bg-clip-text text-transparent">Modern Healthcare Business</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
          Manage leads, patients, consultations, surgeries, grafts, follow-ups, and patient outcomes in one intelligent platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/hair-test"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-base shadow-lg shadow-teal-500/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-emerald-100" />
            <span>Take Free AI Hair Test</span>
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Start Free Trial</span>
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-base shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-700" />
            <span>Book a Demo</span>
          </Link>
        </div>

        {/* HERO DASHBOARD PREVIEW */}
        <div className="relative pt-12 max-w-6xl mx-auto">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl p-4 md:p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-mono text-slate-400">graftdesk.app/dashboard</span>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Live Clinic Environment
              </span>
            </div>

            {/* Dashboard Mock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 text-left">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-xs text-slate-500 font-medium">Total Surgeries YTD</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">428</p>
                <span className="text-[10px] text-emerald-600 font-bold">+18.4% from last month</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-xs text-slate-500 font-medium">Grafts Implanted</p>
                <p className="text-2xl font-extrabold text-teal-600 mt-1">1,248,500</p>
                <span className="text-[10px] text-slate-500 font-medium">Avg 2,910 / surgery</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-xs text-slate-500 font-medium">Lead Conversion Rate</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">42.8%</p>
                <span className="text-[10px] text-emerald-600 font-bold">+6.2% post-AI adoption</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-xs text-slate-500 font-medium">Monthly Revenue</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">$284,500</p>
                <span className="text-[10px] text-slate-500 font-medium">Active clinic pipeline</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI HAIR ANALYSIS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Proprietary Computer Vision</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              AI-Assisted Scalp & Graft Estimation
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base font-medium">
              Upload patient donor and crown photos to generate automated Norwood scale classification, hair density indexes (grafts/cm²), and expected graft ranges in under 10 seconds.
            </p>

            <div className="space-y-3 pt-2">
              {[
                'Automated Norwood Scale Classification (I - VII)',
                'Donor Area Quality Rating & Follicular Supply Score',
                'Procedure Recommendation Rationale (FUE / DHI / FUT)',
                'AI-Assisted Estimate with Qualified Medical Verification',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs md:text-sm text-slate-700 font-semibold">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">AI Analysis Report #891</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Patient: Michael Vance</p>
                </div>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                95.4% Confidence
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-medium">Norwood Loss Stage</span>
                <p className="font-extrabold text-slate-900 text-base mt-0.5">Norwood IV</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-medium">Graft Estimate Range</span>
                <p className="font-extrabold text-teal-600 text-base mt-0.5">2,900 - 3,300 Grafts</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-medium">Donor Density</span>
                <p className="font-bold text-slate-800 mt-0.5">68 grafts / cm²</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-medium">Recommended Tech</span>
                <p className="font-bold text-emerald-600 mt-0.5">Motorized Sapphire FUE</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-semibold leading-snug">
              ⚠️ AI-assisted estimate — final treatment decisions must be verified by a qualified medical professional.
            </div>
          </div>
        </div>
      </section>

      {/* BEFORE & AFTER SHOWCASE */}
      <section className="max-w-7xl mx-auto px-6 py-12 text-center space-y-8">
        <div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">Interactive Patient Results Showcase</h2>
          <p className="text-slate-500 text-sm md:text-base mt-2 font-medium">
            Compare Day 0 pre-op hair loss design against post-op hair transplant restoration.
          </p>
        </div>

        {/* Severity Toggle Selector */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setSeverity('moderate')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              severity === 'moderate'
                ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Moderate Thinning (Norwood IV)
          </button>
          <button
            onClick={() => setSeverity('severe')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              severity === 'severe'
                ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Severe Baldness (Norwood VI)
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          {severity === 'moderate' ? (
            <BeforeAfterSlider
              beforeUrl="/images/showcase/before.png"
              afterUrl="/images/showcase/after.png"
              beforeLabel="Before FUE Procedure (Norwood IV)"
              afterLabel="Month 6 Result (3,120 Grafts Implanted)"
            />
          ) : (
            <BeforeAfterSlider
              beforeUrl="/images/showcase/before_severe.png"
              afterUrl="/images/showcase/after_severe.png"
              beforeLabel="Before FUE Procedure (Severe Norwood VI)"
              afterLabel="Month 12 Result (4,850 Grafts Implanted)"
            />
          )}
        </div>
      </section>

      {/* FEATURE SUITE GRID */}
      <section className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">Engineered for Premier Hair Clinics</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base font-medium">
            Replace fragmented tools with one dedicated operating system built specifically for hair transplant workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-teal-500/40 transition-all duration-300 shadow-xs hover:shadow-lg group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-5xl mx-auto px-6 py-12 text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-b from-teal-50 to-white border border-teal-200 shadow-xl space-y-6 relative overflow-hidden">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Ready to elevate your hair transplant practice?
          </h2>
          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto font-medium">
            Join leading hair restoration clinics using GraftDesk to automate consultations, increase surgery conversions, and deliver world-class patient outcomes.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-base shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-1"
            >
              <span>Start Free 14-Day Trial</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
