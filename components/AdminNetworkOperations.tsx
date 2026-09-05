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

type Props={canPartners:boolean;canAffiliates:boolean};

const empty:Snapshot={partners:0,partnerPending:0,partnerProductsReview:0,affiliates:0,affiliatePending:0,payoutPending:0};

export function AdminNetworkOperations({canPartners,canAffiliates}:Props){
  const[data,setData]=useState<Snapshot>(empty);
  const[loading,setLoading]=useState(true);
  const[message,setMessage]=useState('');
  const[lastSync,setLastSync]=useState('');

  const load=useCallback(async()=>{
    setLoading(true);setMessage('');
    try{
      let partner:any={partners:[],products:[]};
      let affiliate:any={affiliates:[],payouts:[]};
      if(canPartners){
        const partnerRes=await fetch('/api/admin/partners',{cache:'no-store'});
        partner=await partnerRes.json().catch(()=>({}));
        if(!partnerRes.ok)throw new Error(partner?.error||'Không đọc được dữ liệu đối tác.');
      }
      if(canAffiliates){
        const affiliateRes=await fetch('/api/admin/affiliates',{cache:'no-store'});
        affiliate=await affiliateRes.json().catch(()=>({}));
        if(!affiliateRes.ok)throw new Error(affiliate?.error||'Không đọc được dữ liệu CTV.');
      }
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
      setLastSync(new Intl.DateTimeFormat('vi-VN',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date()));
    }catch(error){setMessage(error instanceof Error?error.message:'Không kết nối được dữ liệu production.')}finally{setLoading(false)}
  },[canPartners,canAffiliates]);

  useEffect(()=>{
    void load();
    const refresh=()=>void load();
    const timer=window.setInterval(refresh,30000);
    window.addEventListener('happygo-network-updated',refresh);
    window.addEventListener('focus',refresh);
    return()=>{window.clearInterval(timer);window.removeEventListener('happygo-network-updated',refresh);window.removeEventListener('focus',refresh)};
  },[load]);

  return <section className="admin-panel admin-network-operations">
    <div className="admin-panel-head"><div><small>MẠNG LƯỚI HỢP TÁC · PRODUCTION</small><h2>Trung tâm Đối tác & Cộng tác viên</h2><p>Dữ liệu tổng quan chỉ tải theo đúng quyền nghiệp vụ của tài khoản đang đăng nhập.</p>{lastSync&&<small>Đồng bộ gần nhất: {lastSync} · tự làm mới mỗi 30 giây</small>}</div><button type="button" className="admin-secondary" onClick={()=>void load()} disabled={loading}>{loading?'Đang làm mới...':'↻ Làm mới'}</button></div>
    {message&&<div className="admin-connect-error">{message}</div>}
    <div className="admin-partner-kpis">
      {canPartners&&<><article><span>Đối tác</span><b>{data.partners}</b><small>{data.partnerPending} hồ sơ chờ duyệt</small></article><article><span>Sản phẩm đối tác</span><b>{data.partnerProductsReview}</b><small>đang chờ duyệt</small></article></>}
      {canAffiliates&&<><article><span>Cộng tác viên</span><b>{data.affiliates}</b><small>{data.affiliatePending} hồ sơ chờ duyệt</small></article><article><span>Rút hoa hồng</span><b>{data.payoutPending}</b><small>yêu cầu chờ đối soát</small></article></>}
    </div>
    <div className="admin-network-flow">
      <span><b>1</b> Đăng ký</span><em>→</em><span><b>2</b> Admin duyệt</span><em>→</em><span><b>3</b> Bán / đăng sản phẩm</span><em>→</em><span><b>4</b> Đối soát</span><em>→</em><span><b>5</b> Thanh toán</span>
    </div>
    <div className="admin-network-links">{canPartners&&<Link href="/partner" target="_blank">Mở Cổng Đối tác ↗</Link>}{canAffiliates&&<><Link href="/affiliate" target="_blank">Mở Cổng CTV ↗</Link><Link href="/admin?module=network&tab=affiliates">Quản trị CTV chi tiết →</Link></>}</div>
    {canAffiliates&&<><AdminAffiliateApplications/><AdminAffiliatePayoutRequests/></>}
  </section>;
}
