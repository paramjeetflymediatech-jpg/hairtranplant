import React from 'react';
import { ShieldCheck, Award, HeartPulse } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">Our Mission</h1>
        <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto font-medium">
          GraftDesk was founded by lead hair restoration surgeons and software architects to modernize the multi-billion dollar hair transplant industry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <Award className="w-8 h-8 text-teal-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">Medical Excellence</h3>
          <p className="text-xs text-slate-500 font-medium">Designed alongside ISHRS certified surgeons to match real surgical workflows.</p>
        </div>
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <ShieldCheck className="w-8 h-8 text-teal-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">Uncompromising Security</h3>
          <p className="text-xs text-slate-500 font-medium">Strict tenant isolation, HIPAA readiness, and encrypted medical vaults.</p>
        </div>
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <HeartPulse className="w-8 h-8 text-teal-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">Patient Outcomes</h3>
          <p className="text-xs text-slate-500 font-medium">Automated post-op care timelines to maximize graft survival and patient satisfaction.</p>
        </div>
      </div>
    </div>
  );
}
