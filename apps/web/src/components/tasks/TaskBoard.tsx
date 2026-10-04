import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { TaskBoardResponse, TaskProgress } from '@saafsafari/shared';
import { CheckCircle2, Flame, Award, Coins, Sparkles, RefreshCw, Calendar, Target, AlertCircle } from 'lucide-react';

export const TaskBoard: React.FC = () => {
  const [data, setData] = useState<TaskBoardResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getTasks();
      setData(res);
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCheckin = async () => {
    try {
      setCheckingIn(true);
      setFeedback(null);
      const res = await api.checkinHabit();
      setFeedback({
        message: res.message || `+${res.creditsEarned} GC & +${res.xpEarned} XP! Streak: ${res.streakDays} days 🔥`,
        type: 'success',
      });
      // Refresh task board to reflect new progress and streak
      await fetchTasks();
    } catch (err: any) {
      setFeedback({
        message: err.message || 'Check-in failed. Already checked in today?',
        type: 'error',
      });
    } finally {
      setCheckingIn(false);
    }
  };

  const tasks: TaskProgress[] = data ? data[activeTab] || [] : [];

  // Check if daily habit is checked in today
  const todayStr = new Date().toISOString().split('T')[0];
  const isHabitDone = data?.lastHabitCheckInDate === todayStr;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 glass-panel p-6 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-bold font-display text-white">Civic Mission Board</h1>
          </div>
          <p className="text-sm text-slate-400">
            Complete daily segregation habits and civic tasks to evolve your territory mascot and earn Green Credits.
          </p>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-4 bg-slate-900/60 border border-amber-500/30 px-5 py-3 rounded-xl shadow-glow">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Habit Streak</span>
            <span className="text-2xl font-black font-display text-amber-400">
              {data?.streakDays ?? 0} <span className="text-xs font-normal text-slate-400">days</span>
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <Sparkles className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Daily Habit One-Click Check-in Card (Always accessible) */}
      <div className="mb-8 glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 to-slate-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Daily Segregation Habit</span>
                {isHabitDone && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    COMPLETED TODAY
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">Segregated Waste at Source (Wet & Dry)</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-lg">
                Log your daily source segregation before municipal pickup. Rewards you with +10 GC, +25 XP, and maintains your streak!
              </p>
            </div>
          </div>

          <button
            onClick={handleCheckin}
            disabled={checkingIn || isHabitDone}
            className={`px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-glow ${
              isHabitDone
                ? 'bg-slate-800 text-slate-400 border border-white/5 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
            }`}
          >
            {checkingIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Recording...</span>
              </>
            ) : isHabitDone ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Checked In</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Check-in Now (+10 GC)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Task Period Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-glow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'daily' && '⚡ Daily Tasks'}
              {tab === 'weekly' && '📅 Weekly Missions'}
              {tab === 'monthly' && '🏆 Monthly Challenges'}
            </button>
          ))}
        </div>

        <button
          onClick={fetchTasks}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
          title="Refresh tasks"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Task Grid */}
      {loading && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl h-40 animate-pulse bg-slate-800/30" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-white/5">
          <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-white">No active tasks in this cycle</h4>
          <p className="text-xs text-slate-400 mt-1">Check back soon for new municipal challenges.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const progressPct = Math.min(100, Math.round(((task.currentCount || 0) / task.targetCount) * 100));
            const isComplete = task.completed || progressPct >= 100;

            return (
              <div
                key={task.id}
                className={`glass-panel p-5 rounded-2xl border transition-all ${
                  isComplete
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    {task.isTerritoryGoal && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-1.5 uppercase tracking-wider">
                        Territory Goal
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-white">{task.titleEn}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{task.descriptionEn}</p>
                  </div>

                  {isComplete ? (
                    <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold flex items-center gap-1 border border-emerald-500/30">
                        <Coins className="w-3 h-3" />
                        +{task.rewardGC} GC
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-semibold flex items-center gap-1">
                        <Award className="w-2.5 h-2.5" />
                        +{task.rewardXP} XP
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-slate-400">Progress</span>
                    <span className={isComplete ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                      {task.currentCount || 0} / {task.targetCount} ({progressPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isComplete ? 'bg-emerald-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
