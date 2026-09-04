import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {affiliateActor,findTrackableVilla,publicBaseUrl} from '@/lib/server/affiliate';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 try{
  const actor=await affiliateActor(req);if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});const villaId=String(req.nextUrl.searchParams.get('villa_id')||'');if(!uuid.test(villaId))return NextResponse.json({error:'Villa không hợp lệ.'},{status:400});const villa=await findTrackableVilla(db(),villaId);if(!villa)return NextResponse.json({error:'Villa không tồn tại hoặc chưa được xuất bản.'},{status:404});
  const link=`${publicBaseUrl(req)}/product?slug=${encodeURIComponent(String(villa.slug))}&ref=${encodeURIComponent(actor.referralCode)}&villa_id=${encodeURIComponent(villaId)}`;
  return NextResponse.json({ok:true,villa:{id:String(villa.id),name:String(villa.name),slug:String(villa.slug)},link},{headers:{'Cache-Control':'no-store'}});
 }catch(error){console.error('affiliate_generate_link_failed',error);return NextResponse.json({error:'Không tạo được link CTV.'},{status:500})}
}
