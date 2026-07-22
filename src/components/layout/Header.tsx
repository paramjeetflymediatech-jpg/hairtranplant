'use client';

import React, { useState } from 'react';
import { Search, Bell, Sparkles, ChevronDown, User, Shield, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { CommandPalette } from './CommandPalette';

interface HeaderProps {
  userRole?: string;
  userName?: string;
}

export function Header({ userRole = 'CLINIC_ADMIN', userName = 'Elena Rostova' }: HeaderProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = [
    { id: '1', title: 'Surgery Completed', desc: 'FUE 3,100 grafts completed for Michael Vance.', time: '10m ago', type: 'success' },
    { id: '2', title: 'New Lead Inbound', desc: 'Julian Thorne requested online graft assessment.', time: '1h ago', type: 'info' },
    { id: '3', title: 'Follow-Up Due', desc: '6-Month photo evaluation scheduled for today.', time: '3h ago', type: 'warning' },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-white/90 backdrop-blur-xl border-b border-slate-200/90 shadow-2xs">
        {/* Search Bar / Command Palette Trigger */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-3 px-3.5 py-2 w-64 md:w-80 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all text-xs font-medium"
          >
            <Search className="w-4 h-4 text-teal-600" />
            <span className="flex-1 text-left">Search patients, leads, surgeries...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded shadow-xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Side Tools */}
        <div className="flex items-center gap-3">
          {/* Quick AI Action button */}
          <a
            href="/ai-analysis"
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>AI Hair Scanner</span>
          </a>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-600" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 py-2 rounded-2xl bg-white border border-slate-200 shadow-xl z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Notifications</span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    3 New
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors flex gap-3 items-start">
                      {n.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">{n.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {userName.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">{userName}</span>
                <span className="text-[10px] text-slate-500 capitalize">{userRole.replace('_', ' ')}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 py-2 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 text-xs">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900">{userName}</p>
                  <p className="text-[10px] text-slate-500">admin@apexhair.com</p>
                </div>
                <a href="/portal" className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition-colors font-medium">
                  <User className="w-4 h-4 text-teal-600" /> Patient Portal Mode
                </a>
                <a href="/settings/billing" className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition-colors font-medium">
                  <Shield className="w-4 h-4 text-slate-500" /> Subscription Settings
                </a>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/login';
                  }}
                  className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-bold"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
}
