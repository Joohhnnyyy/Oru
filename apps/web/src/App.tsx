import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { TerritoryMap } from './components/map/TerritoryMap';
import { TerritoryDrawer } from './components/map/TerritoryDrawer';
import { TaskBoard } from './components/tasks/TaskBoard';
import { WalletView } from './components/wallet/WalletView';
import { CouponMarketplace } from './components/coupons/CouponMarketplace';
import { LeaderboardView } from './components/leaderboards/LeaderboardView';
import { AdminLayout } from './components/admin/AdminLayout';
import type { TerritoryMetadata } from '@saafsafari/game-rules';
import { Sparkles, MapPin, CheckSquare, Wallet, Gift, Trophy, Building2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('map');
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryMetadata | null>(null);
  const { role } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F19]">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 relative flex flex-col p-4 sm:p-6 overflow-hidden">
        {activeTab === 'map' && (
          <div className="relative flex-1 w-full h-[calc(100vh-140px)] min-h-[600px]">
            <TerritoryMap
              onSelectTerritory={(t) => setSelectedTerritory(t)}
              selectedTerritoryId={selectedTerritory?.h3Index}
            />
            {selectedTerritory && (
              <TerritoryDrawer
                territory={selectedTerritory}
                onClose={() => setSelectedTerritory(null)}
                onNavigateToTasks={() => setActiveTab('tasks')}
                onReportHotspot={(t) => {
                  alert(`Reporting waste hotspot for ${t.name} (${t.ward})`);
                }}
              />
            )}
          </div>
        )}

        {activeTab === 'tasks' && <TaskBoard />}

        {activeTab === 'wallet' && <WalletView />}

        {activeTab === 'coupons' && <CouponMarketplace />}

        {activeTab === 'leaderboards' && <LeaderboardView />}

        {activeTab === 'admin' && <AdminLayout />}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;
