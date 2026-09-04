import {AdminAffiliateManager} from '@/components/AdminAffiliateManager';
import {AdminAffiliatePayoutRequests} from '@/components/AdminAffiliatePayoutRequests';

export default function AdminAffiliatesPage(){
 return <main className="admin-main affiliate-admin-page">
  <AdminAffiliatePayoutRequests/>
  <AdminAffiliateManager/>
 </main>;
}
