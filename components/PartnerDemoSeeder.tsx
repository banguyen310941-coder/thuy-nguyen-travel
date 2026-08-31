'use client';

import {useEffect} from 'react';

const ACCOUNTS='happygo_partner_accounts_v1';
const PROFILE='happygo_partner_profile_v1';
const PRODUCTS='happygo_partner_products_v1';
const PRICING='happygo_partner_pricing_v1';
const SESSION='happygo_partner_session_v1';
const DEMO_ID='pt_happygo_demo';
const DEMO_EMAIL='demo@happygo.vn';
const DEMO_PASSWORD='HappyGo123';

function read(key:string){try{const raw=localStorage.getItem(key);const value=raw?JSON.parse(raw):[];return Array.isArray(value)?value:[]}catch{return[]}}
function write(key:string,value:unknown){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function ensureDemo(){
 const accounts=read(ACCOUNTS);
 const demo={id:DEMO_ID,email:DEMO_EMAIL,password:DEMO_PASSWORD,companyName:'Sunrise Hospitality Demo',contactName:'Nguyễn Minh Partner',phone:'0909123456',createdAt:new Date().toISOString(),status:'active'};
 const cleaned=accounts.filter((x:any)=>x?.id!==DEMO_ID&&String(x?.email||'').trim().toLowerCase()!==DEMO_EMAIL);
 write(ACCOUNTS,[demo,...cleaned]);
 const profileKey=`${PROFILE}_${DEMO_ID}`;
 try{if(!localStorage.getItem(profileKey))write(profileKey,{id:DEMO_ID,name:'Sunrise Hospitality Demo',contact:'Nguyễn Minh Partner',phone:'0909123456',email:DEMO_EMAIL,website:'https://example.com',taxCode:'0312345678',address:'12 Trần Phú, Nha Trang, Khánh Hòa'})}catch{}
 const products=read(PRODUCTS);
 const demoProducts=[
  {id:'partner_demo_resort',partnerId:DEMO_ID,partnerName:'Sunrise Hospitality Demo',type:'Khách sạn',name:'HappyGo Demo Beach Resort Nha Trang',slug:'happygo-demo-beach-resort-nha-trang',place:'Nha Trang, Khánh Hòa',address:'12 Trần Phú, Nha Trang',price:'2.900.000đ/đêm',summary:'Khách sạn demo dùng để trải nghiệm đầy đủ giao diện Partner Hub HappyGo.',cover:'',gallery:'',amenities:'Hồ bơi, buffet sáng, wifi, phòng gym, bãi biển',policies:'Hủy miễn phí trước 7 ngày. Phụ thu theo chính sách từng giai đoạn.',checkin:'14:00',checkout:'12:00',unitsText:'Deluxe Ocean View | 2 khách | King/Twin\nFamily Suite | 4 khách | 2 phòng ngủ',status:'approved',source:'manual',updatedAt:new Date().toISOString()},
  {id:'partner_demo_villa',partnerId:DEMO_ID,partnerName:'Sunrise Hospitality Demo',type:'Villa & Resort',name:'HappyGo Demo Garden Villa',slug:'happygo-demo-garden-villa',place:'Phước Hải, Bà Rịa - Vũng Tàu',address:'Khu nghỉ dưỡng ven biển Phước Hải',price:'5.500.000đ/đêm',summary:'Villa demo đang ở trạng thái chờ HappyGo duyệt.',cover:'',gallery:'',amenities:'Hồ bơi riêng, BBQ, bếp, 3 phòng ngủ',policies:'Đặt cọc 50%.',checkin:'14:00',checkout:'12:00',unitsText:'Villa 3PN Garden | 6 người lớn + 2 trẻ em',status:'review',source:'manual',updatedAt:new Date().toISOString()}
 ];
 const missing=demoProducts.filter(p=>!products.some((x:any)=>x?.id===p.id));
 if(missing.length)write(PRODUCTS,[...missing,...products]);
 const pricing=read(PRICING);
 const demoPricing=[
  {productId:'partner_demo_resort',commission:'12',agencyPrice:'2400000',retailPrice:'2900000',promoPrice:'2690000',rules:[{date:'2026-09-05',agencyPrice:'2500000',retailPrice:'3100000',promoPrice:'2850000',quantity:'5',note:'Cuối tuần'},{date:'2026-09-06',agencyPrice:'2500000',retailPrice:'3100000',promoPrice:'2850000',quantity:'4',note:'Cuối tuần'}],updatedAt:new Date().toISOString()},
  {productId:'partner_demo_villa',commission:'10',agencyPrice:'4800000',retailPrice:'5500000',promoPrice:'5200000',rules:[],updatedAt:new Date().toISOString()}
 ];
 const missingPricing=demoPricing.filter(p=>!pricing.some((x:any)=>x?.productId===p.productId));
 if(missingPricing.length)write(PRICING,[...missingPricing,...pricing]);
}

export function PartnerDemoSeeder(){
 useEffect(()=>{ensureDemo()},[]);
 function enterDemo(){ensureDemo();localStorage.setItem(SESSION,DEMO_ID);window.location.reload()}
 return <button type="button" onClick={enterDemo} style={{position:'fixed',right:18,bottom:18,zIndex:9999,border:0,borderRadius:999,padding:'12px 18px',background:'#ff6500',color:'#fff',fontWeight:800,boxShadow:'0 8px 28px rgba(0,0,0,.18)',cursor:'pointer'}}>Vào tài khoản demo</button>;
}
