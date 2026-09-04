import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';

function elevated(role:string){return role==='owner'||role==='admin'}
function financeRole(role:string){return elevated(role)||role==='accounting'}

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const actor=await adminActor(req,'ledger');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 const finance=financeRole(actor.role),sql=db();
 try{
  const rows=finance?await sql`
   select b.id,b.code,b.customer_name_snapshot,b.phone_snapshot,b.status,b.start_date,b.sales_staff_id,b.sales_staff_name_snapshot,b.selling_total_vnd,b.cost_total_vnd,
    coalesce((select string_agg(bi.product_name_snapshot,', ' order by bi.id) from booking_items bi where bi.booking_id=b.id),'Dịch vụ HappyGo') product_name,
    coalesce((select sum(p.amount_vnd) from payments p where p.booking_id=b.id and p.status='paid'),0)::bigint customer_paid,
    coalesce((select sum(coalesce(pr.paid_amount_vnd,pr.amount_vnd)) from payment_requests pr where pr.booking_id=b.id and pr.status='paid'),0)::bigint supplier_paid,
    coalesce((select sum(pr.amount_vnd) from payment_requests pr where pr.booking_id=b.id and pr.status='approved'),0)::bigint approved_unpaid,
    coalesce((select sum(pr.amount_vnd) from payment_requests pr where pr.booking_id=b.id and pr.status in ('pending_director','approved','paid')),0)::bigint requested,
    coalesce((select count(*) from payment_requests pr where pr.booking_id=b.id and pr.status='paid'),0)::int paid_count
   from bookings b where b.status<>'cancelled' order by b.created_at desc limit 1000`
   :await sql`
   select b.id,b.code,b.customer_name_snapshot,b.phone_snapshot,b.status,b.start_date,b.sales_staff_id,b.sales_staff_name_snapshot,b.selling_total_vnd,b.cost_total_vnd,
    coalesce((select string_agg(bi.product_name_snapshot,', ' order by bi.id) from booking_items bi where bi.booking_id=b.id),'Dịch vụ HappyGo') product_name,
    coalesce((select sum(p.amount_vnd) from payments p where p.booking_id=b.id and p.status='paid'),0)::bigint customer_paid,
    0::bigint supplier_paid,0::bigint approved_unpaid,0::bigint requested,0::int paid_count
   from bookings b where b.status<>'cancelled' and b.sales_staff_id=${actor.id} order by b.created_at desc limit 1000`;
  return NextResponse.json({ok:true,finance,rows:rows.map((r:any)=>({id:String(r.id),code:String(r.code),customerName:String(r.customer_name_snapshot||''),phone:String(r.phone_snapshot||''),product:String(r.product_name||''),status:String(r.status),startDate:r.start_date?String(r.start_date).slice(0,10):'',salesStaffId:r.sales_staff_id?String(r.sales_staff_id):'',salesStaffName:String(r.sales_staff_name_snapshot||''),sellingTotal:Number(r.selling_total_vnd||0),costTotal:r.cost_total_vnd===null?null:Number(r.cost_total_vnd),customerPaid:Number(r.customer_paid||0),supplierPaid:Number(r.supplier_paid||0),approvedUnpaid:Number(r.approved_unpaid||0),requested:Number(r.requested||0),paidCount:Number(r.paid_count||0)}))});
 }catch(error){console.error('financial_ledger_get_failed',error);return NextResponse.json({error:'Không đọc được sổ công nợ production.'},{status:500})}
}
