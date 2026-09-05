import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';
import {hashPassword} from '@/lib/server/portal-auth';
import {settleAffiliateBooking} from '@/lib/server/affiliate';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const statuses=new Set(['pending','active','blocked']);
const codeOf=(raw:string)=>raw.toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,32);
const randomCode=()=>`CTV${Math.random().toString(36).slice(2,8).toUpperCase()}`;
const safeUrl=(value:string)=>!value||/^https:\/\//i.test(value)?value:'';
const elevated=(actor:{role:string;permissions:string[]})=>actor.role==='owner'||actor.role==='admin'||actor.permissions.includes('*');

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const profileActor=await adminActor(req,'affiliates');
 const financeActor=await adminActor(req,'affiliate_finance');
 const actor=profileActor||financeActor;
 if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 const manageAccess=Boolean(profileActor);
 const financeAccess=Boolean(financeActor);
 const approvalAccess=elevated(actor);
 const financeOnly=financeAccess&&!manageAccess;
 const canSeeAll=approvalAccess||financeOnly;
 try{
  const sql=db();
  const affiliates=canSeeAll
   ?await sql`select a.id,a.user_id,a.sales_owner_id,a.referral_code,a.phone,a.zalo,a.bank_account,a.bank_name,a.account_holder,a.total_commission,a.balance,a.commission_rate,a.status,a.created_at,a.updated_at,s.name,s.email,s.status as staff_status,owner.name as sales_owner_name,(select count(*) from affiliate_clicks c where c.affiliate_id=a.id)::bigint as click_count,(select count(*) from affiliate_referrals r where r.affiliate_id=a.id and r.status in ('approved','paid'))::bigint as closed_orders from affiliates a join staff s on s.id=a.user_id left join staff owner on owner.id=a.sales_owner_id order by a.created_at desc`
   :await sql`select a.id,a.user_id,a.sales_owner_id,a.referral_code,a.phone,a.zalo,a.bank_account,a.bank_name,a.account_holder,a.total_commission,a.balance,a.commission_rate,a.status,a.created_at,a.updated_at,s.name,s.email,s.status as staff_status,owner.name as sales_owner_name,(select count(*) from affiliate_clicks c where c.affiliate_id=a.id)::bigint as click_count,(select count(*) from affiliate_referrals r where r.affiliate_id=a.id and r.status in ('approved','paid'))::bigint as closed_orders from affiliates a join staff s on s.id=a.user_id left join staff owner on owner.id=a.sales_owner_id where a.sales_owner_id=${actor.id} order by a.created_at desc`;
  const referrals=canSeeAll
   ?await sql`select ar.id,ar.affiliate_id,ar.customer_phone,ar.commission_amount,ar.status,ar.created_at,ar.credited_at,b.id as booking_id,b.code as booking_code,b.status as booking_status,p.name as villa_name,s.name as affiliate_name from affiliate_referrals ar join affiliates a on a.id=ar.affiliate_id join staff s on s.id=a.user_id join bookings b on b.id=ar.booking_id left join products p on p.id=ar.villa_id order by ar.created_at desc limit 300`
   :await sql`select ar.id,ar.affiliate_id,ar.customer_phone,ar.commission_amount,ar.status,ar.created_at,ar.credited_at,b.id as booking_id,b.code as booking_code,b.status as booking_status,p.name as villa_name,s.name as affiliate_name from affiliate_referrals ar join affiliates a on a.id=ar.affiliate_id join staff s on s.id=a.user_id join bookings b on b.id=ar.booking_id left join products p on p.id=ar.villa_id where a.sales_owner_id=${actor.id} order by ar.created_at desc limit 300`;
  const payouts=financeAccess?(canSeeAll
   ?await sql`select cp.id,cp.affiliate_id,cp.amount,cp.status,cp.payout_date,cp.receipt_url,cp.created_at,s.name as affiliate_name,a.bank_account,a.bank_name,a.account_holder from commission_payouts cp join affiliates a on a.id=cp.affiliate_id join staff s on s.id=a.user_id order by cp.created_at desc limit 200`
   :await sql`select cp.id,cp.affiliate_id,cp.amount,cp.status,cp.payout_date,cp.receipt_url,cp.created_at,s.name as affiliate_name,a.bank_account,a.bank_name,a.account_holder from commission_payouts cp join affiliates a on a.id=cp.affiliate_id join staff s on s.id=a.user_id where a.sales_owner_id=${actor.id} order by cp.created_at desc limit 200`):[];
  const items=affiliates.map((a:any)=>({id:String(a.id),userId:String(a.user_id),salesOwnerId:a.sales_owner_id?String(a.sales_owner_id):'',salesOwnerName:String(a.sales_owner_name||'Chưa phân công'),name:String(a.name),email:String(a.email),referralCode:String(a.referral_code),phone:String(a.phone||''),zalo:String(a.zalo||''),bankAccount:String(a.bank_account||''),bankName:String(a.bank_name||''),accountHolder:String(a.account_holder||''),totalCommission:financeAccess?Number(a.total_commission||0):0,balance:financeAccess?Number(a.balance||0):0,commissionRate:financeAccess?Number(a.commission_rate||0):0,status:String(a.status),staffStatus:String(a.staff_status),clicks:Number(a.click_count||0),closedOrders:Number(a.closed_orders||0),createdAt:String(a.created_at),updatedAt:String(a.updated_at)}));
  return NextResponse.json({
   ok:true,
   manageAccess,
   financeAccess,
   approvalAccess,
   ownershipScope:canSeeAll?'all':'assigned',
   currentStaffId:actor.id,
   affiliates:items,
   referrals:referrals.map((r:any)=>({id:String(r.id),affiliateId:String(r.affiliate_id),affiliateName:String(r.affiliate_name),bookingId:String(r.booking_id),bookingCode:String(r.booking_code),bookingStatus:String(r.booking_status),villaName:String(r.villa_name||'Villa'),customerPhone:String(r.customer_phone||''),commissionAmount:financeAccess?Number(r.commission_amount||0):0,status:String(r.status),createdAt:String(r.created_at),creditedAt:r.credited_at?String(r.credited_at):''})),
   payouts:financeAccess?payouts.map((p:any)=>({id:String(p.id),affiliateId:String(p.affiliate_id),affiliateName:String(p.affiliate_name),amount:Number(p.amount||0),status:String(p.status),payoutDate:p.payout_date?String(p.payout_date):'',receiptUrl:String(p.receipt_url||''),createdAt:String(p.created_at),bankAccount:String(p.bank_account||''),bankName:String(p.bank_name||''),accountHolder:String(p.account_holder||'')})):[],
   stats:{total:items.length,active:items.filter(x=>x.status==='active').length,balance:financeAccess?items.reduce((n,x)=>n+x.balance,0):0,commission:financeAccess?items.reduce((n,x)=>n+x.totalCommission,0):0}
  });
 }catch(error){
  console.error('admin_affiliates_get_failed',error);
  return NextResponse.json({error:'Không đọc được module CTV.'},{status:500});
 }
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const profileActor=await adminActor(req,'affiliates');
 const financeActor=await adminActor(req,'affiliate_finance');
 const actor=profileActor||financeActor;
 if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 const canManage=Boolean(profileActor);
 const canFinance=Boolean(financeActor);
 const canApprove=elevated(actor);
 const financeOnly=canFinance&&!canManage;
 const canSeeAll=canApprove||financeOnly;
 const body=await req.json().catch(()=>({}));
 const action=String(body.action||'');
 if(['payout','resolve_payout','reconcile'].includes(action)&&!canFinance)return NextResponse.json({error:'Bạn không có quyền Tài chính CTV.'},{status:403});
 const sql=db();
 const ownsAffiliate=async(id:string)=>canSeeAll||Boolean((await sql`select 1 from affiliates where id=${id} and sales_owner_id=${actor.id} limit 1`)[0]);
 try{
  if(action==='create'){
   if(!canManage)return NextResponse.json({error:'Bạn không có quyền quản lý hồ sơ CTV.'},{status:403});
   const name=String(body.name||'').trim(),email=String(body.email||'').trim().toLowerCase(),password=String(body.password||''),phone=String(body.phone||'').trim(),zalo=String(body.zalo||'').trim(),bankAccount=String(body.bankAccount||'').trim(),bankName=String(body.bankName||'').trim(),accountHolder=String(body.accountHolder||'').trim(),referralCode=codeOf(String(body.referralCode||''))||randomCode(),requestedStatus=statuses.has(String(body.status))?String(body.status):'pending',status=canApprove?requestedStatus:'pending',rate=Math.max(0,Math.min(100,Number(body.commissionRate)||5));
   if(!canFinance&&rate!==5)return NextResponse.json({error:'Bạn không có quyền đặt tỷ lệ hoa hồng CTV.'},{status:403});
   if(name.length<2||!/^\S+@\S+\.\S+$/.test(email)||password.length<8)return NextResponse.json({error:'Tên, email hoặc mật khẩu CTV chưa hợp lệ.'},{status:400});
   if(referralCode.length<4)return NextResponse.json({error:'Mã giới thiệu cần ít nhất 4 ký tự.'},{status:400});
   const staffStatus=status==='active'?'active':status==='blocked'?'locked':'inactive';
   const ownerId=canApprove?null:actor.id;
   const rows=await sql`with new_staff as (insert into staff(name,email,phone,password_hash,role,department,status,permissions) values(${name},${email},${phone||null},${hashPassword(password)},'affiliate','affiliate',${staffStatus},'["affiliate"]'::jsonb) returning id) insert into affiliates(user_id,sales_owner_id,referral_code,phone,zalo,bank_account,bank_name,account_holder,commission_rate,status) select id,${ownerId},${referralCode},${phone||null},${zalo||null},${bankAccount||null},${bankName||null},${accountHolder||null},${rate},${status} from new_staff returning id,user_id,referral_code,sales_owner_id`;
   const saved=rows[0];
   await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'affiliate.create','affiliate',${String(saved.id)},${JSON.stringify({name,email,referralCode,commissionRate:rate,status,salesOwnerId:saved.sales_owner_id?String(saved.sales_owner_id):''})}::jsonb)`;
   return NextResponse.json({ok:true,id:String(saved.id),referralCode:String(saved.referral_code),status});
  }

  if(action==='update'){
   const id=String(body.id||'');
   if(!uuid.test(id))return NextResponse.json({error:'CTV không hợp lệ.'},{status:400});
   const current=(await sql`select a.*,s.name,s.email from affiliates a join staff s on s.id=a.user_id where a.id=${id} limit 1`)[0];
   if(!current)return NextResponse.json({error:'Không tìm thấy CTV.'},{status:404});
   const currentRate=Number(current.commission_rate||0),requestedRate=Math.max(0,Math.min(100,Number(body.commissionRate??current.commission_rate)||0));
   if(!canManage){
    if(!canFinance||body.commissionRate===undefined)return NextResponse.json({error:'Bạn chỉ có quyền cập nhật tài chính CTV.'},{status:403});
    if(requestedRate===currentRate)return NextResponse.json({ok:true});
    await sql`update affiliates set commission_rate=${requestedRate},updated_at=now() where id=${id}`;
    await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,before_data,after_data) values(${actor.id},'affiliate.rate','affiliate',${id},${JSON.stringify({commissionRate:currentRate})}::jsonb,${JSON.stringify({commissionRate:requestedRate})}::jsonb)`;
    return NextResponse.json({ok:true});
   }
   if(!await ownsAffiliate(id))return NextResponse.json({error:'CTV này không thuộc phạm vi phụ trách của bạn.'},{status:403});
   if(!canFinance&&requestedRate!==currentRate)return NextResponse.json({error:'Bạn không có quyền thay đổi tỷ lệ hoa hồng CTV.'},{status:403});
   const requestedStatus=statuses.has(String(body.status))?String(body.status):String(current.status);
   if(requestedStatus!==String(current.status)&&!canApprove)return NextResponse.json({error:'Chỉ Admin/Owner được kích hoạt hoặc khóa hồ sơ CTV.'},{status:403});
   const status=canApprove?requestedStatus:String(current.status),rate=requestedRate,phone=String(body.phone??current.phone??'').trim(),zalo=String(body.zalo??current.zalo??'').trim(),bankAccount=String(body.bankAccount??current.bank_account??'').trim(),bankName=String(body.bankName??current.bank_name??'').trim(),accountHolder=String(body.accountHolder??current.account_holder??'').trim(),staffStatus=status==='active'?'active':status==='blocked'?'locked':'inactive';
   const statusChanged=status!==String(current.status);
   const auditAction=statusChanged?(status==='active'?'affiliate.approve':status==='blocked'?'affiliate.block':'affiliate.pending'):'affiliate.update';
   await sql`with changed as (update affiliates set phone=${phone||null},zalo=${zalo||null},bank_account=${bankAccount||null},bank_name=${bankName||null},account_holder=${accountHolder||null},commission_rate=${rate},status=${status},updated_at=now() where id=${id} returning user_id) update staff set phone=${phone||null},status=${staffStatus},updated_at=now() where id=(select user_id from changed)`;
   await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,before_data,after_data) values(${actor.id},${auditAction},'affiliate',${id},${JSON.stringify({status:current.status,commissionRate:currentRate,salesOwnerId:current.sales_owner_id?String(current.sales_owner_id):''})}::jsonb,${JSON.stringify({status,commissionRate:rate,salesOwnerId:current.sales_owner_id?String(current.sales_owner_id):''})}::jsonb)`;
   return NextResponse.json({ok:true});
  }

  if(action==='payout'){
   const id=String(body.id||''),amount=Math.max(0,Math.round(Number(body.amount)||0)),receiptUrl=safeUrl(String(body.receiptUrl||'').trim()),requestId=String(body.requestId||'').trim()||crypto.randomUUID();
   if(!uuid.test(id)||amount<=0)return NextResponse.json({error:'Số tiền thanh toán chưa hợp lệ.'},{status:400});
   if(!await ownsAffiliate(id))return NextResponse.json({error:'CTV này không thuộc phạm vi phụ trách của bạn.'},{status:403});
   if(!uuid.test(requestId))return NextResponse.json({error:'Mã yêu cầu thanh toán không hợp lệ.'},{status:400});
   if(body.receiptUrl&&!receiptUrl)return NextResponse.json({error:'Biên nhận phải là URL HTTPS.'},{status:400});
   const result=(await sql`with lock_request as (
      select pg_advisory_xact_lock(hashtext(${requestId}))
    ), existing as (
      select al.after_data->>'payoutId' as payout_id
      from audit_logs al,lock_request
      where al.action='affiliate.payout' and al.after_data->>'requestId'=${requestId}
      order by al.created_at asc limit 1
    ), waiting as (
      select cp.id from commission_payouts cp,lock_request
      where cp.affiliate_id=${id} and cp.status='pending'
      order by cp.created_at asc limit 1
    ), debited as (
      update affiliates a set balance=a.balance-${amount},updated_at=now()
      from lock_request
      where a.id=${id} and a.balance>=${amount}
        and not exists(select 1 from existing)
        and not exists(select 1 from waiting)
      returning a.id,a.balance
    ), inserted as (
      insert into commission_payouts(affiliate_id,amount,status,payout_date,receipt_url)
      select d.id,${amount},'paid',now(),${receiptUrl||null} from debited d
      returning id,affiliate_id,amount
    ), logged as (
      insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data)
      select ${actor.id},'affiliate.payout','affiliate',i.affiliate_id::text,jsonb_build_object('amount',i.amount,'receiptUrl',${receiptUrl},'requestId',${requestId},'payoutId',i.id::text)
      from inserted i returning id
    )
    select coalesce((select payout_id from existing),(select id::text from inserted)) as payout_id,
      exists(select 1 from existing) as idempotent,
      exists(select 1 from waiting) as has_pending,
      exists(select 1 from inserted) as created,
      (select balance from affiliates where id=${id}) as balance`)[0];
   if(result?.idempotent)return NextResponse.json({ok:true,payoutId:String(result.payout_id),idempotent:true});
   if(result?.has_pending)return NextResponse.json({error:'CTV đang có yêu cầu rút tiền chờ xử lý. Hãy duyệt hoặc từ chối yêu cầu đó trước.'},{status:409});
   if(!result?.created)return NextResponse.json({error:'Số dư CTV không đủ để thanh toán.'},{status:400});
   const remainingBalance=Number(result.balance||0);
   if(remainingBalance===0)await sql`update affiliate_referrals set status='paid',updated_at=now() where affiliate_id=${id} and status='approved'`;
   return NextResponse.json({ok:true,payoutId:String(result.payout_id),requestId});
  }

  if(action==='resolve_payout'){
   const payoutId=String(body.payoutId||''),decision=String(body.decision||''),receiptUrl=safeUrl(String(body.receiptUrl||'').trim());
   if(!uuid.test(payoutId)||!['paid','cancelled'].includes(decision))return NextResponse.json({error:'Yêu cầu thanh toán không hợp lệ.'},{status:400});
   const payoutScope=canSeeAll
    ?(await sql`select cp.affiliate_id from commission_payouts cp where cp.id=${payoutId} limit 1`)[0]
    :(await sql`select cp.affiliate_id from commission_payouts cp join affiliates a on a.id=cp.affiliate_id where cp.id=${payoutId} and a.sales_owner_id=${actor.id} limit 1`)[0];
   if(!payoutScope)return NextResponse.json({error:'Yêu cầu thanh toán này không thuộc phạm vi phụ trách của bạn.'},{status:403});
   if(body.receiptUrl&&!receiptUrl)return NextResponse.json({error:'Biên nhận phải là URL HTTPS.'},{status:400});
   if(decision==='cancelled'){
    const cancelled=await sql`update commission_payouts set status='cancelled',updated_at=now() where id=${payoutId} and status='pending' returning affiliate_id,amount`;
    if(!cancelled[0])return NextResponse.json({error:'Yêu cầu này không còn ở trạng thái chờ.'},{status:409});
    await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'affiliate.payout.cancel','affiliate',${String(cancelled[0].affiliate_id)},${JSON.stringify({payoutId,amount:Number(cancelled[0].amount||0)})}::jsonb)`;
    return NextResponse.json({ok:true});
   }
   const paid=await sql`with target as (select cp.id,cp.affiliate_id,cp.amount from commission_payouts cp where cp.id=${payoutId} and cp.status='pending' for update), debited as (update affiliates a set balance=a.balance-t.amount,updated_at=now() from target t where a.id=t.affiliate_id and a.balance>=t.amount returning a.id,a.balance), finished as (update commission_payouts cp set status='paid',payout_date=now(),receipt_url=${receiptUrl||null},updated_at=now() from target t,debited d where cp.id=t.id and d.id=t.affiliate_id returning cp.id,cp.affiliate_id,cp.amount,d.balance) select * from finished`;
   if(!paid[0])return NextResponse.json({error:'Yêu cầu không còn ở trạng thái chờ hoặc số dư CTV không đủ.'},{status:409});
   const affiliateId=String(paid[0].affiliate_id),amount=Number(paid[0].amount||0),remainingBalance=Number(paid[0].balance||0);
   if(remainingBalance===0)await sql`update affiliate_referrals set status='paid',updated_at=now() where affiliate_id=${affiliateId} and status='approved'`;
   await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'affiliate.payout.approve','affiliate',${affiliateId},${JSON.stringify({payoutId,amount,receiptUrl})}::jsonb)`;
   return NextResponse.json({ok:true,payoutId,amount});
  }

  if(action==='reconcile'){
   const bookingId=String(body.bookingId||'');
   if(!uuid.test(bookingId))return NextResponse.json({error:'Booking không hợp lệ.'},{status:400});
   if(!canSeeAll){const scoped=(await sql`select 1 from affiliate_referrals ar join affiliates a on a.id=ar.affiliate_id where ar.booking_id=${bookingId} and a.sales_owner_id=${actor.id} limit 1`)[0];if(!scoped)return NextResponse.json({error:'Booking CTV này không thuộc phạm vi phụ trách của bạn.'},{status:403})}
   const amount=await settleAffiliateBooking(sql,bookingId);
   await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'affiliate.reconcile','booking',${bookingId},${JSON.stringify({commissionAmount:amount})}::jsonb)`;
   return NextResponse.json({ok:true,commissionAmount:amount});
  }

  return NextResponse.json({error:'Hành động không hỗ trợ.'},{status:400});
 }catch(error:any){
  console.error('admin_affiliates_post_failed',error);
  const text=String(error?.message||'');
  const duplicate=text.includes('staff_email_key')||text.includes('affiliates_referral_code_key');
  return NextResponse.json({error:duplicate?'Email hoặc mã giới thiệu đã được sử dụng.':'Không thể cập nhật module CTV.'},{status:duplicate?409:500});
 }
}
