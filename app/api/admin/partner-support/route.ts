import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';
import {readBoundedJson,requestBodyTooLarge} from '@/lib/server/public-abuse';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function allTickets(){
  const sql=db();
  const tickets=await sql`select t.id,t.partner_id,t.subject,t.category,t.status,t.created_at,t.updated_at,p.name as partner_name from partner_support_tickets t join partners p on p.id=t.partner_id order by t.updated_at desc`;
  if(!tickets.length)return [];
  const ids=tickets.map((x:any)=>String(x.id));
  const messages=await sql`select id,ticket_id,sender_type,sender_name,body,created_at from partner_support_messages where ticket_id = any(${ids}::uuid[]) order by created_at`;
  return tickets.map((t:any)=>({id:String(t.id),partnerId:String(t.partner_id),partnerName:t.partner_name,subject:t.subject,category:t.category,status:t.status,createdAt:t.created_at,updatedAt:t.updated_at,messages:messages.filter((m:any)=>String(m.ticket_id)===String(t.id)).map((m:any)=>({id:String(m.id),from:m.sender_type,name:m.sender_name,text:m.body,at:m.created_at}))}));
}

export async function GET(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  if(!await adminActor(req,'partners'))return NextResponse.json({error:'Unauthorized'},{status:401});
  try{return NextResponse.json({ok:true,tickets:await allTickets()})}catch(error){console.error('admin_partner_support_get_failed',error);return NextResponse.json({error:'Không đọc được hỗ trợ đối tác.'},{status:500})}
}

export async function POST(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const actor=await adminActor(req,'partners');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
  if(requestBodyTooLarge(req,65_536))return NextResponse.json({error:'Dữ liệu hỗ trợ quá lớn.'},{status:413});const parsed=await readBoundedJson(req,65_536);if(parsed.tooLarge)return NextResponse.json({error:'Dữ liệu hỗ trợ quá lớn.'},{status:413});
  const body=parsed.body;const ticketId=String(body.ticketId||''),text=String(body.text||'').trim().slice(0,8000);
  if(!uuid.test(ticketId)||!text)return NextResponse.json({error:'Yêu cầu hoặc nội dung trả lời không hợp lệ.'},{status:400});
  const sql=db();
  try{const rows=await sql`select id,status from partner_support_tickets where id=${ticketId}`;if(!rows.length)return NextResponse.json({error:'Không tìm thấy yêu cầu.'},{status:404});await sql`insert into partner_support_messages(ticket_id,sender_type,sender_name,body) values(${ticketId},'admin',${actor.name},${text})`;await sql`update partner_support_tickets set status=${rows[0].status==='resolved'?'processing':rows[0].status},updated_at=now() where id=${ticketId}`;return NextResponse.json({ok:true,tickets:await allTickets()})}catch(error){console.error('admin_partner_support_post_failed',error);return NextResponse.json({error:'Không gửi được phản hồi.'},{status:500})}
}

export async function PATCH(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  if(!await adminActor(req,'partners'))return NextResponse.json({error:'Unauthorized'},{status:401});
  if(requestBodyTooLarge(req,32_768))return NextResponse.json({error:'Dữ liệu hỗ trợ quá lớn.'},{status:413});const parsed=await readBoundedJson(req,32_768);if(parsed.tooLarge)return NextResponse.json({error:'Dữ liệu hỗ trợ quá lớn.'},{status:413});
  const body=parsed.body;const ticketId=String(body.ticketId||''),status=String(body.status||'');if(!uuid.test(ticketId)||!['new','processing','waiting','resolved'].includes(status))return NextResponse.json({error:'Yêu cầu hoặc trạng thái không hợp lệ.'},{status:400});
  const sql=db();
  try{const rows=await sql`update partner_support_tickets set status=${status},updated_at=now() where id=${ticketId} returning id`;if(!rows.length)return NextResponse.json({error:'Không tìm thấy yêu cầu.'},{status:404});return NextResponse.json({ok:true,tickets:await allTickets()})}catch(error){console.error('admin_partner_support_patch_failed',error);return NextResponse.json({error:'Không cập nhật được trạng thái.'},{status:500})}
}
