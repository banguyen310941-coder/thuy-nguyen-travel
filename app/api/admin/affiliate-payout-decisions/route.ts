import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const safeUrl=(value:string)=>!value||/^https:\/\//i.test(value)?value:'';
const elevated=(actor:{role:string;permissions:string[]})=>actor.role==='owner'||actor.role==='admin'||actor.permissions.includes('*');

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const financeActor=await adminActor(req,'affiliate_finance');
 if(!financeActor)return NextResponse.json({error:'Unauthorized'},{status:401});
 const profileActor=await adminActor(req,'affiliates');
 const actor=financeActor,financeOnly=!profileActor,canSeeAll=elevated(actor)||financeOnly;
 const body=await req.json().catch(()=>({}));
 const payoutId=String(body.payoutId||''),decision=String(body.decision||''),requestId=String(body.requestId||'').trim(),receiptUrl=safeUrl(String(body.receiptUrl||'').trim());
 if(!uuid.test(payoutId)||!['paid','cancelled'].includes(decision))return NextResponse.json({error:'Yêu cầu thanh toán không hợp lệ.'},{status:400});
 if(!uuid.test(requestId))return NextResponse.json({error:'Mã yêu cầu xử lý payout không hợp lệ.'},{status:400});
 if(body.receiptUrl&&!receiptUrl)return NextResponse.json({error:'Biên nhận phải là URL HTTPS.'},{status:400});
 try{
  const sql=db();
  const payoutScope=canSeeAll
   ?(await sql`select cp.affiliate_id from commission_payouts cp where cp.id=${payoutId} limit 1`)[0]
   :(await sql`select cp.affiliate_id from commission_payouts cp join affiliates a on a.id=cp.affiliate_id where cp.id=${payoutId} and a.sales_owner_id=${actor.id} limit 1`)[0];
  if(!payoutScope)return NextResponse.json({error:'Yêu cầu thanh toán này không thuộc phạm vi phụ trách của bạn.'},{status:403});
  const affiliateId=String(payoutScope.affiliate_id),payoutLockKey=`affiliate-payout:${affiliateId}`,expectedAction=decision==='paid'?'affiliate.payout.approve':'affiliate.payout.cancel';
  if(decision==='cancelled'){
   const result=(await sql`with lock_affiliate as (
     select pg_advisory_xact_lock(hashtext(${payoutLockKey}))
    ), lock_request as (
     select pg_advisory_xact_lock(hashtext(${requestId})) from lock_affiliate
    ), existing as (
     select al.action,al.after_data
     from audit_logs al,lock_request
     where al.action in ('affiliate.payout.approve','affiliate.payout.cancel') and al.after_data->>'requestId'=${requestId}
     order by al.created_at asc limit 1
    ), target as (
     select cp.id,cp.affiliate_id,cp.amount
     from commission_payouts cp,lock_request
     where cp.id=${payoutId} and cp.status='pending' and not exists(select 1 from existing)
     for update of cp
    ), changed as (
     update commission_payouts cp set status='cancelled',updated_at=now()
     from target t where cp.id=t.id
     returning cp.id,cp.affiliate_id,cp.amount
    ), logged as (
     insert into audit_logs(actor_staff_id,action,entity_type,entity_id,before_data,after_data)
     select ${actor.id},'affiliate.payout.cancel','affiliate',c.affiliate_id::text,
      jsonb_build_object('payoutId',c.id::text,'amount',c.amount,'status','pending'),
      jsonb_build_object('payoutId',c.id::text,'amount',c.amount,'status','cancelled','decision','cancelled','requestId',${requestId},'balanceChanged',false)
     from changed c returning id
    )
    select (select action from existing limit 1) as existing_action,
     (select after_data->>'payoutId' from existing limit 1) as existing_payout_id,
     (select id::text from changed limit 1) as payout_id,
     (select amount from changed limit 1) as amount`)[0];
   if(result?.existing_action){
    if(String(result.existing_action)===expectedAction&&String(result.existing_payout_id)===payoutId)return NextResponse.json({ok:true,payoutId,idempotent:true,decision});
    return NextResponse.json({error:'Mã requestId này đã được dùng cho quyết định payout khác.'},{status:409});
   }
   if(!result?.payout_id)return NextResponse.json({error:'Yêu cầu này không còn ở trạng thái chờ.'},{status:409});
   return NextResponse.json({ok:true,payoutId:String(result.payout_id),amount:Number(result.amount||0),decision,requestId});
  }
  const result=(await sql`with lock_affiliate as (
    select pg_advisory_xact_lock(hashtext(${payoutLockKey}))
   ), lock_request as (
    select pg_advisory_xact_lock(hashtext(${requestId})) from lock_affiliate
   ), existing as (
    select al.action,al.after_data
    from audit_logs al,lock_request
    where al.action in ('affiliate.payout.approve','affiliate.payout.cancel') and al.after_data->>'requestId'=${requestId}
    order by al.created_at asc limit 1
   ), target as (
    select cp.id,cp.affiliate_id,cp.amount
    from commission_payouts cp,lock_request
    where cp.id=${payoutId} and cp.status='pending' and not exists(select 1 from existing)
    for update of cp
   ), debited as (
    update affiliates a set balance=a.balance-t.amount,updated_at=now()
    from target t where a.id=t.affiliate_id and a.balance>=t.amount
    returning a.id,a.balance+t.amount as balance_before,a.balance as balance_after
   ), finished as (
    update commission_payouts cp set status='paid',payout_date=now(),receipt_url=${receiptUrl||null},updated_at=now()
    from target t,debited d where cp.id=t.id and d.id=t.affiliate_id
    returning cp.id,cp.affiliate_id,cp.amount,d.balance_before,d.balance_after
   ), marked_referrals as (
    update affiliate_referrals ar set status='paid',updated_at=now()
    from finished f where ar.affiliate_id=f.affiliate_id and ar.status='approved' and f.balance_after=0
    returning ar.id
   ), logged as (
    insert into audit_logs(actor_staff_id,action,entity_type,entity_id,before_data,after_data)
    select ${actor.id},'affiliate.payout.approve','affiliate',f.affiliate_id::text,
     jsonb_build_object('payoutId',f.id::text,'amount',f.amount,'status','pending','balanceBefore',f.balance_before),
     jsonb_build_object('payoutId',f.id::text,'amount',f.amount,'status','paid','decision','paid','requestId',${requestId},'receiptUrl',${receiptUrl},'balanceAfter',f.balance_after)
    from finished f returning id
   )
   select (select action from existing limit 1) as existing_action,
    (select after_data->>'payoutId' from existing limit 1) as existing_payout_id,
    (select id::text from finished limit 1) as payout_id,
    (select amount from finished limit 1) as amount,
    (select balance_after from finished limit 1) as balance`)[0];
  if(result?.existing_action){
   if(String(result.existing_action)===expectedAction&&String(result.existing_payout_id)===payoutId)return NextResponse.json({ok:true,payoutId,idempotent:true,decision});
   return NextResponse.json({error:'Mã requestId này đã được dùng cho quyết định payout khác.'},{status:409});
  }
  if(!result?.payout_id)return NextResponse.json({error:'Yêu cầu không còn ở trạng thái chờ hoặc số dư CTV không đủ.'},{status:409});
  return NextResponse.json({ok:true,payoutId:String(result.payout_id),amount:Number(result.amount||0),balance:Number(result.balance||0),decision,requestId});
 }catch(error){
  console.error('affiliate_payout_decision_failed',error);
  return NextResponse.json({error:'Không thể xử lý quyết định payout CTV.'},{status:500});
 }
}
