'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Trash2, Eye, Clock, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

export default function SuperAdminPage() {
  const [data, setData] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tab and Pagination States
  const [activeTab, setActiveTab] = useState<'clinics' | 'leads'>('clinics');
  
  const [leadsPage, setLeadsPage] = useState(1);
  const LEADS_PER_PAGE = 5;

  const [clinicsPage, setClinicsPage] = useState(1);
  const CLINICS_PER_PAGE = 5;

  async function fetchPlatformData() {
    try {
      const res = await fetch('/api/super-admin');
      const json = await res.json();
      setData(json);
      setLeads(json.leads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlatformData();
  }, []);

  const handleDeleteLead = async (leadId: string) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "You are about to delete this website inquiry lead record permanently.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/api/super-admin?leadId=${leadId}`, {
        method: 'DELETE'
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to delete lead');

      // Update local state
      const updatedLeads = leads.filter(l => l.id !== leadId);
      setLeads(updatedLeads);

      // Adjust page if current page is now empty
      const totalPages = Math.ceil(updatedLeads.length / LEADS_PER_PAGE);
      if (leadsPage > totalPages && totalPages > 0) {
        setLeadsPage(totalPages);
      }

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'The contact inquiry lead has been removed successfully.',
        confirmButtonColor: '#0d9488'
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to delete the lead.',
        confirmButtonColor: '#e11d48'
      });
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/super-admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
      const resData = await res.json();

      if (!res.ok) throw new Error(resData.error || 'Failed to update status');

      // Update local state
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Lead status has been successfully updated to ${newStatus}.`,
        confirmButtonColor: '#0d9488',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to update status.',
        confirmButtonColor: '#e11d48'
      });
    }
  };

  const handleViewLeadDetails = (lead: any) => {
    let clinic = 'Not Specified';
    let message = 'No message provided.';
    
    if (lead.notes) {
      const clinicMatch = lead.notes.match(/Clinic:\s*([^.]+)/);
      const messageMatch = lead.notes.match(/Message:\s*([\s\S]+)/);
      if (clinicMatch) clinic = clinicMatch[1].trim();
      if (messageMatch) message = messageMatch[1].trim();
    }

    Swal.fire({
      title: `<h3 class="text-sm font-bold text-slate-800 tracking-tight">Lead Inquiry Detail Panel</h3>`,
      html: `
        <div class="text-left text-xs space-y-4 font-sans text-slate-700">
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <p><strong>Lead Name:</strong> <span class="text-slate-900 font-semibold">${lead.name}</span></p>
            <p><strong>Email Address:</strong> <a href="mailto:${lead.email}" class="text-teal-600 font-bold hover:underline">${lead.email || 'N/A'}</a></p>
            <p><strong>Clinic Practice:</strong> <span class="text-slate-900 font-semibold">${clinic}</span></p>
            <p><strong>Current Status:</strong> <span class="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200 text-[9px]">${lead.status}</span></p>
            <p><strong>Date Submitted:</strong> <span class="text-slate-900 font-medium">${new Date(lead.createdAt).toLocaleString()}</span></p>
          </div>
          <div>
            <p class="font-bold text-slate-800 mb-1.5">Submitted Inquiry Message:</p>
            <div style="background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 14px; border-radius: 0 12px 12px 0; font-style: italic; font-size: 13px; color: #0f766e; line-height: 1.5;">
              "${message}"
            </div>
          </div>
        </div>
      `,
      confirmButtonColor: '#0d9488',
      confirmButtonText: 'Dismiss'
    });
  };

  if (loading) return <div className="p-12 text-center text-slate-500 text-xs font-medium">Loading Super Admin Control Center...</div>;

  const metrics = data?.metrics || { totalClinics: 2, activeSubscriptions: 2, mrr: 898, annualRunRate: 10776, totalPatients: 428 };
  const clinics = data?.clinics || [];

  // Leads Pagination Math
  const totalLeadsPages = Math.ceil(leads.length / LEADS_PER_PAGE) || 1;
  const startLeadIndex = (leadsPage - 1) * LEADS_PER_PAGE;
  const paginatedLeads = leads.slice(startLeadIndex, startLeadIndex + LEADS_PER_PAGE);

  // Clinics Pagination Math
  const totalClinicsPages = Math.ceil(clinics.length / CLINICS_PER_PAGE) || 1;
  const startClinicIndex = (clinicsPage - 1) * CLINICS_PER_PAGE;
  const paginatedClinics = clinics.slice(startClinicIndex, startClinicIndex + CLINICS_PER_PAGE);

  return (
    <div className="space-y-8 pb-16">
      {/* Title Header */}
      <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Platform Control Center</span>
          <h1 className="text-2xl font-extrabold text-slate-900">GraftDesk Global SaaS Metrics</h1>
        </div>
        <ShieldCheck className="w-8 h-8 text-rose-600" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total SaaS Clinics</span>
          <p className="text-3xl font-extrabold text-slate-900">{metrics.totalClinics}</p>
          <span className="text-[10px] text-emerald-600 font-bold">100% Active Tenants</span>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Monthly Recurring Revenue</span>
          <p className="text-3xl font-extrabold text-emerald-600">${metrics.mrr.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-medium">ARR: ${(metrics.mrr * 12).toLocaleString()}</span>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Active Subscriptions</span>
          <p className="text-3xl font-extrabold text-teal-600">{metrics.activeSubscriptions}</p>
          <span className="text-[10px] text-emerald-600 font-bold">0% Churn</span>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Patient Records</span>
          <p className="text-3xl font-extrabold text-slate-900">{metrics.totalPatients}</p>
          <span className="text-[10px] text-slate-500 font-medium">Across all clinic databases</span>
        </div>
      </div>

      {/* Tab Switcher Selector */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('clinics')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-bold transition-all ${
            activeTab === 'clinics'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Subscribed Clinics ({clinics.length})
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-bold transition-all ${
            activeTab === 'leads'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          Website Contact Inquiries ({leads.length})
        </button>
      </div>

      {/* Details Container Panel */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-6">
        {/* Tab 1: Subscribed Clinics */}
        {activeTab === 'clinics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Registered Tenants & Clinics</h3>
              <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded border border-teal-200">SaaS Node Active</span>
            </div>
            
            <div className="overflow-x-auto min-h-[250px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3 font-semibold">Clinic Name</th>
                    <th className="pb-3 font-semibold">Location</th>
                    <th className="pb-3 font-semibold">Subscription Plan</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedClinics.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">No clinics registered on platform.</td>
                    </tr>
                  ) : (
                    paginatedClinics.map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-50/30">
                        <td className="py-4 font-bold text-slate-900 text-sm">{c.name}</td>
                        <td className="py-4 text-slate-500 font-medium">{c.city || 'Beverly Hills'}, {c.country || 'United States'}</td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200 text-[10px] uppercase">
                            {c.subscriptionPlan}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px] uppercase">
                            {c.subscriptionStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Clinics Pagination Controls */}
            {clinics.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold">
                <button
                  disabled={clinicsPage === 1}
                  onClick={() => setClinicsPage(clinicsPage - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                
                <span className="text-slate-500 font-medium">
                  Page {clinicsPage} of {totalClinicsPages}
                </span>

                <button
                  disabled={clinicsPage === totalClinicsPages}
                  onClick={() => setClinicsPage(clinicsPage + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Inbound Leads / Contact Inquiries */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Inquiries Database</h3>
              <span className="px-2.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-[10px] text-rose-700 font-bold">
                {leads.length} Global Leads
              </span>
            </div>

            <div className="divide-y divide-slate-100 min-h-[250px]">
              {paginatedLeads.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium space-y-1">
                  <p>No contact inquiries submitted yet.</p>
                  <p className="text-[10px] text-slate-300">Submit queries from the public contact page to populate.</p>
                </div>
              ) : (
                paginatedLeads.map((lead: any) => (
                  <div key={lead.id} className="py-4 flex items-center justify-between gap-4 text-xs hover:bg-slate-50/50 px-2 rounded-2xl transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-sm">{lead.name}</p>
                        <span className="text-[9px] px-2 py-0.5 font-extrabold text-teal-700 bg-teal-50 border border-teal-200/50 rounded-full uppercase">
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-slate-500 font-semibold">{lead.email}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(lead.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Status Dropdown Selector */}
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-bold rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-pointer shadow-2xs hover:bg-slate-100 transition-colors"
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="CONSULTATION_BOOKED">Consultation Booked</option>
                        <option value="CONSULTATION_COMPLETED">Consultation Completed</option>
                        <option value="TREATMENT_RECOMMENDED">Treatment Recommended</option>
                        <option value="SURGERY_BOOKED">Surgery Booked</option>
                        <option value="CONVERTED">Converted</option>
                        <option value="LOST">Lost</option>
                      </select>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleViewLeadDetails(lead)}
                          title="View Message Details"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-600 border border-slate-200 hover:border-teal-200 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          title="Delete Inquiry"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {leads.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold">
                <button
                  disabled={leadsPage === 1}
                  onClick={() => setLeadsPage(leadsPage - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                
                <span className="text-slate-500 font-medium">
                  Page {leadsPage} of {totalLeadsPages}
                </span>

                <button
                  disabled={leadsPage === totalLeadsPages}
                  onClick={() => setLeadsPage(leadsPage + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
