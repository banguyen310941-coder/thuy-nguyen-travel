import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {affiliateActor} from '@/lib/server/affiliate';

const percent=(part:number,total:number)=>total>0?Math.round((part/total)*1000)/10:0;

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 try{
  const actor=await affiliateActor(req);
  if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
  const sql=db();
  const [allRows,last30Rows,topProducts]=await Promise.all([
   sql`select
    (select count(*)::bigint from affiliate_clicks where affiliate_id=${actor.id}) as clicks,
    (select count(*)::bigint from affiliate_referrals where affiliate_id=${actor.id} and status<>'cancelled') as referrals,
    (select count(*)::bigint from affiliate_referrals where affiliate_id=${actor.id} and status in ('approved','paid')) as credited_orders,
    (select count(*)::bigint from affiliate_referrals where affiliate_id=${actor.id} and status='pending') as pending_orders,
    (select coalesce(sum(commission_amount),0)::bigint from affiliate_referrals where affiliate_id=${actor.id} and status in ('approved','paid')) as credited_commission,
    (select coalesce(sum(amount),0)::bigint from commission_payouts where affiliate_id=${actor.id} and status='paid') as paid_payouts,
    (select coalesce(sum(amount),0)::bigint from commission_payouts where affiliate_id=${actor.id} and status='pending') as pending_payouts`,
   sql`select
    (select count(*)::bigint from affiliate_clicks where affiliate_id=${actor.id} and clicked_on>=current_date-29) as clicks,
    (select count(*)::bigint from affiliate_referrals where affiliate_id=${actor.id} and status<>'cancelled' and created_at>=now()-interval '30 days') as referrals,
    (select count(*)::bigint from affiliate_referrals where affiliate_id=${actor.id} and status in ('approved','paid') and credited_at>=now()-interval '30 days') as credited_orders,
    (select count(*)::bigint from affiliate_referrals where affiliate_id=${actor.id} and status='pending' and created_at>=now()-interval '30 days') as pending_orders,
    (select coalesce(sum(commission_amount),0)::bigint from affiliate_referrals where affiliate_id=${actor.id} and status in ('approved','paid') and credited_at>=now()-interval '30 days') as credited_commission,
    (select coalesce(sum(amount),0)::bigint from commission_payouts where affiliate_id=${actor.id} and status='paid' and created_at>=now()-interval '30 days') as paid_payouts`,
   sql`with click_metrics as (
      select villa_id,count(*)::bigint as clicks
      from affiliate_clicks
      where affiliate_id=${actor.id} and clicked_on>=current_date-29
      group by villa_id
     ), referral_metrics as (
      select villa_id,
       count(*) filter(where status<>'cancelled')::bigint as bookings,
       count(*) filter(where status in ('approved','paid'))::bigint as credited_orders,
       coalesce(sum(commission_amount) filter(where status in ('approved','paid')),0)::bigint as commission
      from affiliate_referrals
      where affiliate_id=${actor.id} and created_at>=now()-interval '30 days'
      group by villa_id
     ), product_ids as (
      select villa_id from click_metrics union select villa_id from referral_metrics
     )
     select x.villa_id as id,coalesce(p.name,'Sản phẩm đã ẩn') as name,coalesce(p.type,'') as type,
      coalesce(c.clicks,0)::bigint as clicks,coalesce(r.bookings,0)::bigint as bookings,
      coalesce(r.credited_orders,0)::bigint as credited_orders,coalesce(r.commission,0)::bigint as commission
     from product_ids x
     left join products p on p.id=x.villa_id
     left join click_metrics c on c.villa_id=x.villa_id
     left join referral_metrics r on r.villa_id=x.villa_id
     order by coalesce(c.clicks,0) desc,coalesce(r.bookings,0) desc,coalesce(r.commission,0) desc
     limit 6`
  ]);
  const all=allRows[0]||{},last30=last30Rows[0]||{};
  const normalize=(row:any)=>({
   clicks:Number(row.clicks||0),referrals:Number(row.referrals||0),creditedOrders:Number(row.credited_orders||0),pendingOrders:Number(row.pending_orders||0),creditedCommission:Number(row.credited_commission||0),paidPayouts:Number(row.paid_payouts||0),pendingPayouts:Number(row.pending_payouts||0),conversionRate:percent(Number(row.referrals||0),Number(row.clicks||0))
  });
  return NextResponse.json({
   ok:true,
   allTime:normalize(all),
   last30Days:normalize(last30),
   topProducts:topProducts.map((row:any)=>({id:String(row.id),name:String(row.name),type:String(row.type||''),clicks:Number(row.clicks||0),bookings:Number(row.bookings||0),creditedOrders:Number(row.credited_orders||0),commission:Number(row.commission||0),conversionRate:percent(Number(row.bookings||0),Number(row.clicks||0))})),
   generatedAt:new Date().toISOString()
  },{headers:{'Cache-Control':'no-store, max-age=0'}});
 }catch(error){
  console.error('affiliate_performance_failed',error);
  return NextResponse.json({error:'Không đọc được hiệu quả bán hàng CTV.'},{status:500});
 }
}
