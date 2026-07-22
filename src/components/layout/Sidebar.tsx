'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GitMerge,
  Calendar,
  Sparkles,
  Scissors,
  Clock,
  Images,
  CreditCard,
  ShieldCheck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Activity,
  Award
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  userRole?: string;
  clinicName?: string;
}

export function Sidebar({ userRole = 'CLINIC_ADMIN', clinicName = 'Apex Hair Institute' }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const mainNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'CONSULTANT', 'RECEPTIONIST'] },
    { name: 'Patient CRM', href: '/patients', icon: Users, roles: ['CLINIC_ADMIN', 'DOCTOR', 'CONSULTANT', 'RECEPTIONIST'] },
    { name: 'Lead Pipeline', href: '/leads', icon: GitMerge, roles: ['CLINIC_ADMIN', 'DOCTOR', 'CONSULTANT', 'RECEPTIONIST'] },
    { name: 'Appointments', href: '/appointments', icon: Calendar, roles: ['CLINIC_ADMIN', 'DOCTOR', 'CONSULTANT', 'RECEPTIONIST'] },
    { name: 'AI Hair Analysis', href: '/ai-analysis', icon: Sparkles, roles: ['CLINIC_ADMIN', 'DOCTOR', 'CONSULTANT'] },
    { name: 'Surgery Tracker', href: '/surgeries', icon: Scissors, roles: ['CLINIC_ADMIN', 'DOCTOR'] },
    { name: 'Follow-Up Engine', href: '/follow-ups', icon: Clock, roles: ['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { name: 'Before & After', href: '/gallery', icon: Images, roles: ['CLINIC_ADMIN', 'DOCTOR', 'CONSULTANT'] },
  ];

  const subNav = [
    { name: 'Clinic Settings', href: '/settings', icon: Settings, roles: ['CLINIC_ADMIN'] },
    { name: 'Billing & Plans', href: '/settings/billing', icon: CreditCard, roles: ['CLINIC_ADMIN'] },
    { name: 'Patient Portal', href: '/portal', icon: UserCheck, roles: ['PATIENT', 'CLINIC_ADMIN', 'DOCTOR'] },
  ];

  const superAdminNav = [
    { name: 'Super Admin Control', href: '/super-admin', icon: ShieldCheck, roles: ['SUPER_ADMIN'] }
  ];

  const filteredNav = mainNav.filter(item => item.roles.includes(userRole));
  const filteredSub = subNav.filter(item => item.roles.includes(userRole));
  const filteredSuper = superAdminNav.filter(item => item.roles.includes(userRole));

  return (
    <aside
      className={clsx(
        'relative flex flex-col justify-between h-screen bg-white border-r border-slate-200/90 shadow-sm transition-all duration-300 z-30 select-none shrink-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Top Brand Banner */}
      <div>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-bold shadow-md shadow-teal-500/20 shrink-0">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-lg text-slate-900 font-sans">
                  Graft<span className="text-teal-600">Desk</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">
                  Clinic OS
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Clinic Tenant Label */}
        {!collapsed && (
          <div className="mx-3 my-3 p-2.5 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center gap-2.5">
            <Award className="w-4 h-4 text-teal-600 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{clinicName}</p>
              <p className="text-[10px] text-teal-700 font-semibold">Verified Medical Practice</p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
          <div className={clsx('text-[10px] font-bold text-slate-400 uppercase px-3 py-1', collapsed && 'text-center')}>
            {collapsed ? '•••' : 'Core Workspace'}
          </div>
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group',
                  isActive
                    ? 'bg-teal-50 text-teal-700 border border-teal-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon
                  className={clsx(
                    'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105',
                    isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}

          {filteredSuper.length > 0 && (
            <div className="pt-3">
              <div className={clsx('text-[10px] font-bold text-rose-500 uppercase px-3 py-1', collapsed && 'text-center')}>
                {collapsed ? 'SA' : 'Super Admin'}
              </div>
              {filteredSuper.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100/80 transition-all"
                >
                  <item.icon className="w-5 h-5 text-rose-600 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              ))}
            </div>
          )}

          {filteredSub.length > 0 && (
            <div className="pt-3">
              <div className={clsx('text-[10px] font-bold text-slate-400 uppercase px-3 py-1', collapsed && 'text-center')}>
                {collapsed ? '•••' : 'Management & Portal'}
              </div>
              {filteredSub.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group',
                      isActive
                        ? 'bg-teal-50 text-teal-700 border border-teal-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    )}
                  >
                    <item.icon className="w-5 h-5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {userRole.substring(0, 2)}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">Elena Rostova</p>
                <p className="text-[10px] text-slate-500 capitalize">{userRole.replace('_', ' ')}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
