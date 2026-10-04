import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { LeaderboardResponse, LeaderboardEntry } from '@saafsafari/shared';
import { Trophy, Medal, MapPin, User, Sparkles, RefreshCw, AlertCircle, Shield } from 'lucide-react';

const MASCOT_ICONS: Record<string, string> = {
  dolphin: '🐬',
  blackbuck: '🦌',
  nilgai: '🦬',
  jackal: '🐺',
  peafowl: '🦚',
  leopard: '🐆',
  sparrow: '🐦',
};

export const LeaderboardView: React.FC = () => {
  const { user } = useAuth();
  const [type, setType] = useState<'territories' | 'citizens'>('territories');
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async (lbType: 'territories' | 'citizens') => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getLeaderboard(lbType);
      setData(res);
    } catch (err: any) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Could not load live leaderboard rankings. Using local network ranking.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(type);
  }, [type]);

  const entries: LeaderboardEntry[] = data?.entries || [];
  const topThree = entries.slice(0, 3);
  const restEntries = entries.slice(3);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Civic Rankings & Leaderboard
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Delhi municipal ward standings and top eco-warriors competing for weekly civic honors.
          </p>
        </div>

        {/* Toggle Pill */}
        <div className="flex items-center bg-slate-900/80 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setType('territories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              type === 'territories'
                ? 'bg-emerald-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Territories</span>
          </button>
          <button
            onClick={() => setType('citizens')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              type === 'citizens'
                ? 'bg-emerald-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Citizens</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 items-end">
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1 glass-panel p-6 rounded-3xl border border-slate-400/30 text-center relative overflow-hidden bg-slate-900/40">
            <div className="w-12 h-12 rounded-2xl bg-slate-300/20 text-slate-300 flex items-center justify-center mx-auto mb-3 border border-slate-300/30 font-bold text-lg">
              2nd
            </div>
            <div className="text-3xl mb-1">{MASCOT_ICONS[topThree[1].mascot || ''] || '🥈'}</div>
            <h3 className="font-bold text-white text-base truncate">{topThree[1].name}</h3>
            <span className="text-xs text-slate-400 font-mono">
              {type === 'territories' ? 'Ward Health' : 'Lifetime XP'}
            </span>
            <div className="mt-2 text-xl font-black font-display text-slate-200">
              {topThree[1].score.toLocaleString()} {type === 'territories' ? 'HP' : 'XP'}
            </div>
          </div>

          {/* Rank 1 (Gold - Elevated) */}
          <div className="order-1 md:order-2 glass-panel p-8 rounded-3xl border border-amber-400/50 text-center relative overflow-hidden bg-gradient-to-b from-amber-500/10 to-slate-900/60 shadow-2xl shadow-amber-500/10 transform md:-translate-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-400/40 font-bold text-xl shadow-glow">
              👑 1st
            </div>
            <div className="text-4xl mb-1">{MASCOT_ICONS[topThree[0].mascot || ''] || '🥇'}</div>
            <h3 className="font-extrabold text-white text-lg truncate">{topThree[0].name}</h3>
            <span className="text-xs text-amber-300 font-mono">
              {type === 'territories' ? 'Champion Ward' : 'Supreme Eco-Warrior'}
            </span>
            <div className="mt-2 text-2xl font-black font-display text-amber-400">
              {topThree[0].score.toLocaleString()} {type === 'territories' ? 'HP' : 'XP'}
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="order-3 glass-panel p-6 rounded-3xl border border-amber-700/30 text-center relative overflow-hidden bg-slate-900/40">
            <div className="w-12 h-12 rounded-2xl bg-amber-700/20 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-700/30 font-bold text-lg">
              3rd
            </div>
            <div className="text-3xl mb-1">{MASCOT_ICONS[topThree[2].mascot || ''] || '🥉'}</div>
            <h3 className="font-bold text-white text-base truncate">{topThree[2].name}</h3>
            <span className="text-xs text-slate-400 font-mono">
              {type === 'territories' ? 'Ward Health' : 'Lifetime XP'}
            </span>
            <div className="mt-2 text-xl font-black font-display text-amber-600">
              {topThree[2].score.toLocaleString()} {type === 'territories' ? 'HP' : 'XP'}
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900/60 border-b border-white/10 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="w-8 text-center">Rank</span>
            <span>{type === 'territories' ? 'Territory / Ward' : 'Eco-Citizen'}</span>
          </div>
          <span>{type === 'territories' ? 'Territory Health' : 'Experience Points'}</span>
        </div>

        {loading && entries.length === 0 ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading standings...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No rankings found for this category.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {entries.map((item) => {
              const isCurrentUser = user && (item.id === user.userId || item.name.includes((user as any).name || ''));

              return (
                <div
                  key={item.id}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    isCurrentUser
                      ? 'bg-emerald-500/10 border-l-4 border-l-emerald-400 font-semibold'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-8 text-center font-mono font-bold text-sm ${
                        item.rank === 1
                          ? 'text-amber-400'
                          : item.rank === 2
                          ? 'text-slate-300'
                          : item.rank === 3
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      }`}
                    >
                      #{item.rank}
                    </span>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-lg border border-white/5">
                        {MASCOT_ICONS[item.mascot || ''] || (type === 'territories' ? '🏛️' : '👤')}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {item.name}
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              YOU
                            </span>
                          )}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {item.mood ? `Mood: ${item.mood}` : item.tier ? `Tier: ${item.tier}` : item.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-emerald-400">
                      {item.score.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1 font-mono">
                      {type === 'territories' ? 'HP' : 'XP'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
