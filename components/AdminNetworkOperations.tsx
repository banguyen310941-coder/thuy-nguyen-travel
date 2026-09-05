'use client';

import Link from 'next/link';
import {useCallback,useEffect,useState} from 'react';
import {AdminAffiliateApplications} from '@/components/AdminAffiliateApplications';
import {AdminAffiliatePayoutRequests} from '@/components/AdminAffiliatePayoutRequests';

type Snapshot={
  partners:number;
  partnerPending:number;
  partnerProductsReview:number;
  affiliates:number;
  affiliatePending:number;
  payoutPending:number;
};

const empty:Snapshot={partners:0,partnerPending:0,partnerProductsReview:0,affiliates:0,affiliatePending:0,payoutPending:0};

export function AdminNetworkOperations(){
  const[data,setData]=useState<Snapshot>(empty);
  const[loading,setLoading]=useState(true);
  const[message,setMessage]=useState('');

  const load=useCallback(async()=>{
    setLoading(true);setMessage('');
    try{
      const [partnerRes,affiliateRes]=await Promise.all([
        fetch('/api/admin/partners',{cache:'no-store'}),
        fetch('/api/admin/affiliates',{cache:'no-store'}),
      ]);
      const partner=await partnerRes.json().catch(()=>({}));
      const affiliate=await affiliateRes.json().catch(()=>({}));
      if(!partnerRes.ok||!affiliateRes.ok)throw new Error(partner?.error||affiliate?.error||'Không đọc được dữ liệu mạng lưới.');
      const partners=Array.isArray(partner.partners)?partner.partners:[];
      const products=Array.isArray(partner.products)?partner.products:[];
      const affiliates=Array.isArray(affiliate.affiliates)?affiliate.affiliates:[];
      const payouts=Array.isArray(affiliate.payouts)?affiliate.payouts:[];
      setData({
        partners:partners.length,
        partnerPending:partners.filter((x:any)=>x?.status==='pending').length,
        partnerProductsReview:products.filter((x:any)=>x?.status==='review').length,
        affiliates:affiliates.length,
        affiliatePending:affiliates.filter((x:any)=>x?.status==='pending').length,
        payoutPending:payouts.filter((x:any)=>x?.status==='pending').length,
      });
    }catch(error){setMessage(error instanceof Error?error.message:'Không kết nối được dữ liệu production.')}finally{setLoading(false)}
  },[]);

  useEffect(()=>{
    void load();
    const refresh=()=>void load();
    window.addEventListener('happygo-network-updated',refresh);
    window.addEventListener('focus',refresh);
    return()=>{window.removeEventListener('happygo-network-updated',refresh);window.removeEventListener('focus',refresh)};
  },[load]);

  return <section className="admin-panel admin-network-operations">
    <div className="admin-panel-head"><div><small>MẠNG LƯỚI HỢP TÁC · PRODUCTION</small><h2>Trung tâm Đối tác & Cộng tác viên</h2><p>Một luồng vận hành chung từ đăng ký, duyệt tài khoản, duyệt sản phẩm/đơn đến đối soát và thanh toán.</p></div><button type="button" className="admin-secondary" onClick={()=>void load()} disabled={loading}>{loading?'Đang làm mới...':'↻ Làm mới'}</button></div>
    {message&&<div className="admin-connect-error">{message}</div>}
    <div className="admin-partner-kpis">
      <article><span>Đối tác</span><b>{data.partners}</b><small>{data.partnerPending} hồ sơ chờ duyệt</small></article>
      <article><span>Sản phẩm đối tác</span><b>{data.partnerProductsReview}</b><small>đang chờ duyệt</small></article>
      <article><span>Cộng tác viên</span><b>{data.affiliates}</b><small>{data.affiliatePending} hồ sơ chờ duyệt</small></article>
      <article><span>Rút hoa hồng</span><b>{data.payoutPending}</b><small>yêu cầu chờ đối soát</small></article>
    </div>
    <div className="admin-network-flow">
      <span><b>1</b> Đăng ký</span><em>→</em><span><b>2</b> Admin duyệt</span><em>→</em><span><b>3</b> Bán / đăng sản phẩm</span><em>→</em><span><b>4</b> Đối soát</span><em>→</em><span><b>5</b> Thanh toán</span>
    </div>
    <div className="admin-network-links"><Link href="/partner" target="_blank">Mở Cổng Đối tác ↗</Link><Link href="/affiliate" target="_blank">Mở Cổng CTV ↗</Link><Link href="/admin/affiliates">Quản trị CTV chi tiết →</Link></div>
    <AdminAffiliateApplications/>
    <AdminAffiliatePayoutRequests/>
  </section>;
}
