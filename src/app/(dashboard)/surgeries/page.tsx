'use client';

import React, { useState, useEffect } from 'react';
import { Scissors, Clock, Plus, CheckCircle2, SlidersHorizontal, User, AlertCircle } from 'lucide-react';

export default function SurgeryWorkspacePage() {
  const [surgeries, setSurgeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSurgery, setActiveSurgery] = useState<any>(null);

  const [extractedCount, setExtractedCount] = useState(3150);
  const [implantedCount, setImplantedCount] = useState(3120);

  const fetchSurgeries = async () => {
    try {
      const res = await fetch('/api/surgeries');
      const data = await res.json();
      if (data.surgeries && data.surgeries.length > 0) {
        setSurgeries(data.surgeries);
        setActiveSurgery(data.surgeries[0]);
        setExtractedCount(data.surgeries[0].extractedGrafts || 3150);
        setImplantedCount(data.surgeries[0].implantedGrafts || 3120);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurgeries();
  }, []);

  const updateCounts = async (newExtracted: number, newImplanted: number) => {
    setExtractedCount(newExtracted);
    setImplantedCount(newImplanted);
    if (!activeSurgery) return;

    try {
      await fetch('/api/surgeries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surgeryId: activeSurgery.id,
          extractedGrafts: newExtracted,
          implantedGrafts: newImplanted,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 text-xs font-medium">Loading Surgery Workspace...</div>;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Surgical Workspace & Graft Counter</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Real-time follicular unit graft extraction & implantation monitoring.</p>
        </div>
      </div>

      {activeSurgery && (
        <div className="space-y-8">
          {/* SURGERY SUMMARY CARD */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 font-bold flex items-center justify-center text-lg border border-rose-200">
                <Scissors className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-extrabold text-slate-900">{activeSurgery.patient?.name || 'Michael Vance'}</h2>
                  <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                    {activeSurgery.procedure || 'FUE'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Surgeon: {activeSurgery.doctor?.name || 'Dr. Alexander Vance'} • Date: {activeSurgery.surgeryDate} • Duration: {activeSurgery.surgeryDuration || '6h 45m'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                Status: {activeSurgery.status || 'COMPLETED'}
              </span>
            </div>
          </div>

          {/* LIVE GRAFT COUNTERS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <span className="text-xs font-bold text-slate-500">Planned Target Grafts</span>
              <p className="text-3xl font-extrabold text-slate-900">{activeSurgery.plannedGrafts}</p>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full w-full" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700">Extracted Grafts</span>
                <div className="flex gap-1">
                  <button onClick={() => updateCounts(extractedCount + 50, implantedCount)} className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-xs font-bold hover:bg-teal-100 border border-teal-200">
                    +50
                  </button>
                </div>
              </div>
              <p className="text-3xl font-extrabold text-teal-600">{extractedCount}</p>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: `${Math.min(100, (extractedCount / activeSurgery.plannedGrafts) * 100)}%` }} />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700">Implanted Grafts</span>
                <div className="flex gap-1">
                  <button onClick={() => updateCounts(extractedCount, implantedCount + 50)} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 border border-emerald-200">
                    +50
                  </button>
                </div>
              </div>
              <p className="text-3xl font-extrabold text-emerald-600">{implantedCount}</p>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, (implantedCount / activeSurgery.plannedGrafts) * 100)}%` }} />
              </div>
            </div>
          </div>

          {/* GRAFT TYPE BREAKDOWN */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base">Follicular Unit Type Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-medium">Single Hair (1-Hair)</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">650</p>
                <span className="text-[10px] text-slate-400 font-medium">Hairline transition</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-medium">Double Hair (2-Hair)</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">1,450</p>
                <span className="text-[10px] text-slate-400 font-medium">Mid-scalp core</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-medium">Triple Hair (3-Hair)</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">820</p>
                <span className="text-[10px] text-slate-400 font-medium">High density zone</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-medium">Multi Hair (4+ Hair)</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">200</p>
                <span className="text-[10px] text-slate-400 font-medium">Vertex crown</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
