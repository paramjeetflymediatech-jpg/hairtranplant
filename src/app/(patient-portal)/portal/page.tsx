'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Scissors,
  Clock,
  CheckCircle2,
  Award,
  Images,
  User,
  Plus,
  Phone,
  Mail,
  FileText,
  ArrowRight,
  ShieldCheck,
  Activity,
  HeartHandshake
} from 'lucide-react';
import Swal from 'sweetalert2';
import { BeforeAfterSlider } from '@/components/gallery/BeforeAfterSlider';
import Link from 'next/link';

export default function PatientPortalPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [portalErrors, setPortalErrors] = useState<{ [key: string]: string }>({});
  const [newApp, setNewApp] = useState({
    doctorId: '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    type: 'CONSULTATION',
    notes: '',
  });

  const TIME_SLOTS = [
    { value: '09:00', label: '09:00 AM' },
    { value: '09:30', label: '09:30 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '10:30', label: '10:30 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '11:30', label: '11:30 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '12:30', label: '12:30 PM' },
    { value: '13:00', label: '01:00 PM' },
    { value: '13:30', label: '01:30 PM' },
    { value: '14:00', label: '02:00 PM' },
    { value: '14:30', label: '02:30 PM' },
    { value: '15:00', label: '03:00 PM' },
    { value: '15:30', label: '03:30 PM' },
    { value: '16:00', label: '04:00 PM' },
    { value: '16:30', label: '04:30 PM' },
    { value: '17:00', label: '05:00 PM' },
    { value: '17:30', label: '05:30 PM' },
    { value: '18:00', label: '06:00 PM' },
    { value: '18:30', label: '06:30 PM' },
    { value: '19:00', label: '07:00 PM' },
  ];

  const checkPortalOverlap = (date: string, startTime: string, endTime: string, docId: string) => {
    if (!date || !startTime || !endTime) return null;
    const existingApps: any[] = data?.patient?.appointments || [];

    const sameDayApps = existingApps.filter(
      (a: any) => a.appointmentDate === date && a.status !== 'CANCELLED'
    );

    for (const app of sameDayApps) {
      if (startTime < app.endTime && endTime > app.startTime) {
        return `You already have an appointment scheduled between ${app.startTime} and ${app.endTime}.`;
      }
    }
    return null;
  };

  const validatePortalForm = () => {
    const errors: { [key: string]: string } = {};
    const todayStr = new Date().toISOString().split('T')[0];

    if (!newApp.doctorId) {
      errors.doctorId = 'Specialist selection is required.';
    }
    if (!newApp.appointmentDate) {
      errors.appointmentDate = 'Date selection is required.';
    } else if (newApp.appointmentDate < todayStr) {
      errors.appointmentDate = 'Date cannot be in the past.';
    }

    const WORK_START = '09:00';
    const WORK_END = '19:00';

    if (!newApp.startTime) {
      errors.startTime = 'Start time is required.';
    } else if (newApp.startTime < WORK_START || newApp.startTime > WORK_END) {
      errors.startTime = 'Start time must be within working hours (09:00 AM - 07:00 PM).';
    }

    if (!newApp.endTime) {
      errors.endTime = 'End time is required.';
    } else if (newApp.endTime < WORK_START || newApp.endTime > WORK_END) {
      errors.endTime = 'End time must be within working hours (09:00 AM - 07:00 PM).';
    }

    if (newApp.startTime && newApp.endTime) {
      if (newApp.startTime >= newApp.endTime) {
        errors.endTime = 'End time must be after start time.';
      } else {
        const [sH, sM] = newApp.startTime.split(':').map(Number);
        const [eH, eM] = newApp.endTime.split(':').map(Number);
        const duration = (eH * 60 + eM) - (sH * 60 + sM);
        if (duration < 15) {
          errors.endTime = 'Slot duration must be at least 15 minutes.';
        }
      }

      if (newApp.appointmentDate === todayStr) {
        const now = new Date();
        const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (currentHHMM > WORK_END) {
          errors.appointmentDate = 'Working hours for today (09:00 AM - 07:00 PM) have ended. Please pick a future date.';
        } else if (newApp.startTime < currentHHMM) {
          errors.startTime = 'Start time cannot be in the past for today.';
        }
      }

      const overlapError = checkPortalOverlap(
        newApp.appointmentDate,
        newApp.startTime,
        newApp.endTime,
        newApp.doctorId
      );
      if (overlapError) {
        errors.overlap = overlapError;
      }
    }

    setPortalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchPortalData = async () => {
    try {
      const res = await fetch('/api/portal/dashboard');
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      }
    } catch (err) {
      console.error('Error fetching portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();

    // Fetch doctors for selector
    fetch('/api/users')
      .then((res) => res.json())
      .then((uData) => {
        if (uData.users) setDoctors(uData.users);
      });
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.patient?.id) return;
    if (!validatePortalForm()) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please check the highlighted form inputs.',
        icon: 'warning',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newApp,
          patientId: data.patient.id,
        }),
      });
      const resData = await res.json();
      if (res.ok) {
        Swal.fire({
          title: 'Booking Confirmed!',
          text: 'Your consultation slot has been reserved successfully.',
          icon: 'success',
          confirmButtonColor: '#0d9488',
        });
        setShowBookModal(false);
        setPortalErrors({});
        setNewApp({
          doctorId: '',
          appointmentDate: '',
          startTime: '',
          endTime: '',
          type: 'CONSULTATION',
          notes: '',
        });
        fetchPortalData();
      } else {
        Swal.fire({
          title: 'Booking Failed',
          text: resData.error || 'Failed to request appointment',
          icon: 'error',
          confirmButtonColor: '#0d9488',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error',
        text: 'Error requesting appointment',
        icon: 'error',
        confirmButtonColor: '#0d9488',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-teal-600 animate-pulse" />
          <p className="text-xs text-slate-500 font-semibold">Loading your recovery portal...</p>
        </div>
      </div>
    );
  }

  if (!data?.patient) {
    return (
      <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-4">
        <h3 className="text-sm font-bold text-rose-800">No Patient Record Found</h3>
        <p className="text-xs text-rose-600">Please contact your clinic admin to verify your patient record association.</p>
      </div>
    );
  }

  const patient = data.patient;
  const surgery = patient.surgeries?.[0];
  const lastAnalysis = patient.hairAnalyses?.[0];
  const photos = patient.photos || [];

  // Determine before and after URLs dynamically if available
  const beforePhoto = photos.find((p: any) => p.type === 'BEFORE' || p.type === 'DAY_1')?.imageUrl;
  const afterPhoto = photos.find((p: any) => ['AFTER', 'MONTH_6', 'MONTH_12', 'MONTH_9'].includes(p.type))?.imageUrl;

  // Pre-Op vs Post-Op status tags
  const statusDisplay = patient.status === 'POST_OP' ? 'Post-Op Recovery' : patient.status === 'SCHEDULED' ? 'Surgery Scheduled' : 'In Consultation';

  return (
    <div className="space-y-8 pb-16">
      {/* Patient Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-5">
          {patient.profilePhoto ? (
            <img
              src={patient.profilePhoto}
              alt={patient.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-500/60 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-teal-800/80 border border-teal-500/40 text-teal-200 font-extrabold flex items-center justify-center text-xl shadow-lg">
              {patient.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight">{patient.name}</h1>
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] font-bold uppercase tracking-wider">
                {statusDisplay}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Primary Surgeon: <span className="text-teal-400 font-semibold">{data.surgeonName}</span>
              {surgery && ` • Last Procedure: ${surgery.graftsCount || 3120} Grafts (${surgery.surgeryDate})`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowBookModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-900/40 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Consultation</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Medical & Graft Metrics */}
        <div className="lg:col-span-2 space-y-8">
          {/* Graft Breakdown */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Scissors className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-base">Follicular Unit Graft Breakdown</h3>
            </div>
            
            {surgery ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Implanted</span>
                    <p className="text-2xl font-black text-teal-600 mt-1">{surgery.graftsCount || 3120}</p>
                    <span className="text-[9px] text-slate-400 font-medium mt-1 block">Grafts Placed</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Single Grafts</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">650</p>
                    <span className="text-[9px] text-slate-400 font-medium mt-1 block">Hairline Zone</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Double Grafts</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">1,450</p>
                    <span className="text-[9px] text-slate-400 font-medium mt-1 block">Mid-Scalp Zone</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Multi Grafts</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">1,020</p>
                    <span className="text-[9px] text-slate-400 font-medium mt-1 block">Crown & Core</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100/80 text-[11px] text-teal-800 font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Implanted using high-precision Sapphire Micro-Blades for maximum density retention.</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                🗓️ Your surgery is currently being scheduled. Graft breakdown metrics will populate post-operatively.
              </div>
            )}
          </div>

          {/* Growth Timeline Slider */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Images className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-base">Growth & Restoration Gallery</h3>
            </div>

            {beforePhoto && afterPhoto ? (
              <div className="space-y-4">
                <BeforeAfterSlider
                  beforeUrl={beforePhoto}
                  afterUrl={afterPhoto}
                  beforeLabel="Pre-Op Base Scan"
                  afterLabel="Latest Recovery Result"
                />
                <p className="text-[11px] text-slate-500 text-center font-medium italic">
                  Drag the slider to compare hair restoration maturation progress.
                </p>
              </div>
            ) : photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photos.map((photo: any) => (
                  <div key={photo.id} className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group">
                    <img src={photo.imageUrl} alt={photo.type} className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">{photo.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                📸 Recovery photos have not been uploaded yet. Your surgeon will add progression photos during reviews.
              </div>
            )}
          </div>

          {/* AI Hair Analysis History */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-base">AI Scalp Diagnostics History</h3>
            </div>

            {lastAnalysis ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Loss Stage (Norwood)</span>
                  <p className="text-lg font-black text-slate-900">{lastAnalysis.norwoodStage || 'Norwood IV'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans">Hair Density</span>
                  <p className="text-lg font-black text-slate-900">{lastAnalysis.hairDensity || '85'} grafts / cm²</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Donor Quality / Score</span>
                  <p className={`text-sm font-black ${lastAnalysis.donorAreaQuality?.includes('Not Assessable') ? 'text-rose-600' : 'text-teal-600'}`}>
                    {lastAnalysis.donorAreaQuality || 'EXCELLENT'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="space-y-1 text-left">
                  <p className="text-xs font-bold text-slate-900">No Scalp Scan On File</p>
                  <p className="text-[11px] text-slate-500 font-medium">Configure an instant AI hair loss evaluation to check donor supply.</p>
                </div>
                <Link
                  href={`/ai-analysis?patientId=${patient.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 shrink-0"
                >
                  <span>Launch Scan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Recovery Checklist & Appointments */}
        <div className="space-y-8">
          {/* Post-Op Checklist */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <HeartHandshake className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-base">Milestone & Care Guide</h3>
            </div>

            <div className="space-y-3.5">
              {[
                { title: 'Day 1 Post-Op Review', status: 'COMPLETED', date: 'Done' },
                { title: 'Day 7 Gentle Wash (Remove Scabs)', status: 'COMPLETED', date: 'Done' },
                { title: 'Avoid Strenuous Exercise (2 Wks)', status: 'COMPLETED', date: 'Done' },
                { title: 'Month 6 Growth Density Check', status: 'DUE TODAY', date: 'July 2026' },
                { title: 'Month 12 Final Hairline Density', status: 'UPCOMING', date: 'Jan 2027' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    item.status === 'COMPLETED'
                      ? 'bg-slate-50/50 border-slate-100 text-slate-500'
                      : item.status === 'DUE TODAY'
                      ? 'bg-teal-50 border-teal-200 text-teal-900'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 text-xs">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        item.status === 'COMPLETED'
                          ? 'text-slate-400'
                          : item.status === 'DUE TODAY'
                          ? 'text-teal-600'
                          : 'text-slate-300'
                      }`}
                    />
                    <span className="font-bold">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-bold opacity-80 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments Calendar */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Calendar className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-base">Your Schedule</h3>
            </div>

            {patient.appointments && patient.appointments.length > 0 ? (
              <div className="space-y-3">
                {patient.appointments.map((app: any) => (
                  <div key={app.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{app.appointmentDate}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                        {app.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{app.startTime} - {app.endTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                No appointments booked.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book Consultation Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleBook} noValidate className="w-full max-w-md p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Request Consultation Slot</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Doctor / Specialist <span className="text-rose-500">*</span>
              </label>
              <select
                value={newApp.doctorId}
                onChange={(e) => {
                  setNewApp({ ...newApp, doctorId: e.target.value });
                  if (portalErrors.doctorId) setPortalErrors((prev) => ({ ...prev, doctorId: '' }));
                }}
                className={`w-full px-4 py-2 rounded-xl text-slate-900 text-xs font-medium focus:outline-none ${
                  portalErrors.doctorId
                    ? 'bg-rose-50/50 border border-rose-400 focus:border-rose-500'
                    : 'bg-slate-50 border border-slate-200 focus:border-teal-500'
                }`}
              >
                <option value="">-- Choose Specialist --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.role})</option>
                ))}
              </select>
              {portalErrors.doctorId && <p className="text-[11px] text-rose-500 font-medium mt-1">{portalErrors.doctorId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Requested Type</label>
                <select
                  value={newApp.type}
                  onChange={(e) => setNewApp({ ...newApp, type: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-teal-500"
                >
                  <option value="CONSULTATION">Consultation</option>
                  <option value="FOLLOW_UP">Post-Op Follow-Up</option>
                  <option value="REVIEW">Growth Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={newApp.appointmentDate}
                  onChange={(e) => {
                    setNewApp({ ...newApp, appointmentDate: e.target.value });
                    if (portalErrors.appointmentDate) setPortalErrors((prev) => ({ ...prev, appointmentDate: '' }));
                  }}
                  className={`w-full px-4 py-2 rounded-xl text-slate-900 text-xs font-medium focus:outline-none ${
                    portalErrors.appointmentDate
                      ? 'bg-rose-50/50 border border-rose-400 focus:border-rose-500'
                      : 'bg-slate-50 border border-slate-200 focus:border-teal-500'
                  }`}
                />
                {portalErrors.appointmentDate && <p className="text-[11px] text-rose-500 font-medium mt-1">{portalErrors.appointmentDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Time <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newApp.startTime}
                  onChange={(e) => {
                    setNewApp({ ...newApp, startTime: e.target.value });
                    if (portalErrors.startTime || portalErrors.overlap) {
                      setPortalErrors((prev) => ({ ...prev, startTime: '', overlap: '' }));
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-xl text-slate-900 text-xs font-medium focus:outline-none ${
                    portalErrors.startTime
                      ? 'bg-rose-50/50 border border-rose-400 focus:border-rose-500'
                      : 'bg-slate-50 border border-slate-200 focus:border-teal-500'
                  }`}
                >
                  <option value="">-- Select Start Time --</option>
                  {TIME_SLOTS.slice(0, -1).map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                {portalErrors.startTime && <p className="text-[11px] text-rose-500 font-medium mt-1">{portalErrors.startTime}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  End Time <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newApp.endTime}
                  onChange={(e) => {
                    setNewApp({ ...newApp, endTime: e.target.value });
                    if (portalErrors.endTime || portalErrors.overlap) {
                      setPortalErrors((prev) => ({ ...prev, endTime: '', overlap: '' }));
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-xl text-slate-900 text-xs font-medium focus:outline-none ${
                    portalErrors.endTime
                      ? 'bg-rose-50/50 border border-rose-400 focus:border-rose-500'
                      : 'bg-slate-50 border border-slate-200 focus:border-teal-500'
                  }`}
                >
                  <option value="">-- Select End Time --</option>
                  {TIME_SLOTS.filter((slot) => !newApp.startTime || slot.value > newApp.startTime).map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                {portalErrors.endTime && <p className="text-[11px] text-rose-500 font-medium mt-1">{portalErrors.endTime}</p>}
              </div>
            </div>

            {portalErrors.overlap && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <span>⚠️ {portalErrors.overlap}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes</label>
              <textarea
                value={newApp.notes}
                onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-teal-500 h-20 resize-none"
                placeholder="Describe your current status or questions..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPortalErrors({});
                  setShowBookModal(false);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                Book Session
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
