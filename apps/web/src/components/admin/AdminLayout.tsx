import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TerritoryOverview } from './TerritoryOverview';
import { QrSourceManager } from './QrSourceManager';
import { ReviewQueue } from './ReviewQueue';
import {
  Building2,
  ShieldAlert,
  QrCode,
  FileCheck2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { role, switchPersona } = useAuth();
  const [subTab, setSubTab] = useState<'overview' | 'qr' | 'reviews'>('overview');

  // Client-side role gate
  if (role !== 'ward_admin') {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 glass-panel rounded-3xl border border-purple-500/30 text-center shadow-2xl animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-2xl font-bold font-display text-white mb-2">
          Municipal Access Restricted
        </h3>
        <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
          The Municipal Admin Console is protected by Amazon Verified Permissions (Cedar policies). Only authorized municipal ward officers can view citywide telemetry and provision QR markers.
        </p>

        <button
          onClick={() => switchPersona('ward_admin')}
          className="px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 mx-auto active:scale-95"
        >
          <span>Switch to Ward 34 Admin Persona</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Admin Subheader & Cedar Policy Badge */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/30 via-slate-900/40 to-slate-950/40">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Municipal Command Center
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold border border-purple-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-400" />
                Cedar Policy: ALLOW
              </span>
            </div>
            <h1 className="text-2xl font-bold font-display text-white">
              Ward 34 (Hauz Khas) Administration
            </h1>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setSubTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'overview'
                ? 'bg-purple-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Health & Hotspots</span>
          </button>

          <button
            onClick={() => setSubTab('qr')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'qr'
                ? 'bg-purple-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Hardware</span>
          </button>

          <button
            onClick={() => setSubTab('reviews')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'reviews'
                ? 'bg-purple-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>AI Review Queue</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {subTab === 'overview' && <TerritoryOverview />}
      {subTab === 'qr' && <QrSourceManager />}
      {subTab === 'reviews' && <ReviewQueue />}
    </div>
  );
};
