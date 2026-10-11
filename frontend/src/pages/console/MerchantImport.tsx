import { Link } from 'react-router-dom';
import { AccountPage, cardClass, inputClass } from '../../components/AccountPage';
export default function MerchantImport() {
  return <AccountPage title="Bring your rewards to Oru." intro="Inventory import is not available in the current backend. No stock can be published from this screen." character="turtle">
    <div className="grid gap-8 lg:grid-cols-2">
      <fieldset disabled className={`${cardClass} space-y-5`}><legend className="font-bold">Coupon inventory · unavailable</legend><label className="block">Merchant name<input className={inputClass} placeholder="Merchant name" /></label><label className="block">CSV inventory<input className={inputClass} type="file" accept="text/csv,.csv" /></label><p className="text-sm text-muted">Inventory upload, validation and publishing require a merchant administration service.</p><button className="btn btn-play" disabled>Import unavailable</button></fieldset>
      <article className={cardClass}><h2>Batch preview</h2><p className="my-4 text-muted">No inventory has been uploaded or validated.</p><Link to="/console/merchants" className="btn btn-quiet">View current offers</Link></article>
    </div>
  </AccountPage>;
}
