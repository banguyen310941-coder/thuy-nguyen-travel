'use client';

import {useEffect,useMemo,useState} from 'react';
import {rateForDate} from '@/components/AdminRateCalendar';

type Unit={id:string;weekdayPrice?:string;weekendPrice?:string;holidayPrice?:string;status?:string};
type Product={slug:string;price?:string;units?:Unit[]};
const KEY='tn_cms_products_v3_units';
const money=(v?:string)=>{if(!v)return 0;const digits=v.replace(/\D/g,'');return digits?Number(digits):0};
const fmt=(n:number)=>new Intl.NumberFormat('vi-VN').format(n)+'đ';
const dateKey=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const isWeekend=(d:Date)=>d.getDay()===5||d.getDay()===6;
const holidayKeys=new Set(['01-01','04-30','05-01','09-02']);
const isHoliday=(d:Date)=>holidayKeys.has(`${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
function fallbackPrice(u:Unit,d:Date){const weekday=money(u.weekdayPrice);const weekend=money(u.weekendPrice)||weekday;const holiday=money(u.holidayPrice)||weekend||weekday;return isHoliday(d)?holiday:isWeekend(d)?weekend:weekday}
function priceForDate(u:Unit,d:Date){const rate=rateForDate(u.id,dateKey(d));if(rate){const qty=Number(rate.quantity||0);if(rate.status!=='available'||qty<=0)return 0;return money(rate.price)}return fallbackPrice(u,d)}
export function DailyPriceRange({slug,fallback='',checkin='',checkout='',compact=false}:{slug:string;fallback?:string;checkin?:string|null;checkout?:string|null;compact?:boolean}){const [product,setProduct]=useState<Product|null>(null);const [rev,setRev]=useState(0);useEffect(()=>{const load=()=>{try{const arr=JSON.parse(localStorage.getItem(KEY)||'[]') as Product[];setProduct(arr.find(p=>p.slug===slug)||null)}catch{setProduct(null)}};load();const refresh=()=>{load();setRev(x=>x+1)};window.addEventListener('tn-products-updated',refresh);window.addEventListener('tn-rates-updated',refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener('tn-products-updated',refresh);window.removeEventListener('tn-rates-updated',refresh);window.removeEventListener('storage',refresh)}},[slug]);const range=useMemo(()=>{const active=(product?.units||[]).filter(u=>u.status!=='hidden'&&u.status!=='soldout');const vals:number[]=[];if(checkin){const start=new Date(`${checkin}T12:00:00`);const end=checkout?new Date(`${checkout}T12:00:00`):new Date(start.getFullYear(),start.getMonth(),start.getDate()+1);for(const u of active){for(let d=new Date(start);d<end;d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)){const p=priceForDate(u,d);if(p)vals.push(p)}}}else{for(const u of active){[money(u.weekdayPrice),money(u.weekendPrice),money(u.holidayPrice)].filter(Boolean).forEach(v=>vals.push(v))}}return vals.length?{min:Math.min(...vals),max:Math.max(...vals)}:null},[product,checkin,checkout,rev]);if(!range)return <span className={compact?'daily-price compact':'daily-price'}><small>{checkin?'Không còn giá mở bán ngày đã chọn':'Giá từ'}</small><b>{checkin?'Liên hệ kiểm tra phòng':product?.price||fallback||'Liên hệ'}</b></span>;return <span className={compact?'daily-price compact':'daily-price'}><small>{checkin?'Khoảng giá ngày đã chọn':'Khoảng giá theo ngày'}</small><b>{range.min===range.max?fmt(range.min):`${fmt(range.min)} – ${fmt(range.max)}`}</b><em>/ đêm</em></span>}
export {dateKey};
