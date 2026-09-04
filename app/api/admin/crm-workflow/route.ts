import {NextRequest,NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {db,hasDatabase} from '@/lib/db';
import {adminActor,type AdminActor} from '@/lib/server/admin-access';

export const dynamic='force-dynamic';
export const runtime='nodejs';

const SHARED_ENTITY='admin_shared_state';
const PIPELINE_KEY='happygo_crm_pipeline_v1';
const FOLLOWUPS_KEY='happygo_crm_followups_v1';
const OPPORTUNITIES_KEY='happygo_crm_opportunities_v1';
const stages=new Set(['lead','consulting','quoted','closing','won','lost']);

function elevated(actor:AdminActor){return actor.role==='owner'||actor.role==='admin'||actor.permissions.includes('*')}
function customerKey(phone?:unknown,email?:unknown){const digits=String(phone||'').replace(/\D/g,'');return digits?`phone:${digits}`:`email:${String(email||'').trim().toLowerCase()}`}
function array(value:unknown):any[]{return Array.isArray(value)?value:[]}
function object(value:unknown):Record<string,any>{return value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,any>: {}}
function unwrap(raw:unknown){const value=raw as any;return value&&typeof value==='object'&&'value' in value?value.value:value}
function envelope(value:unknown,actor:AdminActor){return JSON.stringify({value,updatedAt:new Date().toISOString(),updatedBy:actor.name})}

async function latestShared(key:string){const rows=await db()`select after_data from audit_logs where entity_type=${SHARED_ENTITY} and entity_id=${key} order by created_at desc,id desc limit 1`;return rows[0]?unwrap(rows[0].after_data):undefined}
async function saveShared(actor:AdminActor,key:string,value:unknown){const sql=db();await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'crm_workflow.save',${SHARED_ENTITY},${key},${envelope(value,actor)}::jsonb)`}
async function customerAccess(actor:AdminActor,customerId:string){const sql=db();if(elevated(actor)){const rows=await sql`select c.id,c.name,c.phone,c.email from customers c where c.id=${customerId} limit 1`;return rows[0]||null}const rows=await sql`select c.id,c.name,c.phone,c.email from customers c join customer_assignments ca on ca.customer_id=c.id where c.id=${customerId} and ca.staff_id=${actor.id} limit 1`;return rows[0]||null}

async function workflowCustomers(actor:AdminActor){
 const sql=db();
 const rows=elevated(actor)?await sql`
  select c.id,c.name,c.phone,c.email,c.source,c.note,c.status,c.created_at,c.updated_at,
   ca.staff_id,ca.source assignment_source,ca.assigned_at,st.name staff_name,
   coalesce(bc.booking_count,0)::int booking_count,
   lb.id booking_id,lb.code booking_code,lb.status booking_status,lb.created_at booking_created_at,lb.start_date,
   lb.sales_staff_id booking_sales_staff_id,lb.sales_staff_name_snapshot booking_sales_staff_name,
   coalesce(prod.product_name,'') product_name
  from customers c
  left join customer_assignments ca on ca.customer_id=c.id left join staff st on st.id=ca.staff_id
  left join lateral(select count(*)::int booking_count from bookings b where b.customer_id=c.id) bc on true
  left join lateral(select b.id,b.code,b.status,b.created_at,b.start_date,b.sales_staff_id,b.sales_staff_name_snapshot from bookings b where b.customer_id=c.id order by b.created_at desc limit 1) lb on true
  left join lateral(select string_agg(bi.product_name_snapshot,', ' order by bi.id) product_name from booking_items bi where bi.booking_id=lb.id) prod on true
  order by c.updated_at desc limit 1000`
 :await sql`
  select c.id,c.name,c.phone,c.email,c.source,c.note,c.status,c.created_at,c.updated_at,
   ca.staff_id,ca.source assignment_source,ca.assigned_at,st.name staff_name,
   coalesce(bc.booking_count,0)::int booking_count,
   lb.id booking_id,lb.code booking_code,lb.status booking_status,lb.created_at booking_created_at,lb.start_date,
   lb.sales_staff_id booking_sales_staff_id,lb.sales_staff_name_snapshot booking_sales_staff_name,
   coalesce(prod.product_name,'') product_name
  from customers c
  join customer_assignments ca on ca.customer_id=c.id and ca.staff_id=${actor.id} left join staff st on st.id=ca.staff_id
  left join lateral(select count(*)::int booking_count from bookings b where b.customer_id=c.id) bc on true
  left join lateral(select b.id,b.code,b.status,b.created_at,b.start_date,b.sales_staff_id,b.sales_staff_name_snapshot from bookings b where b.customer_id=c.id order by b.created_at desc limit 1) lb on true
  left join lateral(select string_agg(bi.product_name_snapshot,', ' order by bi.id) product_name from booking_items bi where bi.booking_id=lb.id) prod on true
  order by c.updated_at desc limit 1000`;
 return rows.map((r:any)=>({
  id:String(r.id),key:customerKey(r.phone,r.email),name:String(r.name||''),phone:String(r.phone||''),email:String(r.email||''),source:String(r.source||''),need:String(r.note||''),status:String(r.status||'lead'),createdAt:String(r.created_at),updatedAt:String(r.updated_at),bookingCount:Number(r.booking_count||0),
  assignment:r.staff_id?{staffId:String(r.staff_id),staffName:String(r.staff_name||''),source:String(r.assignment_source||''),assignedAt:String(r.assigned_at||'')}:null,
  latestBooking:r.booking_id?{id:String(r.booking_id),code:String(r.booking_code||''),product:String(r.product_name||''),status:String(r.booking_status||'new'),createdAt:String(r.booking_created_at),startDate:r.start_date?String(r.start_date).slice(0,10):'',salesStaffId:String(r.booking_sales_staff_id||''),salesStaffName:String(r.booking_sales_staff_name||'')}:null,
 }))
}

async function workflowBookings(actor:AdminActor){
 const sql=db();const rows=elevated(actor)?await sql`select b.id,b.code,b.status,b.customer_id,b.customer_name_snapshot,b.phone_snapshot,b.email_snapshot,b.start_date,b.created_at,b.sales_staff_id,b.sales_staff_name_snapshot,coalesce((select string_agg(bi.product_name_snapshot,', ' order by bi.id) from booking_items bi where bi.booking_id=b.id),'') product_name from bookings b order by b.created_at desc limit 1000`:await sql`select b.id,b.code,b.status,b.customer_id,b.customer_name_snapshot,b.phone_snapshot,b.email_snapshot,b.start_date,b.created_at,b.sales_staff_id,b.sales_staff_name_snapshot,coalesce((select string_agg(bi.product_name_snapshot,', ' order by bi.id) from booking_items bi where bi.booking_id=b.id),'') product_name from bookings b join customer_assignments ca on ca.customer_id=b.customer_id and ca.staff_id=${actor.id} order by b.created_at desc limit 1000`;
 return rows.map((r:any)=>({id:String(r.id),code:String(r.code),status:String(r.status),customerId:String(r.customer_id||''),customerName:String(r.customer_name_snapshot||''),phone:String(r.phone_snapshot||''),email:String(r.email_snapshot||''),startDate:r.start_date?String(r.start_date).slice(0,10):'',createdAt:String(r.created_at),salesStaffId:String(r.sales_staff_id||''),salesStaffName:String(r.sales_staff_name_snapshot||''),product:String(r.product_name||'')}))
}

async function workflowActivities(actor:AdminActor){
 const sql=db();const rows=elevated(actor)?await sql`select a.id,a.customer_id,a.type,a.content,a.next_follow_up_at,a.created_at,a.staff_id,c.phone,c.email,st.name staff_name from crm_activities a join customers c on c.id=a.customer_id left join staff st on st.id=a.staff_id order by a.created_at desc limit 5000`:await sql`select a.id,a.customer_id,a.type,a.content,a.next_follow_up_at,a.created_at,a.staff_id,c.phone,c.email,st.name staff_name from crm_activities a join customers c on c.id=a.customer_id join customer_assignments ca on ca.customer_id=c.id and ca.staff_id=${actor.id} left join staff st on st.id=a.staff_id order by a.created_at desc limit 5000`;
 return rows.map((r:any)=>({id:String(r.id),customerId:String(r.customer_id),customerKey:customerKey(r.phone,r.email),type:String(r.type||'note'),content:String(r.content||''),result:String(r.type||'note'),nextAt:r.next_follow_up_at?String(r.next_follow_up_at):'',staffId:String(r.staff_id||''),staffName:String(r.staff_name||'Hệ thống'),createdAt:String(r.created_at)}))
}

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});const actor=await adminActor(req,'customers');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const [customers,bookings,activities,pipelineRaw,followupsRaw,opportunitiesRaw]=await Promise.all([workflowCustomers(actor),workflowBookings(actor),workflowActivities(actor),latestShared(PIPELINE_KEY),latestShared(FOLLOWUPS_KEY),latestShared(OPPORTUNITIES_KEY)]);
  const allowed=new Set(customers.map((c:any)=>c.key));const pipeline=Object.fromEntries(Object.entries(object(pipelineRaw)).filter(([key])=>allowed.has(key)));const followups=array(followupsRaw).filter(item=>allowed.has(String(item?.customerKey||'')));const opportunities=Object.fromEntries(Object.entries(object(opportunitiesRaw)).filter(([key])=>allowed.has(key)));
  const sales=elevated(actor)?await db()`select id,name,email from staff where status='active' and (role='sales' or department='sales') order by name`:[];
  return NextResponse.json({ok:true,customers,bookings,activities,pipeline,followups,opportunities,sales:sales.map((s:any)=>({id:String(s.id),name:String(s.name),email:String(s.email||'')})),capabilities:{manage:elevated(actor)}} ,{headers:{'Cache-Control':'no-store, max-age=0'}})
 }catch(error){console.error('crm_workflow_get_failed',error);return NextResponse.json({error:'Không đọc được CRM Workflow production.'},{status:500})}
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});const actor=await adminActor(req,'customers');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});const body=await req.json().catch(()=>({}));const action=String(body.action||'');
 try{
  if(action==='stage'){
   const customerId=String(body.customerId||''),stage=String(body.stage||'');if(!stages.has(stage))return NextResponse.json({error:'Giai đoạn không hợp lệ.'},{status:400});const customer=await customerAccess(actor,customerId);if(!customer)return NextResponse.json({error:'Bạn không có quyền cập nhật khách này.'},{status:403});const key=customerKey(customer.phone,customer.email),state=object(await latestShared(PIPELINE_KEY));state[key]={stage,changedAt:new Date().toISOString(),customerId};await saveShared(actor,PIPELINE_KEY,state);await db()`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'crm.pipeline.stage','customer',${customerId},${JSON.stringify({stage,key})}::jsonb)`;return NextResponse.json({ok:true})
  }
  if(action==='followup.create'){
   const customerId=String(body.customerId||''),title=String(body.title||'').trim().slice(0,500),note=String(body.note||'').trim().slice(0,2000),dueAt=String(body.dueAt||'');if(!title||!dueAt||Number.isNaN(+new Date(dueAt)))return NextResponse.json({error:'Nội dung hoặc thời gian nhắc chưa hợp lệ.'},{status:400});const customer=await customerAccess(actor,customerId);if(!customer)return NextResponse.json({error:'Bạn không có quyền cập nhật khách này.'},{status:403});const latestBooking=(await db()`select code from bookings where customer_id=${customerId} order by created_at desc limit 1`)[0];const key=customerKey(customer.phone,customer.email),items=array(await latestShared(FOLLOWUPS_KEY));const now=new Date().toISOString(),item={id:randomUUID(),customerId,customerKey:key,customerName:String(customer.name||''),phone:String(customer.phone||''),bookingCode:latestBooking?String(latestBooking.code):'',title,dueAt:new Date(dueAt).toISOString(),status:'open',note,createdBy:actor.name,createdById:actor.id,createdAt:now};await saveShared(actor,FOLLOWUPS_KEY,[item,...items].slice(0,5000));await db()`insert into crm_activities(customer_id,staff_id,type,content,next_follow_up_at) values(${customerId},${actor.id},'follow_up',${note?`${title} · ${note}`:title},${new Date(dueAt).toISOString()})`;return NextResponse.json({ok:true,id:item.id})
  }
  if(action==='followup.done'){
   const id=String(body.id||''),items=array(await latestShared(FOLLOWUPS_KEY));const target=items.find(item=>String(item?.id||'')===id);if(!target)return NextResponse.json({error:'Không tìm thấy nhắc việc.'},{status:404});let customer=null;const customerId=String(target?.customerId||'');if(customerId)customer=await customerAccess(actor,customerId);if(!customer){const rows=await workflowCustomers(actor);if(!rows.some((row:any)=>row.key===String(target?.customerKey||'')))return NextResponse.json({error:'Bạn không có quyền hoàn tất nhắc việc này.'},{status:403})}const doneAt=new Date().toISOString(),next=items.map(item=>String(item?.id||'')===id?{...item,status:'done',doneAt,doneBy:actor.name}:item);await saveShared(actor,FOLLOWUPS_KEY,next);if(customerId&&customer)await db()`insert into crm_activities(customer_id,staff_id,type,content) values(${customerId},${actor.id},'follow_up_done',${String(target?.title||'Hoàn tất follow-up')})`;return NextResponse.json({ok:true})
  }
  return NextResponse.json({error:'Hành động không hỗ trợ.'},{status:400})
 }catch(error){console.error('crm_workflow_post_failed',error);return NextResponse.json({error:'Không thể cập nhật CRM Workflow production.'},{status:500})}
}
