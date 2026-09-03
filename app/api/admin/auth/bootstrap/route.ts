import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {hashPassword,setSessionCookie} from '@/lib/server/portal-auth';

const COOKIE='happygo_admin_auth';
function authorized(req:NextRequest){const expected=process.env.ADMIN_API_KEY?.trim()||'';return Boolean(expected)&&(req.headers.get('x-admin-key')||'')===expected}

export async function POST(req:NextRequest){
  if(!authorized(req))return NextResponse.json({error:'Khóa nội bộ không đúng.'},{status:401});
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const body=await req.json().catch(()=>({}));const name=String(body.name||'Chủ tài khoản HappyGo').trim(),email=String(body.email||process.env.ADMIN_EMAIL||'').trim().toLowerCase(),password=String(body.password||'');
  if(name.length<2||!/^\S+@\S+\.\S+$/.test(email))return NextResponse.json({error:'Tên hoặc email quản trị chưa hợp lệ.'},{status:400});
  if(password.length<10)return NextResponse.json({error:'Mật khẩu quản trị cần tối thiểu 10 ký tự.'},{status:400});
  const sql=db();
  try{
    const owners=await sql`select id from staff where role='owner' limit 1`;if(owners.length)return NextResponse.json({error:'Chủ tài khoản production đã được kích hoạt.'},{status:409});
    const rows=await sql`insert into staff(name,email,password_hash,role,department,status,permissions) values(${name},${email},${hashPassword(password)},'owner','management','active',${JSON.stringify(['*'])}::jsonb) returning id,name,email,phone,role,department,status,permissions,created_at`;
    const staff=rows[0];const response=NextResponse.json({ok:true,staff:{id:String(staff.id),name:staff.name,email:staff.email,phone:staff.phone||'',role:staff.role,department:staff.department||'',status:staff.status,permissions:staff.permissions||['*'],createdAt:staff.created_at}});setSessionCookie(response,COOKIE,'admin',String(staff.id));return response;
  }catch(error:any){console.error('admin_bootstrap_failed',error);const duplicate=String(error?.message||'').includes('staff_email_key');return NextResponse.json({error:duplicate?'Email này đã tồn tại trong danh sách nhân viên.':'Không thể kích hoạt quản trị production.'},{status:duplicate?409:500})}
}
