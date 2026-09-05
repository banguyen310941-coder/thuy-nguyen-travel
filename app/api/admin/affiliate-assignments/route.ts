import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const elevated=(actor:{role:string;permissions:string[]})=>actor.role==='owner'||actor.role==='admin'||actor.permissions.includes('*');

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const actor=await adminActor(req,'affiliates');
 if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const sql=db();
  const canAssign=elevated(actor);
  const sales=canAssign?await sql`select id,name,email,department from staff where status='active' and role<>'affiliate' and (role in ('owner','admin','sales') or permissions ? 'affiliates' or permissions ? '*') order by case when role='sales' then 0 else 1 end,name`:[];
  const rows=canAssign
   ?await sql`select a.id,a.sales_owner_id,s.name as sales_owner_name from affiliates a left join staff s on s.id=a.sales_owner_id order by a.created_at desc`
   :await sql`select a.id,a.sales_owner_id,s.name as sales_owner_name from affiliates a left join staff s on s.id=a.sales_owner_id where a.sales_owner_id=${actor.id} order by a.created_at desc`;
  return NextResponse.json({ok:true,canAssign,currentStaffId:actor.id,sales:sales.map((s:any)=>({id:String(s.id),name:String(s.name),email:String(s.email),department:String(s.department||'')})),assignments:rows.map((r:any)=>({affiliateId:String(r.id),salesOwnerId:r.sales_owner_id?String(r.sales_owner_id):'',salesOwnerName:String(r.sales_owner_name||'Chưa phân công')}))});
 }catch(error){console.error('affiliate_assignments_get_failed',error);return NextResponse.json({error:'Không đọc được phân công CTV.'},{status:500})}
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const actor=await adminActor(req,'affiliates');
 if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 if(!elevated(actor))return NextResponse.json({error:'Chỉ Admin/Owner được chuyển Sale phụ trách CTV.'},{status:403});
 const body=await req.json().catch(()=>({}));const affiliateId=String(body.affiliateId||''),salesOwnerId=String(body.salesOwnerId||'');
 if(!uuid.test(affiliateId)||salesOwnerId&&!uuid.test(salesOwnerId))return NextResponse.json({error:'Dữ liệu phân công không hợp lệ.'},{status:400});
 try{
  const sql=db();
  if(salesOwnerId){const staff=(await sql`select id,name,role,permissions from staff where id=${salesOwnerId} and status='active' limit 1`)[0];if(!staff)return NextResponse.json({error:'Không tìm thấy Sale đang hoạt động.'},{status:404});const permissions=Array.isArray(staff.permissions)?staff.permissions.map(String):[];if(!['owner','admin','sales'].includes(String(staff.role))&&!permissions.includes('affiliates')&&!permissions.includes('*'))return NextResponse.json({error:'Nhân viên được chọn chưa có quyền chăm sóc CTV.'},{status:400})}
  const before=(await sql`select sales_owner_id from affiliates where id=${affiliateId} limit 1`)[0];if(!before)return NextResponse.json({error:'Không tìm thấy CTV.'},{status:404});
  await sql`update affiliates set sales_owner_id=${salesOwnerId||null},updated_at=now() where id=${affiliateId}`;
  await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,before_data,after_data) values(${actor.id},'affiliate.assign_sales','affiliate',${affiliateId},${JSON.stringify({salesOwnerId:before.sales_owner_id?String(before.sales_owner_id):''})}::jsonb,${JSON.stringify({salesOwnerId})}::jsonb)`;
  return NextResponse.json({ok:true});
 }catch(error){console.error('affiliate_assignments_save_failed',error);return NextResponse.json({error:'Không thể cập nhật Sale phụ trách CTV.'},{status:500})}
}
