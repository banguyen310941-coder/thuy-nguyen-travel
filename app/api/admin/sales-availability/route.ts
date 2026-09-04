import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor,type AdminActor} from '@/lib/server/admin-access';

export const dynamic='force-dynamic';
export const runtime='nodejs';

const ENTITY='sales_availability';
const SHARED_ENTITY='admin_shared_state';
const SHARED_KEY='happygo_crm_sales_availability_v1';
function elevated(actor:AdminActor){return actor.role==='owner'||actor.role==='admin'||actor.permissions.includes('*')}
function isSales(actor:AdminActor){return actor.role==='sales'||String(actor.department||'').toLowerCase()==='sales'}
async function states(){
 const sql=db();const sales=await sql`select id,name from staff where status='active' and (role='sales' or department='sales') order by name,id`;const rows=await sql`select distinct on (entity_id) entity_id,after_data,created_at from audit_logs where entity_type=${ENTITY} order by entity_id,created_at desc,id desc`;const map=new Map(rows.map((row:any)=>[String(row.entity_id),row.after_data as any]));const result:Record<string,{receivingCustomers:boolean;updatedAt:string;updatedBy?:string}>={};for(const sale of sales){const raw:any=map.get(String(sale.id))||{};result[String(sale.id)]={receivingCustomers:raw.receivingCustomers!==false,updatedAt:String(raw.updatedAt||''),updatedBy:raw.updatedBy?String(raw.updatedBy):undefined}}return{sales:sales.map((sale:any)=>({id:String(sale.id),name:String(sale.name)})),states:result}
}
async function mirror(actor:AdminActor){const current=await states(),now=new Date().toISOString();await db()`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'sales_availability.mirror',${SHARED_ENTITY},${SHARED_KEY},${JSON.stringify({value:current.states,updatedAt:now,updatedBy:actor.name})}::jsonb)`;return current}

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});const actor=await adminActor(req,'customers');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{const current=await states();return NextResponse.json({ok:true,...current,actorId:actor.id,canToggle:isSales(actor)||elevated(actor),canManage:elevated(actor)},{headers:{'Cache-Control':'no-store, max-age=0'}})}catch(error){console.error('sales_availability_get_failed',error);return NextResponse.json({error:'Không đọc được trạng thái nhận khách.'},{status:500})}
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});const actor=await adminActor(req,'customers');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});const body=await req.json().catch(()=>({}));let staffId=String(body.staffId||actor.id);if(!elevated(actor))staffId=actor.id;if(!isSales(actor)&&!elevated(actor))return NextResponse.json({error:'Chỉ Sale hoặc Quản trị viên được đổi trạng thái nhận khách.'},{status:403});
 try{const target=(await db()`select id,name,role,department from staff where id=${staffId} and status='active' limit 1`)[0];if(!target||!(String(target.role)==='sales'||String(target.department||'').toLowerCase()==='sales'))return NextResponse.json({error:'Nhân viên Sale không hợp lệ.'},{status:400});const receivingCustomers=Boolean(body.receivingCustomers),updatedAt=new Date().toISOString();await db()`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'sales_availability.update',${ENTITY},${staffId},${JSON.stringify({receivingCustomers,updatedAt,updatedBy:actor.name})}::jsonb)`;const current=await mirror(actor);return NextResponse.json({ok:true,...current,actorId:actor.id})}catch(error){console.error('sales_availability_post_failed',error);return NextResponse.json({error:'Không thể cập nhật trạng thái nhận khách.'},{status:500})}
}
