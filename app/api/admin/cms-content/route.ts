import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor,type AdminActor} from '@/lib/server/admin-access';

export const dynamic='force-dynamic';
export const runtime='nodejs';

const ENTITY='admin_shared_state';
const CONFIG={articles:{key:'tn_cms_articles_v3',permission:'content'},tours:{key:'tn_cms_tours_v3',permission:'tours'}} as const;
type Kind=keyof typeof CONFIG;

type Envelope={value:unknown;updatedAt?:string;updatedBy?:string};
function array(value:unknown):any[]{return Array.isArray(value)?value:[]}
function unwrap(raw:unknown){let value=raw;if(typeof value==='string'){try{value=JSON.parse(value)}catch{return[]}}if(value&&typeof value==='object'&&'value' in value)return array((value as Envelope).value);return array(value)}
function elevated(actor:AdminActor){return actor.role==='owner'||actor.role==='admin'||actor.permissions.includes('*')}
function canUse(actor:AdminActor,kind:Kind){const permission=CONFIG[kind].permission;return elevated(actor)||actor.permissions.includes(permission)}
function cleanId(value:unknown){return String(value||'').trim().slice(0,180)}
function itemName(kind:Kind,item:any){return kind==='articles'?String(item?.title||'Bài viết'):String(item?.name||'Tour')}
async function latest(key:string){const rows=await db()`select after_data,created_at from audit_logs where entity_type=${ENTITY} and entity_id=${key} order by created_at desc,id desc limit 1`;return rows[0]?{items:unwrap(rows[0].after_data),updatedAt:String(rows[0].created_at)}:{items:[],updatedAt:''}}
async function write(actor:AdminActor,key:string,items:unknown[],action:string,before?:unknown){const updatedAt=new Date().toISOString(),envelope={value:items,updatedAt,updatedBy:actor.name};await db()`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,before_data,after_data) values(${actor.id},${action},${ENTITY},${key},${before===undefined?null:JSON.stringify(before)}::jsonb,${JSON.stringify(envelope)}::jsonb)`;return updatedAt}

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const kind=String(req.nextUrl.searchParams.get('kind')||'') as Kind;if(!(kind in CONFIG))return NextResponse.json({error:'Loại nội dung không hợp lệ.'},{status:400});
 const actor=await adminActor(req);if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});if(!canUse(actor,kind))return NextResponse.json({error:'Forbidden'},{status:403});
 try{const state=await latest(CONFIG[kind].key);return NextResponse.json({ok:true,items:state.items,updatedAt:state.updatedAt},{headers:{'Cache-Control':'no-store, max-age=0'}})}catch(error){console.error('cms_content_get_failed',kind,error);return NextResponse.json({error:'Không đọc được nội dung production.'},{status:500})}
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const body=await req.json().catch(()=>({})),kind=String(body.kind||'') as Kind,action=String(body.action||'');if(!(kind in CONFIG))return NextResponse.json({error:'Loại nội dung không hợp lệ.'},{status:400});
 const actor=await adminActor(req);if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});if(!canUse(actor,kind))return NextResponse.json({error:'Forbidden'},{status:403});
 try{const key=CONFIG[kind].key,state=await latest(key),items=state.items;
  if(action==='save'){
   const item=body.item&&typeof body.item==='object'?body.item:null,id=cleanId(item?.id);if(!item||!id)return NextResponse.json({error:'Nội dung chưa có ID hợp lệ.'},{status:400});
   const nextItem={...item,id};const exists=items.some((row:any)=>cleanId(row?.id)===id);const next=exists?items.map((row:any)=>cleanId(row?.id)===id?nextItem:row):[nextItem,...items];const updatedAt=await write(actor,key,next,`cms.${kind}.save`,exists?items.find((row:any)=>cleanId(row?.id)===id):undefined);return NextResponse.json({ok:true,item:nextItem,items:next,updatedAt})
  }
  if(action==='delete'){
   const id=cleanId(body.id),target=items.find((row:any)=>cleanId(row?.id)===id);if(!id||!target)return NextResponse.json({error:'Không tìm thấy nội dung production.'},{status:404});const next=items.filter((row:any)=>cleanId(row?.id)!==id);const updatedAt=await write(actor,key,next,`cms.${kind}.delete`,{deleted:target});return NextResponse.json({ok:true,items:next,deleted:{id,name:itemName(kind,target)},updatedAt})
  }
  return NextResponse.json({error:'Hành động không hỗ trợ.'},{status:400})
 }catch(error){console.error('cms_content_post_failed',kind,error);return NextResponse.json({error:'Không thể cập nhật nội dung production.'},{status:500})}
}
