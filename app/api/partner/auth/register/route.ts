import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {hashPassword,setSessionCookie} from '@/lib/server/portal-auth';

const COOKIE='happygo_partner_auth';
const emailOk=(v:string)=>/^\S+@\S+\.\S+$/.test(v);
const phoneOk=(v:string)=>/^[0-9+().\s-]{8,20}$/.test(v);

export async function POST(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const body=await req.json().catch(()=>({}));
  const companyName=String(body.companyName||'').trim();
  const contactName=String(body.contactName||'').trim();
  const phone=String(body.phone||'').trim();
  const email=String(body.email||'').trim().toLowerCase();
  const password=String(body.password||'');
  if(companyName.length<2||contactName.length<2||!emailOk(email)||!phoneOk(phone))return NextResponse.json({error:'Vui lòng nhập đầy đủ thông tin doanh nghiệp và người liên hệ.'},{status:400});
  if(password.length<8)return NextResponse.json({error:'Mật khẩu cần tối thiểu 8 ký tự.'},{status:400});
  const sql=db();
  try{
    const exists=await sql`select id from partners where lower(email)=lower(${email}) limit 1`;
    if(exists.length)return NextResponse.json({error:'Email này đã có tài khoản đối tác.'},{status:409});
    const rows=await sql`insert into partners(name,email,phone,status,commission_percent) values(${companyName},${email},${phone},'pending',0) returning id,name,email,phone,status,created_at`;
    const partner=rows[0];
    await sql`insert into partner_accounts(partner_id,password_hash,contact_name) values(${partner.id},${hashPassword(password)},${contactName})`;
    const response=NextResponse.json({ok:true,partner:{id:String(partner.id),name:partner.name,email:partner.email,phone:partner.phone,status:partner.status,contact:contactName,website:'',taxCode:'',address:'',createdAt:partner.created_at}});
    setSessionCookie(response,COOKIE,'partner',String(partner.id));
    return response;
  }catch(error){
    console.error('partner_register_failed',error);
    return NextResponse.json({error:'Không thể tạo tài khoản đối tác lúc này.'},{status:500});
  }
}
