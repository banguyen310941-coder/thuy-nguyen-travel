'use client';

import {useEffect,useMemo,useState} from 'react';

type Unit={weekdayPrice?:string;weekendPrice?:string;holidayPrice?:string;status?:string};
type Product={slug:string;price?:string;units?:Unit[]};
const KEY='tn_cms_products_v3_units';
const money=(v?:string)=>{if(!v)return 0;const digits=v.replace(/\D/g,'');return digits?Number(digits):0};
const fmt=(n:number)=>new Intl.NumberFormat('vi-VN').format(n)+'đ';
const dateKey=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const isWeekend=(d:Date)=>d.getDay()===5||d.getDay()===6;
const holidayKeys=new Set(['01-01','04-30','05-01','09-02']);
const isHoliday=(d:Date)=>holidayKeys.has(`${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
function unitPrice(u:Unit,d:Date){const weekday=money(u.weekdayPrice);const weekend=money(u.weekendPrice)||weekday;const holiday=money(u.holidayPrice)||weekend||weekday;return isHoliday(d)?holiday:isWeekend(d)?weekend:weekday}
export function getUnitRange(units:Unit[],start?:Date,end?:Date){const active=units.filter(u=>u.status!=='hidden'&&u.status!=='soldout');const dates:Date[]=[];if(start){const stop=end&&end>start?end:new Date(start.getFullYear(),start.getMonth(),start.getDate()+1);for(let d=new Date(start);d<stop&&dates.length<31;d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1))dates.push(d)}const vals:number[]=[];for(const u of active){if(dates.length){for(const d of dates){const p=unitPrice(u,d);if(p)vals.push(p)}}else{[money(u.weekdayPrice),money(u.weekendPrice),money(u.holidayPrice)].filter(Boolean).forEach(v=>vals.push(v))}}return vals.length?{min:Math.min(...vals),max:Math.max(...vals)}:null}
export function DailyPriceRange({slug,fallback='',checkin='',checkout='',compact=false}:{slug:string;fallback?:string;checkin?:string|null;checkout?:string|null;compact?:boolean}){const [product,setProduct]=useState<Product|null>(null);useEffect(()=>{const load=()=>{try{const arr=JSON.parse(localStorage.getItem(KEY)||'[]') as Product[];setProduct(arr.find(p=>p.slug===slug)||null)}catch{setProduct(null)}};load();window.addEventListener('tn-products-updated',load);window.addEventListener('storage',load);return()=>{window.removeEventListener('tn-products-updated',load);window.removeEventListener('storage',load)}},[slug]);const range=useMemo(()=>{const s=checkin?new Date(`${checkin}T12:00:00`):undefined;const e=checkout?new Date(`${checkout}T12:00:00`):undefined;return getUnitRange(product?.units||[],s,e)},[product,checkin,checkout]);if(!range){return <span className={compact?'daily-price compact':'daily-price'}><small>Giá từ</small><b>{product?.price||fallback||'Liên hệ'}</b></span>}return <span className={compact?'daily-price compact':'daily-price'}><small>{checkin?'Khoảng giá ngày đã chọn':'Khoảng giá theo ngày'}</small><b>{range.min===range.max?fmt(range.min):`${fmt(range.min)} – ${fmt(range.max)}`}</b><em>/ đêm</em></span>}
export {dateKey};
