'use client';
import {useEffect} from 'react';
import {tours} from '@/data/catalog';
import {internationalTours} from '@/data/internationalTours';

type Day={title:string;morning:string;afternoon:string;evening:string;meals:string};
type CmsTour={id:string;name:string;cover:string;category:string;duration:string;departure:string;airline:string;route:string;transport:string;summary:string;status:string;price:string;salePrice:string;childPrice:string;singleCharge:string;departures:string;gallery:string;highlights:string;itinerary:string;days:Day[];included:string;excluded:string;policies:string;promotion:string;rating:string;reviewCount:string;faq:string;seoTitle:string;seoDescription:string;slug:string};
const KEY='tn_cms_tours_v3';
const all=[...tours,...internationalTours];
const mapTour=(t:any):CmsTour=>({
 id:`seed_tour_${t.slug}`,name:t.name,cover:t.image||'',category:t.category,duration:t.duration||'',departure:t.departureFrom||'Hà Nội / TP.HCM',airline:t.airline||'',route:t.route||'',transport:(t.transport||[]).join(', '),summary:t.summary||'',status:'published',price:t.oldPrice||'',salePrice:t.priceFrom||'',childPrice:'',singleCharge:'',departures:(t.departureDates||[]).join('\n'),gallery:(t.gallery||[]).join('\n'),highlights:(t.highlights||[]).join('\n'),itinerary:'',days:(t.itinerary||[]).map((d:any)=>({title:d.title||'',morning:d.morning||'',afternoon:d.afternoon||'',evening:d.evening||'',meals:d.meals||''})),included:(t.included||[]).join('\n'),excluded:(t.excluded||[]).join('\n'),policies:(t.policies||[]).join('\n'),promotion:(t.promotions||[]).join('\n'),rating:String(t.rating||''),reviewCount:String(t.reviewCount||''),faq:(t.faq||[]).map((x:any)=>`${x.q}\n${x.a}`).join('\n\n'),seoTitle:t.seoTitle||t.name,seoDescription:t.seoDescription||t.summary||'',slug:t.slug
});
export function AdminTourSeedSync(){useEffect(()=>{try{const current=JSON.parse(localStorage.getItem(KEY)||'[]') as CmsTour[];const bySlug=new Map(current.map(x=>[x.slug,x]));let changed=false;for(const t of all){if(!bySlug.has(t.slug)){const seed=mapTour(t);bySlug.set(t.slug,seed);changed=true}}if(changed||!current.length){const merged=Array.from(bySlug.values());localStorage.setItem(KEY,JSON.stringify(merged));window.dispatchEvent(new Event('tn-tours-updated'))}}catch{}},[]);return null}
