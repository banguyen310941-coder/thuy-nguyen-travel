import {db,hasDatabase} from '@/lib/db';

const KEYS=['tn_cms_tours_v3','tn_cms_articles_v3','tn_cms_homepage'] as const;
type Key=(typeof KEYS)[number];
export type PublicSiteState=Record<string,unknown>;

const PRIVATE_FIELD_TOKENS=new Set(['net','cost','supplier','agency','wholesale','margin','profit','markup','partner','affiliate','commission','owner','host','contact','phone','mobile','token','secret','password','credential']);
const PRIVATE_TEXT=/(giá\s*(gốc|net|hợp tác|(?:phòng\s*)?nguồn)|biên\s*lợi\s*nhuận|lợi\s*nhuận|markup|cộng\s+[\d.,]+\s*đ.{0,40}(phòng|p)\/?(đêm|đ)|bảng\s*(giá\s*)?nguồn|bảng\s*SẢN PHẨM|sourceprice|netrate)/i;

function envelope(value:unknown){let parsed=value;if(typeof parsed==='string'){try{parsed=JSON.parse(parsed)}catch{return null}}if(!parsed||typeof parsed!=='object'||!('value' in parsed))return null;return(parsed as{value?:unknown}).value}
function visibleList(value:unknown){if(!Array.isArray(value))return[];return value.filter((item:any)=>String(item?.status||'').toLowerCase()==='published')}
function money(value:unknown){const amount=Number(value||0);return amount>0?`${new Intl.NumberFormat('vi-VN').format(amount)}đ`:''}
function rateMeta(label:unknown){try{const value=JSON.parse(String(label||''));return value&&typeof value==='object'?value:{}}catch{return{note:String(label||'')}}}
function customerText(value:unknown){const text=String(value||'').trim();if(!text)return'';return text.split(/\n+/).map(line=>line.split(/(?<=[.!?])\s+/).filter(sentence=>sentence&&!PRIVATE_TEXT.test(sentence)).join(' ').trim()).filter(Boolean).join('\n')}
function snakeField(key:string){return key.replace(/([a-z0-9])([A-Z])/g,'$1_$2').replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'').toLowerCase()}
function privateField(key:string){const snake=snakeField(key),tokens=snake.split('_').filter(Boolean);if(tokens.some(token=>PRIVATE_FIELD_TOKENS.has(token)))return true;if(/^rate_[a-d]$/.test(snake))return true;if(/^(?:source_(?:price|sheet|image|file|folder)|(?:price|sheet|image|file|folder)_source)$/.test(snake))return true;return false}
export function sanitizePublicValue(value:unknown):unknown{if(Array.isArray(value))return value.map(sanitizePublicValue);if(value&&typeof value==='object'){const safe:Record<string,unknown>={};for(const[key,item]of Object.entries(value as Record<string,unknown>)){if(privateField(key))continue;safe[key]=sanitizePublicValue(item)}return safe}if(typeof value==='string')return customerText(value);return value}
function publicData(value:unknown){const safe=sanitizePublicValue(value);return safe&&typeof safe==='object'&&!Array.isArray(safe)?safe as Record<string,unknown>:{} }

async function relationalProducts(sql:ReturnType<typeof db>){
 const[products,units]=await Promise.all([
  sql`select id,slug,type,name,status,description,retail_price_vnd,data,created_at,updated_at from products where partner_id is null and status='published' order by updated_at desc`,
  sql`select id,product_id,code,name,capacity,retail_price_vnd,data,status from product_units where product_id in(select id from products where partner_id is null and status='published') and status<>'hidden' order by name,id`
 ]);
 return products.map((row:any)=>{const rawData=row.data&&typeof row.data==='object'?row.data:{};const data=publicData(rawData);const productUnits=units.filter((unit:any)=>String(unit.product_id)===String(row.id)).map((unit:any)=>{const unitData=publicData(unit.data&&typeof unit.data==='object'?unit.data:{});return{...unitData,id:String(unit.id),code:String(unit.code||''),name:String(unit.name||''),capacity:String((unitData as any)?.capacity||unit.capacity||''),weekdayPrice:String((unitData as any)?.weekdayPrice||money(unit.retail_price_vnd)),status:String(unit.status||'available')}});return{...data,id:String(row.id),slug:String(row.slug),type:String(row.type),name:String(row.name),status:'published',summary:customerText(row.description||(data as any).summary||''),content:customerText((data as any).content||''),price:String((data as any).price||money(row.retail_price_vnd)),source:'admin',createdAt:String(row.created_at),updatedAt:String(row.updated_at),units:productUnits}})
}
async function relationalRates(sql:ReturnType<typeof db>){const rows=await sql`select r.id,r.product_id,r.unit_id,r.start_date,r.end_date,r.retail_price_vnd,r.inventory,r.label from rate_rules r join products p on p.id=r.product_id where p.partner_id is null and p.status='published' order by r.start_date,r.id`;return rows.map((row:any)=>{const extra=rateMeta(row.label);return{id:String(row.id),productId:String(row.product_id),unitId:String(row.unit_id||''),start:String(row.start_date).slice(0,10),end:String(row.end_date).slice(0,10),price:money(row.retail_price_vnd),oldPrice:'',quantity:String(row.inventory??0),minStay:String((extra as any).minStay||1),status:String((extra as any).status||(Number(row.inventory)===0?'soldout':'available')),note:customerText((extra as any).note||'')}})}

export async function getPublicSiteState():Promise<PublicSiteState>{
 if(!hasDatabase())return{};
 try{
  const sql=db();const[rows,productionProducts,productionRates]=await Promise.all([
   sql`select distinct on (entity_id) entity_id,after_data,created_at from audit_logs where entity_type='admin_shared_state' and entity_id in('tn_cms_tours_v3','tn_cms_articles_v3','tn_cms_homepage') order by entity_id,created_at desc,id desc`,
   relationalProducts(sql),relationalRates(sql)
  ]);
  const state:PublicSiteState={tn_cms_products_v3_units:productionProducts,tn_cms_daily_rates_v1:productionRates};
  for(const row of rows){const rawKey=String(row.entity_id);if(!KEYS.some(key=>key===rawKey))continue;const key=rawKey as Key,value=envelope(row.after_data);if(key==='tn_cms_tours_v3')state[key]=sanitizePublicValue(visibleList(value));else if(key==='tn_cms_articles_v3'){const now=Date.now();state[key]=sanitizePublicValue(Array.isArray(value)?value.filter((item:any)=>item?.status==='published'||(item?.status==='scheduled'&&item?.publishAt&&+new Date(item.publishAt)<=now)):[])}else state[key]=sanitizePublicValue(value)}
  const legacyTours=Array.isArray(state.tn_cms_tours_v3)?state.tn_cms_tours_v3 as any[]:[],knownTourSlugs=new Set(legacyTours.map((item:any)=>String(item?.slug||'')));const relationalTours=(productionProducts as any[]).filter((item:any)=>item.type==='Tour'&&!knownTourSlugs.has(String(item.slug))).map((item:any)=>({id:item.id,name:item.name,slug:item.slug,cover:item.cover||'',category:item.category||'Tour du lịch',duration:item.duration||'',departure:item.pickup||'',route:item.place||item.itinerary||'',summary:item.summary||'',status:'published',salePrice:item.price||'',price:item.price||'',departures:'',gallery:item.gallery||'',content:item.content||''}));state.tn_cms_tours_v3=[...legacyTours,...relationalTours];
  return state;
 }catch(error){console.error('public_site_state_load_failed',error);return{}}
}
