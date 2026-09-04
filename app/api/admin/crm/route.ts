import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const statuses=new Set(['lead','contacting','customer','inactive']);
function elevated(role:string){return role==='owner'||role==='admin'}
function shapeCustomer(row:any){return{
 id:String(row.id),name:String(row.name||''),phone:row.phone?String(row.phone):'',email:row.email?String(row.email):'',status:String(row.status||'lead'),source:row.source?String(row.source):'',note:row.note?String(row.note):'',createdAt:String(row.created_at),updatedAt:String(row.updated_at),
 bookingCount:Number(row.booking_count||0),latestBookingAt:row.latest_booking_at?String(row.latest_booking_at):'',
 assignment:row.staff_id?{staffId:String(row.staff_id),staffName:String(row.staff_name||''),source:String(row.assignment_source||''),assignedAt:String(row.assigned_at||'')}:null,
 activities:Array.isArray(row.activities)?row.activities:[]
}}
async function sales(sql:any){return sql`select id,name,email,phone,role,department,status,permissions from staff where status='active' and (role='sales' or department='sales') order by name`}
async function rotation(sql:any){await sql`insert into sales_rotation(id,enabled,assigned_count) values(1,false,0) on conflict(id) do nothing`;const rows=await sql`select id,last_staff_id,enabled,assigned_count,updated_at from sales_rotation where id=1`;return rows[0]}
async function nextSale(sql:any){const list=await sales(sql);if(!list.length)return null;const state=await rotation(sql);const last=String(state?.last_staff_id||'');const index=list.findIndex((s:any)=>String(s.id)===last);return list[(index+1+list.length)%list.length]||list[0]}
async function assignRoundRobin(sql:any,customerId:string){const existing=await sql`select customer_id from customer_assignments where customer_id=${customerId} limit 1`;if(existing.length)return null;const state=await rotation(sql);if(!state?.enabled)return null;const sale=await nextSale(sql);if(!sale)return null;await sql`insert into customer_assignments(customer_id,staff_id,source,assigned_at) values(${customerId},${String(sale.id)},'round_robin',now()) on conflict(customer_id) do nothing`;await sql`update sales_rotation set last_staff_id=${String(sale.id)},assigned_count=assigned_count+1,updated_at=now() where id=1`;return sale}

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const actor=await adminActor(req,'customers');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 const sql=db();
 try{
  const base=elevated(actor.role)?await sql`
   select c.*,ca.staff_id,ca.source as assignment_source,ca.assigned_at,s.name as staff_name,
    count(distinct b.id)::int as booking_count,max(b.created_at) as latest_booking_at,
    coalesce((select jsonb_agg(jsonb_build_object('id',a.id::text,'type',a.type,'content',coalesce(a.content,''),'nextFollowUpAt',a.next_follow_up_at,'staffId',a.staff_id::text,'staffName',coalesce(st.name,''),'createdAt',a.created_at) order by a.created_at desc) from crm_activities a left join staff st on st.id=a.staff_id where a.customer_id=c.id),'[]'::jsonb) as activities
   from customers c left join customer_assignments ca on ca.customer_id=c.id left join staff s on s.id=ca.staff_id left join bookings b on b.customer_id=c.id
   group by c.id,ca.staff_id,ca.source,ca.assigned_at,s.name order by c.updated_at desc limit 1000`
   :await sql`
   select c.*,ca.staff_id,ca.source as assignment_source,ca.assigned_at,s.name as staff_name,
    count(distinct b.id)::int as booking_count,max(b.created_at) as latest_booking_at,
    coalesce((select jsonb_agg(jsonb_build_object('id',a.id::text,'type',a.type,'content',coalesce(a.content,''),'nextFollowUpAt',a.next_follow_up_at,'staffId',a.staff_id::text,'staffName',coalesce(st.name,''),'createdAt',a.created_at) order by a.created_at desc) from crm_activities a left join staff st on st.id=a.staff_id where a.customer_id=c.id),'[]'::jsonb) as activities
   from customers c join customer_assignments ca on ca.customer_id=c.id and ca.staff_id=${actor.id} left join staff s on s.id=ca.staff_id left join bookings b on b.customer_id=c.id
   group by c.id,ca.staff_id,ca.source,ca.assigned_at,s.name order by c.updated_at desc limit 1000`;
  const rotationState=await rotation(sql);const saleRows=elevated(actor.role)?await sales(sql):[];
  return NextResponse.json({ok:true,customers:base.map(shapeCustomer),sales:saleRows.map((s:any)=>({id:String(s.id),name:String(s.name),email:String(s.email||'')})),rotation:{enabled:Boolean(rotationState?.enabled),lastStaffId:rotationState?.last_staff_id?String(rotationState.last_staff_id):'',assignedCount:Number(rotationState?.assigned_count||0)},capabilities:{manage:elevated(actor.role),create:true}})
 }catch(error){console.error('admin_crm_get_failed',error);return NextResponse.json({error:'Không đọc được CRM production.'},{status:500})}
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const actor=await adminActor(req,'customers');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 const body=await req.json().catch(()=>({}));const action=String(body.action||'');const sql=db();
 try{
  if(action==='create'){
   const name=String(body.name||'').trim(),phone=String(body.phone||'').trim(),email=String(body.email||'').trim().toLowerCase(),source=String(body.source||'Nhập thủ công').trim(),note=String(body.note||'').trim();
   if(name.length<2||(!phone&&!email))return NextResponse.json({error:'Cần tên khách và ít nhất SĐT hoặc email.'},{status:400});
   const duplicate=phone?await sql`select id from customers where regexp_replace(coalesce(phone,''),'[^0-9]','','g')=regexp_replace(${phone},'[^0-9]','','g') limit 1`:await sql`select id from customers where lower(coalesce(email,''))=${email} limit 1`;
   if(duplicate.length)return NextResponse.json({error:'Khách này đã có trong CRM.'},{status:409});
   const rows=await sql`insert into customers(name,phone,email,status,source,note,updated_at) values(${name},${phone||null},${email||null},'lead',${source||null},${note||null},now()) returning *`;const customer=rows[0];
   const requested=String(body.salesStaffId||'');if(requested){if(!elevated(actor.role)&&requested!==actor.id)return NextResponse.json({error:'Bạn không có quyền giao khách cho Sale khác.'},{status:403});const staff=await sql`select id from staff where id=${requested} and status='active' limit 1`;if(staff.length)await sql`insert into customer_assignments(customer_id,staff_id,source) values(${String(customer.id)},${requested},'manual') on conflict(customer_id) do update set staff_id=excluded.staff_id,source='manual',assigned_at=now()`}
   else if(actor.role==='sales')await sql`insert into customer_assignments(customer_id,staff_id,source) values(${String(customer.id)},${actor.id},'manual') on conflict(customer_id) do nothing`;
   else await assignRoundRobin(sql,String(customer.id));
   await sql`insert into crm_activities(customer_id,staff_id,type,content) values(${String(customer.id)},${actor.id},'created',${`Tạo lead từ ${source}`})`;
   await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'crm.customer.create','customer',${String(customer.id)},${JSON.stringify(customer)}::jsonb)`;
   return NextResponse.json({ok:true,id:String(customer.id)});
  }
  if(action==='assign'){
   if(!elevated(actor.role))return NextResponse.json({error:'Chỉ Quản trị được phân Sale.'},{status:403});const customerId=String(body.customerId||''),staffId=String(body.staffId||'');if(!uuid.test(customerId))return NextResponse.json({error:'Khách không hợp lệ.'},{status:400});
   const before=await sql`select * from customer_assignments where customer_id=${customerId} limit 1`;
   if(!staffId)await sql`delete from customer_assignments where customer_id=${customerId}`;
   else{if(!uuid.test(staffId))return NextResponse.json({error:'Nhân viên không hợp lệ.'},{status:400});const staff=await sql`select id from staff where id=${staffId} and status='active' limit 1`;if(!staff.length)return NextResponse.json({error:'Không tìm thấy Sale đang hoạt động.'},{status:400});await sql`insert into customer_assignments(customer_id,staff_id,source,assigned_at) values(${customerId},${staffId},'manual',now()) on conflict(customer_id) do update set staff_id=excluded.staff_id,source='manual',assigned_at=now()`}
   const after=staffId?await sql`select * from customer_assignments where customer_id=${customerId} limit 1`:[];await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,before_data,after_data) values(${actor.id},'crm.assignment.update','customer',${customerId},${JSON.stringify(before[0]||null)}::jsonb,${JSON.stringify(after[0]||null)}::jsonb)`;return NextResponse.json({ok:true});
  }
  if(action==='toggleAuto'){
   if(!elevated(actor.role))return NextResponse.json({error:'Chỉ Quản trị được đổi chế độ chia khách.'},{status:403});await rotation(sql);await sql`update sales_rotation set enabled=${Boolean(body.enabled)},updated_at=now() where id=1`;return NextResponse.json({ok:true});
  }
  if(action==='distribute'){
   if(!elevated(actor.role))return NextResponse.json({error:'Chỉ Quản trị được chia khách.'},{status:403});const state=await rotation(sql);if(!state.enabled)return NextResponse.json({error:'Hãy bật chia khách tự động trước.'},{status:400});const pending=await sql`select c.id from customers c left join customer_assignments ca on ca.customer_id=c.id where ca.customer_id is null order by c.created_at asc limit 500`;let count=0;for(const row of pending){if(await assignRoundRobin(sql,String(row.id)))count++}return NextResponse.json({ok:true,count});
  }
  if(action==='status'){
   const customerId=String(body.customerId||''),status=String(body.status||'');if(!uuid.test(customerId)||!statuses.has(status))return NextResponse.json({error:'Dữ liệu không hợp lệ.'},{status:400});if(!elevated(actor.role)){const own=await sql`select customer_id from customer_assignments where customer_id=${customerId} and staff_id=${actor.id} limit 1`;if(!own.length)return NextResponse.json({error:'Bạn không có quyền cập nhật khách này.'},{status:403})}const before=await sql`select * from customers where id=${customerId} limit 1`;await sql`update customers set status=${status},updated_at=now() where id=${customerId}`;const after=await sql`select * from customers where id=${customerId} limit 1`;await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,before_data,after_data) values(${actor.id},'crm.customer.status','customer',${customerId},${JSON.stringify(before[0]||null)}::jsonb,${JSON.stringify(after[0]||null)}::jsonb)`;return NextResponse.json({ok:true});
  }
  if(action==='activity'){
   const customerId=String(body.customerId||''),type=String(body.type||'note').slice(0,50),content=String(body.content||'').trim().slice(0,5000),next=String(body.nextFollowUpAt||'');if(!uuid.test(customerId)||!content)return NextResponse.json({error:'Nội dung chăm sóc chưa hợp lệ.'},{status:400});if(!elevated(actor.role)){const own=await sql`select customer_id from customer_assignments where customer_id=${customerId} and staff_id=${actor.id} limit 1`;if(!own.length)return NextResponse.json({error:'Bạn không có quyền cập nhật khách này.'},{status:403})}await sql`insert into crm_activities(customer_id,staff_id,type,content,next_follow_up_at) values(${customerId},${actor.id},${type},${content},${next?new Date(next).toISOString():null})`;await sql`update customers set updated_at=now() where id=${customerId}`;return NextResponse.json({ok:true});
  }
  return NextResponse.json({error:'Hành động không hỗ trợ.'},{status:400});
 }catch(error){console.error('admin_crm_post_failed',error);return NextResponse.json({error:'Không thể cập nhật CRM production.'},{status:500})}
}
