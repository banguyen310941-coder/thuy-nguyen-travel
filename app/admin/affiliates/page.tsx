import Link from 'next/link';
import {AdminAffiliateManager} from '@/components/AdminAffiliateManager';
import {AdminAffiliatePayoutRequests} from '@/components/AdminAffiliatePayoutRequests';
import {AdminAffiliateApplications} from '@/components/AdminAffiliateApplications';
import {PortalWorkspaceBar} from '@/components/PortalWorkspaceBar';

export default function AdminAffiliatesPage(){
 return <>
  <PortalWorkspaceBar scope="admin" status="Production · CTV/Affiliate"/>
  <main className="admin-main affiliate-admin-page">
   <div className="admin-welcome production"><div><small>TRUNG TÂM CỘNG TÁC VIÊN</small><h2>Quản trị CTV / Affiliate</h2><p>Duyệt đăng ký, theo dõi hoa hồng, xử lý yêu cầu rút tiền và quản lý tài khoản CTV trên cùng nguồn production.</p></div><div className="admin-top-actions"><Link href="/admin">← Trung tâm Admin</Link><Link href="/partner">Cổng đối tác</Link><Link href="/affiliate">Cổng CTV</Link></div></div>
   <AdminAffiliateApplications/>
   <AdminAffiliatePayoutRequests/>
   <AdminAffiliateManager/>
  </main>
 </>;
}
