'use client';

import {useEffect} from 'react';
import {tours} from '@/data/catalog';

const KEY='tn_cms_tours_v3';

type Day={title:string;morning:string;afternoon:string;evening:string;meals:string};
type CmsTour={
 id:string;name:string;cover:string;category:string;duration:string;departure:string;airline:string;route:string;transport:string;summary:string;status:string;
 price:string;salePrice:string;childPrice:string;singleCharge:string;departures:string;gallery:string;highlights:string;itinerary:string;days:Day[];
 included:string;excluded:string;policies:string;promotion:string;rating:string;reviewCount:string;faq:string;seoTitle:string;seoDescription:string;slug:string;
};

function toCms(t:(typeof tours)[number]):CmsTour{
 const days=(t.itinerary||[]).map(d=>({title:d.title||'',morning:d.morning||'',afternoon:d.afternoon||'',evening:d.evening||'',meals:d.meals||''}));
 return {
  id:`seed_${t.slug}`,name:t.name,cover:t.image,category:t.category,duration:t.duration,departure:t.departureFrom||'',airline:t.airline||'',route:t.route,
  transport:(t.transport||[]).join(', '),summary:t.summary,status:'published',price:t.oldPrice||'',salePrice:t.priceFrom||'',childPrice:'',singleCharge:'',
  departures:(t.departureDates||[]).join('\n'),gallery:(t.gallery||[]).join('\n'),highlights:(t.highlights||[]).join('\n'),itinerary:'',days:days.length?days:[{title:'',morning:'',afternoon:'',evening:'',meals:''}],
  included:(t.included||[]).join('\n'),excluded:(t.excluded||[]).join('\n'),policies:(t.policies||[]).join('\n'),promotion:(t.promotions||[]).join('\n'),
  rating:t.rating?String(t.rating):'',reviewCount:t.reviewCount?String(t.reviewCount):'',faq:(t.faq||[]).map(x=>`${x.q}\n${x.a}`).join('\n\n'),
  seoTitle:t.seoTitle||'',seoDescription:t.seoDescription||'',slug:t.slug
 };
}

export function AdminTourSeedSync(){
 useEffect(()=>{
  try{
   const current=JSON.parse(localStorage.getItem(KEY)||'[]') as CmsTour[];
   const slugs=new Set(current.map(x=>x.slug));
   const missing=tours.filter(t=>!slugs.has(t.slug)).map(toCms);
   if(!missing.length)return;
   localStorage.setItem(KEY,JSON.stringify([...current,...missing]));
   window.dispatchEvent(new Event('tn-tours-updated'));
  }catch{}
 },[]);
 return null;
}
