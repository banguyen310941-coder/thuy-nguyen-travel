import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {ensureVisitor,findTrackableVilla,setAffiliateAttribution} from '@/lib/server/affiliate';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({ok:false},{status:503});
 const body=await req.json().catch(()=>({}));const code=String(body.code||'').trim().toUpperCase(),villaId=String(body.villaId||'');
 if(!/^[A-Z0-9_-]{4,32}$/.test(code)||!uuid.test(villaId))return NextResponse.json({ok:false},{status:400});
 try{
  const sql=db();const affiliate=(await sql`select a.id from affiliates a join staff s on s.id=a.user_id where upper(a.referral_code)=upper(${code}) and a.status='active' and s.status='active' and s.role='affiliate' limit 1`)[0];if(!affiliate)return NextResponse.json({ok:false},{status:404});const villa=await findTrackableVilla(sql,villaId);if(!villa)return NextResponse.json({ok:false},{status:404});
  const response=NextResponse.json({ok:true});const visitor=ensureVisitor(response,req);await sql`insert into affiliate_clicks(affiliate_id,villa_id,visitor_key) values(${String(affiliate.id)},${villaId},${visitor}) on conflict(affiliate_id,villa_id,visitor_key,clicked_on) do nothing`;setAffiliateAttribution(response,String(affiliate.id),villaId);return response;
 }catch(error){console.error('affiliate_track_failed',error);return NextResponse.json({ok:false},{status:500})}
}
