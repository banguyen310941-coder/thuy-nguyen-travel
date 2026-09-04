import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {partnerActor} from '@/lib/server/partner-access';

async function ticketRows(partnerId:string){
  const sql=db();
  const tickets=await sql`select t.id,t.subject,t.category,t.status,t.created_at,t.updated_at,p.name as partner_name,a.contact_name from partner_support_tickets t join partners p on p.id=t.partner_id left join partner_accounts a on a.partner_id=p.id where t.partner_id=${partnerId} order by t.updated_at desc`;
  if(!tickets.length)return [];
  const ids=tickets.map((x:any)=>String(x.id));
  const messages=await sql`select id,ticket_id,sender_type,sender_name,body,created_at from partner_support_messages where ticket_id = any(${ids}::uuid[]) order by created_at`;
  return tickets.map((t:any)=>({id:String(t.id),partnerId,partnerName:t.partner_name,subject:t.subject,category:t.category,status:t.status,createdAt:t.created_at,updatedAt:t.updated_at,messages:messages.filter((m:any)=>String(m.ticket_id)===String(t.id)).map((m:any)=>({id:String(m.id),from:m.sender_type,name:m.sender_name,text:m.body,at:m.created_at}))}));
}

export async function GET(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const actor=await partnerActor(req);if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
  try{return NextResponse.json({ok:true,tickets:await ticketRows(actor.id)})}catch(error){console.error('partner_support_get_failed',error);return NextResponse.json({error:'Không đọc được yêu cầu hỗ trợ.'},{status:500})}
}

export async function POST(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const actor=await partnerActor(req);if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await req.json().catch(()=>({}));const action=String(body.action||'create'),text=String(body.text||'').trim();
  if(text.length<1)return NextResponse.json({error:'Vui lòng nhập nội dung.'},{status:400});
  const sql=db();
  try{
    const partnerRows=await sql`select p.name,a.contact_name from partners p left join partner_accounts a on a.partner_id=p.id where p.id=${actor.id}`;
    const sender=String(partnerRows[0]?.contact_name||partnerRows[0]?.name||'Đối tác HappyGo');
    if(action==='reply'){
      const ticketId=String(body.ticketId||'');const rows=await sql`select id,status from partner_support_tickets where id=${ticketId} and partner_id=${actor.id} limit 1`;if(!rows.length)return NextResponse.json({error:'Không tìm thấy yêu cầu.'},{status:404});
      await sql`insert into partner_support_messages(ticket_id,sender_type,sender_name,body) values(${ticketId},'partner',${sender},${text})`;
      await sql`update partner_support_tickets set status='new',updated_at=now() where id=${ticketId}`;
    }else{
      const subject=String(body.subject||'').trim(),category=String(body.category||'Khác').trim()||'Khác';if(subject.length<3)return NextResponse.json({error:'Vui lòng nhập chủ đề.'},{status:400});
      const rows=await sql`insert into partner_support_tickets(partner_id,subject,category,status) values(${actor.id},${subject},${category},'new') returning id`;
      await sql`insert into partner_support_messages(ticket_id,sender_type,sender_name,body) values(${rows[0].id},'partner',${sender},${text})`;
    }
    return NextResponse.json({ok:true,tickets:await ticketRows(actor.id)});
  }catch(error){console.error('partner_support_post_failed',error);return NextResponse.json({error:'Không thể gửi yêu cầu hỗ trợ.'},{status:500})}
}
