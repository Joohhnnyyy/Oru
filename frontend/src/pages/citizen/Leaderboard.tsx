import { useCallback, useState } from 'react';
import type { LeaderboardType } from '@saafsafari/shared';
import { AccountPage, inputClass } from '../../components/AccountPage';
import { ResourceStatus } from '../../components/ResourceStatus';
import { useApiResource } from '../../hooks/useApiResource';
import { api } from '../../lib/api';

export default function Leaderboard() {
  const [type, setType] = useState<LeaderboardType>('citywide');
  const load = useCallback(() => api.getLeaderboard(type), [type]);
  const resource = useApiResource(load);
  return <AccountPage title="Growing together" intro="Follow your city's progress and see how your territory compares.">
    <label className="block max-w-sm">Show rankings<select className={inputClass} value={type} onChange={(event) => setType(event.target.value as LeaderboardType)}><option value="citywide">Citywide citizens</option><option value="territory">My territory's citizens</option><option value="territories">Territory health</option></select></label>
    <ResourceStatus {...resource} />
    {resource.data && <div className="mt-6 overflow-x-auto rounded-card border border-line bg-surface" {...{ string: 'spotlight' }}><table className="w-full text-left"><caption className="p-4 text-left text-muted">{resource.data.entries.length === 0 ? 'No rankings yet.' : type === 'territories' ? 'Ranked by territory health' : 'Ranked by lifetime XP'}</caption><thead className="bg-surface"><tr><th scope="col" className="p-4">Rank</th><th scope="col" className="p-4">Name</th><th scope="col" className="p-4">{type === 'territories' ? 'Health' : 'XP'}</th></tr></thead><tbody>{resource.data.entries.map((entry) => <tr className="border-t border-line hover:bg-mint/5 transition-colors" key={entry.id}><td className="p-4 font-mono font-bold">{entry.rank}</td><td className="p-4 font-bold">{entry.name}<span className="ml-3 text-sm font-normal text-muted">{entry.tier || entry.mood}</span></td><td className="p-4 font-mono">{entry.score}</td></tr>)}</tbody></table></div>}
    {resource.data?.userRank && <aside aria-label="Your standing" className="mt-6 oru-card max-w-md" {...{ string: 'spotlight' }}><p className="text-xs font-bold text-primary uppercase tracking-wider">Your Standing</p><p className="mt-2 text-2xl font-extrabold">Rank #{resource.data.userRank.rank}</p><p className="text-muted">{resource.data.userRank.score} Lifetime XP</p></aside>}
  </AccountPage>;
}
