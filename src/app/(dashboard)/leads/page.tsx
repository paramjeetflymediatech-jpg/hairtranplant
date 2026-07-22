'use client';

import React, { useState, useEffect } from 'react';
import { GitMerge, Plus, DollarSign, User, Phone, Mail, ChevronRight } from 'lucide-react';

export default function LeadPipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', source: 'Instagram Ads', estimatedValue: 7500 });

  const stages = [
    { key: 'NEW', label: 'New Inbound', color: 'border-blue-300 text-blue-700 bg-blue-50' },
    { key: 'CONTACTED', label: 'Contacted', color: 'border-amber-300 text-amber-700 bg-amber-50' },
    { key: 'CONSULTATION_BOOKED', label: 'Consultation Booked', color: 'border-purple-300 text-purple-700 bg-purple-50' },
    { key: 'CONSULTATION_COMPLETED', label: 'Consultation Done', color: 'border-cyan-300 text-cyan-700 bg-cyan-50' },
    { key: 'TREATMENT_RECOMMENDED', label: 'Treatment Rec.', color: 'border-teal-300 text-teal-700 bg-teal-50' },
    { key: 'SURGERY_BOOKED', label: 'Surgery Booked', color: 'border-rose-300 text-rose-700 bg-rose-50' },
    { key: 'CONVERTED', label: 'Converted', color: 'border-emerald-300 text-emerald-700 bg-emerald-50' },
    { key: 'LOST', label: 'Lost', color: 'border-slate-300 text-slate-600 bg-slate-100' },
  ];

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStageUpdate = async (leadId: string, status: string) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status }),
      });
      if (res.ok) fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
      if (res.ok) {
        setShowModal(false);
        setNewLead({ name: '', email: '', phone: '', source: 'Instagram Ads', estimatedValue: 7500 });
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalPipelineValue = leads.reduce((acc, l) => acc + Number(l.estimatedValue || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lead CRM Kanban Pipeline</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Total Pipeline Value: <strong className="text-teal-700">${totalPipelineValue.toLocaleString()}</strong> ({leads.length} Active Leads)
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>New Lead Inbound</span>
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 select-none min-h-[600px]">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.key);
          return (
            <div
              key={stage.key}
              className="w-72 shrink-0 rounded-3xl bg-slate-100/70 border border-slate-200/90 p-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${stage.color}`}>{stage.label}</span>
                  <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-500/40 transition-all shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{lead.name}</p>
                          <span className="text-[10px] text-slate-400 font-medium">{lead.source || 'Website'}</span>
                        </div>
                        <span className="text-xs font-extrabold text-teal-700">
                          ${Number(lead.estimatedValue || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-1 font-medium">
                        {lead.phone && <p>📞 {lead.phone}</p>}
                        {lead.email && <p>✉️ {lead.email}</p>}
                      </div>

                      {/* Stage Move Controls */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStageUpdate(lead.id, e.target.value)}
                          className="bg-slate-50 text-slate-700 px-2 py-1 rounded border border-slate-200 text-[10px] font-semibold focus:outline-none"
                        >
                          {stages.map((s) => (
                            <option key={s.key} value={s.key}>
                              Move: {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleCreateLead} className="w-full max-w-md p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create Lead Record</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lead Name</label>
              <input
                type="text"
                required
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Deal Value ($)</label>
              <input
                type="number"
                value={newLead.estimatedValue}
                onChange={(e) => setNewLead({ ...newLead, estimatedValue: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                Save Lead
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
