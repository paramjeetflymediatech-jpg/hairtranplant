'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, UserPlus, Filter, ChevronRight, User, Phone, Mail, Sparkles, Scissors, Calendar, X, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PatientDirectoryPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', email: '', phone: '', hairLossStage: 'Norwood IV', status: 'CONSULTATION' });

  const handleDeletePatient = async (patientId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete all their appointments, medical notes, follow-ups, and surgeries.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0d9488',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: 'Deleted!',
          text: 'Patient record has been deleted.',
          icon: 'success',
          confirmButtonColor: '#0d9488'
        });
        fetchPatients();
      } else {
        Swal.fire({
          title: 'Error',
          text: data.error || 'Failed to delete patient',
          icon: 'error',
          confirmButtonColor: '#0d9488'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error',
        text: 'Error deleting patient',
        icon: 'error',
        confirmButtonColor: '#0d9488'
      });
    }
  };

  const fetchPatients = async () => {
    try {
      const url = `/api/patients?search=${encodeURIComponent(search)}&status=${encodeURIComponent(statusFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.patients) setPatients(data.patients);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, statusFilter]);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient),
      });
      const data = await res.json();
      if (res.ok) {
        const patientEmail = newPatient.email;
        setShowModal(false);
        setNewPatient({ name: '', email: '', phone: '', hairLossStage: 'Norwood IV', status: 'CONSULTATION' });
        fetchPatients();
        if (patientEmail) {
          Swal.fire({
            title: 'Patient Created!',
            html: `Patient record and portal account created successfully.<br/><br/><strong>Share credentials with the patient:</strong><br/>Email: <code>${patientEmail}</code><br/>Password: <code>password123</code>`,
            icon: 'success',
            confirmButtonColor: '#0d9488'
          });
        } else {
          Swal.fire({
            title: 'Success',
            text: 'Patient record created successfully!',
            icon: 'success',
            confirmButtonColor: '#0d9488'
          });
        }
      } else {
        Swal.fire({
          title: 'Error',
          text: data.error || 'Failed to create patient',
          icon: 'error',
          confirmButtonColor: '#0d9488'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error',
        text: 'Error creating patient',
        icon: 'error',
        confirmButtonColor: '#0d9488'
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient CRM Directory</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage patient medical records, surgical histories, and outcome timelines.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-opacity"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by patient name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500 font-medium shadow-2xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-teal-500 font-semibold shadow-2xs"
        >
          <option value="">All Patient Statuses</option>
          <option value="CONSULTATION">In Consultation</option>
          <option value="SCHEDULED">Surgery Scheduled</option>
          <option value="POST_OP">Post-Op Recovery</option>
          <option value="COMPLETED">12-Month Completed</option>
        </select>
      </div>

      {/* Patient Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-500/40 transition-all shadow-xs hover:shadow-lg space-y-4 flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {patient.profilePhoto ? (
                    <img src={patient.profilePhoto} alt={patient.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-sm border border-teal-200">
                      {patient.name.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-700 transition-colors">{patient.name}</h3>
                    <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      {patient.hairLossStage || 'Norwood IV'}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    patient.status === 'POST_OP'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : patient.status === 'SCHEDULED'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}
                >
                  {patient.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3 font-medium">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{patient.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patient.phone || 'No phone number'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <Link
                href={`/patients/${patient.id}`}
                className="flex-grow py-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 font-bold text-xs border border-slate-200 hover:border-teal-200 transition-all flex items-center justify-center gap-2"
              >
                <span>Open Workspace</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <button
                type="button"
                onClick={() => handleDeletePatient(patient.id)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-all shrink-0"
                title="Delete Patient Record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleCreatePatient} className="w-full max-w-md p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create New Patient Record</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={newPatient.email}
                onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
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
                Save Patient
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
