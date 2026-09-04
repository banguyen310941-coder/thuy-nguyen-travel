import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {setSessionCookie,verifyPassword} from '@/lib/server/portal-auth';
import {authAttemptKey,loginTemporarilyBlocked,recordLoginAttempt} from '@/lib/server/auth-attempts';

const COOKIE='happygo_partner_auth';

export async function POST(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const body=await req.json().catch(()=>({}));
  const email=String(body.email||'').trim().toLowerCase();
  const password=String(body.password||'');
  if(!email||!password)return NextResponse.json({error:'Vui lòng nhập email và mật khẩu.'},{status:400});
  const sql=db(),attemptKey=authAttemptKey(req,'partner',email);
  try{
    if(await loginTemporarilyBlocked(sql,attemptKey))return NextResponse.json({error:'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau khoảng 15 phút.'},{status:429});
    const rows=await sql`select p.id,p.name,p.email,p.phone,p.status,p.created_at,a.password_hash,a.contact_name,a.website,a.tax_code,a.address from partners p join partner_accounts a on a.partner_id=p.id where lower(p.email)=lower(${email}) limit 1`;
    const row=rows[0];
    if(!row||!verifyPassword(password,String(row.password_hash||''))){await recordLoginAttempt(sql,attemptKey,'partner',false);return NextResponse.json({error:'Email hoặc mật khẩu không đúng.'},{status:401})}
    await recordLoginAttempt(sql,attemptKey,'partner',true);
    if(row.status==='blocked')return NextResponse.json({error:'Tài khoản đã bị khóa. Vui lòng liên hệ HappyGo để được hỗ trợ.'},{status:403});
    await sql`update partner_accounts set last_login_at=now(),updated_at=now() where partner_id=${row.id}`;
    const response=NextResponse.json({ok:true,partner:{id:String(row.id),name:row.name,email:row.email,phone:row.phone,status:row.status,contact:row.contact_name||'',website:row.website||'',taxCode:row.tax_code||'',address:row.address||'',createdAt:row.created_at}});
    setSessionCookie(response,COOKIE,'partner',String(row.id));
    return response;
  }catch(error){
    console.error('partner_login_failed',error);
    return NextResponse.json({error:'Không thể đăng nhập lúc này.'},{status:500});
  }
}
