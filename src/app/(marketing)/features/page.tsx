import React from 'react';
import { Sparkles, Scissors, Users, GitMerge, Clock, Camera } from 'lucide-react';

export default function FeaturesPage() {
  const list = [
    { title: 'AI Hair Loss Norwood Classifier', desc: 'Deep vision neural nets identify temporal recession and crown thinning automatically.', icon: Sparkles },
    { title: 'Follicular Unit Graft Counter', desc: 'Track single, double, triple, and multi graft breakdown during extraction and placement.', icon: Scissors },
    { title: 'Patient CRM 360 Workspace', desc: 'Centralized medical timeline detailing pre-op photos, surgery notes, and prescription history.', icon: Users },
    { title: 'Automated Post-Op Follow-Up Engine', desc: 'Automate milestone check-ins at Day 1, 7, 15, and Months 1, 3, 6, 9, 12.', icon: Clock },
    { title: 'Kanban Lead Pipeline', desc: 'Manage incoming consultation leads, deposit tracking, and surgery scheduling.', icon: GitMerge },
    { title: 'Before & After Comparison Slider', desc: 'High-definition side-by-side comparison slider with privacy consent controls.', icon: Camera },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">Full Feature Suite</h1>
        <p className="text-slate-600 text-sm md:text-base font-medium">
          Built exclusively for hair restoration clinics. Everything you need to scale operations and deliver exceptional patient outcomes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {list.map((item, idx) => (
          <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
