import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Flame, Coins, ShieldCheck, UserCheck, ChevronDown, Award } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { user, role, switchPersona } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-6 py-3.5 flex items-center justify-between">
      {/* Brand & Live Region Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onTabChange('map')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-xl shadow-glow">
            🦁
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-display tracking-tight text-white">SaafSafari</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE NCR
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Verifiable Civic Waste & Energy Action</p>
          </div>
        </div>
      </div>

      {/* Right Controls: Balance, Streak & Persona Switcher */}
      <div className="flex items-center gap-3">
        {/* Green Credits Balance Pill */}
        <div
          onClick={() => onTabChange('wallet')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-xs font-semibold cursor-pointer hover:border-emerald-500/60 transition-colors shadow-inner"
        >
          <Coins className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-display text-sm">{user?.balanceGC || 0}</span>
          <span className="text-slate-400 text-[11px]">GC</span>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/30 text-xs font-semibold text-amber-300">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>{user?.streakDays || 1}d</span>
        </div>

        {/* Persona Switcher Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-white/10 transition-colors">
            {role === 'ward_admin' ? (
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            ) : (
              <UserCheck className="w-4 h-4 text-emerald-400" />
            )}
            <div className="text-left hidden sm:block">
              <span className="block font-medium leading-none text-[11px]">
                {role === 'ward_admin' ? 'Ward 34 Admin' : 'Aarav Sharma'}
              </span>
              <span className="text-[10px] text-slate-400 capitalize">{role.replace('_', ' ')}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Persona Menu */}
          <div className="absolute right-0 top-full mt-1.5 w-60 glass-panel rounded-xl p-2 shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50">
            <span className="block px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Hackathon Persona Switcher
            </span>
            <button
              onClick={() => switchPersona('citizen')}
              className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                role === 'citizen' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <div>
                <span className="block">Aarav Sharma (Citizen)</span>
                <span className="text-[10px] text-slate-400">Delhi Van Rakshak (420 GC)</span>
              </div>
              {role === 'citizen' && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
            </button>

            <button
              onClick={() => switchPersona('ward_admin')}
              className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors mt-1 ${
                role === 'ward_admin' ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <div>
                <span className="block">Ward 34 Admin (MCD)</span>
                <span className="text-[10px] text-slate-400">Cedar Municipal Admin</span>
              </div>
              {role === 'ward_admin' && <span className="w-2 h-2 rounded-full bg-purple-400"></span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
