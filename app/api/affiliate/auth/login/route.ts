import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {setSessionCookie,verifyPassword} from '@/lib/server/portal-auth';
import {AFFILIATE_SESSION_COOKIE} from '@/lib/server/affiliate';

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const body=await req.json().catch(()=>({}));const email=String(body.email||'').trim().toLowerCase(),password=String(body.password||'');
 if(!email||!password)return NextResponse.json({error:'Vui lòng nhập email và mật khẩu.'},{status:400});
 try{
  const rows=await db()`select s.id,s.name,s.email,s.password_hash,s.status as staff_status,a.id as affiliate_id,a.referral_code,a.status as affiliate_status from staff s join affiliates a on a.user_id=s.id where lower(s.email)=lower(${email}) and s.role='affiliate' limit 1`;
  const row=rows[0];if(!row||row.staff_status!=='active'||row.affiliate_status!=='active'||!verifyPassword(password,String(row.password_hash||'')))return NextResponse.json({error:'Email hoặc mật khẩu không đúng, hoặc tài khoản CTV chưa được kích hoạt.'},{status:401});
  const response=NextResponse.json({ok:true,affiliate:{id:String(row.affiliate_id),name:String(row.name),email:String(row.email),referralCode:String(row.referral_code)}});setSessionCookie(response,AFFILIATE_SESSION_COOKIE,'affiliate',String(row.id));return response;
 }catch(error){console.error('affiliate_login_failed',error);return NextResponse.json({error:'Module CTV chưa sẵn sàng trên database production.'},{status:503})}
}
