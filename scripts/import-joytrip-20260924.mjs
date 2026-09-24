import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {neon} from '@neondatabase/serverless';

const IMPORT_ID='joytrip-20260924-v1';
const url=process.env.DATABASE_URL;
if(!url){console.log('[joytrip] DATABASE_URL missing; skip import');process.exit(0)}
const sql=neon(url);
const chunks=Array.from({length:10},(_,i)=>JSON.parse(readFileSync(new URL(`../data/joytrip-import/chunk${i+1}.json`,import.meta.url),'utf8')));
const items=chunks.flat();

const money=n=>new Intl.NumberFormat('vi-VN').format(Number(n||0))+'đ';
const slugify=value=>String(value||'')
 .normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D')
 .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,235);
const generatedSlug=item=>slugify(`tour-${item.name}-${item.duration||'tour'}-${item.departure||''}-${item.airline||''}`);
const unwrap=value=>value&&typeof value==='object'&&'value'in value?value.value:value;
const asObject=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
const summary=item=>`${item.name}${item.duration?` · ${item.duration}`:''}. Lịch khởi hành và giá được cập nhật từ JOYTRIP.`;

const marker=await sql`select id from audit_logs where entity_type='system_import' and entity_id=${IMPORT_ID} limit 1`;
if(marker.length){console.log('[joytrip] already imported',IMPORT_ID);process.exit(0)}

const staff=await sql`select id from staff where status='active' order by created_at asc limit 1`;
const actorId=staff[0]?.id||null;
const legacyRows=await sql`select after_data from audit_logs where entity_type='admin_shared_state' and entity_id='tn_cms_tours_v3' order by created_at desc,id desc limit 1`;
let legacy=unwrap(legacyRows[0]?.after_data);
if(!Array.isArray(legacy))legacy=[];
const relational=await sql`select id,slug,name,description,retail_price_vnd,data,status from products where partner_id is null and type='Tour'`;
const legacyBySlug=new Map(legacy.map((t,i)=>[String(t?.slug||''),{t,i}]).filter(([slug])=>slug));
const relBySlug=new Map(relational.map(r=>[String(r.slug||''),r]).filter(([slug])=>slug));

let legacyChanged=false,updatedLegacy=0,updatedRelational=0,created=0,skippedDuplicateInput=0;
const seenInput=new Set();

for(const item of items){
 const fingerprint=JSON.stringify([item.name,item.duration,item.airline,item.departure,item.departures,item.price]);
 if(seenInput.has(fingerprint)){skippedDuplicateInput++;continue}
 seenInput.add(fingerprint);

 let slug=String(item.matchSlug||'').trim();
 if(!slug)slug=generatedSlug(item);
 const priceText=money(item.price);
 const legacyHit=legacyBySlug.get(slug);
 if(legacyHit){
   const current=legacyHit.t;
   const next={...current,price:priceText,salePrice:priceText,departures:item.departures,
     joytripSourceSheet:item.sourceSheet,joytripProgramLink:item.programLink,joytripUpdatedAt:new Date().toISOString()};
   if(item.duration&&!next.duration)next.duration=item.duration;
   if(item.departure&&!next.departure)next.departure=item.departure;
   if(item.airline&&!next.airline)next.airline=item.airline;
   legacy[legacyHit.i]=next;legacyHit.t=next;legacyChanged=true;updatedLegacy++;continue;
 }
 const relHit=relBySlug.get(slug);
 if(relHit){
   const oldData=asObject(relHit.data);
   const nextData={...oldData,price:priceText,departures:item.departures,
     joytripSourceSheet:item.sourceSheet,joytripProgramLink:item.programLink,joytripUpdatedAt:new Date().toISOString()};
   if(item.duration&&!nextData.duration)nextData.duration=item.duration;
   if(item.departure&&!nextData.departure)nextData.departure=item.departure;
   if(item.airline&&!nextData.airline)nextData.airline=item.airline;
   await sql`update products set retail_price_vnd=${Number(item.price||0)},data=${JSON.stringify(nextData)}::jsonb,updated_at=now() where id=${relHit.id}`;
   relHit.data=nextData;updatedRelational++;continue;
 }
 const id=randomUUID(),now=new Date().toISOString();
 const data={
   price:priceText,category:item.category||'Tour du lịch',duration:item.duration||'',departure:item.departure||'',
   route:item.route||item.name,departures:item.departures||'',airline:item.airline||'',transport:item.airline||'',
   summary:summary(item),content:summary(item),seoTitle:`${item.name} | HappyGo`,
   seoDescription:summary(item).slice(0,155),sourceProgramLink:item.programLink||'',
   joytripSourceSheet:item.sourceSheet,joytripProgramLink:item.programLink||'',joytripImportedAt:now
 };
 await sql`insert into products(id,partner_id,slug,type,name,status,description,retail_price_vnd,net_price_vnd,promo_price_vnd,data,created_at,updated_at)
 values(${id},null,${slug},'Tour',${item.name},'published',${summary(item)},${Number(item.price||0)},null,null,${JSON.stringify(data)}::jsonb,now(),now())`;
 relBySlug.set(slug,{id,slug,data});created++;
}

if(legacyChanged){
 const envelope={value:legacy,updatedAt:new Date().toISOString(),updatedBy:'JOYTRIP import 2026-09-24'};
 await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data)
 values(${actorId},'joytrip.import','admin_shared_state','tn_cms_tours_v3',${JSON.stringify(envelope)}::jsonb)`;
}
const report={importId:IMPORT_ID,totalInput:items.length,updatedLegacy,updatedRelational,created,skippedDuplicateInput,completedAt:new Date().toISOString()};
await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data)
 values(${actorId},'joytrip.import.complete','system_import',${IMPORT_ID},${JSON.stringify(report)}::jsonb)`;
console.log('[joytrip] import complete',JSON.stringify(report));
