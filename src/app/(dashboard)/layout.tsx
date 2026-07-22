import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { getSessionUser } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser();
  const userRole = session?.role || 'CLINIC_ADMIN';
  const userName = session?.name || 'Elena Rostova';

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar userRole={userRole} clinicName="Apex Hair Institute" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header userRole={userRole} userName={userName} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
