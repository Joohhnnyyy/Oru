import React from 'react';
import type { TerritoryMetadata } from '@saafsafari/game-rules';
import { X, Heart, ShieldAlert, Sparkles, MapPin, ArrowRight } from 'lucide-react';

interface TerritoryDrawerProps {
  territory: TerritoryMetadata | null;
  onClose: () => void;
  onNavigateToTasks?: () => void;
  onReportHotspot?: (territory: TerritoryMetadata) => void;
}

const MASCOT_EMOJIS: Record<string, string> = {
  dolphin: '🐬',
  blackbuck: '🦌',
  nilgai: '🦬',
  jackal: '🐺',
  peafowl: '🦚',
  leopard: '🐆',
  sparrow: '🐦',
};

const MOOD_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  sick: { label: 'Sick / Critical', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
  recovering: { label: 'Recovering', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' },
  thriving: { label: 'Thriving', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
  legendary: { label: 'Legendary Eco-Zone', color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' },
};

export const TerritoryDrawer: React.FC<TerritoryDrawerProps> = ({
  territory,
  onClose,
  onNavigateToTasks,
  onReportHotspot,
}) => {
  if (!territory) return null;

  const mascotEmoji = MASCOT_EMOJIS[territory.mascot?.toLowerCase()] || '🐾';
  const mood = MOOD_BADGES[territory.mood] || MOOD_BADGES.thriving;

  return (
    <div className="fixed top-20 right-6 w-96 max-w-[calc(100vw-3rem)] glass-panel rounded-2xl p-6 shadow-2xl z-30 border border-white/10 animate-in slide-in-from-right-8 duration-300">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-white/10">
        <div>
          <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5" />
            {territory.ward || 'Municipal Ward'}
          </span>
          <h3 className="text-xl font-bold font-display text-white">{territory.name}</h3>
          <span className="text-[11px] text-slate-400 font-mono">H3: {territory.h3Index}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close territory details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mascot & Health Card */}
      <div className="my-5 p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-slate-800 flex items-center justify-center text-3xl shadow-inner border border-emerald-500/20">
          {mascotEmoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-300 capitalize font-semibold">
              Guardian {territory.mascot}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${mood.bg} ${mood.color}`}>
              {mood.label}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                territory.health >= 90
                  ? 'bg-purple-500'
                  : territory.health >= 75
                  ? 'bg-emerald-500'
                  : territory.health >= 50
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, territory.health))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-400" /> Health
            </span>
            <span className="font-bold text-white">{territory.health} / 100</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-5 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
          <span className="text-slate-400 block mb-0.5">Clean Index</span>
          <span className="text-lg font-bold text-emerald-400 flex items-center gap-1 font-display">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            {territory.cleanIndex || '7.2'} <span className="text-[11px] text-slate-500 font-normal">/ 10</span>
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
          <span className="text-slate-400 block mb-0.5">Active Hotspots</span>
          <span className="text-lg font-bold text-amber-400 flex items-center gap-1 font-display">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            {(territory as any).activeHotspotsCount ?? 1} Open
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {onNavigateToTasks && (
          <button
            onClick={onNavigateToTasks}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-glow transition-all active:scale-[0.98]"
          >
            <span>View Tasks for this Ward</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        {onReportHotspot && (
          <button
            onClick={() => onReportHotspot(territory)}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Report Waste Dumping Hotspot</span>
          </button>
        )}
      </div>
    </div>
  );
};
