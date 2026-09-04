import {db,hasDatabase} from '@/lib/db';

export type PublicProductSeo={
 id:string;slug:string;type:string;name:string;summary:string;place:string;address:string;category:string;cover:string;gallery:string[];seoTitle:string;seoDescription:string;serviceStars:number;price:number;updatedAt:string;
};

function dataObject(value:unknown){return value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{}}
function lines(value:unknown){return String(value||'').split(/\n+/).map(x=>x.trim()).filter(Boolean)}
function n(value:unknown){const parsed=Number(value||0);return Number.isFinite(parsed)&&parsed>0?parsed:0}

export async function getPublishedProductSeo(slug:string):Promise<PublicProductSeo|null>{
 if(!slug||!hasDatabase())return null;
 try{
  const sql=db();
  const rows=await sql`select id,slug,type,name,description,retail_price_vnd,data,updated_at from products where partner_id is null and status='published' and slug=${slug} limit 1`;
  const row=rows[0] as any;if(!row)return null;const data=dataObject(row.data);const gallery=lines(data.gallery);const cover=String(data.cover||gallery[0]||'');const summary=String(data.summary||row.description||'').trim();
  return {id:String(row.id),slug:String(row.slug),type:String(row.type),name:String(row.name),summary,place:String(data.place||''),address:String(data.address||''),category:String(data.category||row.type||''),cover,gallery,seoTitle:String(data.seoTitle||'').trim(),seoDescription:String(data.seoDescription||'').trim(),serviceStars:n(data.serviceStars),price:n(row.retail_price_vnd),updatedAt:String(row.updated_at||'')};
 }catch{return null}
}

export async function listPublishedProductSeo(){
 if(!hasDatabase())return[] as Array<Pick<PublicProductSeo,'slug'|'updatedAt'>>;
 try{const sql=db();const rows=await sql`select slug,updated_at from products where partner_id is null and status='published' order by updated_at desc`;return rows.map((row:any)=>({slug:String(row.slug),updatedAt:String(row.updated_at||'')}))}catch{return[] as Array<Pick<PublicProductSeo,'slug'|'updatedAt'>>}
}
