import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {setSessionCookie,verifyPassword} from '@/lib/server/portal-auth';
import {authAttemptKey,loginTemporarilyBlocked,recordLoginAttempt} from '@/lib/server/auth-attempts';
import {consumePublicRateLimit,publicRateKey,readBoundedJson,requestBodyTooLarge} from '@/lib/server/public-abuse';

const COOKIE='happygo_partner_auth';

export async function POST(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  if(requestBodyTooLarge(req,8192))return NextResponse.json({error:'Dữ liệu đăng nhập quá lớn.'},{status:413});
  const parsed=await readBoundedJson(req,8192);if(parsed.tooLarge)return NextResponse.json({error:'Dữ liệu đăng nhập quá lớn.'},{status:413});
  const body=parsed.body;
  const email=String(body.email||'').trim().toLowerCase();
  const password=String(body.password||'');
  if(!email||!password)return NextResponse.json({error:'Vui lòng nhập email và mật khẩu.'},{status:400});
  const sql=db(),attemptKey=authAttemptKey(req,'partner',email);
  try{
    const burstAllowed=await consumePublicRateLimit(sql,{key:publicRateKey(req,'partner-login'),action:'partner.login.submit',scope:'partner-login-ip',maxHits:30,windowMinutes:15});
    if(!burstAllowed)return NextResponse.json({error:'Có quá nhiều yêu cầu đăng nhập từ mạng này. Vui lòng thử lại sau.'},{status:429,headers:{'Retry-After':'900'}});
    if(await loginTemporarilyBlocked(sql,attemptKey))return NextResponse.json({error:'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau khoảng 15 phút.'},{status:429,headers:{'Retry-After':'900'}});
    const rows=await sql`select p.id,p.name,p.email,p.phone,p.status,p.created_at,floor(extract(epoch from p.updated_at)*1000)::bigint as session_version,a.password_hash,a.contact_name,a.website,a.tax_code,a.address from partners p join partner_accounts a on a.partner_id=p.id where lower(p.email)=lower(${email}) limit 1`;
    const row=rows[0];
    if(!row||!verifyPassword(password,String(row.password_hash||''))){await recordLoginAttempt(sql,attemptKey,'partner',false);return NextResponse.json({error:'Email hoặc mật khẩu không đúng.'},{status:401})}
    await recordLoginAttempt(sql,attemptKey,'partner',true);
    if(!['pending','active'].includes(String(row.status)))return NextResponse.json({error:'Tài khoản đối tác không còn quyền truy cập. Vui lòng liên hệ HappyGo để được hỗ trợ.'},{status:403});
    await sql`update partner_accounts set last_login_at=now(),updated_at=now() where partner_id=${row.id}`;
    const response=NextResponse.json({ok:true,partner:{id:String(row.id),name:row.name,email:row.email,phone:row.phone,status:row.status,contact:row.contact_name||'',website:row.website||'',taxCode:row.tax_code||'',address:row.address||'',createdAt:row.created_at}});
    setSessionCookie(response,COOKIE,'partner',String(row.id),String(row.session_version));return response;
  }catch(error){console.error('partner_login_failed',error);return NextResponse.json({error:'Không thể đăng nhập lúc này.'},{status:500})}
}
