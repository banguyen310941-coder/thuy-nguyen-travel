'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';

export function AdminAffiliateShortcut(){
 const pathname=usePathname();
 const[visible,setVisible]=useState(false);
 const[pending,setPending]=useState(0);
 useEffect(()=>{
  let alive=true;
  const load=async()=>{
   try{
    const auth=await fetch('/api/admin/auth/me',{cache:'no-store'});
    if(!auth.ok)return;
    const data=await auth.json().catch(()=>({}));
    const staff=data.staff||{};
    const permissions=Array.isArray(staff.permissions)?staff.permissions:[];
    const allowed=staff.role==='owner'||staff.role==='admin'||permissions.includes('*')||permissions.includes('partners')||permissions.includes('affiliates');
    if(!alive)return;
    setVisible(allowed);
    if(!allowed)return;
    const [partnerRes,affiliateRes]=await Promise.all([
      fetch('/api/admin/partners',{cache:'no-store'}),
      fetch('/api/admin/affiliates',{cache:'no-store'}),
    ]);
    const partner=await partnerRes.json().catch(()=>({}));
    const affiliate=await affiliateRes.json().catch(()=>({}));
    const partners=Array.isArray(partner.partners)?partner.partners:[];
    const products=Array.isArray(partner.products)?partner.products:[];
    const affiliates=Array.isArray(affiliate.affiliates)?affiliate.affiliates:[];
    const payouts=Array.isArray(affiliate.payouts)?affiliate.payouts:[];
    if(alive)setPending(
      partners.filter((x:any)=>x?.status==='pending').length+
      products.filter((x:any)=>x?.status==='review').length+
      affiliates.filter((x:any)=>x?.status==='pending').length+
      payouts.filter((x:any)=>x?.status==='pending').length
    );
   }catch{}
  };
  void load();
  const refresh=()=>void load();
  const timer=window.setInterval(refresh,30000);
  window.addEventListener('happygo-network-updated',refresh);
  window.addEventListener('focus',refresh);
  return()=>{alive=false;window.clearInterval(timer);window.removeEventListener('happygo-network-updated',refresh);window.removeEventListener('focus',refresh)};
 },[]);
 if(!visible)return null;
 const onNetwork=pathname.startsWith('/admin/affiliates');
 return <Link className="admin-affiliate-shortcut" href={onNetwork?'/admin':'/admin/affiliates'}>{onNetwork?'← Admin chính':<>🤝 Mạng lưới hợp tác{pending>0?<b>{pending}</b>:null}</>}</Link>;
}
