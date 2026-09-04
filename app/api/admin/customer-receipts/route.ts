import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function elevated(role:string){return role==='owner'||role==='admin'}
function canSeeAll(role:string){return elevated(role)||role==='accounting'}
function fund(method:string){const v=method.toLowerCase();if(v.includes('tiền mặt'))return'cash';if(v.includes('momo')||v.includes('zalo')||v.includes('ví'))return'wallet';return'bank'}
function voucher(id:string,paidAt:unknown){const d=new Date(String(paidAt||Date.now()));const stamp=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;return`PT-${stamp}-${id.replace(/-/g,'').slice(-6).toUpperCase()}`}

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});const actor=await adminActor(req,'receipts');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});const sql=db();
 try{
  const rows=canSeeAll(actor.role)?await sql`select p.*,b.code as booking_code,b.customer_name_snapshot,b.sales_staff_id from payments p join bookings b on b.id=p.booking_id where p.status='paid' order by coalesce(p.paid_at,p.created_at) desc limit 1000`:await sql`select p.*,b.code as booking_code,b.customer_name_snapshot,b.sales_staff_id from payments p join bookings b on b.id=p.booking_id where p.status='paid' and b.sales_staff_id=${actor.id} order by coalesce(p.paid_at,p.created_at) desc limit 1000`;
  const bookings=canSeeAll(actor.role)?await sql`select id,code,customer_name_snapshot,selling_total_vnd,sales_staff_id from bookings where status<>'cancelled' order by created_at desc limit 500`:await sql`select id,code,customer_name_snapshot,selling_total_vnd,sales_staff_id from bookings where status<>'cancelled' and sales_staff_id=${actor.id} order by created_at desc limit 500`;
  const sums=await sql`select booking_id,sum(amount_vnd)::bigint as paid from payments where status='paid' group by booking_id`;const byBooking=new Map(sums.map((x:any)=>[String(x.booking_id),Number(x.paid||0)]));
  return NextResponse.json({ok:true,receipts:rows.map((r:any)=>({id:String(r.id),receiptNo:voucher(String(r.id),r.paid_at||r.created_at),bookingId:String(r.booking_id),bookingCode:String(r.booking_code),customerName:String(r.customer_name_snapshot||''),type:String(r.type||'deposit'),amount:Number(r.amount_vnd||0),method:String(r.provider||''),transactionRef:String(r.provider_reference||''),note:String(r.note||''),paidAt:String(r.paid_at||r.created_at),createdByStaffId:r.created_by_staff_id?String(r.created_by_staff_id):''})),bookings:bookings.map((b:any)=>({id:String(b.id),code:String(b.code),customerName:String(b.customer_name_snapshot||''),sellingTotal:Number(b.selling_total_vnd||0),paidTotal:byBooking.get(String(b.id))||0})),capabilities:{create:true,all:canSeeAll(actor.role)}})
 }catch(error){console.error('customer_receipts_get_failed',error);return NextResponse.json({error:'Không đọc được phiếu thu production.'},{status:500})}
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});const actor=await adminActor(req,'receipts');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});const body=await req.json().catch(()=>({}));const bookingId=String(body.bookingId||''),amount=Math.round(Number(body.amount)||0),method=String(body.method||'Chuyển khoản').trim(),transactionRef=String(body.transactionRef||'').trim(),note=String(body.note||'').trim().slice(0,4000),paidAt=body.paidAt?new Date(String(body.paidAt)):new Date();if(!uuid.test(bookingId)||amount<=0||Number.isNaN(+paidAt))return NextResponse.json({error:'Thông tin phiếu thu chưa hợp lệ.'},{status:400});const sql=db();
 try{
  const bookingRows=await sql`select id,code,customer_name_snapshot,selling_total_vnd,sales_staff_id from bookings where id=${bookingId} limit 1`;const booking=bookingRows[0];if(!booking)return NextResponse.json({error:'Không tìm thấy booking.'},{status:404});if(!canSeeAll(actor.role)&&String(booking.sales_staff_id||'')!==actor.id)return NextResponse.json({error:'Bạn không có quyền ghi thu cho booking này.'},{status:403});
  const paidRows=await sql`select coalesce(sum(amount_vnd),0)::bigint as paid from payments where booking_id=${bookingId} and status='paid'`;const beforePaid=Number(paidRows[0]?.paid||0),selling=Number(booking.selling_total_vnd||0),type=selling>0&&beforePaid+amount>=selling?'full':'deposit';
  const rows=await sql`insert into payments(booking_id,type,amount_vnd,status,provider,provider_reference,paid_at,note,created_by_staff_id,updated_at) values(${bookingId},${type},${amount},'paid',${method},${transactionRef||null},${paidAt.toISOString()},${note||null},${actor.id},now()) returning *`;const payment=rows[0];const receiptNo=voucher(String(payment.id),payment.paid_at||payment.created_at);
  await sql`insert into accounting_entries(voucher_no,entry_type,entry_date,category,description,counterparty,fund,amount_vnd,document_ref,note,source,source_id,created_by_staff_id) values(${receiptNo},'income',${paidAt.toISOString().slice(0,10)},'Thu tiền khách',${`Thu booking ${String(booking.code)}`},${String(booking.customer_name_snapshot||'')},${fund(method)},${amount},${transactionRef||null},${note||null},'receipt',${String(payment.id)},${actor.id}) on conflict(voucher_no) do nothing`;
  await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'receipt.create','payment',${String(payment.id)},${JSON.stringify(payment)}::jsonb)`;
  return NextResponse.json({ok:true,id:String(payment.id),receiptNo});
 }catch(error){console.error('customer_receipt_create_failed',error);return NextResponse.json({error:'Không thể tạo phiếu thu production.'},{status:500})}
}
