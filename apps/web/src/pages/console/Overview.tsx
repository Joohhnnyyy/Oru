import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError, type AdminTerritoryOverview, type HotspotItem } from '../../lib/api';

const MOOD_COLOR: Record<string, string> = {
  sick: 'bg-red-100 text-red-700',
  recovering: 'bg-amber-100 text-amber-700',
  thriving: 'bg-green-100 text-green-700',
  legendary: 'bg-purple-100 text-purple-700',
};

export default function Overview() {
  const [overview, setOverview] = useState<AdminTerritoryOverview | null>(null);
  const [hotspots, setHotspots] = useState<HotspotItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getTerritoryOverview().then(setOverview).catch((e) => setError(e instanceof ApiError ? e.message : 'Could not load territories.'));
    api.getHotspots().then((r) => setHotspots(r.hotspots)).catch(() => undefined);
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Municipal console</h1>
        <Link to="/console/review" className="rounded-full bg-[#1B8A5A] px-4 py-2 text-sm font-semibold text-white">
          Review queue →
        </Link>
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

      {overview && (
        <>
          <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Kpi label="Territories" value={overview.totalTerritories} />
            <Kpi label="Avg. health" value={`${Math.round(overview.averageHealth)}/100`} />
            <Kpi label="Open hotspots" value={overview.totalActiveHotspots} />
            <Kpi label="Legendary" value={overview.moodDistribution.legendary ?? 0} />
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-bold">Territories</h2>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Health</th>
                    <th className="px-4 py-3">Mood</th>
                    <th className="px-4 py-3">Hotspots</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.territories.map((t) => (
                    <tr key={t.territoryId} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-semibold">{t.name}</td>
                      <td className="px-4 py-3">{t.health}/100</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${MOOD_COLOR[t.moodState] ?? ''}`}>{t.moodState}</span>
                      </td>
                      <td className="px-4 py-3">{t.activeHotspotsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-bold">Hotspots</h2>
        {hotspots?.length === 0 && <p className="mt-2 text-muted-foreground">No open hotspots.</p>}
        <ul className="mt-3 flex flex-col gap-3">
          {hotspots?.map((h) => (
            <li key={h.hotspotId} className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{h.title}</p>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold">{h.severity}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{h.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">Territory {h.territoryId} · {h.status}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}
