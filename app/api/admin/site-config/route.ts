import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';

const allowed=new Set(['site','seo']);
function parseValue(value:unknown){if(!value)return null;if(typeof value==='string'){try{return JSON.parse(value)}catch{return null}}return value}

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const actor=await adminActor(req,'settings');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 const type=req.nextUrl.searchParams.get('type')||'site';if(!allowed.has(type))return NextResponse.json({error:'Loại cấu hình không hợp lệ.'},{status:400});
 try{const sql=db();const rows=await sql`select after_data,created_at from audit_logs where entity_type='site_config' and entity_id=${type} order by created_at desc,id desc limit 1`;const raw=rows[0]?.after_data as any;return NextResponse.json({ok:true,type,value:parseValue(raw?.value??raw),updatedAt:rows[0]?.created_at?String(rows[0].created_at):''})}catch(error){console.error('site_config_get_failed',error);return NextResponse.json({error:'Không đọc được cấu hình production.'},{status:500})}
}

export async function PUT(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const actor=await adminActor(req,'settings');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 const body=await req.json().catch(()=>({}));const type=String(body.type||'');if(!allowed.has(type)||!body.value||typeof body.value!=='object'||Array.isArray(body.value))return NextResponse.json({error:'Cấu hình không hợp lệ.'},{status:400});
 try{const sql=db();await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'site_config.save','site_config',${type},${JSON.stringify({value:body.value,updatedAt:new Date().toISOString(),updatedBy:actor.name})}::jsonb)`;return NextResponse.json({ok:true,type})}catch(error){console.error('site_config_put_failed',error);return NextResponse.json({error:'Không lưu được cấu hình production.'},{status:500})}
}
