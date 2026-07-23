'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  GitMerge,
  Plus,
  DollarSign,
  User,
  Phone,
  Mail,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Eye,
  UserCheck,
  X,
  FileText,
  Calendar,
} from 'lucide-react';
import Swal from 'sweetalert2';

interface LeadItem {
  id: string;
  clinicId: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  status: string;
  estimatedValue?: number;
  notes?: string;
  photos?: string; // JSON string of { front, top, sides, back }
  hairAnalysisData?: string; // JSON string of AI result
  createdAt: string;
}

export default function LeadPipelinePage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Online Hair Test',
    estimatedValue: 7500,
  });

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

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStageUpdate = async (leadId: string, status: string) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status }),
      });
      if (res.ok) {
        fetchLeads();
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead({ ...selectedLead, status });
        }
      }
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
        setNewLead({ name: '', email: '', phone: '', source: 'Online Hair Test', estimatedValue: 7500 });
        fetchLeads();
        Swal.fire({
          icon: 'success',
          title: 'Lead Created',
          text: 'New lead record added to pipeline.',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Convert Lead to Patient
  const handleConvertToPatient = async (lead: LeadItem) => {
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source || 'Lead Pipeline',
          status: 'CONSULTATION',
          notes: lead.notes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to convert lead');
      }

      // Update lead status to CONVERTED
      await handleStageUpdate(lead.id, 'CONVERTED');

      Swal.fire({
        icon: 'success',
        title: 'Lead Converted!',
        text: `${lead.name} has been added to your patient list.`,
        confirmButtonColor: '#0d9488',
      });

      setSelectedLead(null);
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Conversion Failed',
        text: err.message || 'Could not convert lead to patient.',
        confirmButtonColor: '#e11d48',
      });
    }
  };

  const totalPipelineValue = leads.reduce((acc, l) => acc + Number(l.estimatedValue || 0), 0);

  // Helper to parse JSON photos object safely
  const parsePhotos = (photosStr?: string) => {
    if (!photosStr) return null;
    try {
      return JSON.parse(photosStr);
    } catch (e) {
      return null;
    }
  };

  // Helper to parse JSON hair analysis data safely
  const parseAnalysis = (analysisStr?: string) => {
    if (!analysisStr) return null;
    try {
      return JSON.parse(analysisStr);
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lead CRM & Hair Diagnostic Pipeline</h1>
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
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${stage.color}`}>{stage.label}</span>
                  <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {stageLeads.map((lead) => {
                    const photosObj = parsePhotos(lead.photos);
                    const photoCount = photosObj ? Object.keys(photosObj).length : 0;
                    const aiObj = parseAnalysis(lead.hairAnalysisData);

                    return (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-500/60 hover:shadow-md transition-all cursor-pointer space-y-3 relative group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{lead.name}</p>
                            <span className="text-[10px] text-slate-400 font-medium">{lead.source || 'Online Test'}</span>
                          </div>
                          <span className="text-xs font-extrabold text-teal-700">
                            ${Number(lead.estimatedValue || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 space-y-1 font-medium">
                          {lead.phone && <p className="truncate">📞 {lead.phone}</p>}
                          {lead.email && <p className="truncate">✉️ {lead.email}</p>}
                        </div>

                        {/* Badges for Hair Photos & AI Norwood Scale */}
                        {(photoCount > 0 || aiObj) && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {photoCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-md">
                                <Camera className="w-3 h-3" /> {photoCount} Photos
                              </span>
                            )}
                            {aiObj?.norwoodStage && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
                                <Sparkles className="w-3 h-3" /> {aiObj.norwoodStage}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Stage Move Dropdown */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]" onClick={(e) => e.stopPropagation()}>
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

                          <span className="text-[10px] text-teal-600 font-bold flex items-center gap-0.5 group-hover:underline">
                            View <Eye className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lead Details & Hair Photos Review Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl my-8 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{selectedLead.name}</h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 uppercase tracking-wide">
                    {selectedLead.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-4">
                  {selectedLead.email && <span>✉️ {selectedLead.email}</span>}
                  {selectedLead.phone && <span>📞 {selectedLead.phone}</span>}
                  <span>📅 Submitted: {new Date(selectedLead.createdAt).toLocaleDateString()}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hair Photos Section */}
            {(() => {
              const photosObj = parsePhotos(selectedLead.photos);
              if (!photosObj || Object.keys(photosObj).length === 0) {
                return (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-xs text-slate-500 font-medium">No hair diagnostic photos uploaded for this lead.</p>
                  </div>
                );
              }

              const photoKeys = [
                { key: 'front', label: 'Front Hairline' },
                { key: 'top', label: 'Crown / Top View' },
                { key: 'sides', label: 'Temple / Side Views' },
                { key: 'back', label: 'Donor Area (Back)' },
              ];

              return (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Camera className="w-4 h-4 text-teal-600" /> Patient Hair Test Photos
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {photoKeys.map((item) => {
                      const photoUrl = photosObj[item.key];
                      if (!photoUrl) return null;
                      return (
                        <div
                          key={item.key}
                          onClick={() => setPreviewPhoto(photoUrl)}
                          className="group relative rounded-2xl border border-slate-250 overflow-hidden bg-slate-900 aspect-square cursor-pointer shadow-xs hover:shadow-md transition-all"
                        >
                          <img src={photoUrl} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-2 text-center">
                            <span className="text-[10px] font-bold text-white block truncate">{item.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* AI Hair Diagnostics Analysis Breakdown */}
            {(() => {
              const aiObj = parseAnalysis(selectedLead.hairAnalysisData);
              if (!aiObj) return null;

              return (
                <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-teal-200/60 pb-3">
                    <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-600" /> AI Hair Diagnostics Breakdown
                    </h3>
                    {aiObj.norwoodStage && (
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-teal-700 text-white">
                        {aiObj.norwoodStage}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Estimated Graft Need</span>
                      <strong className="text-teal-800 font-extrabold text-sm block mt-0.5">
                        {aiObj.estimatedGraftRequirement?.minimumGrafts || 0} - {aiObj.estimatedGraftRequirement?.maximumGrafts || 0} Grafts
                      </strong>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Recommended Treatment</span>
                      <strong className="text-teal-800 font-extrabold text-sm block mt-0.5">
                        {aiObj.procedureAssessment?.preliminaryRecommendation || 'FUE Hair Transplant'}
                      </strong>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Graft Density</span>
                      <strong className="text-teal-800 font-extrabold text-sm block mt-0.5">
                        {aiObj.graftDensityAssessment?.recommendedTargetDensity || '45-50 grafts/cm²'}
                      </strong>
                    </div>
                  </div>

                  {aiObj.clinicalObservations && aiObj.clinicalObservations.length > 0 && (
                    <div className="bg-white p-3 rounded-xl border border-teal-100 text-xs">
                      <span className="text-slate-500 font-bold block mb-1">Clinical Observations:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700 font-medium text-[11px]">
                        {aiObj.clinicalObservations.map((obs: string, idx: number) => (
                          <li key={idx}>{obs}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Notes Section */}
            {selectedLead.notes && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Lead Notes & Summary</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-medium">
                  {selectedLead.notes}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-600">Update Status:</span>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleStageUpdate(selectedLead.id, e.target.value)}
                  className="bg-slate-50 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none"
                >
                  {stages.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => handleConvertToPatient(selectedLead)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Convert Lead to Patient</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* High-Res Photo Lightbox Preview */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={previewPhoto} alt="High Res Hair View" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 bg-slate-900/80 text-white p-2 rounded-full hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Add Manual Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleCreateLead} className="w-full max-w-md p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create Manual Lead Record</h3>
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
