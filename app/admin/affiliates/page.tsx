import Link from 'next/link';
import {AdminAffiliateManager} from '@/components/AdminAffiliateManager';
import {AdminNetworkOperations} from '@/components/AdminNetworkOperations';
import {PortalWorkspaceBar} from '@/components/PortalWorkspaceBar';

export default function AdminAffiliatesPage(){
 return <>
  <PortalWorkspaceBar scope="admin" status="Production · Đối tác & CTV"/>
  <main className="admin-main affiliate-admin-page">
   <div className="admin-welcome production"><div><small>TRUNG TÂM MẠNG LƯỚI HỢP TÁC</small><h2>Đối tác & Cộng tác viên</h2><p>Duyệt hồ sơ, theo dõi sản phẩm/đơn, đối soát hoa hồng và thanh toán trên cùng nguồn production.</p></div><div className="admin-top-actions"><Link href="/admin">← Trung tâm Admin</Link><Link href="/partner">Cổng đối tác</Link><Link href="/affiliate">Cổng CTV</Link></div></div>
   <AdminNetworkOperations/>
   <AdminAffiliateManager/>
  </main>
 </>;
}
