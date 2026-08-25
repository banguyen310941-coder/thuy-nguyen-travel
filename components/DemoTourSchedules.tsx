'use client';

import {useEffect} from 'react';

const KEY='tn_cms_tours_v3';
const demo=[
 {id:'tour_bac_kinh_demo_schedule',slug:'bac-kinh-van-ly-truong-thanh',name:'Tinh hoa Trung Quốc: Bắc Kinh - Thượng Hải - Hàng Châu - Ô Trấn',category:'Tour Trung Quốc',duration:'7N6Đ',departure:'Hà Nội',route:'Hà Nội - Bắc Kinh - Hàng Châu - Ô Trấn - Thượng Hải',summary:'Hành trình Trung Quốc nhiều điểm đến, kết hợp di sản lịch sử, đô thị hiện đại và cảnh quan Giang Nam.',status:'published',price:'21.680.000đ',salePrice:'21.180.000đ',departures:'06/09/2026\n13/09/2026\n27/09/2026\n04/10/2026\n18/10/2026\n01/11/2026\n15/11/2026'},
 {id:'tour_thuong_hai_demo_schedule',slug:'thuong-hai-hang-chau-o-tran',name:'Thượng Hải - Hàng Châu - Ô Trấn',category:'Tour Trung Quốc',duration:'6N5Đ',departure:'Hà Nội',route:'Thượng Hải - Hàng Châu - Ô Trấn',summary:'Tour kết hợp đô thị hiện đại, cảnh quan Giang Nam và cổ trấn nổi tiếng.',status:'published',price:'18.900.000đ',salePrice:'18.900.000đ',departures:'10/09/2026\n24/09/2026\n08/10/2026\n22/10/2026\n05/11/2026\n19/11/2026'},
 {id:'tour_danang_demo_schedule',slug:'da-nang-hoi-an-ba-na',name:'Đà Nẵng - Hội An - Bà Nà',category:'Tour trong nước',duration:'4N3Đ',departure:'Hà Nội / TP.HCM',route:'Đà Nẵng - Hội An - Bà Nà',summary:'Tour miền Trung kết hợp biển, phố cổ Hội An và khu du lịch Bà Nà.',status:'published',price:'5.490.000đ',salePrice:'5.490.000đ',departures:'05/09/2026\n12/09/2026\n03/10/2026\n17/10/2026\n07/11/2026\n21/11/2026'},
 {id:'tour_phuquoc_demo_schedule',slug:'phu-quoc-4n3d',name:'Phú Quốc nghỉ dưỡng 4N3Đ',category:'Tour trong nước',duration:'4N3Đ',departure:'Hà Nội / TP.HCM',route:'Phú Quốc',summary:'Kỳ nghỉ biển tại Phú Quốc với lựa chọn khách sạn hoặc resort theo ngân sách.',status:'published',price:'6.290.000đ',salePrice:'6.290.000đ',departures:'09/09/2026\n23/09/2026\n14/10/2026\n28/10/2026\n11/11/2026\n25/11/2026'}
];

export function DemoTourSchedules(){
 useEffect(()=>{
  try{
   const raw=JSON.parse(localStorage.getItem(KEY)||'[]');
   const items=Array.isArray(raw)?raw:[];
   let changed=false;
   for(const sample of demo){
    const index=items.findIndex((x:any)=>x?.slug===sample.slug);
    if(index<0){items.push({...sample,cover:'',gallery:'',airline:'',transport:'',highlights:'',itinerary:'',days:[],included:'',excluded:'',policies:'',promotion:'',rating:'',reviewCount:'',faq:'',seoTitle:'',seoDescription:'',childPrice:'',singleCharge:''});changed=true;continue}
    const current=items[index];
    if(!String(current.departures||'').trim()){
     items[index]={...current,departures:sample.departures};changed=true;
    }
   }
   if(changed){localStorage.setItem(KEY,JSON.stringify(items));window.dispatchEvent(new Event('tn-tours-updated'))}
  }catch{}
 },[]);
 return null;
}
