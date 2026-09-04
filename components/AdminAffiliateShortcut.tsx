'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';

export function AdminAffiliateShortcut(){const pathname=usePathname();const[visible,setVisible]=useState(false);useEffect(()=>{let alive=true;void fetch('/api/admin/auth/me',{cache:'no-store'}).then(async r=>{if(!r.ok)return;const data=await r.json().catch(()=>({}));const staff=data.staff||{};const permissions=Array.isArray(staff.permissions)?staff.permissions:[];if(alive)setVisible(staff.role==='owner'||staff.role==='admin'||permissions.includes('*')||permissions.includes('affiliates'))}).catch(()=>{});return()=>{alive=false}},[]);if(!visible)return null;const onAffiliate=pathname.startsWith('/admin/affiliates');return <Link className="admin-affiliate-shortcut" href={onAffiliate?'/admin':'/admin/affiliates'}>{onAffiliate?'← Admin chính':'🤝 Cộng tác viên'}</Link>}
