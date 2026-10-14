import {NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';

export async function GET(){
  if(!hasDatabase())return NextResponse.json({configured:false,needsBootstrap:false,code:'database_unconfigured',error:'Cơ sở dữ liệu quản trị chưa được cấu hình.'},{status:503});
  try{const sql=db();const rows=await sql`select count(*)::int as count from staff where role='owner'`;return NextResponse.json({configured:true,needsBootstrap:Number(rows[0]?.count||0)===0})}catch(error){
    console.error('admin_auth_status_failed',error);
    const detail=String(error).toLowerCase();
    const quotaExceeded=detail.includes('quota')||detail.includes('402')||detail.includes('exceeded');
    return NextResponse.json({configured:true,needsBootstrap:false,code:quotaExceeded?'database_quota_exceeded':'database_unavailable',error:quotaExceeded?'Cơ sở dữ liệu đang vượt hạn mức Neon. Vui lòng mở lại quota hoặc nâng cấp gói Neon để đăng nhập quản trị.':'Không kết nối được cơ sở dữ liệu quản trị.'},{status:503});
  }
}
