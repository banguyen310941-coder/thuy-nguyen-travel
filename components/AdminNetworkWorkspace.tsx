'use client';

import {useState} from 'react';
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

export function AdminNetworkWorkspace(){
  const[tab,setTab]=useState<Tab>('overview');
  return <section className="admin-network-workspace">
    <div className="admin-welcome production">
      <div><small>MẠNG LƯỚI HỢP TÁC · PRODUCTION</small><h2>Đối tác & Cộng tác viên</h2><p>Một điểm vận hành chung cho hồ sơ, sản phẩm, hỗ trợ, hoa hồng và thanh toán.</p></div>
      <div className="admin-production-badge"><i/>Production secure</div>
    </div>
    <nav className="admin-network-tabs" aria-label="Mạng lưới hợp tác">
      {tabs.map(item=><button key={item.id} type="button" className={tab===item.id?'active':''} onClick={()=>setTab(item.id)}><b>{item.label}</b><small>{item.hint}</small></button>)}
    </nav>
    {tab==='overview'&&<AdminNetworkOperations/>}
    {tab==='partners'&&<AdminPartnerManager/>}
    {tab==='support'&&<PartnerSupportCenter/>}
    {tab==='affiliates'&&<AdminAffiliateManager/>}
  </section>;
}
