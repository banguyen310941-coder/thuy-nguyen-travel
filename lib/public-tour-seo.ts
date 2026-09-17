import {db,hasDatabase} from '@/lib/db';

type TourDay={title:string;morning:string;afternoon:string;evening:string;meals:string};
export type PublicTourSeo={
 slug:string;name:string;summary:string;category:string;duration:string;route:string;departure:string;
 cover:string;gallery:string[];price:string;seoTitle:string;seoDescription:string;updatedAt:string;
 airline:string;transport:string;childPrice:string;singleCharge:string;departures:string;highlights:string;
 days:TourDay[];included:string;excluded:string;policies:string;promotion:string;rating:string;reviewCount:string;
 faq:string;content:string;
};

function object(value:unknown){return value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};}
function lines(value:unknown){if(Array.isArray(value))return value.map(x=>String(x||'').trim()).filter(Boolean);return String(value||'').split(/\n+/).map(x=>x.trim()).filter(Boolean)}
function text(value:unknown){return Array.isArray(value)?value.map(x=>String(x||'').trim()).filter(Boolean).join('\n'):String(value||'')}
function dayList(value:unknown):TourDay[]{if(!Array.isArray(value))return[];return value.map((item:any)=>({title:String(item?.title||''),morning:String(item?.morning||''),afternoon:String(item?.afternoon||''),evening:String(item?.evening||''),meals:String(item?.meals||'')}))}
function envelope(value:unknown){let parsed=value;if(typeof parsed==='string'){try{parsed=JSON.parse(parsed)}catch{return null}}if(!parsed||typeof parsed!=='object'||!('value' in parsed))return null;return (parsed as {value?:unknown}).value}
function fromLegacy(item:any):PublicTourSeo{return{
 slug:String(item.slug||''),name:String(item.name||''),summary:String(item.summary||''),category:String(item.category||'Tour du lịch'),duration:String(item.duration||''),route:String(item.route||''),departure:String(item.departure||''),cover:String(item.cover||lines(item.gallery)[0]||''),gallery:lines(item.gallery),price:String(item.salePrice||item.price||''),seoTitle:String(item.seoTitle||''),seoDescription:String(item.seoDescription||''),updatedAt:String(item.updatedAt||item.updated_at||''),airline:String(item.airline||''),transport:text(item.transport),childPrice:String(item.childPrice||''),singleCharge:String(item.singleCharge||''),departures:text(item.departures),highlights:text(item.highlights),days:dayList(item.days),included:text(item.included),excluded:text(item.excluded),policies:text(item.policies),promotion:String(item.promotion||item.promotions||''),rating:String(item.rating||''),reviewCount:String(item.reviewCount||''),faq:text(item.faq),content:String(item.content||'')
}}
function fromProduct(row:any):PublicTourSeo{const data=object(row.data);const gallery=lines(data.gallery);return{
 slug:String(row.slug||''),name:String(row.name||''),summary:String(data.summary||row.description||''),category:String(data.category||'Tour du lịch'),duration:String(data.duration||''),route:String(data.route||data.place||data.itinerary||''),departure:String(data.departure||data.pickup||''),cover:String(data.cover||gallery[0]||''),gallery,price:String(data.price||row.retail_price_vnd||''),seoTitle:String(data.seoTitle||''),seoDescription:String(data.seoDescription||''),updatedAt:String(row.updated_at||''),airline:String(data.airline||''),transport:text(data.transport),childPrice:String(data.childPrice||''),singleCharge:String(data.singleCharge||''),departures:text(data.departures),highlights:text(data.highlights),days:dayList(data.days),included:text(data.included),excluded:text(data.excluded),policies:text(data.policies),promotion:String(data.promotion||data.promotions||''),rating:String(data.rating||''),reviewCount:String(data.reviewCount||''),faq:text(data.faq),content:String(data.content||'')
}}

async function legacyTours(sql:ReturnType<typeof db>){const rows=await sql`select after_data,created_at from audit_logs where entity_type='admin_shared_state' and entity_id='tn_cms_tours_v3' order by created_at desc,id desc limit 1`;const value=envelope(rows[0]?.after_data);return Array.isArray(value)?value.filter((item:any)=>String(item?.status||'').toLowerCase()==='published').map(fromLegacy):[]}
async function relationalTours(sql:ReturnType<typeof db>){const rows=await sql`select slug,name,description,retail_price_vnd,data,updated_at from products where partner_id is null and status='published' and type in ('Tour','Tour du lịch') order by updated_at desc`;return rows.map(fromProduct)}

export async function listPublishedTourSeo():Promise<PublicTourSeo[]>{if(!hasDatabase())return[];try{const sql=db();const [legacy,relational]=await Promise.all([legacyTours(sql),relationalTours(sql)]);const seen=new Set<string>();return [...legacy,...relational].filter(item=>item.slug&&!seen.has(item.slug)&&seen.add(item.slug))}catch{return[]}}
export async function getPublishedTourSeo(slug:string):Promise<PublicTourSeo|null>{if(!slug)return null;const tours=await listPublishedTourSeo();return tours.find(item=>item.slug===slug)||null}
