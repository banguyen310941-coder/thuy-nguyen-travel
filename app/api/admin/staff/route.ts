import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {hashPassword,readSession} from '@/lib/server/portal-auth';

const roles=new Set(['admin','sales','content','operations','accounting']);
const statuses=new Set(['active','inactive','locked']);
function shape(row:any){return{id:String(row.id),name:row.name,email:row.email,phone:row.phone||'',role:row.role,department:row.department||'',status:row.status,permissions:Array.isArray(row.permissions)?row.permissions:[],createdAt:row.created_at}}
async function actor(req:NextRequest){const session=readSession(req,'happygo_admin_auth','admin');if(!session)return null;const sql=db();const rows=await sql`select id,role,status from staff where id=${session.id} and status='active' limit 1`;const row=rows[0];return row&&(row.role==='owner'||row.role==='admin')?row:null}

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 try{if(!await actor(req))return NextResponse.json({error:'Unauthorized'},{status:401});const sql=db();const rows=await sql`select id,name,email,phone,role,department,status,permissions,created_at from staff where role<>'affiliate' order by case when role='owner' then 0 else 1 end,created_at`;return NextResponse.json({ok:true,staff:rows.map(shape)})}catch(error){console.error('admin_staff_get_failed',error);return NextResponse.json({error:'Không đọc được danh sách nhân viên.'},{status:500})}
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 try{
  const current=await actor(req);if(!current)return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await req.json().catch(()=>({}));const id=String(body.id||''),name=String(body.name||'').trim(),email=String(body.email||'').trim().toLowerCase(),phone=String(body.phone||'').trim(),role=String(body.role||'sales'),department=String(body.department||'sales').trim()||'sales',status=statuses.has(String(body.status))?String(body.status):'active',permissions=Array.isArray(body.permissions)?body.permissions.map(String):[],password=String(body.password||'');
  if(name.length<2||!/^\S+@\S+\.\S+$/.test(email)||!roles.has(role))return NextResponse.json({error:'Thông tin nhân viên chưa hợp lệ.'},{status:400});
  const sql=db();let rows:any[]=[];
  if(id){
    const target=await sql`select id,role from staff where id=${id} limit 1`;if(!target.length)return NextResponse.json({error:'Không tìm thấy nhân viên.'},{status:404});if(target[0].role==='owner')return NextResponse.json({error:'Chủ tài khoản được quản lý tại hồ sơ bảo mật riêng.'},{status:403});if(target[0].role==='affiliate')return NextResponse.json({error:'Tài khoản CTV được quản lý tại module Cộng tác viên.'},{status:403});
    if(password){if(password.length<8)return NextResponse.json({error:'Mật khẩu mới cần tối thiểu 8 ký tự.'},{status:400});rows=await sql`update staff set name=${name},email=${email},phone=${phone||null},password_hash=${hashPassword(password)},role=${role},department=${department},status=${status},permissions=${JSON.stringify(permissions)}::jsonb,updated_at=now() where id=${id} returning id,name,email,phone,role,department,status,permissions,created_at`}
    else rows=await sql`update staff set name=${name},email=${email},phone=${phone||null},role=${role},department=${department},status=${status},permissions=${JSON.stringify(permissions)}::jsonb,updated_at=now() where id=${id} returning id,name,email,phone,role,department,status,permissions,created_at`;
  }else{
    if(password.length<8)return NextResponse.json({error:'Mật khẩu đăng nhập cần tối thiểu 8 ký tự.'},{status:400});rows=await sql`insert into staff(name,email,phone,password_hash,role,department,status,permissions) values(${name},${email},${phone||null},${hashPassword(password)},${role},${department},${status},${JSON.stringify(permissions)}::jsonb) returning id,name,email,phone,role,department,status,permissions,created_at`;
  }
  return NextResponse.json({ok:true,staff:shape(rows[0])});
 }catch(error:any){console.error('admin_staff_save_failed',error);const duplicate=String(error?.message||'').includes('staff_email_key');return NextResponse.json({error:duplicate?'Email đăng nhập đã được dùng cho nhân viên khác.':'Không thể lưu nhân viên.'},{status:duplicate?409:500})}
}

export async function DELETE(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 try{if(!await actor(req))return NextResponse.json({error:'Unauthorized'},{status:401});const id=req.nextUrl.searchParams.get('id')||'';const sql=db();const target=await sql`select role from staff where id=${id}`;if(!target.length)return NextResponse.json({error:'Không tìm thấy nhân viên.'},{status:404});if(target[0].role==='owner')return NextResponse.json({error:'Không thể xóa Chủ tài khoản.'},{status:403});if(target[0].role==='affiliate')return NextResponse.json({error:'Tài khoản CTV được quản lý tại module Cộng tác viên.'},{status:403});await sql`delete from staff where id=${id}`;return NextResponse.json({ok:true})}catch(error){console.error('admin_staff_delete_failed',error);return NextResponse.json({error:'Không thể xóa nhân viên.'},{status:500})}
}
