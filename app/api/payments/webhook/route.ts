import {timingSafeEqual} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {requestBodyTooLarge} from '@/lib/server/public-abuse';

export const runtime='nodejs';
export const dynamic='force-dynamic';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function secretOk(req:NextRequest){const expected=process.env.PAYMENT_WEBHOOK_SECRET?.trim()||'',actual=req.headers.get('x-payment-webhook-secret')||'';if(!expected||!actual)return false;const a=Buffer.from(actual),b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b)}
function fund(provider:string){const p=provider.toLowerCase();if(p.includes('momo')||p.includes('zalo')||p.includes('wallet')||p.includes('ví'))return'wallet';if(p.includes('cash')||p.includes('tiền mặt'))return'cash';return'bank'}
function voucher(id:string,paidAt:Date){const stamp=`${paidAt.getFullYear()}${String(paidAt.getMonth()+1).padStart(2,'0')}${String(paidAt.getDate()).padStart(2,'0')}`;return`PT-${stamp}-${id.replace(/-/g,'').slice(-6).toUpperCase()}`}
function samePayment(payment:any,bookingId:string,amount:number){return Boolean(payment)&&String(payment.booking_id)===bookingId&&Number(payment.amount_vnd||0)===amount}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 if(!process.env.PAYMENT_WEBHOOK_SECRET?.trim())return NextResponse.json({error:'Payment webhook chưa được cấu hình.'},{status:503});
 if(!secretOk(req))return NextResponse.json({error:'Unauthorized'},{status:401});
 if(requestBodyTooLarge(req,32768))return NextResponse.json({error:'Payload payment webhook quá lớn.'},{status:413});
 const body=await req.json().catch(()=>({})),event=String(body.event||''),bookingId=String(body.booking_id||body.bookingId||''),provider=String(body.provider||'payment_gateway').trim().slice(0,100),providerRef=String(body.provider_reference||body.providerReference||'').trim().slice(0,200),amount=Math.round(Number(body.amount_vnd??body.amount)||0),paidAt=body.paid_at||body.paidAt?new Date(String(body.paid_at||body.paidAt)):new Date();
 if(event!=='payment_paid'||!uuid.test(bookingId)||amount<=0||providerRef.length<3||Number.isNaN(+paidAt))return NextResponse.json({error:'Payload payment_paid không hợp lệ.'},{status:400});
 const sql=db();
 try{
  const booking=(await sql`select id,code,customer_name_snapshot,selling_total_vnd from bookings where id=${bookingId} limit 1`)[0];if(!booking)return NextResponse.json({error:'Không tìm thấy booking.'},{status:404});
  const existing=(await sql`select * from payments where provider=${provider} and provider_reference=${providerRef} limit 1`)[0];let payment=existing,idempotent=Boolean(existing);
  if(existing&&!samePayment(existing,bookingId,amount))return NextResponse.json({error:'provider_reference đã tồn tại với giao dịch khác.'},{status:409});
  if(!payment){
   const paid=(await sql`select coalesce(sum(amount_vnd),0)::bigint total from payments where booking_id=${bookingId} and status='paid'`)[0],selling=Number(booking.selling_total_vnd||0),type=selling>0&&Number(paid?.total||0)+amount>=selling?'full':'deposit';
   const rows=await sql`insert into payments(booking_id,type,amount_vnd,status,provider,provider_reference,paid_at,note,updated_at) values(${bookingId},${type},${amount},'paid',${provider},${providerRef},${paidAt.toISOString()},'Ghi nhận tự động từ payment webhook',now()) on conflict(provider,provider_reference) where provider_reference is not null do nothing returning *`;
   payment=rows[0]||(await sql`select * from payments where provider=${provider} and provider_reference=${providerRef} limit 1`)[0];
   idempotent=!rows[0];
  }
  if(!payment)return NextResponse.json({error:'Không thể ghi nhận giao dịch.'},{status:500});

  // A conflicting insert can lose a race after the initial lookup. Always verify
  // the resolved persisted payment again before touching accounting. This closes
  // the window where the same provider_reference could otherwise be reused with
  // another booking or amount by two concurrent webhook deliveries.
  if(!samePayment(payment,bookingId,amount))return NextResponse.json({error:'provider_reference đã tồn tại với giao dịch khác.'},{status:409});

  const paymentId=String(payment.id),resolvedAmount=Number(payment.amount_vnd||0),resolvedPaidAt=new Date(String(payment.paid_at||paidAt.toISOString()));
  if(!resolvedAmount||Number.isNaN(+resolvedPaidAt))return NextResponse.json({error:'Giao dịch đã lưu không hợp lệ.'},{status:500});
  const receiptNo=voucher(paymentId,resolvedPaidAt);
  await sql`insert into accounting_entries(voucher_no,entry_type,entry_date,category,description,counterparty,fund,amount_vnd,document_ref,note,source,source_id) values(${receiptNo},'income',${resolvedPaidAt.toISOString().slice(0,10)},'Thu tiền khách',${`Thu booking ${String(booking.code)} qua ${provider}`},${String(booking.customer_name_snapshot||'')},${fund(provider)},${resolvedAmount},${providerRef},'Tự động từ payment webhook','receipt',${paymentId}) on conflict(voucher_no) do nothing`;
  await sql`insert into audit_logs(action,entity_type,entity_id,after_data) values('payment.webhook.paid','payment',${paymentId},${JSON.stringify({bookingId,provider,providerReference:providerRef,amount:resolvedAmount,idempotent})}::jsonb)`;
  return NextResponse.json({ok:true,idempotent,paymentId,receiptNo});
 }catch(error){console.error('payment_webhook_failed',error);return NextResponse.json({error:'Không thể xử lý payment webhook.'},{status:500})}
}
