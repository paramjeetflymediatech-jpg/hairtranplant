'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  GitMerge,
  Calendar,
  Scissors,
  TrendingUp,
  DollarSign,
  Clock,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ClinicDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [followUpAlerts, setFollowUpAlerts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [funnel, setFunnel] = useState<any>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        if (data.success) {
          setMetrics(data.metrics);
          setTodayAppointments(data.appointments);
          setFollowUpAlerts(data.followUps);
          setChartData(data.chartData);
          setFunnel(data.funnel);
        }
      } catch (err) {
        console.error('Error loading dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-xs font-bold text-slate-600">Loading Clinic Command Center...</p>
      </div>
    );
  }

  const kpis = [
    { title: 'Total Active Patients', value: metrics?.totalPatients?.toString() || '0', change: 'Live count', icon: Users, color: 'bg-teal-50 text-teal-600' },
    { title: 'New Leads (This Month)', value: metrics?.newLeadsCount?.toString() || '0', change: 'Active funnel', icon: GitMerge, color: 'bg-amber-50 text-amber-600' },
    { title: "Today's Appointments", value: metrics?.todayAppointmentsCount?.toString() || '0', change: 'Today', icon: Calendar, color: 'bg-purple-50 text-purple-600' },
    { title: 'Upcoming Surgeries', value: metrics?.upcomingSurgeriesCount?.toString() || '0', change: 'Scheduled', icon: Scissors, color: 'bg-rose-50 text-rose-600' },
    { title: 'Lead Conversion Rate', value: `${metrics?.leadConversionRate || '0.0'}%`, change: 'Converted leads', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Monthly Revenue', value: `$${(metrics?.monthlyRevenue || 0).toLocaleString()}`, change: 'Current Month', icon: DollarSign, color: 'bg-blue-50 text-blue-600' },
  ];


  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Clinic Command Center
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Apex Hair Institute • Real-time operational pulse & surgical metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/ai-analysis"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>New AI Scalp Scan</span>
          </Link>
          <Link
            href="/appointments"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all"
          >
            <PlusCircle className="w-4 h-4 text-teal-600" />
            <span>Book Appointment</span>
          </Link>
        </div>
      </div>

      {/* KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-500/30 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500">{kpi.title}</span>
              <div className={`p-2 rounded-xl ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{kpi.value}</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS & REVENUE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Graft Volume & Revenue Trend */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Surgical Graft & Revenue Analytics</h3>
              <p className="text-xs text-slate-500 font-medium">Monthly follicular unit count vs gross revenue</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-teal-600 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" /> Graft Count
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Revenue ($)
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="graftGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', color: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="grafts" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#graftGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Conversion Funnel */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">Conversion Funnel</h3>
              <Link href="/leads" className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1">
                Kanban <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 pt-4">
              {[
                { stage: 'Inbound Inquiries', count: funnel?.totalLeads || 0, pct: '100%', color: 'bg-slate-300' },
                { stage: 'Consultation Booked', count: funnel?.consultationBooked || 0, pct: (funnel?.totalLeads || 0) > 0 ? `${Math.round((funnel.consultationBooked / funnel.totalLeads) * 100)}%` : '0%', color: 'bg-teal-500' },
                { stage: 'Treatment Recommended', count: funnel?.treatmentRecommended || 0, pct: (funnel?.totalLeads || 0) > 0 ? `${Math.round((funnel.treatmentRecommended / funnel.totalLeads) * 100)}%` : '0%', color: 'bg-teal-600' },
                { stage: 'Surgery Booked & Converted', count: funnel?.converted || 0, pct: (funnel?.totalLeads || 0) > 0 ? `${Math.round((funnel.converted / funnel.totalLeads) * 100)}%` : '0%', color: 'bg-emerald-600' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">{item.stage}</span>
                    <span className="text-slate-900 font-bold">{item.count} ({item.pct})</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: item.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-100 text-xs text-teal-800 font-semibold">
            ✨ AI Scalp Scanner boosted lead conversion by +12.4% this quarter.
          </div>
        </div>
      </div>

      {/* TODAY'S APPOINTMENTS & FOLLOW-UP ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Appointments List */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Today&apos;s Surgical & Clinical Schedule</h3>
              <p className="text-xs text-slate-500 font-medium">4 total appointments scheduled for today</p>
            </div>
            <Link href="/appointments" className="text-xs font-bold text-teal-600 hover:underline">
              Full Schedule →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {todayAppointments.map((app) => (
              <div key={app.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-center shrink-0">
                    <span className="text-xs font-bold text-teal-700 block">{app.time}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{app.patient}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{app.procedure} • {app.doctor}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      app.type === 'SURGERY'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : app.type === 'CONSULTATION'
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {app.type}
                  </span>
                  <Link
                    href={`/patients/${app.patientId || '1'}`}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-500 hover:text-teal-600 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-Up Action Reminders */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Post-Op Action Queue</h3>
            <Link href="/follow-ups" className="text-xs text-teal-600 font-bold hover:underline">
              All Follow-Ups
            </Link>
          </div>

          <div className="space-y-3">
            {followUpAlerts.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                <div>
                  <Link href={`/patients/${item.patientId || '1'}`} className="font-bold text-slate-900 hover:text-teal-600 hover:underline">
                    {item.patient}
                  </Link>
                  <p className="text-[11px] text-slate-500 font-medium">{item.type}</p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
