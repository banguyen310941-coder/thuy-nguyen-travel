'use client';

import Link from 'next/link';
import {useEffect,useState} from 'react';
import {SearchBar} from '@/components/SearchBar';

export type HomeCmsData={
  eyebrow:string;title:string;subtitle:string;noteTitle:string;noteText:string;heroImage:string;
  servicesEnabled:boolean;servicesTitle:string;servicesSubtitle:string;
  destinationsEnabled:boolean;destinationsTitle:string;
  productsEnabled:boolean;productsTitle:string;
  cruisesEnabled:boolean;cruisesTitle:string;cruisesSubtitle:string;
  toursEnabled:boolean;toursTitle:string;
  ctaEnabled:boolean;ctaEyebrow:string;ctaTitle:string;ctaText:string;hotline:string;zalo:string;
};

export const defaultHomeCms:HomeCmsData={
  eyebrow:'HAPPYGO TRAVEL',
  title:'Khám phá Việt Nam theo cách của bạn',
  subtitle:'Khách sạn · Villa & Resort · Du thuyền · Tour – chọn hành trình phù hợp, xem giá rõ ràng và được HappyGo hỗ trợ từ lúc tìm kiếm đến khi khởi hành.',
  noteTitle:'Kỳ nghỉ của bạn',
  noteText:'Bắt đầu bằng một điểm đến',
  heroImage:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1900&q=88',
  servicesEnabled:true,servicesTitle:'Chọn trải nghiệm dành cho bạn',servicesSubtitle:'Một nơi để tìm chuyến đi, chỗ nghỉ và hành trình trên vịnh',
  destinationsEnabled:true,destinationsTitle:'Điểm đến được yêu thích',
  productsEnabled:true,productsTitle:'Lưu trú nổi bật',
  cruisesEnabled:true,cruisesTitle:'Du thuyền Hạ Long & Lan Hạ',cruisesSubtitle:'Những hải trình đáng nhớ trên vịnh di sản',
  toursEnabled:true,toursTitle:'Tour được quan tâm',
  ctaEnabled:true,ctaEyebrow:'HAPPYGO TRAVEL',ctaTitle:'Hành trình hạnh phúc, kết nối yêu thương',ctaText:'Liên hệ HappyGo Travel để được tư vấn tour, villa, khách sạn và du thuyền phù hợp.',hotline:'0969973949',zalo:'0969973949'
};

const API_BASE=process.env.NEXT_PUBLIC_API_BASE_URL||'';
const quickLinks=[['🏨','Khách sạn','/khach-san'],['🏡','Villa & Resort','/villa-resort'],['🛳','Du thuyền','/du-thuyen'],['✈','Tour','/tour-du-lich']] as const;

function migrateHome(value:Partial<HomeCmsData>|null|undefined):HomeCmsData{
 const next={...defaultHomeCms,...(value||{})};
 if(/th[uú]y\s*nguy[eê]n/i.test(next.eyebrow||''))next.eyebrow='HAPPYGO TRAVEL';
 if(/th[uú]y\s*nguy[eê]n/i.test(next.ctaEyebrow||''))next.ctaEyebrow='HAPPYGO TRAVEL';
 return next;
}

export function useHomeCms(initialCms:Partial<HomeCmsData>|null=defaultHomeCms){
  const[data,setData]=useState<HomeCmsData>(()=>migrateHome(initialCms));
  useEffect(()=>setData(migrateHome(initialCms)),[initialCms]);
  useEffect(()=>{
    let alive=true;
    const loadRemote=async()=>{try{const response=await fetch('/api/catalog/site-state',{cache:'no-store'});if(!response.ok)return;const payload=await response.json() as{state?:Record<string,unknown>};const value=payload.state?.tn_cms_homepage;if(alive&&value&&typeof value==='object'&&!Array.isArray(value))setData(migrateHome(value as Partial<HomeCmsData>))}catch{}};
    void loadRemote();
    const refresh=()=>void loadRemote();
    window.addEventListener('tn-homepage-updated',refresh);
    if(API_BASE){fetch(`${API_BASE.replace(/\/$/,'')}/api/site-settings/homepage`).then(r=>r.ok?r.json():null).then(v=>{if(alive&&v?.value)setData(migrateHome(v.value))}).catch(()=>{});}
    return()=>{alive=false;window.removeEventListener('tn-homepage-updated',refresh)};
  },[]);
  return data;
}

export function HomeCmsHero({initialCms=defaultHomeCms}:{initialCms?:Partial<HomeCmsData>|null}){
  const data=useHomeCms(initialCms);
  return <section className="mock-hero" style={{backgroundImage:`url(${data.heroImage})`}}>
    <div className="mock-hero-overlay" />
    <div className="container mock-hero-content">
      <p className="mock-eyebrow">{data.eyebrow}</p>
      <h1>{data.title}</h1>
      <p>{data.subtitle}</p>
      <div className="home-hero-quicklinks" aria-label="Dịch vụ nổi bật">{quickLinks.map(([icon,label,href])=><Link href={href} key={href}><span>{icon}</span>{label}</Link>)}</div>
      <div className="mock-hero-note"><span>✈</span><div>{data.noteTitle}<br/><b>{data.noteText}</b></div></div>
      <div className="mock-hero-search"><SearchBar /></div>
    </div>
  </section>;
}
