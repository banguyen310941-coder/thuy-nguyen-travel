import {timingSafeEqual} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';
import {settleAffiliateBooking} from '@/lib/server/affiliate';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function secretOk(req:NextRequest){const expected=process.env.AFFILIATE_WEBHOOK_SECRET?.trim()||'';const actual=req.headers.get('x-affiliate-webhook-secret')||'';if(!expected||!actual)return false;const a=Buffer.from(actual),b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b)}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const body=await req.json().catch(()=>({}));const bookingId=String(body.booking_id||body.bookingId||''),event=String(body.event||'booking_completed');if(event!=='booking_completed'||!uuid.test(bookingId))return NextResponse.json({error:'Payload không hợp lệ.'},{status:400});
 const actor=secretOk(req)?null:await adminActor(req,'bookings');if(!secretOk(req)&&!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{const amount=await settleAffiliateBooking(db(),bookingId);return NextResponse.json({ok:true,bookingId,commissionAmount:amount})}catch(error){console.error('affiliate_booking_completed_failed',error);return NextResponse.json({error:'Không thể đối soát hoa hồng.'},{status:500})}
}
