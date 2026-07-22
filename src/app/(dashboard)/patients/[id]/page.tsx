'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  User,
  Calendar,
  Sparkles,
  Scissors,
  Clock,
  Images,
  CheckCircle2,
  Phone,
  Mail,
  FileText,
  SlidersHorizontal,
  DollarSign,
  Upload
} from 'lucide-react';
import { BeforeAfterSlider } from '@/components/gallery/BeforeAfterSlider';
import Swal from 'sweetalert2';

export const dynamic = 'force-dynamic';

export default function PatientWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const patientId = resolvedParams?.id || '';

  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'analysis' | 'surgery' | 'grafts' | 'gallery'>('overview');

  const [photoType, setPhotoType] = useState<string>('BEFORE');
  const [capturedAt, setCapturedAt] = useState<string>(new Date().toISOString().split('T')[0]);
  const [photoFile, setPhotoFile] = useState<string>('');
  const [photoNotes, setPhotoNotes] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      Swal.fire({
        title: 'Error',
        text: 'Please select a photo to upload.',
        icon: 'error',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    setUploading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: photoType,
          imageUrl: photoFile,
          capturedAt,
          notes: photoNotes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Progression photo uploaded successfully.',
          icon: 'success',
          confirmButtonColor: '#0d9488',
        });
        setPhotoFile('');
        setPhotoNotes('');
        // Reload patient details
        const patientRes = await fetch(`/api/patients/${patientId}`);
        const patientData = await patientRes.json();
        if (patientData.patient) setPatient(patientData.patient);
      } else {
        Swal.fire({
          title: 'Upload Failed',
          text: data.error || 'Failed to save photo',
          icon: 'error',
          confirmButtonColor: '#0d9488',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error',
        text: 'Error uploading photo',
        icon: 'error',
        confirmButtonColor: '#0d9488',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleViewDetailedAnalysis = (analysisData: any) => {
    try {
      const report = JSON.parse(analysisData.aiAnalysis);
      
      const clinicalFindingsHtml = report.clinicalObservations?.length > 0
        ? `<ul style="text-align: left; font-size: 11px; margin-left: 20px; color: #334155; margin-top: 4px; margin-bottom: 4px;">` +
          report.clinicalObservations.map((obs: string) => `<li style="margin-bottom: 2px;">${obs}</li>`).join('') +
          `</ul>`
        : '<p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">No abnormalities observed.</p>';

      const nextStepsHtml = report.recommendedNextSteps?.length > 0
        ? `<ul style="text-align: left; font-size: 11px; margin-left: 20px; color: #334155; margin-top: 4px; margin-bottom: 4px;">` +
          report.recommendedNextSteps.map((step: string) => `<li style="margin-bottom: 2px;">${step}</li>`).join('') +
          `</ul>`
        : '<p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Consultation with specialist.</p>';

      Swal.fire({
        title: `AI Scalp Assessment Report`,
        html: `
          <div style="font-family: inherit; font-size: 12px; text-align: left; max-height: 400px; overflow-y: auto; padding-right: 5px;">
            <div style="margin-bottom: 12px; padding: 10px; background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px;">
              <strong>Status:</strong> ${report.assessmentStatus || 'SUFFICIENT'} (Quality: ${report.imageQuality?.overall || 'GOOD'})
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px;">
              <div style="background: #f8fafc; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 10px; font-weight: bold; display: block;">NORWOOD SCALE</span>
                <strong style="font-size: 13px; color: #0f172a;">${report.norwoodStage || 'Norwood IV'}</strong>
              </div>
              <div style="background: #f8fafc; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 10px; font-weight: bold; display: block;">GRAFT ESTIMATE</span>
                <strong style="font-size: 13px; color: #0f172a;">${report.estimatedGraftRequirement?.minimumGrafts || '0'} - ${report.estimatedGraftRequirement?.maximumGrafts || '0'}</strong>
              </div>
            </div>

            <div style="margin-bottom: 15px; background: #f8fafc; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <span style="color: #64748b; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">NORWOOD PATTERN DESCRIPTION</span>
              <span style="color: #334155; font-size: 11px; font-weight: 500;">${report.norwoodDescription || 'N/A'}</span>
            </div>

            <div style="margin-bottom: 15px; background: #f8fafc; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <span style="color: #64748b; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">ZONE BREAKDOWN</span>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; color: #334155;">
                <div><strong>Frontal:</strong> ${report.zoneBreakdown?.frontalRecession || 'N/A'}</div>
                <div><strong>Mid-Scalp:</strong> ${report.zoneBreakdown?.midScalpDensity || 'N/A'}</div>
                <div><strong>Crown:</strong> ${report.zoneBreakdown?.crownVertex || 'N/A'}</div>
                <div><strong>Temples:</strong> ${report.zoneBreakdown?.temporalPeaks || 'N/A'}</div>
              </div>
            </div>

            <div style="margin-bottom: 15px; background: #f8fafc; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <span style="color: #64748b; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">CLINICAL FINDINGS</span>
              ${clinicalFindingsHtml}
            </div>

            <div style="margin-bottom: 15px; background: #f8fafc; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <span style="color: #64748b; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">RECOMMENDED NEXT STEPS</span>
              ${nextStepsHtml}
            </div>
            
            <div style="background: #fffbeb; border: 1px solid #fef3c7; color: #92400e; padding: 10px; border-radius: 12px; font-size: 10px; line-height: 1.4;">
              ⚠️ <strong>Disclaimer:</strong> ${report.disclaimer || 'AI-assisted estimate only.'}
            </div>
          </div>
        `,
        width: '500px',
        confirmButtonColor: '#0d9488',
        confirmButtonText: 'Close Report'
      });
    } catch (e) {
      console.error(e);
      Swal.fire({
        title: 'Error',
        text: 'Failed to parse the detailed AI report payload.',
        icon: 'error',
        confirmButtonColor: '#0d9488'
      });
    }
  };

  useEffect(() => {
    async function fetchPatientDetails() {
      try {
        if (!patientId) return;
        const res = await fetch(`/api/patients/${patientId}`);
        const data = await res.json();
        if (data.patient) setPatient(data.patient);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPatientDetails();
  }, [patientId]);

  if (loading) {
    return <div className="p-12 text-center text-slate-500 text-xs font-medium">Loading Patient 360 Workspace...</div>;
  }

  if (!patient) {
    return <div className="p-12 text-center text-rose-600 text-xs font-medium">Patient record not found.</div>;
  }

  const surgery = patient.surgeries?.[0];
  const analysis = patient.hairAnalyses?.[0];
  const grafts = surgery?.grafts || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Patient Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {patient.profilePhoto ? (
            <img src={patient.profilePhoto} alt={patient.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-500 shadow-xs" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-2xl border-2 border-teal-200">
              {patient.name.substring(0, 2)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900">{patient.name}</h1>
              <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold">
                {patient.hairLossStage || 'Norwood IV'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-4">
              <span>DOB: {patient.dateOfBirth || '1988-06-14'}</span>
              <span>•</span>
              <span>Source: {patient.source || 'Instagram Ads'}</span>
              <span>•</span>
              <span>Status: <strong className="text-emerald-600">{patient.status}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/ai-analysis?patientId=${patientId}`}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-xs shadow-md shadow-teal-500/20 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>Run AI Analysis</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', name: 'Overview & Profile', icon: User },
          { id: 'timeline', name: 'Patient Timeline', icon: Clock },
          { id: 'analysis', name: 'Hair Analysis', icon: Sparkles },
          { id: 'surgery', name: 'Surgery & Plan', icon: Scissors },
          { id: 'grafts', name: 'Graft Precision Tracker', icon: SlidersHorizontal },
          { id: 'gallery', name: 'Before & After Gallery', icon: Images },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap font-bold ${
              activeTab === tab.id
                ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base">Contact Information</h3>
            <div className="space-y-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-teal-600" />
                <span>{patient.email || 'michael.patient@gmail.com'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-teal-600" />
                <span>{patient.phone || '+1 (555) 789-0123'}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base">Surgeon Medical Notes</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {patient.notes || 'Prioritized dense temporal peak reconstruction. Very compliant post-op patient. Sapphire FUE technique utilized for maximum follicular protection.'}
            </p>
          </div>
        </div>
      )}

      {/* 2. TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base">Chronological Patient Journey</h3>
          <div className="relative border-l-2 border-teal-200 pl-6 space-y-6 text-xs">
            <div className="relative">
              <span className="absolute -left-8 top-0.5 w-4 h-4 rounded-full bg-teal-500 ring-4 ring-white" />
              <p className="font-bold text-slate-900">Inbound Lead Created</p>
              <p className="text-slate-500">Captured via Instagram Ads Campaign</p>
            </div>
            <div className="relative">
              <span className="absolute -left-8 top-0.5 w-4 h-4 rounded-full bg-teal-600 ring-4 ring-white" />
              <p className="font-bold text-slate-900">In-Clinic Consultation & AI Scalp Scan</p>
              <p className="text-slate-500">Diagnosed Norwood IV. Recommended FUE 3,100 grafts.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-8 top-0.5 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white" />
              <p className="font-bold text-slate-900">Surgery Performed & Completed</p>
              <p className="text-slate-500">3,120 Grafts implanted (Singles: 650, Doubles: 1450, Triples: 820, Multi: 200)</p>
            </div>
            <div className="relative">
              <span className="absolute -left-8 top-0.5 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-white" />
              <p className="font-bold text-slate-900">Month 6 Post-Op Photo Inspection</p>
              <p className="text-slate-500">Status: Scheduled for today</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. HAIR ANALYSIS */}
      {activeTab === 'analysis' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">AI Hair Scalp Assessment</h3>
              <p className="text-xs text-slate-500 font-medium">Computer vision Norwood & density metrics</p>
            </div>
            {analysis && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleViewDetailedAnalysis(analysis)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] shadow-sm transition-all"
                >
                  View Detailed Report
                </button>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  {analysis.doctorVerified ? 'Doctor Verified' : 'AI Result'}
                </span>
              </div>
            )}
          </div>

          {analysis ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-medium">Norwood Stage</span>
                <p className="text-lg font-extrabold text-slate-900 mt-1">{analysis.hairLossStage || 'Unknown'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-medium">Estimated Graft Range</span>
                <p className="text-lg font-extrabold text-teal-600 mt-1">
                  {analysis.estimatedMinGrafts && analysis.estimatedMaxGrafts
                    ? `${analysis.estimatedMinGrafts.toLocaleString()} - ${analysis.estimatedMaxGrafts.toLocaleString()} Grafts`
                    : 'N/A'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-medium">Donor Area Quality</span>
                <p className="text-lg font-extrabold text-emerald-600 mt-1">{analysis.donorAreaQuality || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-medium">Density Index</span>
                <p className="text-lg font-extrabold text-slate-900 mt-1">{analysis.hairDensity || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900">No AI Hair Analysis Completed</p>
                <p className="text-[11px] text-slate-500 font-medium max-w-sm mx-auto">
                  Run a digital Norwood classification and follicular graft estimation scan for this patient.
                </p>
              </div>
              <Link
                href={`/ai-analysis?patientId=${patientId}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 fill-white" />
                <span>Run AI Scalp Scan</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 4 & 5. SURGERY & GRAFTS */}
      {(activeTab === 'surgery' || activeTab === 'grafts') && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base">Surgical Procedure & Follicular Unit Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 font-medium">Planned Grafts</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">3,100</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 font-medium">Extracted Grafts</span>
              <p className="text-xl font-extrabold text-teal-600 mt-1">3,150</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 font-medium">Implanted Grafts</span>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">3,120</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Graft Type Distribution</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-slate-500 font-medium">Single Hair Units</p>
                <p className="font-extrabold text-slate-900 text-base mt-0.5">650</p>
                <span className="text-[10px] text-slate-400 font-medium">Frontal hairline</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-slate-500 font-medium">Double Hair Units</p>
                <p className="font-extrabold text-slate-900 text-base mt-0.5">1,450</p>
                <span className="text-[10px] text-slate-400 font-medium">Mid-line transition</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-slate-500 font-medium">Triple Hair Units</p>
                <p className="font-extrabold text-slate-900 text-base mt-0.5">820</p>
                <span className="text-[10px] text-slate-400 font-medium">Density core</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-slate-500 font-medium">Multi-Hair Units</p>
                <p className="font-extrabold text-slate-900 text-base mt-0.5">200</p>
                <span className="text-[10px] text-slate-400 font-medium">Vertex crown</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. GALLERY */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload New Photo Form */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 h-fit">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <Upload className="w-5 h-5 text-teal-600" />
              Upload Progression Photo
            </h3>
            
            <form onSubmit={handleSavePhoto} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo Classification</label>
                <select
                  value={photoType}
                  onChange={(e) => setPhotoType(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-teal-500"
                >
                  <option value="BEFORE">Before (Day 0 Pre-Op)</option>
                  <option value="DAY_1">Day 1 Post-Op</option>
                  <option value="MONTH_1">Month 1 Recovery</option>
                  <option value="MONTH_3">Month 3 Recovery</option>
                  <option value="MONTH_6">Month 6 Growth</option>
                  <option value="MONTH_9">Month 9 Growth</option>
                  <option value="MONTH_12">Month 12 Outcome</option>
                  <option value="AFTER">After (Final Result)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date Captured</label>
                <input
                  type="date"
                  required
                  value={capturedAt}
                  onChange={(e) => setCapturedAt(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Local Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              {photoFile && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-40">
                  <img src={photoFile} alt="Preview" className="w-full object-cover max-h-40" />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Observations</label>
                <textarea
                  value={photoNotes}
                  onChange={(e) => setPhotoNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-teal-500 h-20 resize-none"
                  placeholder="e.g. Scabs clean, minimal swelling..."
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs disabled:opacity-50"
              >
                {uploading ? 'Saving photo...' : 'Save Progression Photo'}
              </button>
            </form>
          </div>

          {/* Interactive Outcome Slider & Gallery Grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Outcome Slider */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
              <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Interactive Outcome Comparison Slider</h3>
              {(() => {
                const photos = patient.photos || [];
                const before = photos.find((p: any) => p.type === 'BEFORE' || p.type === 'DAY_1')?.imageUrl;
                const after = photos.find((p: any) => ['AFTER', 'MONTH_6', 'MONTH_12', 'MONTH_9'].includes(p.type))?.imageUrl;

                if (before && after) {
                  return (
                    <BeforeAfterSlider
                      beforeUrl={before}
                      afterUrl={after}
                      beforeLabel="Pre-Op Base Scan"
                      afterLabel="Latest Recovery Result"
                    />
                  );
                } else {
                  return (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                      ℹ️ Please upload a <strong>Before (Day 0 Pre-Op)</strong> photo and at least one <strong>Post-Op</strong> photo (e.g. Month 6 or After) to enable the interactive slider.
                    </div>
                  );
                }
              })()}
            </div>

            {/* Gallery Grid */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
              <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                <Images className="w-5 h-5 text-teal-600" />
                History of Clinical Progression Photos ({patient.photos?.length || 0})
              </h3>
              {patient.photos && patient.photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {patient.photos.map((p: any) => (
                    <div key={p.id} className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group">
                      <img src={p.imageUrl} alt={p.type} className="w-full h-32 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-2.5 text-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider">{p.type.replace('_', ' ')}</span>
                        <span className="text-[9px] opacity-75">{p.capturedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  No clinical photos uploaded yet. Use the upload panel on the left to add photos.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
