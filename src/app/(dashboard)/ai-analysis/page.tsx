'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Upload, CheckCircle2, AlertTriangle, RefreshCw, Save } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AIHairAnalysisPage() {
  const [photos, setPhotos] = useState<{ [key: string]: string }>({
    frontPhoto: '',
    topPhoto: '',
    leftPhoto: '',
    rightPhoto: '',
    backPhoto: '',
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch all patients for selection dropdown
    async function fetchPatients() {
      try {
        const res = await fetch('/api/patients');
        const data = await res.json();
        if (data.patients) setPatients(data.patients);
      } catch (err) {
        console.error('Error fetching patients:', err);
      }
    }
    fetchPatients();

    // 2. Read patientId query parameter if present
    const urlParams = new URLSearchParams(window.location.search);
    const pId = urlParams.get('patientId');
    if (pId) {
      setSelectedPatientId(pId);
      async function fetchPatientDetail() {
        try {
          const res = await fetch(`/api/patients/${pId}`);
          const data = await res.json();
          if (data.patient) setSelectedPatient(data.patient);
        } catch (err) {
          console.error('Error fetching patient detail:', err);
        }
      }
      fetchPatientDetail();
    }
  }, []);

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotos((prev) => ({
        ...prev,
        [key]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    const hasAnyPhoto = Object.values(photos).some((photo) => !!photo);
    if (!hasAnyPhoto) {
      Swal.fire({
        title: 'Photos Required',
        text: 'Please upload at least one scalp photograph (Front, Top, Left, Right, or Back view) to run the AI diagnostics.',
        icon: 'warning',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos, patientId: selectedPatientId || undefined }),
      });
      const data = await res.json();
      setTimeout(() => {
        setResult(data.analysis);
        setAnalyzing(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setAnalyzing(false);
    }
  };

  const handleSaveResult = async () => {
    if (!selectedPatientId) {
      Swal.fire({
        title: 'Patient Required',
        text: 'Please associate a patient record before saving this analysis.',
        icon: 'warning',
        confirmButtonColor: '#0d9488'
      });
      return;
    }

    setSaveSuccess(false);
    try {
      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos, patientId: selectedPatientId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveSuccess(true);
        Swal.fire({
          title: 'Saved!',
          text: 'AI Analysis has been saved to the patient record.',
          icon: 'success',
          confirmButtonColor: '#0d9488',
          timer: 1500,
          showConfirmButton: false
        });
        setTimeout(() => {
          window.location.href = `/patients/${selectedPatientId}`;
        }, 1500);
      } else {
        Swal.fire({
          title: 'Error',
          text: data.error || 'Failed to save analysis results',
          icon: 'error',
          confirmButtonColor: '#0d9488'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error',
        text: 'Error saving analysis results',
        icon: 'error',
        confirmButtonColor: '#0d9488'
      });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Scalp Vision Model v4.2</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Hair Loss & Graft Estimator</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Computer vision neural net for Norwood classification & donor supply calculation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: Photo Upload & Selector */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base">1. Patient Scalp Photo Intake</h3>

          {/* Patient Selector */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <label className="text-xs font-bold text-slate-700">Patient Association</label>
            {selectedPatient ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-900">{selectedPatient.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {selectedPatient.email} • {selectedPatient.hairLossStage || 'Norwood IV'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatientId('');
                    setSelectedPatient(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-[10px] transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedPatientId(val);
                  const p = patients.find((pat) => pat.id === val);
                  setSelectedPatient(p || null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-teal-500 font-semibold"
              >
                <option value="">-- Choose Patient (Optional for Preview) --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'frontPhoto', label: 'Frontal Hairline View' },
              { key: 'topPhoto', label: 'Top Vertex Crown View' },
              { key: 'leftPhoto', label: 'Left Temporal Peak' },
              { key: 'rightPhoto', label: 'Right Temporal Peak' },
              { key: 'backPhoto', label: 'Back Donor Area View' },
            ].map((view) => (
              <div key={view.key} className="space-y-2">
                <span className="text-xs font-bold text-slate-700">{view.label}</span>
                <input
                  type="file"
                  accept="image/*"
                  id={`file-${view.key}`}
                  onChange={(e) => handleFileChange(view.key, e)}
                  className="hidden"
                />
                <label
                  htmlFor={`file-${view.key}`}
                  className="relative h-36 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-teal-500 flex flex-col items-center justify-center overflow-hidden transition-colors group cursor-pointer"
                >
                  {photos[view.key] ? (
                    <img src={photos[view.key]} alt={view.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-3">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1 group-hover:text-teal-600 transition-colors" />
                      <span className="text-[10px] text-slate-500 font-bold">Click to upload photo</span>
                    </div>
                  )}
                </label>
              </div>
            ))}
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-sm shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Running Neural Scalp Scan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Run AI Graft Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: AI Results Display */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-xs relative min-h-[480px] flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 text-base">2. Automated Diagnostics Report</h3>
              {result && (
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  {result.confidenceScore}% Confidence
                </span>
              )}
            </div>

            {analyzing && (
              <div className="py-20 text-center space-y-4 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
                <p className="text-sm font-bold text-slate-900">Analyzing Follicular Density & Scalp Geometry...</p>
                <p className="text-xs text-slate-500 font-medium">Classifying Norwood scale & calculating donor supply ratio</p>
              </div>
            )}

            {!analyzing && !result && (
              <div className="py-20 text-center text-slate-400 text-xs font-medium">
                Upload patient scalp photos and click &quot;Run AI Graft Analysis&quot; to generate diagnosis.
              </div>
            )}

            {result && !analyzing && (
              <div className="space-y-6 animate-fadeIn">
                {/* 1. Quality & Status Banner */}
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Assessment Status</span>
                    <p className="font-extrabold text-teal-800 mt-0.5">{result.assessmentStatus} (Quality: {result.imageQuality?.overall || 'GOOD'})</p>
                  </div>
                  {result.imageQuality?.limitations?.length > 0 && (
                    <div className="text-right text-[11px] text-slate-600 font-medium">
                      Limitations: {result.imageQuality.limitations.join(', ')}
                    </div>
                  )}
                </div>

                {/* 2. Main Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 font-medium">Classified Hair Loss</span>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">{result.norwoodStage}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">{result.norwoodDescription}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 font-medium">Estimated Graft Count</span>
                    <p className="text-xl font-extrabold text-teal-600 mt-1">
                      {result.estimatedGraftRequirement?.minimumGrafts?.toLocaleString() || '0'} - {result.estimatedGraftRequirement?.maximumGrafts?.toLocaleString() || '0'}
                    </p>
                    <p className="text-[10px] text-emerald-600 mt-1 font-bold">
                      Recommended:{' '}
                      {(() => {
                        const rec = result.procedureAssessment?.preliminaryRecommendation;
                        if (rec === 'FUE') return 'FUE (Follicular Unit Extraction)';
                        if (rec === 'DHI') return 'DHI (Direct Hair Implantation)';
                        if (rec === 'FUT') return 'FUT (Strip Method)';
                        if (rec === 'COMBINATION') return 'Combination Session';
                        if (rec === 'NOT_ENOUGH_INFORMATION') return 'Clinical Exam Required';
                        return rec || 'FUE';
                      })()}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 font-medium">Donor Area Supply</span>
                    <p className="text-sm font-bold text-slate-700 mt-1">
                      {result.donorArea?.rating === 'NOT_ASSESSABLE' ? (
                        <span className="text-rose-600 font-extrabold">Photo Insufficient (Not Assessable)</span>
                      ) : (
                        <span className="text-emerald-600 font-extrabold">
                          {result.donorArea?.rating || 'GOOD'} ({result.donorArea?.qualityScore || '80'}/100)
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">
                      {result.donorArea?.rating === 'NOT_ASSESSABLE'
                        ? 'Please upload a clear photograph of the back of the head (donor area) to analyze hair density and extraction potential.'
                        : result.donorArea?.observations}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 font-medium">Hair Density</span>
                    <p className="text-lg font-bold text-slate-900 mt-1">
                      {result.donorArea?.densityEstimateGraftsPerCm2 || '80'} grafts/cm²
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">Pattern: {result.hairLossPattern} • Severity: {result.hairLossSeverity}</p>
                  </div>
                </div>

                {/* 3. Zone Breakdown */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Zone Analysis Breakdown</h4>
                  <div className="grid grid-cols-2 gap-3.5 text-[11px] font-medium text-slate-700">
                    <div>
                      <span className="text-slate-400 font-bold block">Frontal Recession</span>
                      <span>{result.zoneBreakdown?.frontalRecession}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Mid-Scalp Density</span>
                      <span>{result.zoneBreakdown?.midScalpDensity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Crown Vertex</span>
                      <span>{result.zoneBreakdown?.crownVertex}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Temporal Peaks</span>
                      <span>{result.zoneBreakdown?.temporalPeaks}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Clinical Observations & Next Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900">Clinical Findings</h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium">
                      {result.clinicalObservations?.map((obs: string, idx: number) => (
                        <li key={idx}>{obs}</li>
                      )) || <li>No abnormalities observed.</li>}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900">Recommended Next Steps</h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium">
                      {result.recommendedNextSteps?.map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      )) || <li>Consultation with restoration specialist.</li>}
                    </ul>
                  </div>
                </div>

                {/* 5. Technique Rationale */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900">Technique Rationale</h4>
                  <p className="text-slate-600 text-xs leading-relaxed font-medium">{result.procedureAssessment?.rationale}</p>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{result.disclaimer}</span>
              </div>

              <button
                onClick={handleSaveResult}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 flex items-center justify-center gap-2 transition-all"
              >
                <Save className="w-4 h-4 text-teal-600" />
                <span>{saveSuccess ? 'Saved to Patient Medical Record!' : 'Save Result to Patient Record'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
