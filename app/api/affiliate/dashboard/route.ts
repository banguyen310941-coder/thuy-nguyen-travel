import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {affiliateActor,maskPhone,publicBaseUrl} from '@/lib/server/affiliate';

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 try{
  const actor=await affiliateActor(req);if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});const sql=db();
  const [profileRows,clickRows,orderRows,referrals,payouts,villas]=await Promise.all([
   sql`select a.phone,a.zalo,a.bank_account,a.bank_name,a.account_holder,a.total_commission,a.balance,a.commission_rate,a.status from affiliates a where a.id=${actor.id} limit 1`,
   sql`select count(*)::bigint as total from affiliate_clicks where affiliate_id=${actor.id}`,
   sql`select count(*)::bigint as total from affiliate_referrals where affiliate_id=${actor.id} and status in ('approved','paid')`,
   sql`select ar.id,ar.customer_phone,ar.commission_amount,ar.status,ar.created_at,ar.credited_at,b.code as booking_code,b.status as booking_status,p.name as villa_name from affiliate_referrals ar join bookings b on b.id=ar.booking_id left join products p on p.id=ar.villa_id where ar.affiliate_id=${actor.id} order by ar.created_at desc limit 200`,
   sql`select id,amount,status,payout_date,receipt_url,created_at from commission_payouts where affiliate_id=${actor.id} order by created_at desc limit 100`,
   sql`select p.id,p.slug,p.name,p.retail_price_vnd,p.promo_price_vnd,p.data->>'cover' as cover,p.data->>'place' as place from products p where p.type='Villa & Resort' and ((p.partner_id is null and p.status='published') or (p.partner_id is not null and p.status='approved' and exists(select 1 from partners x where x.id=p.partner_id and x.status='active'))) order by p.updated_at desc,p.name limit 300`
  ]);
  const profile=profileRows[0]||{};const base=publicBaseUrl(req);const villaItems=villas.map((v:any)=>({id:String(v.id),slug:String(v.slug),name:String(v.name),place:String(v.place||''),cover:String(v.cover||''),publicPrice:Number(v.promo_price_vnd||v.retail_price_vnd||0),affiliateLink:`${base}/product?slug=${encodeURIComponent(String(v.slug))}&ref=${encodeURIComponent(actor.referralCode)}&villa_id=${encodeURIComponent(String(v.id))}`}));
  return NextResponse.json({ok:true,affiliate:{id:actor.id,name:actor.name,email:actor.email,referralCode:actor.referralCode,phone:String(profile.phone||''),zalo:String(profile.zalo||''),bankAccount:String(profile.bank_account||''),bankName:String(profile.bank_name||''),accountHolder:String(profile.account_holder||''),totalCommission:Number(profile.total_commission||0),balance:Number(profile.balance||0),commissionRate:Number(profile.commission_rate||0),status:String(profile.status||actor.status)},stats:{clicks:Number(clickRows[0]?.total||0),closedOrders:Number(orderRows[0]?.total||0)},villas:villaItems,referrals:referrals.map((r:any)=>({id:String(r.id),bookingCode:String(r.booking_code),bookingStatus:String(r.booking_status),villaName:String(r.villa_name||'Villa'),customerPhone:maskPhone(r.customer_phone),commissionAmount:Number(r.commission_amount||0),status:String(r.status),createdAt:String(r.created_at),creditedAt:r.credited_at?String(r.credited_at):''})),payouts:payouts.map((p:any)=>({id:String(p.id),amount:Number(p.amount||0),status:String(p.status),payoutDate:p.payout_date?String(p.payout_date):'',receiptUrl:String(p.receipt_url||''),createdAt:String(p.created_at)}))},{headers:{'Cache-Control':'no-store, max-age=0'}});
 }catch(error){console.error('affiliate_dashboard_failed',error);return NextResponse.json({error:'Không đọc được dashboard CTV.'},{status:500})}
}
