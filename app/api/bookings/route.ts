import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';

function normalizePhone(raw:string){const digits=String(raw||'').replace(/\D/g,'');return digits.startsWith('84')&&digits.length===11?`0${digits.slice(2)}`:digits}
function code(){const d=new Date();const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `HG${y}${m}${day}-${Math.random().toString(36).slice(2,7).toUpperCase()}`}
function esc(v:unknown){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
async function sendEmail(to:string,subject:string,html:string){const key=process.env.RESEND_API_KEY;if(!key)return;const from=process.env.EMAIL_FROM||'HappyGo Travel <booking@happygo.vn>';const replyTo=process.env.EMAIL_REPLY_TO||'info@happygo.vn';await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:replyTo,subject,html})})}
async function resolveSalesAssignment(sql:any,customerId:string){
 const existing=await sql`select ca.staff_id,s.name from customer_assignments ca join staff s on s.id=ca.staff_id where ca.customer_id=${customerId} and s.status='active' limit 1`;
 if(existing[0])return{id:String(existing[0].staff_id),name:String(existing[0].name)};
 await sql`insert into sales_rotation(id,enabled,assigned_count) values(1,false,0) on conflict(id) do nothing`;
 const rotation=await sql`select last_staff_id,enabled from sales_rotation where id=1 limit 1`;if(!rotation[0]?.enabled)return null;
 const sales=await sql`select id,name from staff where status='active' and (role='sales' or department='sales') order by name,id`;if(!sales.length)return null;
 const last=String(rotation[0].last_staff_id||''),index=sales.findIndex((item:any)=>String(item.id)===last),selected=sales[(index+1+sales.length)%sales.length]||sales[0];
 const inserted=await sql`insert into customer_assignments(customer_id,staff_id,source,assigned_at) values(${customerId},${String(selected.id)},'round_robin',now()) on conflict(customer_id) do nothing returning staff_id`;
 if(inserted.length){await sql`update sales_rotation set last_staff_id=${String(selected.id)},assigned_count=assigned_count+1,updated_at=now() where id=1`;return{id:String(selected.id),name:String(selected.name)}}
 const actual=await sql`select ca.staff_id,s.name from customer_assignments ca join staff s on s.id=ca.staff_id where ca.customer_id=${customerId} limit 1`;return actual[0]?{id:String(actual[0].staff_id),name:String(actual[0].name)}:null;
}
export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'DATABASE_URL chưa được cấu hình.'},{status:503});
 const body=await req.json().catch(()=>({}));const name=String(body.customerName||'').trim(),phone=normalizePhone(body.phone),email=String(body.email||'').trim().toLowerCase(),product=String(body.product||'Dịch vụ HappyGo').trim();
 if(name.length<2||!/^0\d{9}$/.test(phone))return NextResponse.json({error:'Thông tin khách hàng chưa hợp lệ.'},{status:400});
 const bookingCode=code();const sql=db();
 try{
  const existing=await sql`select id from customers where phone=${phone} limit 1`;let customerId=existing[0]?.id as string|undefined;
  if(customerId){await sql`update customers set name=${name},email=${email||null},source=coalesce(source,${String(body.source||'website')}),updated_at=now() where id=${customerId}`}
  else{const inserted=await sql`insert into customers(name,phone,email,status,source) values(${name},${phone},${email||null},'lead',${String(body.source||'website')}) returning id`;customerId=String(inserted[0].id)}
  const assignment=await resolveSalesAssignment(sql,String(customerId));
  await sql`with new_booking as (insert into bookings(code,customer_id,status,source,start_date,end_date,adults,children,rooms,customer_name_snapshot,phone_snapshot,email_snapshot,note,selling_total_vnd,sales_staff_id,sales_staff_name_snapshot,sales_assigned_at) values(${bookingCode},${customerId},'new',${String(body.source||'website')},${body.startDate||null},${body.endDate||null},${Math.max(1,Number(body.adults)||1)},${Math.max(0,Number(body.children)||0)},${Math.max(1,Number(body.rooms)||1)},${name},${phone},${email||null},${String(body.note||'')},0,${assignment?.id||null},${assignment?.name||null},${assignment?new Date().toISOString():null}) returning id) insert into booking_items(booking_id,product_name_snapshot,quantity,selling_price_vnd,data_snapshot) select id,${product},1,0,${JSON.stringify({kind:String(body.kind||'Dịch vụ')})}::jsonb from new_booking`;
  await sql`insert into crm_activities(customer_id,staff_id,type,content) values(${String(customerId)},${assignment?.id||null},'website_booking',${`Booking ${bookingCode}: ${product}`})`;
  const admin=process.env.ADMIN_EMAIL||'info@happygo.vn';const detail=`<p><b>Mã booking:</b> ${esc(bookingCode)}</p><p><b>Dịch vụ:</b> ${esc(product)}</p><p><b>Khách:</b> ${esc(name)} · ${esc(phone)}${email?` · ${esc(email)}`:''}</p><p><b>Ngày:</b> ${esc(body.startDate||'')} ${body.endDate?`→ ${esc(body.endDate)}`:''}</p><p><b>Khách:</b> ${esc(body.adults||1)} người lớn · ${esc(body.children||0)} trẻ em · ${esc(body.rooms||1)} phòng/căn</p><p><b>Sale:</b> ${esc(assignment?.name||'Chưa phân')}</p><p><b>Ghi chú:</b> ${esc(body.note||'')}</p>`;
  await Promise.allSettled([email?sendEmail(email,`HappyGo Travel đã nhận yêu cầu ${bookingCode}`,`<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>HappyGo Travel đã nhận yêu cầu của bạn</h2>${detail}<p>Đội ngũ tư vấn sẽ liên hệ để xác nhận tình trạng và giá. Hotline: <b>0969 973 949</b>.</p></div>`):Promise.resolve(),sendEmail(admin,`[Booking mới] ${bookingCode} · ${name}`,`<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Booking mới từ website</h2>${detail}</div>`)]);
  return NextResponse.json({ok:true,code:bookingCode,assignedSales:assignment?.name||null});
 }catch(e){console.error('booking_create_failed',e);return NextResponse.json({error:'Không thể tạo booking. Vui lòng thử lại hoặc gọi hotline.'},{status:500})}
}
