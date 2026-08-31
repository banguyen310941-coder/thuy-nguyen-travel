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
 const standardUnit={id:'unit_partner_villa_01',code:'HG-VILLA-A01',name:'Villa Premium 3 phòng ngủ',bedrooms:'3',beds:'2 King + 2 Single',capacity:'6 người lớn + 2 trẻ em',area:'320 m²',view:'Hồ bơi & sân vườn',meal:'Không bao gồm ăn sáng',amenities:'Hồ bơi riêng, bếp đầy đủ, BBQ, máy giặt, Smart TV, Wi-Fi',weekdayPrice:'5500000',weekendPrice:'6500000',holidayPrice:'8500000',extraAdult:'500000',extraChild:'300000',images:'',status:'available',note:'Căn mẫu chuẩn do đối tác gửi HappyGo duyệt.'};
 const demoProducts=[
  {id:'partner_demo_resort',partnerId:DEMO_ID,partnerName:'Sunrise Hospitality Demo',type:'Khách sạn',name:'HappyGo Demo Beach Resort Nha Trang',slug:'happygo-demo-beach-resort-nha-trang',place:'Nha Trang, Khánh Hòa',address:'12 Trần Phú, Nha Trang',price:'2.900.000đ/đêm',summary:'Khách sạn demo dùng để trải nghiệm đầy đủ giao diện Partner Hub HappyGo.',cover:'',gallery:'',amenities:'Hồ bơi, buffet sáng, wifi, phòng gym, bãi biển',policies:'Hủy miễn phí trước 7 ngày. Phụ thu theo chính sách từng giai đoạn.',checkin:'14:00',checkout:'12:00',unitsText:'Deluxe Ocean View | 2 khách | King/Twin\nFamily Suite | 4 khách | 2 phòng ngủ',status:'approved',source:'manual',updatedAt:new Date().toISOString()},
  {id:'partner_demo_villa',partnerId:DEMO_ID,partnerName:'Sunrise Hospitality Demo',type:'Villa & Resort',name:'HappyGo Demo Garden Villa',slug:'happygo-demo-garden-villa',place:'Phước Hải, Bà Rịa - Vũng Tàu',address:'Khu nghỉ dưỡng ven biển Phước Hải',price:'5.500.000đ/đêm',summary:'Villa demo đang ở trạng thái chờ HappyGo duyệt.',cover:'',gallery:'',amenities:'Hồ bơi riêng, BBQ, bếp, 3 phòng ngủ',policies:'Đặt cọc 50%.',checkin:'14:00',checkout:'12:00',unitsText:'Villa 3PN Garden | 6 người lớn + 2 trẻ em',status:'review',source:'manual',updatedAt:new Date().toISOString()},
  {id:'partner_standard_villa_review_2026',partnerId:DEMO_ID,partnerName:'Sunrise Hospitality Demo',type:'Villa & Resort',name:'Sunrise Ocean Pool Villa 3PN',slug:'sunrise-ocean-pool-villa-3pn',place:'Phước Hải, Bà Rịa - Vũng Tàu',address:'Đường ven biển Phước Hải, Đất Đỏ, Bà Rịa - Vũng Tàu',price:'5.500.000đ/đêm',summary:'Sản phẩm mẫu chuẩn được tạo từ tài khoản đối tác để HappyGo Admin kiểm tra và duyệt quy trình.',cover:'',gallery:'',amenities:'Hồ bơi riêng\nBếp đầy đủ\nKhu BBQ\nWi-Fi\nSmart TV\nBãi đỗ xe',policies:'Đặt cọc 50% khi xác nhận. Hủy trước 14 ngày miễn phí; 7–13 ngày tính 50%; dưới 7 ngày tính 100%.',childrenPolicy:'Trẻ dưới 6 tuổi miễn phí khi ngủ chung. Từ 6–11 tuổi áp dụng phụ thu theo từng giai đoạn.',extraCharge:'Phụ thu khách vượt tiêu chuẩn theo hạng căn. Phụ thu lễ/Tết theo bảng giá được xác nhận.',checkin:'14:00',checkout:'12:00',unitsText:'Villa Premium 3PN | 3 phòng ngủ | 6 NL + 2 TE',units:[standardUnit],serviceStars:'5',rating:'',category:'Villa hồ bơi riêng',content:'Villa nguyên căn 3 phòng ngủ dành cho gia đình và nhóm bạn. Sản phẩm mẫu có đầy đủ hạng dịch vụ, cấu hình căn, sức chứa, giá ngày thường/cuối tuần/lễ, phụ thu, tiện ích và chính sách để Admin kiểm tra trước khi duyệt.',status:'review',source:'manual',updatedAt:new Date().toISOString()}
 ];
 const nextProducts=[...products];for(const p of demoProducts){const i=nextProducts.findIndex((x:any)=>x?.id===p.id);if(i<0)nextProducts.unshift(p);else if(p.id==='partner_standard_villa_review_2026')nextProducts[i]={...nextProducts[i],...p}}
 write(PRODUCTS,nextProducts);
 const pricing=read(PRICING);
 const demoPricing=[
  {productId:'partner_demo_resort',commission:'12',agencyPrice:'2400000',retailPrice:'2900000',promoPrice:'2690000',rules:[{date:'2026-09-05',agencyPrice:'2500000',retailPrice:'3100000',promoPrice:'2850000',quantity:'5',note:'Cuối tuần'},{date:'2026-09-06',agencyPrice:'2500000',retailPrice:'3100000',promoPrice:'2850000',quantity:'4',note:'Cuối tuần'}],updatedAt:new Date().toISOString()},
  {productId:'partner_demo_villa',commission:'10',agencyPrice:'4800000',retailPrice:'5500000',promoPrice:'5200000',rules:[],updatedAt:new Date().toISOString()},
  {productId:'partner_standard_villa_review_2026',commission:'12',agencyPrice:'4800000',retailPrice:'5500000',promoPrice:'5200000',rules:[{date:'2026-09-05',agencyPrice:'5200000',retailPrice:'6500000',promoPrice:'6100000',quantity:'3',note:'Giá cuối tuần mẫu'}],updatedAt:new Date().toISOString()}
 ];
 const nextPricing=[...pricing];for(const p of demoPricing){const i=nextPricing.findIndex((x:any)=>x?.productId===p.productId);if(i<0)nextPricing.unshift(p);else if(p.productId==='partner_standard_villa_review_2026')nextPricing[i]={...nextPricing[i],...p}}
 write(PRICING,nextPricing);
}

export function PartnerDemoSeeder(){
 useEffect(()=>{ensureDemo()},[]);
 function enterDemo(){ensureDemo();localStorage.setItem(SESSION,DEMO_ID);window.location.reload()}
 return <button type="button" onClick={enterDemo} style={{position:'fixed',right:18,bottom:18,zIndex:9999,border:0,borderRadius:999,padding:'12px 18px',background:'#ff6500',color:'#fff',fontWeight:800,boxShadow:'0 8px 28px rgba(0,0,0,.18)',cursor:'pointer'}}>Vào tài khoản demo</button>;
}
