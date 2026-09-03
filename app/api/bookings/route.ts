import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';

function normalizePhone(raw:string){const digits=String(raw||'').replace(/\D/g,'');return digits.startsWith('84')&&digits.length===11?`0${digits.slice(2)}`:digits}
function code(){const d=new Date();const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `HG${y}${m}${day}-${Math.random().toString(36).slice(2,7).toUpperCase()}`}
function esc(v:unknown){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
async function sendEmail(to:string,subject:string,html:string){const key=process.env.RESEND_API_KEY;if(!key)return;const from=process.env.EMAIL_FROM||'HappyGo Travel <booking@happygo.vn>';const replyTo=process.env.EMAIL_REPLY_TO||'info@happygo.vn';await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:replyTo,subject,html})})}
export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'DATABASE_URL chưa được cấu hình.'},{status:503});
 const body=await req.json().catch(()=>({}));const name=String(body.customerName||'').trim(),phone=normalizePhone(body.phone),email=String(body.email||'').trim().toLowerCase(),product=String(body.product||'Dịch vụ HappyGo').trim();
 if(name.length<2||!/^0\d{9}$/.test(phone))return NextResponse.json({error:'Thông tin khách hàng chưa hợp lệ.'},{status:400});
 const bookingCode=code();const sql=db();
 try{
  const existing=await sql`select id from customers where phone=${phone} limit 1`;
  let customerId=existing[0]?.id as string|undefined;
  if(customerId){await sql`update customers set name=${name},email=${email||null},source=coalesce(source,${String(body.source||'website')}),updated_at=now() where id=${customerId}`}
  else {const inserted=await sql`insert into customers(name,phone,email,status,source) values(${name},${phone},${email||null},'lead',${String(body.source||'website')}) returning id`;customerId=String(inserted[0].id)}
  await sql`insert into bookings(code,customer_id,status,source,start_date,end_date,adults,children,rooms,customer_name_snapshot,phone_snapshot,email_snapshot,note,selling_total_vnd) values(${bookingCode},${customerId},'new',${String(body.source||'website')},${body.startDate||null},${body.endDate||null},${Math.max(1,Number(body.adults)||1)},${Math.max(0,Number(body.children)||0)},${Math.max(1,Number(body.rooms)||1)},${name},${phone},${email||null},${String(body.note||'')},0)`;
  const admin=process.env.ADMIN_EMAIL||'info@happygo.vn';
  const detail=`<p><b>Mã booking:</b> ${esc(bookingCode)}</p><p><b>Dịch vụ:</b> ${esc(product)}</p><p><b>Khách:</b> ${esc(name)} · ${esc(phone)}${email?` · ${esc(email)}`:''}</p><p><b>Ngày:</b> ${esc(body.startDate||'')} ${body.endDate?`→ ${esc(body.endDate)}`:''}</p><p><b>Khách:</b> ${esc(body.adults||1)} người lớn · ${esc(body.children||0)} trẻ em · ${esc(body.rooms||1)} phòng/căn</p><p><b>Ghi chú:</b> ${esc(body.note||'')}</p>`;
  await Promise.allSettled([
   email?sendEmail(email,`HappyGo Travel đã nhận yêu cầu ${bookingCode}`,`<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>HappyGo Travel đã nhận yêu cầu của bạn</h2>${detail}<p>Đội ngũ tư vấn sẽ liên hệ để xác nhận tình trạng và giá. Hotline: <b>0969 973 949</b>.</p></div>`):Promise.resolve(),
   sendEmail(admin,`[Booking mới] ${bookingCode} · ${name}`,`<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Booking mới từ website</h2>${detail}</div>`)
  ]);
  return NextResponse.json({ok:true,code:bookingCode});
 }catch(e){console.error('booking_create_failed',e);return NextResponse.json({error:'Không thể tạo booking. Vui lòng thử lại hoặc gọi hotline.'},{status:500})}
}
