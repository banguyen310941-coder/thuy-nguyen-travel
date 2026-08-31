'use client';

import { useEffect, useState } from 'react';
import { SearchBar } from '@/components/SearchBar';

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
  title:'Du lịch trọn gói – Nghỉ dưỡng đẳng cấp',
  subtitle:'Vé · Tour · Villa · Resort · Du thuyền – Hành trình hạnh phúc, kết nối yêu thương.',
  noteTitle:'Hành trình của bạn',
  noteText:'Bắt đầu từ một giấc mơ...',
  heroImage:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1900&q=88',
  servicesEnabled:true,servicesTitle:'Khám phá dịch vụ nổi bật',servicesSubtitle:'Lựa chọn trải nghiệm phù hợp với bạn',
  destinationsEnabled:true,destinationsTitle:'Điểm đến phổ biến',
  productsEnabled:true,productsTitle:'Sản phẩm nổi bật',
  cruisesEnabled:true,cruisesTitle:'Du thuyền nổi bật',cruisesSubtitle:'Hạ Long & Lan Hạ',
  toursEnabled:true,toursTitle:'Tour du lịch hot',
  ctaEnabled:true,ctaEyebrow:'HAPPYGO TRAVEL',ctaTitle:'Hành trình hạnh phúc, kết nối yêu thương',ctaText:'Liên hệ HappyGo Travel để được tư vấn tour, villa, khách sạn và du thuyền phù hợp.',hotline:'0969973949',zalo:'0969973949'
};

const API_BASE=process.env.NEXT_PUBLIC_API_BASE_URL||'';

function migrateHome(value:Partial<HomeCmsData>|null|undefined):HomeCmsData{
 const next={...defaultHomeCms,...(value||{})};
 if(/th[uú]y\s*nguy[eê]n/i.test(next.eyebrow||''))next.eyebrow='HAPPYGO TRAVEL';
 if(/th[uú]y\s*nguy[eê]n/i.test(next.ctaEyebrow||''))next.ctaEyebrow='HAPPYGO TRAVEL';
 return next;
}

export function useHomeCms(){
  const [data,setData]=useState<HomeCmsData>(defaultHomeCms);
  useEffect(()=>{
    let alive=true;
    const loadLocal=()=>{try{const local=localStorage.getItem('tn_cms_homepage');const next=migrateHome(local?JSON.parse(local):null);if(alive)setData(next);if(local){const before=JSON.stringify(JSON.parse(local));const after=JSON.stringify(next);if(before!==after)localStorage.setItem('tn_cms_homepage',after)}}catch{if(alive)setData(defaultHomeCms)}};
    loadLocal();
    const refresh=()=>loadLocal();
    window.addEventListener('tn-homepage-updated',refresh);
    window.addEventListener('storage',refresh);
    if(API_BASE){fetch(`${API_BASE.replace(/\/$/,'')}/api/site-settings/homepage`).then(r=>r.ok?r.json():null).then(v=>{if(alive&&v?.value)setData(migrateHome(v.value))}).catch(()=>{});}
    return()=>{alive=false;window.removeEventListener('tn-homepage-updated',refresh);window.removeEventListener('storage',refresh)};
  },[]);
  return data;
}

export function HomeCmsHero(){
  const data=useHomeCms();
  return <section className="mock-hero" style={{backgroundImage:`url(${data.heroImage})`}}>
    <div className="mock-hero-overlay" />
    <div className="container mock-hero-content">
      <p className="mock-eyebrow">{data.eyebrow}</p>
      <h1>{data.title}</h1>
      <p>{data.subtitle}</p>
      <div className="mock-hero-note"><span>✈</span><div>{data.noteTitle}<br/><b>{data.noteText}</b></div></div>
      <div className="mock-hero-search"><SearchBar /></div>
    </div>
  </section>;
}
