import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';

const elevated=(actor:{role:string;permissions:string[]})=>actor.role==='owner'||actor.role==='admin'||actor.permissions.includes('*');
const percent=(part:number,total:number)=>total>0?Math.round((part/total)*1000)/10:0;

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 try{
  const actor=await adminActor(req,'affiliates');
  if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
  const sql=db(),canSeeAll=elevated(actor);
  const rows=canSeeAll?await sql`select a.id,s.name,a.referral_code,a.status,coalesce(owner.name,'Chưa phân công') as sales_owner_name,
    coalesce(c.clicks30,0)::bigint as clicks30,coalesce(r.bookings30,0)::bigint as bookings30,coalesce(r.credited_orders30,0)::bigint as credited_orders30,
    coalesce(r.commission30,0)::bigint as commission30,coalesce(r.pending_orders,0)::bigint as pending_orders,
    coalesce(p.pending_payouts,0)::bigint as pending_payouts,coalesce(p.paid_payouts30,0)::bigint as paid_payouts30,
    f.last_followup_at,f.next_follow_up_at
   from affiliates a join staff s on s.id=a.user_id left join staff owner on owner.id=a.sales_owner_id
   left join lateral(select count(*)::bigint as clicks30 from affiliate_clicks c where c.affiliate_id=a.id and c.clicked_on>=current_date-29)c on true
   left join lateral(select count(*) filter(where ar.status<>'cancelled' and ar.created_at>=now()-interval '30 days')::bigint as bookings30,
     count(*) filter(where ar.status in ('approved','paid') and ar.credited_at>=now()-interval '30 days')::bigint as credited_orders30,
     coalesce(sum(ar.commission_amount) filter(where ar.status in ('approved','paid') and ar.credited_at>=now()-interval '30 days'),0)::bigint as commission30,
     count(*) filter(where ar.status='pending')::bigint as pending_orders from affiliate_referrals ar where ar.affiliate_id=a.id)r on true
   left join lateral(select coalesce(sum(cp.amount) filter(where cp.status='pending'),0)::bigint as pending_payouts,
     coalesce(sum(cp.amount) filter(where cp.status='paid' and cp.created_at>=now()-interval '30 days'),0)::bigint as paid_payouts30 from commission_payouts cp where cp.affiliate_id=a.id)p on true
   left join lateral(select af.created_at as last_followup_at,af.next_follow_up_at from affiliate_followups af where af.affiliate_id=a.id order by af.created_at desc limit 1)f on true
   order by commission30 desc,bookings30 desc,clicks30 desc,s.name`
   :await sql`select a.id,s.name,a.referral_code,a.status,coalesce(owner.name,'Chưa phân công') as sales_owner_name,
    coalesce(c.clicks30,0)::bigint as clicks30,coalesce(r.bookings30,0)::bigint as bookings30,coalesce(r.credited_orders30,0)::bigint as credited_orders30,
    coalesce(r.commission30,0)::bigint as commission30,coalesce(r.pending_orders,0)::bigint as pending_orders,
    coalesce(p.pending_payouts,0)::bigint as pending_payouts,coalesce(p.paid_payouts30,0)::bigint as paid_payouts30,
    f.last_followup_at,f.next_follow_up_at
   from affiliates a join staff s on s.id=a.user_id left join staff owner on owner.id=a.sales_owner_id
   left join lateral(select count(*)::bigint as clicks30 from affiliate_clicks c where c.affiliate_id=a.id and c.clicked_on>=current_date-29)c on true
   left join lateral(select count(*) filter(where ar.status<>'cancelled' and ar.created_at>=now()-interval '30 days')::bigint as bookings30,
     count(*) filter(where ar.status in ('approved','paid') and ar.credited_at>=now()-interval '30 days')::bigint as credited_orders30,
     coalesce(sum(ar.commission_amount) filter(where ar.status in ('approved','paid') and ar.credited_at>=now()-interval '30 days'),0)::bigint as commission30,
     count(*) filter(where ar.status='pending')::bigint as pending_orders from affiliate_referrals ar where ar.affiliate_id=a.id)r on true
   left join lateral(select coalesce(sum(cp.amount) filter(where cp.status='pending'),0)::bigint as pending_payouts,
     coalesce(sum(cp.amount) filter(where cp.status='paid' and cp.created_at>=now()-interval '30 days'),0)::bigint as paid_payouts30 from commission_payouts cp where cp.affiliate_id=a.id)p on true
   left join lateral(select af.created_at as last_followup_at,af.next_follow_up_at from affiliate_followups af where af.affiliate_id=a.id order by af.created_at desc limit 1)f on true
   where a.sales_owner_id=${actor.id}
   order by commission30 desc,bookings30 desc,clicks30 desc,s.name`;
  const now=Date.now();
  const items=rows.map((row:any)=>{
   const clicks30=Number(row.clicks30||0),bookings30=Number(row.bookings30||0),commission30=Number(row.commission30||0),pendingPayouts=Number(row.pending_payouts||0);
   const lastFollowupAt=row.last_followup_at?String(row.last_followup_at):'',nextFollowUpAt=row.next_follow_up_at?String(row.next_follow_up_at):'';
   const reasons:string[]=[];
   if(String(row.status)==='pending')reasons.push('Chờ duyệt');
   if(String(row.status)==='active'&&!lastFollowupAt)reasons.push('Chưa có chăm sóc');
   if(nextFollowUpAt&&new Date(nextFollowUpAt).getTime()<now)reasons.push('Quá hạn follow-up');
   if(String(row.status)==='active'&&clicks30>=5&&bookings30===0)reasons.push('Có click nhưng chưa ra booking');
   if(pendingPayouts>0)reasons.push('Có payout chờ');
   const attentionScore=(reasons.includes('Quá hạn follow-up')?5:0)+(pendingPayouts>0?4:0)+(reasons.includes('Chờ duyệt')?3:0)+(reasons.includes('Chưa có chăm sóc')?3:0)+(reasons.includes('Có click nhưng chưa ra booking')?2:0);
   return{id:String(row.id),name:String(row.name),referralCode:String(row.referral_code),status:String(row.status),salesOwnerName:String(row.sales_owner_name||'Chưa phân công'),clicks30,bookings30,creditedOrders30:Number(row.credited_orders30||0),commission30,pendingOrders:Number(row.pending_orders||0),pendingPayouts,paidPayouts30:Number(row.paid_payouts30||0),conversionRate:percent(bookings30,clicks30),lastFollowupAt,nextFollowUpAt,attentionReasons:reasons,attentionScore};
  });
  const clicks30=items.reduce((total,item)=>total+item.clicks30,0),bookings30=items.reduce((total,item)=>total+item.bookings30,0);
  const commission30=items.reduce((total,item)=>total+item.commission30,0),paidPayouts30=items.reduce((total,item)=>total+item.paidPayouts30,0),pendingPayouts=items.reduce((total,item)=>total+item.pendingPayouts,0);
  return NextResponse.json({ok:true,scope:canSeeAll?'all':'assigned',summary:{totalCtv:items.length,activeCtv:items.filter(item=>item.status==='active').length,clicks30,bookings30,conversionRate:percent(bookings30,clicks30),commission30,paidPayouts30,pendingPayouts,needsAttention:items.filter(item=>item.attentionScore>0).length,overdueFollowups:items.filter(item=>item.attentionReasons.includes('Quá hạn follow-up')).length},items,generatedAt:new Date().toISOString()},{headers:{'Cache-Control':'no-store, max-age=0'}});
 }catch(error){
  console.error('admin_affiliate_performance_failed',error);
  return NextResponse.json({error:'Không đọc được hiệu suất CTV.'},{status:500});
 }
}
