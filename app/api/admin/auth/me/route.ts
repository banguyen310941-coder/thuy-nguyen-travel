import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {readSession} from '@/lib/server/portal-auth';

function shape(row:any){return{id:String(row.id),name:row.name,email:row.email,phone:row.phone||'',role:row.role,department:row.department||'',status:row.status,permissions:Array.isArray(row.permissions)?row.permissions:[],createdAt:row.created_at}}
export async function GET(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const session=readSession(req,'happygo_admin_auth','admin');if(!session)return NextResponse.json({error:'Unauthorized'},{status:401});
  try{const sql=db();const rows=await sql`select id,name,email,phone,role,department,status,permissions,created_at from staff where id=${session.id} and status='active' limit 1`;if(!rows.length)return NextResponse.json({error:'Unauthorized'},{status:401});return NextResponse.json({ok:true,staff:shape(rows[0])})}catch(error){console.error('admin_me_failed',error);return NextResponse.json({error:'Không đọc được phiên quản trị.'},{status:500})}
}
