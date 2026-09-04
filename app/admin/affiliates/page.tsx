import {AdminAffiliateManager} from '@/components/AdminAffiliateManager';
import {AdminAffiliatePayoutRequests} from '@/components/AdminAffiliatePayoutRequests';
import {AdminAffiliateApplications} from '@/components/AdminAffiliateApplications';

export default function AdminAffiliatesPage(){
 return <main className="admin-main affiliate-admin-page">
  <AdminAffiliateApplications/>
  <AdminAffiliatePayoutRequests/>
  <AdminAffiliateManager/>
 </main>;
}
