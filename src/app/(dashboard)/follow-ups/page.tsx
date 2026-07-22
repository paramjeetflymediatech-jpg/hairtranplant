'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Calendar, User, ChevronRight } from 'lucide-react';

export default function FollowUpEnginePage() {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchFollowUps = async () => {
    try {
      const res = await fetch('/api/follow-ups');
      const data = await res.json();
      if (data.followUps) setFollowUps(data.followUps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleUpdateStatus = async (followUpId: string, status: string) => {
    try {
      const res = await fetch('/api/follow-ups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followUpId, status }),
      });
      if (res.ok) fetchFollowUps();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = statusFilter ? followUps.filter((f) => f.status === statusFilter) : followUps;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Automated Post-Op Follow-Up Engine</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Scheduled patient check-ins across 12-month post-surgery milestones.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-teal-500 font-semibold shadow-2xs"
        >
          <option value="">All Milestone Statuses</option>
          <option value="PENDING">Pending Check-Ins</option>
          <option value="COMPLETED">Completed Check-Ins</option>
          <option value="OVERDUE">Overdue Check-Ins</option>
        </select>
      </div>

      {/* Follow Up Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-500/30 transition-all shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">{item.type.replace('_', ' ')}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : item.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{item.patient?.name || 'Patient'}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Scheduled: {item.followUpDate}</p>
              </div>

              {item.notes && <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 font-medium">{item.notes}</p>}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <select
                value={item.status}
                onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
              >
                <option value="PENDING">Set Pending</option>
                <option value="COMPLETED">Mark Completed</option>
                <option value="OVERDUE">Mark Overdue</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
