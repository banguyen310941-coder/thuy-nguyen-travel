import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';

export const dynamic='force-dynamic';
export const runtime='nodejs';
const ENTITY='admin_shared_state';
const KEY='tn_cms_homepage';
function unwrap(raw:unknown){let value=raw;if(typeof value==='string'){try{value=JSON.parse(value)}catch{return null}}if(value&&typeof value==='object'&&'value' in value)return (value as {value?:unknown}).value;return value}
async function current(){const rows=await db()`select after_data,created_at from audit_logs where entity_type=${ENTITY} and entity_id=${KEY} order by created_at desc,id desc limit 1`;return rows[0]?{value:unwrap(rows[0].after_data),updatedAt:String(rows[0].created_at)}:{value:null,updatedAt:''}}

export async function GET(req:NextRequest){if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});const actor=await adminActor(req,'settings');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});try{return NextResponse.json({ok:true,...await current()},{headers:{'Cache-Control':'no-store, max-age=0'}})}catch(error){console.error('homepage_cms_get_failed',error);return NextResponse.json({error:'Không đọc được nội dung trang chủ production.'},{status:500})}}

export async function POST(req:NextRequest){if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});const actor=await adminActor(req,'settings');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});const body=await req.json().catch(()=>({})),value=body&&typeof body.value==='object'&&!Array.isArray(body.value)?body.value:null;if(!value)return NextResponse.json({error:'Nội dung trang chủ không hợp lệ.'},{status:400});try{const before=await current(),updatedAt=new Date().toISOString(),envelope={value,updatedAt,updatedBy:actor.name};await db()`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,before_data,after_data) values(${actor.id},'homepage.save',${ENTITY},${KEY},${JSON.stringify(before.value)}::jsonb,${JSON.stringify(envelope)}::jsonb)`;return NextResponse.json({ok:true,value,updatedAt})}catch(error){console.error('homepage_cms_save_failed',error);return NextResponse.json({error:'Không thể lưu trang chủ production.'},{status:500})}}
