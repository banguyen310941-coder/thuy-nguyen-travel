import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {partnerActor} from '@/lib/server/partner-access';

async function current(partnerId:string){
  const sql=db();
  const rows=await sql`select p.id,p.name,p.email,p.phone,p.status,p.commission_percent,p.created_at,a.contact_name,a.website,a.tax_code,a.address,a.data from partners p join partner_accounts a on a.partner_id=p.id where p.id=${partnerId} limit 1`;
  return rows[0]||null;
}
function shape(row:any){return {id:String(row.id),name:row.name,email:row.email||'',phone:row.phone||'',status:row.status,commissionPercent:Number(row.commission_percent||0),contact:row.contact_name||'',website:row.website||'',taxCode:row.tax_code||'',address:row.address||'',createdAt:row.created_at,data:row.data||{}}}

export async function GET(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  try{const actor=await partnerActor(req);if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});const row=await current(actor.id);if(!row)return NextResponse.json({error:'Unauthorized'},{status:401});return NextResponse.json({ok:true,partner:shape(row)})}catch(error){console.error('partner_me_get_failed',error);return NextResponse.json({error:'Không đọc được hồ sơ đối tác.'},{status:500})}
}

export async function PATCH(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const actor=await partnerActor(req);if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await req.json().catch(()=>({}));
  const name=String(body.name||'').trim(),phone=String(body.phone||'').trim(),contact=String(body.contact||'').trim(),website=String(body.website||'').trim(),taxCode=String(body.taxCode||'').trim(),address=String(body.address||'').trim();
  if(name.length<2||phone.length<8||contact.length<2)return NextResponse.json({error:'Vui lòng nhập đầy đủ tên doanh nghiệp, người liên hệ và số điện thoại.'},{status:400});
  const sql=db();
  try{
    await sql`update partners set name=${name},phone=${phone},updated_at=now() where id=${actor.id}`;
    await sql`update partner_accounts set contact_name=${contact},website=${website||null},tax_code=${taxCode||null},address=${address||null},updated_at=now() where partner_id=${actor.id}`;
    const row=await current(actor.id);return NextResponse.json({ok:true,partner:shape(row)});
  }catch(error){console.error('partner_me_patch_failed',error);return NextResponse.json({error:'Không thể lưu hồ sơ doanh nghiệp.'},{status:500})}
}
