'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, User, Scissors, Sparkles, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
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

  const checkOverlap = (date: string, startTime: string, endTime: string, docId: string, patId: string) => {
    if (!date || !startTime || !endTime) return null;

    const sameDayAppointments = appointments.filter(
      (a) => a.appointmentDate === date && a.status !== 'CANCELLED'
    );

    for (const app of sameDayAppointments) {
      if (startTime < app.endTime && endTime > app.startTime) {
        if (docId && app.doctorId === docId) {
          return `Doctor is already booked from ${app.startTime} to ${app.endTime}.`;
        }
        if (patId && app.patientId === patId) {
          return `Patient already has an appointment from ${app.startTime} to ${app.endTime}.`;
        }
      }
    }
    return null;
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    const todayStr = new Date().toISOString().split('T')[0];

    if (!newAppointment.patientId) {
      errors.patientId = 'Patient selection is required.';
    }
    if (!newAppointment.doctorId) {
      errors.doctorId = 'Doctor/Consultant selection is required.';
    }
    if (!newAppointment.appointmentDate) {
      errors.appointmentDate = 'Appointment date is required.';
    } else if (newAppointment.appointmentDate < todayStr) {
      errors.appointmentDate = 'Appointment date cannot be in the past.';
    }

    const WORK_START = '09:00';
    const WORK_END = '19:00';

    if (!newAppointment.startTime) {
      errors.startTime = 'Start time is required.';
    } else if (newAppointment.startTime < WORK_START || newAppointment.startTime > WORK_END) {
      errors.startTime = 'Start time must be within working hours (09:00 AM - 07:00 PM).';
    }

    if (!newAppointment.endTime) {
      errors.endTime = 'End time is required.';
    } else if (newAppointment.endTime < WORK_START || newAppointment.endTime > WORK_END) {
      errors.endTime = 'End time must be within working hours (09:00 AM - 07:00 PM).';
    }

    if (newAppointment.startTime && newAppointment.endTime) {
      if (newAppointment.startTime >= newAppointment.endTime) {
        errors.endTime = 'End time must be after start time.';
      } else {
        const [sH, sM] = newAppointment.startTime.split(':').map(Number);
        const [eH, eM] = newAppointment.endTime.split(':').map(Number);
        const duration = (eH * 60 + eM) - (sH * 60 + sM);
        if (duration < 15) {
          errors.endTime = 'Slot duration must be at least 15 minutes.';
        }
      }

      if (newAppointment.appointmentDate === todayStr) {
        const now = new Date();
        const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (currentHHMM > WORK_END) {
          errors.appointmentDate = 'Working hours for today (09:00 AM - 07:00 PM) have ended. Please pick a future date.';
        } else if (newAppointment.startTime < currentHHMM) {
          errors.startTime = 'Start time cannot be in the past for today.';
        }
      }

      // Schedule overlap check
      const overlapMessage = checkOverlap(
        newAppointment.appointmentDate,
        newAppointment.startTime,
        newAppointment.endTime,
        newAppointment.doctorId,
        newAppointment.patientId
      );
      if (overlapMessage) {
        errors.overlap = overlapMessage;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      if (data.appointments) setAppointments(data.appointments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    // Fetch patients for booking select dropdown
    fetch('/api/patients')
      .then((res) => res.json())
      .then((data) => {
        if (data.patients) setPatients(data.patients);
      });

    // Fetch clinic doctors for select dropdown
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users) setDoctors(data.users);
      });
  }, []);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please review the highlighted fields in the form.',
        icon: 'warning',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment),
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        setFormErrors({});
        setNewAppointment({
          patientId: '',
          doctorId: '',
          appointmentDate: '',
          startTime: '',
          endTime: '',
          type: 'CONSULTATION',
          notes: '',
        });
        Swal.fire({
          title: 'Success!',
          text: 'Appointment booked successfully.',
          icon: 'success',
          confirmButtonColor: '#0d9488'
        });
        fetchAppointments();
      } else {
        Swal.fire({
          title: 'Booking Error',
          text: data.error || 'Failed to create appointment',
          icon: 'error',
          confirmButtonColor: '#0d9488'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error',
        text: 'Error creating appointment',
        icon: 'error',
        confirmButtonColor: '#0d9488'
      });
    }
  };

  const filtered = filterType ? appointments.filter(a => a.type === filterType) : appointments;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Appointment Calendar & Schedule</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage consultation bookings, post-op reviews, and surgical operating theatre slots.</p>
        </div>

        <button
          onClick={() => {
            setFormErrors({});
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-teal-500 font-semibold shadow-2xs"
        >
          <option value="">All Appointment Types</option>
          <option value="CONSULTATION">Consultations</option>
          <option value="SURGERY">Surgeries</option>
          <option value="FOLLOW_UP">Follow-Ups</option>
          <option value="REVIEW">Reviews</option>
        </select>
      </div>

      {/* Appointment Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((app) => (
          <div
            key={app.id}
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-500/30 transition-all shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-900">{app.appointmentDate}</span>
                <span className="text-[11px] text-slate-500 font-medium">({app.startTime} - {app.endTime})</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  app.type === 'SURGERY'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : app.type === 'CONSULTATION'
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {app.type}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs border border-teal-100">
                {app.patient?.name ? app.patient.name.substring(0, 2) : 'PT'}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{app.patient?.name || 'Patient'}</p>
                <p className="text-xs text-slate-500 font-medium">Assigned Doctor: {app.doctor?.name || 'Dr. Alexander Vance'}</p>
              </div>
            </div>

            {app.notes && (
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-medium">
                {app.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleCreateAppointment} noValidate className="w-full max-w-md p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Book New Appointment Slot</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Patient <span className="text-rose-500">*</span>
              </label>
              <select
                value={newAppointment.patientId}
                onChange={(e) => {
                  setNewAppointment({ ...newAppointment, patientId: e.target.value });
                  if (formErrors.patientId) setFormErrors((prev) => ({ ...prev, patientId: '' }));
                }}
                className={`w-full px-4 py-2 rounded-xl text-slate-900 text-xs font-medium focus:outline-none ${
                  formErrors.patientId
                    ? 'bg-rose-50/50 border border-rose-400 focus:border-rose-500'
                    : 'bg-slate-50 border border-slate-200 focus:border-teal-500'
                }`}
              >
                <option value="">-- Select Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                ))}
              </select>
              {formErrors.patientId && <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.patientId}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Doctor / Consultant <span className="text-rose-500">*</span>
              </label>
              <select
                value={newAppointment.doctorId}
                onChange={(e) => {
                  setNewAppointment({ ...newAppointment, doctorId: e.target.value });
                  if (formErrors.doctorId) setFormErrors((prev) => ({ ...prev, doctorId: '' }));
                }}
                className={`w-full px-4 py-2 rounded-xl text-slate-900 text-xs font-medium focus:outline-none ${
                  formErrors.doctorId
                    ? 'bg-rose-50/50 border border-rose-400 focus:border-rose-500'
                    : 'bg-slate-50 border border-slate-200 focus:border-teal-500'
                }`}
              >
                <option value="">-- Select Doctor/Consultant --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.role})</option>
                ))}
              </select>
              {formErrors.doctorId && <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.doctorId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Type</label>
                <select
                  value={newAppointment.type}
                  onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-teal-500"
                >
                  <option value="CONSULTATION">Consultation</option>
                  <option value="SURGERY">Surgery</option>
                  <option value="FOLLOW_UP">Follow-Up</option>
                  <option value="REVIEW">Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={newAppointment.appointmentDate}
                  onChange={(e) => {
                    setNewAppointment({ ...newAppointment, appointmentDate: e.target.value });
                    if (formErrors.appointmentDate) setFormErrors((prev) => ({ ...prev, appointmentDate: '' }));
                  }}
                  className={`w-full px-4 py-2 rounded-xl text-slate-900 text-xs font-medium focus:outline-none ${
                    formErrors.appointmentDate
                      ? 'bg-rose-50/50 border border-rose-400 focus:border-rose-500'
                      : 'bg-slate-50 border border-slate-200 focus:border-teal-500'
                  }`}
                />
                {formErrors.appointmentDate && <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.appointmentDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Time <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newAppointment.startTime}
                  onChange={(e) => {
                    setNewAppointment({ ...newAppointment, startTime: e.target.value });
                    if (formErrors.startTime || formErrors.overlap) {
                      setFormErrors((prev) => ({ ...prev, startTime: '', overlap: '' }));
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-xl text-slate-900 text-xs font-medium focus:outline-none ${
                    formErrors.startTime
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
                {formErrors.startTime && <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.startTime}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  End Time <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newAppointment.endTime}
                  onChange={(e) => {
                    setNewAppointment({ ...newAppointment, endTime: e.target.value });
                    if (formErrors.endTime || formErrors.overlap) {
                      setFormErrors((prev) => ({ ...prev, endTime: '', overlap: '' }));
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-xl text-slate-900 text-xs font-medium focus:outline-none ${
                    formErrors.endTime
                      ? 'bg-rose-50/50 border border-rose-400 focus:border-rose-500'
                      : 'bg-slate-50 border border-slate-200 focus:border-teal-500'
                  }`}
                >
                  <option value="">-- Select End Time --</option>
                  {TIME_SLOTS.filter((slot) => !newAppointment.startTime || slot.value > newAppointment.startTime).map(
                    (slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    )
                  )}
                </select>
                {formErrors.endTime && <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.endTime}</p>}
              </div>
            </div>

            {formErrors.overlap && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <span>⚠️ {formErrors.overlap}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Procedure Details</label>
              <textarea
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-teal-500 h-20 resize-none"
                placeholder="e.g. Frontal hairline restoration design review..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setFormErrors({});
                  setShowModal(false);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                Book Appointment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
