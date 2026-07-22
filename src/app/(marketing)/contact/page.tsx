'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please provide both your name and email address.',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, clinicName, email, message }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to submit form');

      Swal.fire({
        icon: 'success',
        title: 'Email Submitted Successfully',
        text: 'Our team will contact you shortly.',
        confirmButtonColor: '#0d9488',
      });

      // Clear fields
      setName('');
      setClinicName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.message || 'There was a problem submitting your request.',
        confirmButtonColor: '#0d9488',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-12 relative z-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">Book a Demo or Speak with an Expert</h1>
        <p className="text-slate-600 text-sm md:text-base font-medium">
          Our team of clinical specialists is ready to help transform your clinic operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Contact Information</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              We respond to all clinical automation requests within one business day. Feel free to contact our administrative team for emergency clinic onboarding support.
            </p>
            <div className="space-y-4 text-sm text-slate-600 font-medium">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-teal-600" />
                <span>demo@graftdesk.app</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-teal-600" />
                <span>+1 (800) 555-GRAFT</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Beverly Hills Medical Plaza, CA</span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 text-[11px] text-teal-800 font-medium leading-relaxed">
            🛡️ Your inquiry will be securely auto-routed to our regional consulting teams privately.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
            <input 
              type="text" 
              placeholder="Dr. Sarah Jenkins" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-teal-500 font-semibold" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Name</label>
            <input 
              type="text" 
              placeholder="Beverly Restoration Center" 
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-teal-500 font-semibold" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              placeholder="doctor@clinic.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-teal-500 font-semibold" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message or Demo Specifications</label>
            <textarea 
              rows={3}
              placeholder="Tell us about your clinic layout, surgery count, or surgeon team size..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-teal-500 font-semibold resize-none" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Request...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Demo Request</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
