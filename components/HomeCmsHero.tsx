'use client';

import { useEffect, useState } from 'react';
import { SearchBar } from '@/components/SearchBar';

export type HomeCmsData={
  eyebrow:string;title:string;subtitle:string;noteTitle:string;noteText:string;heroImage:string;
};

export const defaultHomeCms:HomeCmsData={
  eyebrow:'THÚY NGUYÊN TRAVEL',
  title:'Du lịch trọn gói – Nghỉ dưỡng đẳng cấp',
  subtitle:'Vé · Tour · Villa · Resort · Du thuyền – Khám phá thế giới cùng chúng tôi!',
  noteTitle:'Hành trình của bạn',
  noteText:'Bắt đầu từ một giấc mơ...',
  heroImage:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1900&q=88'
};

const API_BASE=process.env.NEXT_PUBLIC_API_BASE_URL||'';

export function HomeCmsHero(){
  const [data,setData]=useState<HomeCmsData>(defaultHomeCms);
  useEffect(()=>{
    const local=localStorage.getItem('tn_cms_homepage');
    if(local){try{setData({...defaultHomeCms,...JSON.parse(local)})}catch{}}
    if(API_BASE){fetch(`${API_BASE.replace(/\/$/,'')}/api/site-settings/homepage`).then(r=>r.ok?r.json():null).then(v=>{if(v?.value)setData({...defaultHomeCms,...v.value})}).catch(()=>{});}
  },[]);
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
