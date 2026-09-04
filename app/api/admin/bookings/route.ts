import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';
import {settleAffiliateBooking} from '@/lib/server/affiliate';

const STATUSES=['new','contacting','confirmed','completed','cancelled'] as const;
type BookingStatus=(typeof STATUSES)[number];
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function elevated(role:string){return role==='owner'||role==='admin'}
function canSeeCost(role:string,permissions:string[]){return elevated(role)||role==='accounting'||permissions.includes('ledger')}
function canOperate(role:string){return elevated(role)||role==='operations'}
function mapBooking(row:any,showCost:boolean){
 const rawItems=Array.isArray(row.items)?row.items:[];
 return {
  id:String(row.id),code:String(row.code),status:String(row.status),source:row.source?String(row.source):'',
  customerName:String(row.customer_name_snapshot||''),phone:String(row.phone_snapshot||''),email:row.email_snapshot?String(row.email_snapshot):'',
  startDate:row.start_date?String(row.start_date).slice(0,10):'',endDate:row.end_date?String(row.end_date).slice(0,10):'',
  adults:Number(row.adults||0),children:Number(row.children||0),rooms:Number(row.rooms||0),
  sellingTotal:Number(row.selling_total_vnd||0),costTotal:showCost&&row.cost_total_vnd!==null?Number(row.cost_total_vnd):null,
  note:row.note?String(row.note):'',adminNote:row.admin_note?String(row.admin_note):'',
  salesStaffId:row.sales_staff_id?String(row.sales_staff_id):'',salesStaffName:row.sales_staff_name_snapshot?String(row.sales_staff_name_snapshot):'',
  salesAssignedAt:row.sales_assigned_at?String(row.sales_assigned_at):'',createdAt:String(row.created_at),updatedAt:String(row.updated_at),
  items:rawItems.map((item:any)=>({id:String(item.id||''),productName:String(item.productName||''),unitName:String(item.unitName||''),quantity:Number(item.quantity||1),sellingPrice:Number(item.sellingPrice||0),costPrice:showCost&&item.costPrice!==null?Number(item.costPrice):null,kind:String(item.kind||'')})),
 };
}

async function rowsForActor(actor:{id:string;role:string}){
 const sql=db();
 if(actor.role==='sales')return sql`
  select b.*,
   coalesce(jsonb_agg(jsonb_build_object(
    'id',bi.id::text,'productName',bi.product_name_snapshot,'unitName',coalesce(bi.unit_name_snapshot,''),'quantity',bi.quantity,
    'sellingPrice',bi.selling_price_vnd,'costPrice',bi.cost_price_vnd,'kind',coalesce(bi.data_snapshot->>'kind','')
   ) order by bi.id) filter (where bi.id is not null),'[]'::jsonb) as items
  from bookings b left join booking_items bi on bi.booking_id=b.id
  where b.sales_staff_id=${actor.id}
  group by b.id order by b.created_at desc limit 500`;
 return sql`
  select b.*,
   coalesce(jsonb_agg(jsonb_build_object(
    'id',bi.id::text,'productName',bi.product_name_snapshot,'unitName',coalesce(bi.unit_name_snapshot,''),'quantity',bi.quantity,
    'sellingPrice',bi.selling_price_vnd,'costPrice',bi.cost_price_vnd,'kind',coalesce(bi.data_snapshot->>'kind','')
   ) order by bi.id) filter (where bi.id is not null),'[]'::jsonb) as items
  from bookings b left join booking_items bi on bi.booking_id=b.id
  group by b.id order by b.created_at desc limit 500`;
}

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'DATABASE_URL chưa được cấu hình.'},{status:503});
 const actor=await adminActor(req,'bookings');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const rows=await rowsForActor(actor);const showCost=canSeeCost(actor.role,actor.permissions);
  return NextResponse.json({ok:true,bookings:rows.map(row=>mapBooking(row,showCost)),capabilities:{showCost,operate:canOperate(actor.role),elevated:elevated(actor.role)}});
 }catch(error){console.error('admin_bookings_list_failed',error);return NextResponse.json({error:'Không đọc được booking production.'},{status:500})}
}

export async function PATCH(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'DATABASE_URL chưa được cấu hình.'},{status:503});
 const actor=await adminActor(req,'bookings');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 const body=await req.json().catch(()=>({}));const id=String(body.id||'');if(!uuid.test(id))return NextResponse.json({error:'Booking không hợp lệ.'},{status:400});
 const sql=db();
 try{
  const beforeRows=await sql`select * from bookings where id=${id} limit 1`;const before=beforeRows[0];if(!before)return NextResponse.json({error:'Không tìm thấy booking.'},{status:404});
  if(actor.role==='sales'&&String(before.sales_staff_id||'')!==actor.id)return NextResponse.json({error:'Bạn không có quyền cập nhật booking này.'},{status:403});
  const isElevated=elevated(actor.role),operator=canOperate(actor.role),finance=canSeeCost(actor.role,actor.permissions);
  if(body.status!==undefined){
   const next=String(body.status) as BookingStatus;if(!STATUSES.includes(next))return NextResponse.json({error:'Trạng thái booking không hợp lệ.'},{status:400});
   const current=String(before.status) as BookingStatus;
   if(!operator){const saleAllowed=actor.role==='sales'&&((current==='new'&&next==='contacting')||(current==='contacting'&&(next==='new'||next==='contacting'))||next===current);if(!saleAllowed)return NextResponse.json({error:'Bạn không có quyền chuyển sang trạng thái này.'},{status:403})}
   if(next==='confirmed'&&current!=='confirmed'&&(Number(before.selling_total_vnd||0)<=0||!before.start_date||!String(before.customer_name_snapshot||'').trim()))return NextResponse.json({error:'Chưa thể xác nhận: cần có giá bán, ngày sử dụng và thông tin khách.'},{status:400});
   await sql`update bookings set status=${next},confirmed_at=case when ${next}='confirmed' and confirmed_at is null then now() else confirmed_at end,completed_at=case when ${next}='completed' and completed_at is null then now() else completed_at end,updated_at=now() where id=${id}`;
  }
  if(body.sellingTotal!==undefined){const value=Math.max(0,Math.round(Number(body.sellingTotal)||0));if(['confirmed','completed'].includes(String(before.status))&&!isElevated)return NextResponse.json({error:'Booking đã xác nhận; chỉ Chủ tài khoản/Quản trị được sửa giá bán.'},{status:403});await sql`update bookings set selling_total_vnd=${value},updated_at=now() where id=${id}`}
  if(body.costTotal!==undefined){if(!finance)return NextResponse.json({error:'Bạn không có quyền cập nhật giá vốn.'},{status:403});const value=Math.max(0,Math.round(Number(body.costTotal)||0));await sql`update bookings set cost_total_vnd=${value},updated_at=now() where id=${id}`}
  if(body.adminNote!==undefined){if(['confirmed','completed'].includes(String(before.status))&&!isElevated)return NextResponse.json({error:'Booking đã xác nhận; chỉ Chủ tài khoản/Quản trị được sửa ghi chú xác nhận.'},{status:403});await sql`update bookings set admin_note=${String(body.adminNote||'').slice(0,12000)},updated_at=now() where id=${id}`}
  if(body.salesStaffId!==undefined){
   if(!operator)return NextResponse.json({error:'Bạn không có quyền phân công booking.'},{status:403});
   const staffId=String(body.salesStaffId||'');if(staffId&&!uuid.test(staffId))return NextResponse.json({error:'Nhân viên không hợp lệ.'},{status:400});
   if(!staffId)await sql`update bookings set sales_staff_id=null,sales_staff_name_snapshot=null,sales_assigned_at=null,updated_at=now() where id=${id}`;
   else {const staff=await sql`select id,name from staff where id=${staffId} and status='active' limit 1`;if(!staff[0])return NextResponse.json({error:'Không tìm thấy nhân viên đang hoạt động.'},{status:400});await sql`update bookings set sales_staff_id=${staffId},sales_staff_name_snapshot=${String(staff[0].name)},sales_assigned_at=now(),updated_at=now() where id=${id}`}
  }
  const afterRows=await sql`select * from bookings where id=${id} limit 1`;const after=afterRows[0];const affiliateCommission=String(after?.status)==='completed'?await settleAffiliateBooking(sql,id):0;
  await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,before_data,after_data) values(${actor.id},'booking.update','booking',${id},${JSON.stringify(before)}::jsonb,${JSON.stringify(after)}::jsonb)`;
  return NextResponse.json({ok:true,affiliateCommission});
 }catch(error){console.error('admin_booking_patch_failed',error);return NextResponse.json({error:'Không thể cập nhật booking production.'},{status:500})}
}
