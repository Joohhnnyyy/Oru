import { Link } from 'react-router-dom';
import { AccountPage, cardClass, inputClass } from '../../components/AccountPage';

export function Energy() {
  return <AccountPage title="A little less energy. A little more care." intro="Bill verification is not available in the current backend. No bill will be uploaded." character="buddy">
    <fieldset disabled className={`${cardClass} max-w-2xl space-y-5`}><legend className="font-bold">Electricity bill · unavailable</legend><label className="block">Electricity bill<input className={inputClass} type="file" accept="image/jpeg,image/png,application/pdf" /></label><label className="block">Billing period<input className={inputClass} type="month" /></label><p className="text-sm text-muted">Upload, redaction and consumption verification require the bill service.</p><button disabled className="btn btn-play">Bill verification unavailable</button></fieldset>
    <Link to="/tasks" className="btn btn-quiet mt-6">View current actions</Link>
  </AccountPage>;
}

export function EnergyResult() {
  return <AccountPage title="A small change worth noticing." intro="Bill verification is not available in the current backend. No bill was processed and no credits were awarded." character="buddy"><Link className="btn btn-play" to="/tasks">View current actions</Link></AccountPage>;
}
