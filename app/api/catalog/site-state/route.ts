import {NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';

export const dynamic='force-dynamic';
export const runtime='nodejs';

const KEYS=['tn_cms_products_v3_units','tn_cms_daily_rates_v1','tn_cms_tours_v3','tn_cms_articles_v3','tn_cms_homepage'] as const;
type Key=(typeof KEYS)[number];

function envelope(value:unknown){
 let parsed=value;
 if(typeof parsed==='string'){try{parsed=JSON.parse(parsed)}catch{return null}}
 if(!parsed||typeof parsed!=='object'||!('value' in parsed))return null;
 return (parsed as {value?:unknown}).value;
}
function visibleList(value:unknown){
 if(!Array.isArray(value))return [];
 return value.filter((item:any)=>String(item?.status||'').toLowerCase()==='published');
}

export async function GET(){
 if(!hasDatabase())return NextResponse.json({ok:true,state:{}},{headers:{'Cache-Control':'public, max-age=10, s-maxage=30, stale-while-revalidate=60'}});
 try{
  const sql=db();
  const rows=await sql`
   select distinct on (entity_id) entity_id,after_data,created_at
   from audit_logs
   where entity_type='admin_shared_state'
   order by entity_id,created_at desc,id desc
  `;
  const state:Partial<Record<Key,unknown>>={};
  for(const row of rows){
   const rawKey=String(row.entity_id);if(!KEYS.some(key=>key===rawKey))continue;
   const key=rawKey as Key;const value=envelope(row.after_data);
   if(key==='tn_cms_products_v3_units')state[key]=visibleList(value);
   else if(key==='tn_cms_tours_v3')state[key]=visibleList(value);
   else if(key==='tn_cms_articles_v3'){
    const now=Date.now();
    state[key]=Array.isArray(value)?value.filter((item:any)=>item?.status==='published'||(item?.status==='scheduled'&&item?.publishAt&&+new Date(item.publishAt)<=now)):[];
   }else state[key]=value;
  }
  return NextResponse.json({ok:true,state},{headers:{'Cache-Control':'public, max-age=10, s-maxage=30, stale-while-revalidate=60'}});
 }catch(error){console.error('public_site_state_failed',error);return NextResponse.json({ok:true,state:{}},{headers:{'Cache-Control':'public, max-age=5'}})}
}
