'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Scissors,
  Users,
  Award,
  ShieldCheck,
  Clock,
  Play,
  Phone,
  MapPin,
  Activity,
  Heart,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { BeforeAfterSlider } from '@/components/gallery/BeforeAfterSlider';

export default function ClinicLandingPage() {
  const [severity, setSeverity] = useState<'moderate' | 'severe'>('moderate');

  const treatments = [
    {
      title: 'Sapphire FUE Transplant',
      desc: 'Follicular Unit Extraction using premium V-shaped sapphire blades. Reduces tissue damage, accelerates healing, and allows ultra-high density placement of up to 55 grafts/cm².',
      icon: Scissors,
      badge: 'Most Popular',
    },
    {
      title: 'DHI Direct Implantation',
      desc: 'Direct Hair Implantation utilizing specialized Choi Implanter pens. Bypasses pre-made incisions to insert hair follicles directly, controlling angle, depth, and direction for natural results.',
      icon: Sparkles,
      badge: 'Aesthetic Precision',
    },
    {
      title: 'PRP & GFC Hair Rejuvenation',
      desc: 'Non-surgical therapy utilizing Platelet-Rich Plasma and Growth Factor Concentrate. Revitalizes miniaturized follicles, strengthens weak roots, and controls active hair shedding.',
      icon: Activity,
      badge: 'Non-Surgical',
    },
    {
      title: 'Donor Area Optimization',
      desc: 'Smart harvesting methodologies to protect your back donor area from over-extraction. Ensures that donor supply remains uniform, healthy, and visually pristine for life.',
      icon: ShieldCheck,
      badge: 'Care Protocol',
    },
    {
      title: 'AI Scalp Diagnostics',
      desc: 'Instant computer-vision analysis of hair loss stages (Norwood Scale I-VII), hair density assessment, and exact follicular graft estimation in under 10 seconds.',
      icon: Award,
      badge: 'Advanced Tech',
    },
    {
      title: 'WhatsApp Recovery Tracker',
      desc: 'Automated digital post-op tracking. Receive step-by-step progress reviews, wash guides, and direct surgeon assistance on WhatsApp at Day 1, 7, 15, and Month 1, 3, 6, 9, and 12.',
      icon: Clock,
      badge: '24/7 Patient Care',
    },
  ];

  return (
    <div className="space-y-24 py-12 bg-slate-50/50">
      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 pt-12 pb-16 text-center space-y-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-teal-150/30 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-xs">
          <Award className="w-4 h-4 text-teal-600" />
          <span>India&apos;s Leading AI-Powered Hair Transplant Institute</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-5xl mx-auto">
          Restore Your Hair. <br />
          <span className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 bg-clip-text text-transparent">Reclaim Your Confidence.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
          Welcome to ASG Hair Transplant Clinic. We combine surgical artistry with advanced AI scalp diagnostics to deliver permanent, natural, and dense hair restoration.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/hair-test"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-base shadow-lg shadow-teal-500/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-emerald-100 animate-pulse" />
            <span>Take Free AI Hair Test</span>
          </Link>
          <Link
            href="/portal"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Patient Portal Login</span>
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-base shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4 text-slate-600" />
            <span>Call Clinic</span>
          </Link>
        </div>

        {/* CLINIC STATISTICS */}
        <div className="pt-12 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 text-left">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Successful Cases</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">10,000+</p>
              <span className="text-[10px] text-teal-600 font-bold">Jalandhar Clinic Registry</span>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Follicle Survival Rate</p>
              <p className="text-3xl font-extrabold text-teal-600 mt-1">99.2%</p>
              <span className="text-[10px] text-slate-500 font-medium">Verified by graft counters</span>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Average Density</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">50 G/cm²</p>
              <span className="text-[10px] text-emerald-600 font-bold">Ultra-high density sapphire</span>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">WhatsApp Follow-ups</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">12 Months</p>
              <span className="text-[10px] text-slate-500 font-medium">Post-op growth tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT CLINIC SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Our Jalandhar Head Clinic</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              State-of-the-Art Hair Restoration Facility
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base font-medium">
              Located at <strong>6-A, Lajpat Nagar, Link Road, Jalandhar, Punjab</strong>, our clinic is equipped with modular surgical suites, advanced high-magnification stereomicroscopes, and specialized Choi implanters. 
            </p>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base font-medium">
              Every surgery is conducted under stringent hygiene protocols, utilizing sterilized single-use tools, ensuring a pain-free local anesthesia experience and seamless recovery.
            </p>

            <div className="space-y-3 pt-2">
              {[
                'Certified Senior Surgeons with 15+ years of micro-graft experience',
                'Advanced digital trichoscopy for donor area supply mapping',
                'Dedicated 24/7 post-operative WhatsApp care and daily wash tracking',
                'Natural hairline design matching facial structure and donor density',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs md:text-sm text-slate-700 font-semibold">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">ASG Clinical Advisory</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Dr. Alexander Vance, MD & Lead Surgeon</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                100% Medical Safety
              </span>
            </div>

            <div className="space-y-4 text-left text-xs">
              <p className="text-slate-300 leading-relaxed font-medium">
                &ldquo;At ASG Hair Clinic, we do not believe in standard templates. Every hairline is manually designed to match the patient&apos;s age, ethnicity, and future hair loss progression. Using AI scalp scans, we can exactly map donor availability to prevent donor area depletion.&rdquo;
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium">Consultation Fee</span>
                  <p className="font-extrabold text-white text-sm mt-0.5">FREE via AI</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium">Surgical Technique</span>
                  <p className="font-extrabold text-teal-400 text-sm mt-0.5">Sapphire FUE & DHI</p>
                </div>
              </div>
            </div>

            <Link
              href="/hair-test"
              className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Get Your AI Diagnosis Now</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* BEFORE & AFTER SHOWCASE */}
      <section className="max-w-7xl mx-auto px-6 py-12 text-center space-y-8 border-t border-slate-200">
        <div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Verified Clinical Results</h2>
          <p className="text-slate-500 text-sm md:text-base mt-2 font-medium">
            Slide the divider to compare patient scalp thinning against successful post-op transplant outcomes.
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
              beforeLabel="Pre-Op Base Scan (Norwood IV)"
              afterLabel="Month 6 Maturation (3,120 Grafts)"
            />
          ) : (
            <BeforeAfterSlider
              beforeUrl="/images/showcase/before_severe.png"
              afterUrl="/images/showcase/after_severe.png"
              beforeLabel="Pre-Op Base Scan (Norwood VI)"
              afterLabel="Month 12 Final Out (4,850 Grafts)"
            />
          )}
        </div>
      </section>

      {/* TREATMENTS & PROTOCOLS */}
      <section className="max-w-7xl mx-auto px-6 py-12 space-y-12 border-t border-slate-200">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Our Treatments & Patient Protocols</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base font-medium">
            Explore our advanced surgical options, diagnostic models, and post-operative digital support systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {treatments.map((t, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-teal-500/40 transition-all duration-300 shadow-xs hover:shadow-lg group hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <t.icon className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full uppercase border border-teal-200">
                  {t.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t.title}</h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CLINICAL WHATSAPP TRACKING ADVANTAGE */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-teal-850 to-emerald-950 text-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-teal-800">
          <div className="lg:col-span-8 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase border border-emerald-400/20">
              <Clock className="w-3.5 h-3.5" />
              <span>Real-Time Patient Support</span>
            </div>
            <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              12-Month Post-Op WhatsApp Tracking Protocol
            </h3>
            <p className="text-teal-100/90 text-xs md:text-sm leading-relaxed font-medium max-w-2xl">
              Following your procedure, our automated WhatsApp tracking system checks in on your graft recovery. You will receive customized message triggers to upload progress photos, receive wash instructions, and directly consult Dr. Vance at critical milestones (Day 1, 7, 15, and Month 1, 3, 6, 9, 12).
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-emerald-300 pt-2">
              <span>✓ Prefilled Photo Checklists</span>
              <span>✓ Direct Surgeon Audits</span>
              <span>✓ Personalized Growth Milestones</span>
            </div>
          </div>
          <div className="lg:col-span-4 flex justify-end">
            <Link
              href="/hair-test"
              className="w-full lg:w-auto px-8 py-4 rounded-2xl bg-white text-slate-900 font-black text-center text-sm shadow-md hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <span>Take Test & Enable Tracking</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT THE TEAM */}
      <section className="max-w-7xl mx-auto px-6 py-12 text-center space-y-12 border-t border-slate-200">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Our Expert Surgical Team</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base font-medium">
            Dedicated hair transplant specialists who combine clinical rigor with meticulous graft placement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-slate-100 mx-auto overflow-hidden border-2 border-teal-500/30">
              <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80" alt="Dr. Alexander Vance" className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">Dr. Alexander Vance, MD</h4>
              <p className="text-xs text-teal-700 font-bold uppercase tracking-wider mt-0.5">Chief Hair Transplant Surgeon</p>
              <p className="text-xs text-slate-500 font-semibold mt-2 px-4">
                Specialized in high-density Sapphire FUE micro-grafting. Over 12 years of experience in custom hairline restoration and crown density restructuring.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-slate-100 mx-auto overflow-hidden border-2 border-teal-500/30">
              <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80" alt="Dr. Paramjeet Singh" className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">Dr. Paramjeet Singh, MS</h4>
              <p className="text-xs text-teal-700 font-bold uppercase tracking-wider mt-0.5">Senior Choi DHI Specialist</p>
              <p className="text-xs text-slate-500 font-semibold mt-2 px-4">
                Pioneer in Choi Implanter DHI procedures in Punjab. Passionate about natural angle recreation, temples reconstruction, and female hair restoration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-5xl mx-auto px-6 py-12 text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-b from-teal-50 to-white border border-teal-200 shadow-xl space-y-6 relative overflow-hidden">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ready to restoration? Find your Norwood loss stage now.
          </h2>
          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto font-medium">
            Get an instant, visual computer-vision analysis of your scalp and estimated grafts without visiting the clinic. It takes less than 1 minute.
          </p>
          <div className="pt-2">
            <Link
              href="/hair-test"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-550 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-base shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-1"
            >
              <span>Take Free AI Hair Test</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
