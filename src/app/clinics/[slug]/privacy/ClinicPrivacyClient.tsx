'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Trash2, Eye } from 'lucide-react';

interface ClinicData {
  name: string;
  slug: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  backgroundImage: string | null;
  themeColor: string | null;
}

export default function ClinicPrivacyClient({ clinic }: { clinic: ClinicData }) {
  const brandColor = clinic.themeColor || '#0d9488'; // fallback to teal

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between">
      {/* Clinic Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href={`/clinics/${clinic.slug}`} className="flex items-center gap-3">
            {clinic.logo ? (
              <img 
                src={clinic.logo} 
                alt={`${clinic.name} Logo`} 
                className="h-9 object-contain max-w-[150px]"
              />
            ) : (
              <div 
                style={{ backgroundColor: brandColor }}
                className="w-8 h-8 rounded-lg text-white font-black flex items-center justify-center text-xs shadow-md"
              >
                {clinic.name.charAt(0)}
              </div>
            )}
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              {clinic.name}
            </span>
          </Link>

          <Link 
            href={`/clinics/${clinic.slug}`}
            className="text-xs text-slate-500 hover:text-slate-900 transition-colors font-semibold flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Privacy Policy Content */}
      <main className="flex-1 py-12 px-6">
        <article className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/60 p-8 md:p-12 shadow-xl shadow-slate-100/50 space-y-8">
          
          <div className="space-y-3 border-b border-slate-100 pb-6">
            <div 
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
            >
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">Privacy Policy</h1>
            <p className="text-xs text-slate-400 font-bold">Last Updated: July 27, 2026</p>
          </div>

          <div className="prose prose-slate text-xs leading-relaxed text-slate-600 font-medium space-y-6">
            
            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-slate-900" style={{ backgroundColor: brandColor }} />
                1. Information We Collect
              </h2>
              <p>
                At <span className="font-semibold text-slate-900">{clinic.name}</span>, your privacy is paramount. In providing our AI-assisted hair diagnostics, we collect and store:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Your name, registered email address, and phone number.</li>
                <li>Scalp photographs and imagery uploaded for Norwood diagnostic analysis.</li>
                <li>AI analysis reports, including graft requirements, density estimations, and recommendation history.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-slate-900" style={{ backgroundColor: brandColor }} />
                2. How We Use Your Data
              </h2>
              <p>
                We use the data collected to deliver instant hair loss diagnostics, custom Norwood stage predictions, and tailored treatment recommendations. Your clinical data and analysis photographs will only be visible to you and our internal authorized practitioners for diagnosis.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-slate-900" style={{ backgroundColor: brandColor }} />
                3. Security and Storage
              </h2>
              <p>
                All data, including images and AI assessment metadata, are stored in encrypted databases. We implement industry-leading encryption and network monitoring protocols to ensure your sensitive medical and personal records remain secure.
              </p>
            </section>

            <section className="space-y-3 bg-slate-50 border border-slate-200/50 rounded-2xl p-5">
              <h2 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-500" />
                <span>4. User Control & Data Deletion</span>
              </h2>
              <p>
                You retain complete control over your data. You have the right to permanently purge your account along with all associated diagnostic history and photos from our servers at any time.
              </p>
              <p className="font-bold text-slate-900">
                To self-delete your patient record immediately:
              </p>
              <Link 
                href={`/clinics/${clinic.slug}/delete-account`}
                style={{ backgroundColor: brandColor }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs mt-2 hover:opacity-90 transition-all"
              >
                <span>Access Account Deletion Tool</span>
              </Link>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-slate-900" style={{ backgroundColor: brandColor }} />
                5. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy or how your medical diagnostic records are handled, contact our compliance officer:
              </p>
              <div className="pt-2 space-y-1 font-semibold text-slate-900">
                {clinic.email && <p>Email: {clinic.email}</p>}
                {clinic.phone && <p>Phone: {clinic.phone}</p>}
              </div>
            </section>

          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800">
        <p>© 2026 {clinic.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
