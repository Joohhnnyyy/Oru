import { Link } from 'react-router-dom';
import { AccountPage, cardClass, inputClass } from '../../components/AccountPage';
export default function BountyNew() {
  return <AccountPage title="Give a community action a purpose." intro="Community bounty creation is not available in the current backend. No rewards or tasks will be published." character="leopard">
    <fieldset disabled className={`${cardClass} max-w-xl space-y-5`}><legend className="font-bold">Community bounty · unavailable</legend><label className="block">Task title<input className={inputClass} placeholder="Name the community action" /></label><label className="block">Territory<select className={inputClass}><option>Select a territory</option></select></label><label className="block">Proof requirements<textarea className={inputClass} rows={3} placeholder="Describe what good proof looks like" /></label><div className="grid grid-cols-2 gap-4"><label>Green Credits<input type="number" min={0} className={inputClass} /></label><label>XP reward<input type="number" min={0} className={inputClass} /></label></div><label className="block">Deadline<input type="date" className={inputClass} /></label><button disabled className="btn btn-play">Bounty creation unavailable</button></fieldset>
    <Link className="btn btn-quiet mt-6" to="/console/hotspots">View current hotspots</Link>
  </AccountPage>;
}
