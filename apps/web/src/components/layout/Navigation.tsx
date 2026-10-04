import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Map, CheckSquare, Wallet, Gift, Trophy, ShieldAlert, Building2 } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { role } = useAuth();

  const tabs = [
    { id: 'map', label: 'Territory Map', icon: Map },
    { id: 'tasks', label: 'Civic Tasks', icon: CheckSquare },
    { id: 'wallet', label: 'Green Wallet', icon: Wallet },
    { id: 'coupons', label: 'Eco-Rewards', icon: Gift },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
  ];

  if (role === 'ward_admin') {
    tabs.push({ id: 'admin', label: 'Municipal Console', icon: Building2 });
  }

  return (
    <nav className="w-full border-b border-white/10 bg-slate-950/60 backdrop-blur px-6 py-2">
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isAdminTab = tab.id === 'admin';

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? isAdminTab
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-emerald-600 text-white shadow-glow'
                  : isAdminTab
                  ? 'text-purple-300 hover:bg-purple-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isAdminTab ? 'text-purple-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {isAdminTab && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/80 text-purple-200 border border-purple-400/40">
                  ADMIN
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
