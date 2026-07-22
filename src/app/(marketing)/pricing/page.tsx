import React from 'react';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '$149',
      period: '/month',
      desc: 'Perfect for boutique clinics starting out with digital patient management.',
      features: [
        'Up to 2 Doctor Seats',
        '1,000 Patient CRM Records',
        'Basic Scalp Photo Storage',
        'Manual Graft Count Logging',
        'Standard Email Support',
      ],
      popular: false,
      cta: 'Start Free Trial',
    },
    {
      name: 'Professional',
      price: '$299',
      period: '/month',
      desc: 'Designed for high-growth hair restoration clinics seeking AI automation.',
      features: [
        'Up to 10 Doctor & Staff Seats',
        'Unlimited Patient Records',
        'Full AI Scalp & Graft Estimator',
        'Live Surgical Graft Precision Counter',
        'Automated Post-Op Follow-Up Engine',
        'Interactive Before & After Gallery',
        'Priority 24/7 Support',
      ],
      popular: true,
      cta: 'Start 14-Day Free Trial',
    },
    {
      name: 'Enterprise',
      price: '$599',
      period: '/month',
      desc: 'For multi-branch surgical chains and high-volume medical groups.',
      features: [
        'Unlimited Staff & Branch Outlets',
        'Custom EHR & Billing Integration',
        'Dedicated HIPAA Compliance Officer',
        'Custom AI Model Fine-tuning',
        'Dedicated Customer Success Manager',
        '99.99% Uptime SLA',
      ],
      popular: false,
      cta: 'Contact Sales',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Transparent SaaS Pricing</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Flexible Plans for Every Stage of Growth
        </h1>
        <p className="text-slate-600 text-sm md:text-base font-medium">
          No hidden fees or surprise contracts. Cancel or upgrade your subscription anytime with zero friction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
        {plans.map((p, i) => (
          <div
            key={i}
            className={`relative p-8 rounded-3xl bg-white border ${
              p.popular ? 'border-teal-500 shadow-md shadow-teal-500/10 scale-105' : 'border-slate-200 shadow-2xs'
            } space-y-6 flex flex-col justify-between`}
          >
            {p.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-teal-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-md">
                Most Popular
              </span>
            )}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{p.desc}</p>
              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-4xl font-extrabold text-slate-900">{p.price}</span>
                <span className="text-slate-500 text-xs font-medium">{p.period}</span>
              </div>
              <div className="border-t border-slate-100 pt-4 space-y-3">
                {p.features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs text-slate-600 font-semibold">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/register"
              className={`w-full py-3.5 rounded-xl font-bold text-xs text-center transition-all ${
                p.popular
                  ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-teal-500/20 hover:from-teal-700 hover:to-teal-600'
                  : 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
