'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, Sparkles, BrainCircuit, Calendar, Phone, Mail, ChevronRight, Check } from 'lucide-react';

interface ClinicData {
  name: string;
  slug: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  backgroundImage: string | null;
  featureImage: string | null;
  themeColor: string | null;
}

export default function ClinicHomeClient({ clinic }: { clinic: ClinicData }) {
  const brandColor = clinic.themeColor || '#0d9488'; // fallback to teal

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href={`/clinics/${clinic.slug}`} className="flex items-center gap-3">
            {clinic.logo ? (
              <img 
                src={clinic.logo} 
                alt={`${clinic.name} Logo`} 
                className="h-10 object-contain max-w-[180px]"
              />
            ) : (
              <div 
                style={{ backgroundColor: brandColor }}
                className="w-10 h-10 rounded-xl text-white font-black flex items-center justify-center shadow-md"
              >
                {clinic.name.charAt(0)}
              </div>
            )}
            <span className="font-extrabold text-xl tracking-tight text-slate-900 hidden sm:block">
              {clinic.name}
            </span>
          </Link>

          <Link 
            href={`/clinics/${clinic.slug}/login`}
            style={{ 
              backgroundColor: brandColor,
              boxShadow: `0 4px 14px -4px ${brandColor}`
            }}
            className="px-5 py-2.5 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all"
          >
            Sign In to Portal
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section 
          className="relative py-24 px-6 overflow-hidden bg-cover bg-center"
          style={{ 
            backgroundImage: clinic.backgroundImage 
              ? `url('${clinic.backgroundImage}')` 
              : "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80')" 
          }}
        >
          {/* Glass Overlay */}
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs z-0" />

          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Free Dynamic AI Hair Analysis</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
              Restore Your Hair.<br />
              <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                Regain Your Confidence.
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-100 max-w-2xl mx-auto font-medium leading-relaxed">
              Experience the future of diagnostics at <span className="font-bold text-white">{clinic.name}</span>. Upload a photo of your scalp for Norwood stage identification and graft requirements.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href={`/clinics/${clinic.slug}/hair-test`}
                style={{ 
                  backgroundColor: brandColor,
                  boxShadow: `0 6px 20px -4px ${brandColor}`
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
              >
                <span>Start Free AI Hair Test</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <Link 
                href={`/clinics/${clinic.slug}/login`}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-sm flex items-center justify-center backdrop-blur-md transition-all"
              >
                Patient & Doctor Portal
              </Link>
            </div>
          </div>
        </section>

        {/* Features / Services Section */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl font-black text-slate-900">How Our AI Scalp Analysis Works</h2>
            <p className="text-slate-500 text-sm font-medium">Get diagnostic-grade results in under 60 seconds with 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-lg shadow-slate-100 space-y-5">
              <div 
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
              >
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Take Scalp Photos</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Snap or upload photos of your scalp (hairline, crown, or top) from your phone or desktop. No signup required to start.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-lg shadow-slate-100 space-y-5">
              <div 
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
              >
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Instant AI Diagnosis</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Our advanced Gemini-powered AI detects hair loss patterns, Norwood stages, and estimates target graft requirements.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-lg shadow-slate-100 space-y-5">
              <div 
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
              >
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Expert Treatment Plan</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Connect with the specialized clinical team at {clinic.name} to convert your assessment into a custom surgical plan.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-slate-100 py-20 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900 leading-tight">
                Why Take the Analysis at {clinic.name}?
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Our tools are designed to give patients complete transparency over their hair transplant options.
              </p>
              
              <ul className="space-y-3.5">
                {[
                  'Accurate Norwood-Hamilton classification estimates',
                  'Precise range estimates for grafts needed (Min - Max)',
                  'Direct consultation and messaging with certified doctors',
                  'Track diagnostic reports history in your private Patient Portal',
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Link 
                  href={`/clinics/${clinic.slug}/hair-test`}
                  style={{ backgroundColor: brandColor }}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-90 transition-all"
                >
                  <span>Analyze Your Hair Now</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-2xl relative border border-white/60">
              <img 
                src={clinic.featureImage || "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"} 
                alt={`${clinic.name} Diagnostics`}
                className="w-full h-80  object-cover"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer / Contact Details */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 items-center text-center md:text-left">
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base">{clinic.name}</h4>
            <p className="text-xs max-w-xs text-slate-400 font-medium">
              Leading hair transplant diagnostics and patient management platform.
            </p>
          </div>

          <div className="space-y-3 flex flex-col items-center md:items-start">
            <h5 className="text-slate-300 font-bold text-xs uppercase tracking-wider">Contact Info</h5>
            {clinic.phone && (
              <a href={`tel:${clinic.phone}`} className="flex items-center gap-2 text-xs font-medium hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{clinic.phone}</span>
              </a>
            )}
            {clinic.email && (
              <a href={`mailto:${clinic.email}`} className="flex items-center gap-2 text-xs font-medium hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{clinic.email}</span>
              </a>
            )}
          </div>

          <div className="text-center md:text-right space-y-3">
            <div className="flex justify-center md:justify-end gap-4 text-xs font-bold mb-2">
              <Link href={`/clinics/${clinic.slug}/privacy`} className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href={`/clinics/${clinic.slug}/delete-account`} className="hover:text-white transition-colors">
                Delete Account
              </Link>
            </div>
            <p className="text-xs font-medium">© 2026 {clinic.name}. All rights reserved.</p>
            <p className="text-[10px] text-slate-500 font-medium">Powered by GraftDesk SaaS Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
