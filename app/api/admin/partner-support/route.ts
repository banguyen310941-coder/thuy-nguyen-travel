import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';

function authorized(req:NextRequest){const expected=process.env.ADMIN_API_KEY?.trim()||'';return Boolean(expected)&&(req.headers.get('x-admin-key')||'')===expected}
async function allTickets(){
  const sql=db();
  const tickets=await sql`select t.id,t.partner_id,t.subject,t.category,t.status,t.created_at,t.updated_at,p.name as partner_name from partner_support_tickets t join partners p on p.id=t.partner_id order by t.updated_at desc`;
  if(!tickets.length)return [];
  const ids=tickets.map((x:any)=>String(x.id));
  const messages=await sql`select id,ticket_id,sender_type,sender_name,body,created_at from partner_support_messages where ticket_id = any(${ids}::uuid[]) order by created_at`;
  return tickets.map((t:any)=>({id:String(t.id),partnerId:String(t.partner_id),partnerName:t.partner_name,subject:t.subject,category:t.category,status:t.status,createdAt:t.created_at,updatedAt:t.updated_at,messages:messages.filter((m:any)=>String(m.ticket_id)===String(t.id)).map((m:any)=>({id:String(m.id),from:m.sender_type,name:m.sender_name,text:m.body,at:m.created_at}))}));
}

export async function GET(req:NextRequest){
  if(!authorized(req))return NextResponse.json({error:'Unauthorized'},{status:401});
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  try{return NextResponse.json({ok:true,tickets:await allTickets()})}catch(error){console.error('admin_partner_support_get_failed',error);return NextResponse.json({error:'Không đọc được hỗ trợ đối tác.'},{status:500})}
}

export async function POST(req:NextRequest){
  if(!authorized(req))return NextResponse.json({error:'Unauthorized'},{status:401});
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const body=await req.json().catch(()=>({}));const ticketId=String(body.ticketId||''),text=String(body.text||'').trim(),name=String(body.name||'HappyGo Support').trim()||'HappyGo Support';
  if(!ticketId||!text)return NextResponse.json({error:'Thiếu nội dung trả lời.'},{status:400});
  const sql=db();
  try{const rows=await sql`select id,status from partner_support_tickets where id=${ticketId}`;if(!rows.length)return NextResponse.json({error:'Không tìm thấy yêu cầu.'},{status:404});await sql`insert into partner_support_messages(ticket_id,sender_type,sender_name,body) values(${ticketId},'admin',${name},${text})`;await sql`update partner_support_tickets set status=${rows[0].status==='resolved'?'processing':rows[0].status},updated_at=now() where id=${ticketId}`;return NextResponse.json({ok:true,tickets:await allTickets()})}catch(error){console.error('admin_partner_support_post_failed',error);return NextResponse.json({error:'Không gửi được phản hồi.'},{status:500})}
}

export async function PATCH(req:NextRequest){
  if(!authorized(req))return NextResponse.json({error:'Unauthorized'},{status:401});
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const body=await req.json().catch(()=>({}));const ticketId=String(body.ticketId||''),status=String(body.status||'');if(!['new','processing','waiting','resolved'].includes(status))return NextResponse.json({error:'Trạng thái không hợp lệ.'},{status:400});
  const sql=db();
  try{const rows=await sql`update partner_support_tickets set status=${status},updated_at=now() where id=${ticketId} returning id`;if(!rows.length)return NextResponse.json({error:'Không tìm thấy yêu cầu.'},{status:404});return NextResponse.json({ok:true,tickets:await allTickets()})}catch(error){console.error('admin_partner_support_patch_failed',error);return NextResponse.json({error:'Không cập nhật được trạng thái.'},{status:500})}
}
