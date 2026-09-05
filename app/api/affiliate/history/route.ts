import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {affiliateActor,maskPhone} from '@/lib/server/affiliate';

const intParam=(raw:string|null,fallback:number,max:number)=>{const n=Number(raw);return Number.isFinite(n)?Math.min(max,Math.max(0,Math.trunc(n))):fallback};

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 try{
  const actor=await affiliateActor(req);
  if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
  const kind=String(req.nextUrl.searchParams.get('kind')||'referrals');
  if(!['referrals','payouts'].includes(kind))return NextResponse.json({error:'Loại lịch sử không hợp lệ.'},{status:400});
  const limit=Math.max(1,intParam(req.nextUrl.searchParams.get('limit'),50,100));
  const offset=intParam(req.nextUrl.searchParams.get('offset'),0,100000);
  const sql=db();
  if(kind==='payouts'){
   const [rows,totalRows]=await Promise.all([
    sql`select id,amount,status,payout_date,receipt_url,created_at from commission_payouts where affiliate_id=${actor.id} order by created_at desc limit ${limit+1} offset ${offset}`,
    sql`select count(*)::bigint as total from commission_payouts where affiliate_id=${actor.id}`
   ]);
   const hasMore=rows.length>limit,items=rows.slice(0,limit).map((p:any)=>({id:String(p.id),amount:Number(p.amount||0),status:String(p.status),payoutDate:p.payout_date?String(p.payout_date):'',receiptUrl:String(p.receipt_url||''),createdAt:String(p.created_at)}));
   return NextResponse.json({ok:true,kind,items,pagination:{limit,offset,total:Number(totalRows[0]?.total||0),hasMore,nextOffset:hasMore?offset+limit:null}},{headers:{'Cache-Control':'no-store, max-age=0'}});
  }
  const [rows,totalRows]=await Promise.all([
   sql`select ar.id,ar.customer_phone,ar.commission_amount,ar.status,ar.created_at,ar.credited_at,b.code as booking_code,b.status as booking_status,p.name as villa_name from affiliate_referrals ar join bookings b on b.id=ar.booking_id left join products p on p.id=ar.villa_id where ar.affiliate_id=${actor.id} order by ar.created_at desc limit ${limit+1} offset ${offset}`,
   sql`select count(*)::bigint as total from affiliate_referrals where affiliate_id=${actor.id}`
  ]);
  const hasMore=rows.length>limit,items=rows.slice(0,limit).map((r:any)=>({id:String(r.id),bookingCode:String(r.booking_code),bookingStatus:String(r.booking_status),villaName:String(r.villa_name||'Sản phẩm'),customerPhone:maskPhone(r.customer_phone),commissionAmount:Number(r.commission_amount||0),status:String(r.status),createdAt:String(r.created_at),creditedAt:r.credited_at?String(r.credited_at):''}));
  return NextResponse.json({ok:true,kind,items,pagination:{limit,offset,total:Number(totalRows[0]?.total||0),hasMore,nextOffset:hasMore?offset+limit:null}},{headers:{'Cache-Control':'no-store, max-age=0'}});
 }catch(error){console.error('affiliate_history_failed',error);return NextResponse.json({error:'Không đọc được lịch sử giao dịch CTV.'},{status:500})}
}
