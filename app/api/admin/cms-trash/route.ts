import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';

export const dynamic='force-dynamic';
export const runtime='nodejs';

const ENTITY='admin_shared_state';
const KEYS={products:'tn_cms_products_v3_units',tours:'tn_cms_tours_v3',articles:'tn_cms_articles_v3'} as const;
type Kind=keyof typeof KEYS;

type Envelope={value:unknown;updatedAt?:string;updatedBy?:string};
function unwrap(raw:unknown){let value=raw;if(typeof value==='string'){try{value=JSON.parse(value)}catch{return undefined}}if(value&&typeof value==='object'&&'value' in value)return (value as Envelope).value;return value}
function array(value:unknown):any[]{return Array.isArray(value)?value:[]}
function owner(actor:{role:string;permissions:string[]}){return actor.role==='owner'||actor.permissions.includes('*')}
function display(kind:Kind,item:any){return kind==='articles'?String(item?.title||item?.name||'Bài viết'):String(item?.name||item?.title||'Nội dung')}
function count(kind:Kind,item:any){if(kind==='products')return Array.isArray(item?.units)?item.units.length:0;if(kind==='tours')return Array.isArray(item?.days)?item.days.length:0;return undefined}
function label(kind:Kind,item:any){if(kind==='articles')return 'Bài viết';if(kind==='tours')return 'Tour';return String(item?.type||'Sản phẩm')}

async function latest(key:string){const rows=await db()`select after_data,created_at from audit_logs where entity_type=${ENTITY} and entity_id=${key} order by created_at desc,id desc limit 1`;return rows[0]?{value:array(unwrap(rows[0].after_data)),updatedAt:String(rows[0].created_at)}:{value:[],updatedAt:''}}
async function snapshot(){const entries=await Promise.all((Object.entries(KEYS) as Array<[Kind,string]>).map(async([kind,key])=>[kind,key,await latest(key)] as const));const records:Record<string,unknown[]>={},rows:any[]=[];for(const[kind,key,state]of entries){records[key]=state.value;for(const item of state.value){const id=String(item?.id||'');if(!id)continue;rows.push({id,key,kind,label:label(kind,item),name:display(kind,item),count:count(kind,item),updatedAt:state.updatedAt})}}return{records,rows:rows.sort((a,b)=>a.label.localeCompare(b.label,'vi')||a.name.localeCompare(b.name,'vi'))}}

export async function GET(req:NextRequest){if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});const actor=await adminActor(req);if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});if(!owner(actor))return NextResponse.json({error:'Chỉ Chủ tài khoản được truy cập vùng xóa dữ liệu.'},{status:403});try{return NextResponse.json({ok:true,...await snapshot()},{headers:{'Cache-Control':'no-store, max-age=0'}})}catch(error){console.error('cms_trash_get_failed',error);return NextResponse.json({error:'Không đọc được dữ liệu nội dung production.'},{status:500})}}

export async function POST(req:NextRequest){if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});const actor=await adminActor(req);if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});if(!owner(actor))return NextResponse.json({error:'Chỉ Chủ tài khoản được xóa dữ liệu.'},{status:403});const body=await req.json().catch(()=>({}));if(String(body.action||'')!=='delete')return NextResponse.json({error:'Hành động không hỗ trợ.'},{status:400});const kind=String(body.kind||'') as Kind,id=String(body.id||'').trim();if(!(kind in KEYS)||!id)return NextResponse.json({error:'Dữ liệu xóa không hợp lệ.'},{status:400});const key=KEYS[kind];try{const state=await latest(key),target=state.value.find((item:any)=>String(item?.id||'')===id);if(!target)return NextResponse.json({error:'Nội dung không còn tồn tại trên production.'},{status:404});const next=state.value.filter((item:any)=>String(item?.id||'')!==id),updatedAt=new Date().toISOString(),envelope={value:next,updatedAt,updatedBy:actor.name};await db()`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,before_data,after_data) values(${actor.id},'cms.delete.permanent',${ENTITY},${key},${JSON.stringify({deleted:target})}::jsonb,${JSON.stringify(envelope)}::jsonb)`;return NextResponse.json({ok:true,deleted:{id,kind,name:display(kind,target)},key,value:next,updatedAt})}catch(error){console.error('cms_trash_delete_failed',error);return NextResponse.json({error:'Không thể xóa dữ liệu production.'},{status:500})}}
