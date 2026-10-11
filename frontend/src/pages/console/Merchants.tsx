import { AccountPage, cardClass } from '../../components/AccountPage';
import { ResourceStatus } from '../../components/ResourceStatus';
import { useApiResource } from '../../hooks/useApiResource';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';
const load = () => api.getCoupons();
export default function Merchants() {
  const resource = useApiResource(load);
  return <AccountPage title="Local rewards, shared value." intro="Offers currently available from the reward service. Inventory editing is not available yet." character="turtle">
    <ResourceStatus {...resource} />
    <Link className="btn btn-quiet mb-6" to="/console/merchants/import">Inventory import</Link>
    {resource.data && !resource.data.coupons.length && <p>No offers are currently available.</p>}
    <div className="grid gap-5 md:grid-cols-3">{resource.data?.coupons.map(coupon => <article className={cardClass} key={coupon.couponId}><h2>{coupon.title}</h2><p>{coupon.discountText}</p><p>{coupon.costGC} GC</p><p>Expires {new Date(coupon.expiresAt).toLocaleDateString()}</p><p className="text-sm text-muted">Merchant: {coupon.merchantId}</p></article>)}</div>
  </AccountPage>;
}
