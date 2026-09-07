import {NextRequest,NextResponse} from 'next/server';
import {hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';

export async function GET(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  try{
    const actor=await adminActor(req);if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
    return NextResponse.json({ok:true,staff:{id:actor.id,name:actor.name,email:actor.email,phone:actor.phone,role:actor.role,department:actor.department,status:actor.status,permissions:actor.permissions,createdAt:actor.createdAt}});
  }catch(error){console.error('admin_me_failed',error);return NextResponse.json({error:'Không đọc được phiên quản trị.'},{status:500})}
}
