'use client';

import {useCallback,useEffect,useMemo,useState} from 'react';
import {AdminNetworkOperations} from '@/components/AdminNetworkOperations';
import {AdminPartnerManager} from '@/components/AdminPartnerManager';
import {PartnerSupportCenter} from '@/components/PartnerSupportCenter';
import {AdminAffiliateManager} from '@/components/AdminAffiliateManager';
import {AdminAffiliateAssignments} from '@/components/AdminAffiliateAssignments';
import {AdminAffiliateFollowups} from '@/components/AdminAffiliateFollowups';
import {AdminNetworkStatusLegend} from '@/components/AdminNetworkStatusLegend';

type Tab='overview'|'partners'|'support'|'affiliates';
type Access={canPartners:boolean;canAffiliates:boolean;canAffiliateFinance:boolean};
type TabItem={id:Tab;label:string;hint:string;area:'all'|'partners'|'affiliates'};
const tabs:TabItem[]=[{id:'overview',label:'Tổng quan',hint:'Việc chờ xử lý',area:'all'},{id:'partners',label:'Đối tác',hint:'Hồ sơ & sản phẩm',area:'partners'},{id:'support',label:'Hỗ trợ',hint:'Trao đổi đối tác',area:'partners'},{id:'affiliates',label:'CTV / Affiliate',hint:'Hồ sơ, Sale & chăm sóc',area:'affiliates'}];
const allowedTab=(item:TabItem,access:Access)=>item.area==='all'||(item.area==='partners'&&access.canPartners)||(item.area==='affiliates'&&access.canAffiliates);

export function AdminNetworkWorkspace(){
 const[tab,setTab]=useState<Tab>('overview'),[access,setAccess]=useState<Access|null>(null),[accessError,setAccessError]=useState('');
 const loadAccess=useCallback(async()=>{try{const r=await fetch('/api/admin/auth/me',{cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Không đọc được quyền mạng lưới.');const staff=d.staff||{},permissions=Array.isArray(staff.permissions)?staff.permissions.map(String):[],elevated=staff.role==='owner'||staff.role==='admin'||permissions.includes('*');setAccess({canPartners:elevated||permissions.includes('partners'),canAffiliates:elevated||permissions.includes('affiliates'),canAffiliateFinance:elevated||permissions.includes('affiliate_finance')});setAccessError('')}catch(error){setAccess({canPartners:false,canAffiliates:false,canAffiliateFinance:false});setAccessError(error instanceof Error?error.message:'Không đọc được quyền mạng lưới.')}},[]);
 useEffect(()=>{void loadAccess();const refresh=()=>void loadAccess();window.addEventListener('happygo-admin-auth',refresh);window.addEventListener('tn-staff-updated',refresh);return()=>{window.removeEventListener('happygo-admin-auth',refresh);window.removeEventListener('tn-staff-updated',refresh)}},[loadAccess]);
 const visibleTabs=useMemo(()=>access?tabs.filter(item=>allowedTab(item,access)):tabs.filter(item=>item.id==='overview'),[access]);
 useEffect(()=>{if(!access)return;const sync=()=>{const params=new URLSearchParams(window.location.search),requested=params.get('tab') as Tab|null,requestedAllowed=visibleTabs.some(item=>item.id===requested),next=requestedAllowed&&requested?requested:'overview';setTab(next);if(requested&&!requestedAllowed){const url=new URL(window.location.href);url.searchParams.set('module','network');url.searchParams.set('tab','overview');window.history.replaceState(null,'',url)}};sync();window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync)},[access,visibleTabs]);
 const choose=(next:Tab)=>{if(!visibleTabs.some(item=>item.id===next))return;setTab(next);const url=new URL(window.location.href);url.searchParams.set('module','network');url.searchParams.set('tab',next);window.history.replaceState(null,'',url)};
 if(!access)return <section className="admin-panel"><div className="admin-empty-state">Đang kiểm tra quyền Mạng lưới hợp tác...</div></section>;
 return <section className="admin-network-workspace"><div className="admin-welcome production"><div><small>MẠNG LƯỚI HỢP TÁC · PRODUCTION</small><h2>Đối tác & Cộng tác viên</h2><p>Hồ sơ CTV, Sale phụ trách, lịch chăm sóc và tài chính CTV được tách quyền độc lập; chỉ hiển thị dữ liệu đúng quyền của tài khoản.</p></div><div className="admin-production-badge"><i/>Production secure</div></div>{accessError&&<div className="admin-connect-error">{accessError}</div>}<nav className="admin-network-tabs" aria-label="Mạng lưới hợp tác">{visibleTabs.map(item=><button key={item.id} type="button" className={tab===item.id?'active':''} onClick={()=>choose(item.id)}><b>{item.label}</b><small>{item.hint}</small></button>)}</nav>{tab==='overview'&&<><AdminNetworkStatusLegend/><AdminNetworkOperations canPartners={access.canPartners} canAffiliates={access.canAffiliates} canAffiliateFinance={access.canAffiliateFinance}/></>}{tab==='partners'&&access.canPartners&&<AdminPartnerManager/>}{tab==='support'&&access.canPartners&&<PartnerSupportCenter/>}{tab==='affiliates'&&access.canAffiliates&&<><AdminAffiliateAssignments/><AdminAffiliateFollowups/><AdminAffiliateManager canFinance={access.canAffiliateFinance}/></>}</section>;
}
