import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { QRCodeSVG } from 'qrcode.react';
import type { QrSource } from '@saafsafari/shared';
import { DELHI_TERRITORIES } from '@saafsafari/game-rules';
import {
  QrCode,
  PlusCircle,
  Printer,
  X,
  RefreshCw,
  AlertCircle,
  MapPin,
  CheckCircle2,
  Truck,
  Trash2,
  Cpu,
} from 'lucide-react';

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  dustbin_static: { label: 'Smart Segregation Bin', icon: Trash2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  truck_rotating: { label: 'Sanitation Truck', icon: Truck, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  ewaste_static: { label: 'E-Waste Hub', icon: Cpu, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
};

export const QrSourceManager: React.FC = () => {
  const [sources, setSources] = useState<QrSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPrintSource, setSelectedPrintSource] = useState<QrSource | null>(null);

  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'dustbin_static',
    territoryId: DELHI_TERRITORIES[0]?.h3Index || '873da1153ffffff',
    latitude: 28.5355,
    longitude: 77.241,
    radiusMeters: 75,
  });

  const fetchSources = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getQrSources();
      setSources(res.qrSources || []);
    } catch (err: any) {
      console.error('Failed to fetch QR sources:', err);
      setError('Could not load live QR registry from API Gateway.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const res = await api.createQrSource({
        name: form.name,
        type: form.type,
        territoryId: form.territoryId,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        radiusMeters: Number(form.radiusMeters),
      });

      setShowRegisterModal(false);
      setForm({
        name: '',
        type: 'smart_bin',
        territoryId: DELHI_TERRITORIES[0]?.h3Index || '873da1153ffffff',
        latitude: 28.5355,
        longitude: 77.241,
        radiusMeters: 75,
      });

      if (res?.qrSource) {
        setSelectedPrintSource(res.qrSource);
      }
      await fetchSources();
    } catch (err: any) {
      setError(err.message || 'Failed to register QR source.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-2">
            <QrCode className="w-6 h-6 text-purple-400" />
            Physical QR Source Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Deploy and manage geofenced physical QR markers on smart bins, sanitation tippers, and community recycling drop-boxes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-glow transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Provision QR Marker</span>
          </button>
          <button
            onClick={fetchSources}
            className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white transition-all"
            title="Refresh sources"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Sources Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/60 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Source Name & ID</th>
                <th className="py-3.5 px-4">Hardware Type</th>
                <th className="py-3.5 px-4">Territory / Ward</th>
                <th className="py-3.5 px-4">Geofence Radius</th>
                <th className="py-3.5 px-4">Coordinates</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && sources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-400 mx-auto mb-2" />
                    Loading registered QR hardware markers...
                  </td>
                </tr>
              ) : sources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No QR sources provisioned yet. Click "Provision QR Marker" to deploy hardware.
                  </td>
                </tr>
              ) : (
                sources.map((src) => {
                  const typeCfg = TYPE_CONFIG[src.type] || TYPE_CONFIG.dustbin_static;
                  const Icon = typeCfg.icon;

                  return (
                    <tr key={src.sourceId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{src.name}</div>
                        <span className="font-mono text-[10px] text-slate-500">{src.sourceId}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${typeCfg.color}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{typeCfg.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {src.h3TerritoryId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-emerald-400">{src.geofenceRadiusMeters}m</span>
                        <span className="text-[10px] text-slate-500 block">GPS Radius</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {src.latitude.toFixed(4)}, {src.longitude.toFixed(4)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedPrintSource(src)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-all border border-white/5 hover:border-purple-400/40"
                        >
                          <Printer className="w-3.5 h-3.5 text-purple-400" />
                          <span>Print QR Tag</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Provision QR Marker */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-purple-400">
              <PlusCircle className="w-6 h-6" />
              <h3 className="text-xl font-bold font-display text-white">Provision Hardware QR Marker</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Generates a tamper-resistant QR code with HMAC token signatures tied to physical geolocation.
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Source Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ward 34 Hauz Khas Central Smart Bin #4"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Hardware Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="smart_bin">Smart Bin</option>
                    <option value="collection_truck">Collection Tipper</option>
                    <option value="ewaste_hub">E-Waste Hub</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Assigned Ward</label>
                  <select
                    value={form.territoryId}
                    onChange={(e) => setForm({ ...form, territoryId: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    {DELHI_TERRITORIES.map((t) => (
                      <option key={t.h3Index} value={t.h3Index}>
                        {t.name} ({t.ward})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Radius (m)</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    required
                    value={form.radiusMeters}
                    onChange={(e) => setForm({ ...form, radiusMeters: parseInt(e.target.value) })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2 shadow-glow transition-all active:scale-95"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Save & Generate QR Tag</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Printable Hardware QR Voucher Tag */}
      {selectedPrintSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl text-center">
            <button
              onClick={() => setSelectedPrintSource(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Municipal Crest Print Area */}
            <div className="bg-white p-6 rounded-2xl text-slate-900 border-2 border-slate-900 shadow-xl mb-6">
              <div className="border-b-2 border-slate-900 pb-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 block">
                  Municipal Corporation of Delhi (MCD)
                </span>
                <h4 className="text-base font-black uppercase tracking-tight text-slate-950">
                  SaafSafari Civic Waste Grid
                </h4>
                <span className="text-[11px] font-bold text-emerald-700 block">
                  Official Verification Point
                </span>
              </div>

              {/* QR Code SVG */}
              <div className="py-2 flex justify-center">
                <QRCodeSVG
                  value={(selectedPrintSource as any).qrPayload || selectedPrintSource.sourceId}
                  size={190}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* Hardware Source Metadata */}
              <div className="border-t-2 border-slate-900 pt-3 mt-4 text-left text-[11px] space-y-1">
                <div className="flex justify-between font-bold">
                  <span>NAME:</span>
                  <span className="truncate max-w-[200px]">{selectedPrintSource.name}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px]">
                  <span>TAG ID:</span>
                  <span>{selectedPrintSource.sourceId}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px]">
                  <span>COORDS:</span>
                  <span>
                    {selectedPrintSource.latitude.toFixed(4)}, {selectedPrintSource.longitude.toFixed(4)} (±{selectedPrintSource.geofenceRadiusMeters}m)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-glow transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Physical Decal</span>
              </button>
              <button
                onClick={() => setSelectedPrintSource(null)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
