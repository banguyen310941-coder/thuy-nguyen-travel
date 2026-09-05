'use client';

import {useEffect,useState} from 'react';
import {usePathname,useRouter,useSearchParams} from 'next/navigation';
import {AdminNetworkOperations} from '@/components/AdminNetworkOperations';
import {AdminPartnerManager} from '@/components/AdminPartnerManager';
import {PartnerSupportCenter} from '@/components/PartnerSupportCenter';
import {AdminAffiliateManager} from '@/components/AdminAffiliateManager';

type Tab='overview'|'partners'|'support'|'affiliates';

const tabs:{id:Tab;label:string;hint:string}[]=[
  {id:'overview',label:'Tổng quan',hint:'Việc chờ xử lý'},
  {id:'partners',label:'Đối tác',hint:'Hồ sơ & sản phẩm'},
  {id:'support',label:'Hỗ trợ',hint:'Trao đổi đối tác'},
  {id:'affiliates',label:'CTV / Affiliate',hint:'Hoa hồng & thanh toán'},
];
const validTab=(value:string|null):value is Tab=>Boolean(value&&tabs.some(item=>item.id===value));

export function AdminNetworkWorkspace(){
  const pathname=usePathname();
  const router=useRouter();
  const search=useSearchParams();
  const requested=search.get('tab');
  const[tab,setTab]=useState<Tab>(validTab(requested)?requested:'overview');

  useEffect(()=>{if(validTab(requested)&&requested!==tab)setTab(requested)},[requested,tab]);

  const choose=(next:Tab)=>{
    setTab(next);
    const params=new URLSearchParams(search.toString());
    params.set('module','network');
    params.set('tab',next);
    router.replace(`${pathname}?${params.toString()}`,{scroll:false});
  };

  return <section className="admin-network-workspace">
    <div className="admin-welcome production">
      <div><small>MẠNG LƯỚI HỢP TÁC · PRODUCTION</small><h2>Đối tác & Cộng tác viên</h2><p>Một điểm vận hành chung cho hồ sơ, sản phẩm, hỗ trợ, hoa hồng và thanh toán.</p></div>
      <div className="admin-production-badge"><i/>Production secure</div>
    </div>
    <nav className="admin-network-tabs" aria-label="Mạng lưới hợp tác">
      {tabs.map(item=><button key={item.id} type="button" className={tab===item.id?'active':''} onClick={()=>choose(item.id)}><b>{item.label}</b><small>{item.hint}</small></button>)}
    </nav>
    {tab==='overview'&&<AdminNetworkOperations/>}
    {tab==='partners'&&<AdminPartnerManager/>}
    {tab==='support'&&<PartnerSupportCenter/>}
    {tab==='affiliates'&&<AdminAffiliateManager/>}
  </section>;
}
