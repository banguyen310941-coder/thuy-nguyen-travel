import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {setSessionCookie,verifyPassword} from '@/lib/server/portal-auth';
import {authAttemptKey,loginTemporarilyBlocked,recordLoginAttempt} from '@/lib/server/auth-attempts';
import {consumePublicRateLimit,publicRateKey,readBoundedJson,requestBodyTooLarge} from '@/lib/server/public-abuse';

const COOKIE='happygo_admin_auth';
function shape(row:any){return{id:String(row.id),name:row.name,email:row.email,phone:row.phone||'',role:row.role,department:row.department||'',status:row.status,permissions:Array.isArray(row.permissions)?row.permissions:[],createdAt:row.created_at}}

export async function POST(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  if(requestBodyTooLarge(req,8192))return NextResponse.json({error:'Dữ liệu đăng nhập quá lớn.'},{status:413});
  const origin=req.headers.get('origin');if(origin&&origin!==req.nextUrl.origin)return NextResponse.json({error:'Yêu cầu không hợp lệ.'},{status:403});
  const parsed=await readBoundedJson(req,8192);if(parsed.tooLarge)return NextResponse.json({error:'Dữ liệu đăng nhập quá lớn.'},{status:413});
  const body=parsed.body;const email=String(body.email||'').trim().toLowerCase(),password=String(body.password||'');if(!email||!password)return NextResponse.json({error:'Vui lòng nhập email và mật khẩu.'},{status:400});
  const sql=db(),attemptKey=authAttemptKey(req,'admin',email);
  try{
    const burstAllowed=await consumePublicRateLimit(sql,{key:publicRateKey(req,'admin-login'),action:'admin.login.submit',scope:'admin-login-ip',maxHits:30,windowMinutes:15});
    if(!burstAllowed)return NextResponse.json({error:'Có quá nhiều yêu cầu đăng nhập từ thiết bị hoặc mạng này. Vui lòng thử lại sau.'},{status:429,headers:{'Retry-After':'900'}});
    if(await loginTemporarilyBlocked(sql,attemptKey))return NextResponse.json({error:'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau khoảng 15 phút.'},{status:429,headers:{'Retry-After':'900'}});
    const rows=await sql`select id,name,email,phone,password_hash,role,department,status,permissions,created_at from staff where lower(email)=lower(${email}) limit 1`;const row=rows[0];
    if(!row||row.status!=='active'||!verifyPassword(password,String(row.password_hash||''))){await recordLoginAttempt(sql,attemptKey,'admin',false);return NextResponse.json({error:'Email hoặc mật khẩu không đúng.'},{status:401})}
    await recordLoginAttempt(sql,attemptKey,'admin',true);
    if(row.role==='affiliate')return NextResponse.json({error:'Tài khoản CTV đăng nhập tại /affiliate.'},{status:403});
    const response=NextResponse.json({ok:true,staff:shape(row)});setSessionCookie(response,COOKIE,'admin',String(row.id));return response;
  }catch(error){console.error('admin_login_failed',error);return NextResponse.json({error:'Không thể đăng nhập quản trị lúc này.'},{status:500})}
}
