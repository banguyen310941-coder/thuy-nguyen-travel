import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {getSiteUrl} from '@/lib/site-url';

type PageProps={searchParams:Promise<Record<string,string|string[]|undefined>>};

export const metadata:Metadata={
 title:"Khách sạn & Resort | HappyGo Travel",
 alternates:{canonical:`${getSiteUrl()}/khach-san-resort`},
 robots:{index:false,follow:true},
};

function appendQuery(base:string,query:Record<string,string|string[]|undefined>){
 const params=new URLSearchParams();
 for(const [key,value] of Object.entries(query)){
  if(Array.isArray(value)){for(const item of value)if(item)params.append(key,String(item));}
  else if(value!==undefined&&value!==null&&String(value)!=='')params.set(key,String(value));
 }
 const qs=params.toString();return qs?`${base}?${qs}`:base;
}

export default async function LegacyStayPage({searchParams}:PageProps){
 redirect(appendQuery("/khach-san-resort",await searchParams));
}
