'use client';

import React, { useState, useEffect } from 'react';
import { Search, User, GitMerge, Scissors, Calendar, Sparkles, X, ChevronRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { title: 'Search Patient Workspace', href: '/patients', icon: User, cat: 'Patients' },
    { title: 'View Lead Kanban Board', href: '/leads', icon: GitMerge, cat: 'Leads' },
    { title: 'Run AI Scalp & Graft Simulator', href: '/ai-analysis', icon: Sparkles, cat: 'AI Tools' },
    { title: 'Log Surgical Graft Counts', href: '/surgeries', icon: Scissors, cat: 'Surgeries' },
    { title: 'Book New Patient Appointment', href: '/appointments', icon: Calendar, cat: 'Schedule' },
  ];

  const filtered = quickActions.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) || item.cat.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center px-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-teal-600 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search patient records..."
            className="w-full py-4 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-sm font-semibold"
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2 max-h-80 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Shortcuts
          </div>
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No matching actions found.</div>
          ) : (
            filtered.map((action, idx) => (
              <a
                key={idx}
                href={action.href}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-teal-700">{action.title}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{action.cat}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5" />
              </a>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Tip: Navigate with arrow keys or type to filter</span>
          <span className="font-bold text-teal-700">GraftDesk AI Engine</span>
        </div>
      </div>
    </div>
  );
}
