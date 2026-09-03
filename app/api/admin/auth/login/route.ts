import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {setSessionCookie,verifyPassword} from '@/lib/server/portal-auth';

const COOKIE='happygo_admin_auth';
function shape(row:any){return{id:String(row.id),name:row.name,email:row.email,phone:row.phone||'',role:row.role,department:row.department||'',status:row.status,permissions:Array.isArray(row.permissions)?row.permissions:[],createdAt:row.created_at}}

export async function POST(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const body=await req.json().catch(()=>({}));const email=String(body.email||'').trim().toLowerCase(),password=String(body.password||'');if(!email||!password)return NextResponse.json({error:'Vui lòng nhập email và mật khẩu.'},{status:400});
  const sql=db();
  try{const rows=await sql`select id,name,email,phone,password_hash,role,department,status,permissions,created_at from staff where lower(email)=lower(${email}) limit 1`;const row=rows[0];if(!row||row.status!=='active'||!verifyPassword(password,String(row.password_hash||'')))return NextResponse.json({error:'Email hoặc mật khẩu không đúng.'},{status:401});const response=NextResponse.json({ok:true,staff:shape(row)});setSessionCookie(response,COOKIE,'admin',String(row.id));return response}catch(error){console.error('admin_login_failed',error);return NextResponse.json({error:'Không thể đăng nhập quản trị lúc này.'},{status:500})}
}
