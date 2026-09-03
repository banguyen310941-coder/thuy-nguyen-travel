import {NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';

export async function GET(){
  if(!hasDatabase())return NextResponse.json({configured:false,needsBootstrap:false},{status:503});
  try{const sql=db();const rows=await sql`select count(*)::int as count from staff where role='owner'`;return NextResponse.json({configured:true,needsBootstrap:Number(rows[0]?.count||0)===0})}catch(error){console.error('admin_auth_status_failed',error);return NextResponse.json({configured:true,needsBootstrap:false,error:'Không kiểm tra được trạng thái quản trị.'},{status:500})}
}
