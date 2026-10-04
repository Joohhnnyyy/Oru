import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { AdminTerritoryOverview, AdminTerritorySummary } from '@saafsafari/shared';
import {
  Building2,
  Heart,
  ShieldAlert,
  Sparkles,
  Search,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  Activity,
  CheckCircle2,
  X,
  MapPin,
} from 'lucide-react';

const MOOD_COLORS: Record<string, { label: string; text: string; bg: string }> = {
  sick: { label: 'Sick / Critical', text: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
  recovering: { label: 'Recovering', text: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' },
  thriving: { label: 'Thriving', text: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
  legendary: { label: 'Legendary Eco-Zone', text: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' },
};

export const TerritoryOverview: React.FC = () => {
  const [data, setData] = useState<AdminTerritoryOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Report modal state
  const [reporting, setReporting] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    latitude: 28.5355,
    longitude: 77.241,
    severity: 'MEDIUM',
  });
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTerritoryOverview();
      setData(res);
    } catch (err: any) {
      console.error('Failed to fetch territory overview:', err);
      setError('Failed to fetch live admin metrics. Using simulated ward telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleCreateHotspot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setReporting(true);
      await api.reportHotspot({
        title: reportForm.title,
        description: reportForm.description,
        latitude: Number(reportForm.latitude),
        longitude: Number(reportForm.longitude),
        severity: reportForm.severity,
      });
      setReportSuccess(`Hotspot "${reportForm.title}" registered! 5-point deduction applied.`);
      setShowReportModal(false);
      setReportForm({
        title: '',
        description: '',
        latitude: 28.5355,
        longitude: 77.241,
        severity: 'MEDIUM',
      });
      // Refresh list
      await fetchOverview();
    } catch (err: any) {
      setError(err.message || 'Failed to submit hotspot report.');
    } finally {
      setReporting(false);
    }
  };

  const territories: AdminTerritorySummary[] = data?.territories || [];
  const filtered = territories.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.territoryId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const moodCounts = data?.moodDistribution || {
    sick: 4,
    recovering: 12,
    thriving: 38,
    legendary: 7,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-400" />
            Delhi Municipal Health Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time telemetry across all 61 municipal zones, automated health calculations, and hotspot buster dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-glow transition-all active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Report Waste Hotspot</span>
          </button>
          <button
            onClick={fetchOverview}
            className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white transition-all"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {reportSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{reportSuccess}</span>
          </div>
          <button onClick={() => setReportSuccess(null)} className="text-xs text-slate-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Territories */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Monitored Wards
          </span>
          <span className="text-3xl font-black font-display text-white">
            {data?.totalTerritories ?? 61}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Delhi NCR H3-Res 8 Zones</span>
        </div>

        {/* Average Health */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            City Average Health
          </span>
          <span className="text-3xl font-black font-display text-emerald-400 flex items-center gap-1.5">
            <Heart className="w-6 h-6 fill-emerald-400 text-emerald-400" />
            {data?.averageHealth ?? 76}%
          </span>
          <span className="text-[11px] text-emerald-500 block mt-1">+3.2% vs last week</span>
        </div>

        {/* Total Hotspots */}
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Active Hotspots
          </span>
          <span className="text-3xl font-black font-display text-amber-400 flex items-center gap-1.5">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            {data?.totalActiveHotspots ?? 18}
          </span>
          <span className="text-[11px] text-amber-500 block mt-1">Pending community clearing</span>
        </div>

        {/* Legendary Wards */}
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/30">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Legendary Eco-Zones
          </span>
          <span className="text-3xl font-black font-display text-purple-400 flex items-center gap-1.5">
            <Sparkles className="w-6 h-6 text-purple-400" />
            {moodCounts.legendary ?? 7}
          </span>
          <span className="text-[11px] text-purple-400 block mt-1">&gt; 90% Health Index</span>
        </div>
      </div>

      {/* Mood Distribution Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-white uppercase tracking-wider">Territory State Breakdown</span>
          <span className="text-slate-400 font-mono">61 Total Wards</span>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 flex overflow-hidden gap-0.5 p-0.5 border border-white/5">
          <div
            className="h-full bg-red-500 rounded-l-full"
            style={{ width: `${((moodCounts.sick || 0) / 61) * 100}%` }}
            title={`Sick: ${moodCounts.sick}`}
          />
          <div
            className="h-full bg-amber-500"
            style={{ width: `${((moodCounts.recovering || 0) / 61) * 100}%` }}
            title={`Recovering: ${moodCounts.recovering}`}
          />
          <div
            className="h-full bg-emerald-500"
            style={{ width: `${((moodCounts.thriving || 0) / 61) * 100}%` }}
            title={`Thriving: ${moodCounts.thriving}`}
          />
          <div
            className="h-full bg-purple-500 rounded-r-full"
            style={{ width: `${((moodCounts.legendary || 0) / 61) * 100}%` }}
            title={`Legendary: ${moodCounts.legendary}`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-400">Sick / Critical:</span>
            <span className="font-bold text-white">{moodCounts.sick || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-400">Recovering:</span>
            <span className="font-bold text-white">{moodCounts.recovering || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Thriving:</span>
            <span className="font-bold text-white">{moodCounts.thriving || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-slate-400">Legendary:</span>
            <span className="font-bold text-white">{moodCounts.legendary || 0}</span>
          </div>
        </div>
      </div>

      {/* Searchable Territory Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-white text-base">Ward Telemetry Table</h3>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ward name or H3..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/60 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Ward / Territory</th>
                <th className="py-3 px-4">H3 Index</th>
                <th className="py-3 px-4">Health Index</th>
                <th className="py-3 px-4">Mood Status</th>
                <th className="py-3 px-4">Active Hotspots</th>
                <th className="py-3 px-4">Last Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No matching territories found.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const mood = MOOD_COLORS[t.moodState] || MOOD_COLORS.thriving;
                  const date = new Date(t.lastUpdated).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={t.territoryId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>{t.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{t.territoryId}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono">{t.health}%</span>
                          <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-400"
                              style={{ width: `${t.health}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${mood.bg} ${mood.text}`}
                        >
                          {mood.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {t.activeHotspotsCount > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                            {t.activeHotspotsCount} Hotspots
                          </span>
                        ) : (
                          <span className="text-slate-500">0 Hotspots</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{date}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Report Dumping Hotspot */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2 text-red-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-xl font-bold font-display text-white">Log Waste Dumping Hotspot</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Submitting a verified hotspot deducts 5 points from the ward's health index and posts a 50 GC community clearing bounty.
            </p>

            <form onSubmit={handleCreateHotspot} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Hotspot Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Major Plastic Waste Dump near Bus Terminal"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description & Evidence</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe location landmarks, approximate volume, and bio-hazard status..."
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={reportForm.latitude}
                    onChange={(e) => setReportForm({ ...reportForm, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={reportForm.longitude}
                    onChange={(e) => setReportForm({ ...reportForm, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Severity Tier</label>
                <select
                  value={reportForm.severity}
                  onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                >
                  <option value="LOW">Low (Litter / Minor debris)</option>
                  <option value="MEDIUM">Medium (Unsegregated heap)</option>
                  <option value="HIGH">High (Major industrial dump / Waterway obstruction)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 shadow-glow transition-all active:scale-95"
                >
                  {reporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                  <span>Broadcast Hotspot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
