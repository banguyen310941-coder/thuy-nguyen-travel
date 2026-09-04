import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {affiliateActor,maskPhone,publicBaseUrl} from '@/lib/server/affiliate';

const clean=(value:unknown,max:number)=>String(value??'').trim().slice(0,max);
const mediaLines=(value:unknown)=>String(value||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 try{
  const actor=await affiliateActor(req);
  if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
  const sql=db();
  const [profileRows,clickRows,orderRows,referrals,payouts,catalogProducts,catalogUnits]=await Promise.all([
   sql`select a.phone,a.zalo,a.bank_account,a.bank_name,a.account_holder,a.total_commission,a.balance,a.commission_rate,a.status from affiliates a where a.id=${actor.id} limit 1`,
   sql`select count(*)::bigint as total from affiliate_clicks where affiliate_id=${actor.id}`,
   sql`select count(*)::bigint as total from affiliate_referrals where affiliate_id=${actor.id} and status in ('approved','paid')`,
   sql`select ar.id,ar.customer_phone,ar.commission_amount,ar.status,ar.created_at,ar.credited_at,b.code as booking_code,b.status as booking_status,p.name as villa_name from affiliate_referrals ar join bookings b on b.id=ar.booking_id left join products p on p.id=ar.villa_id where ar.affiliate_id=${actor.id} order by ar.created_at desc limit 200`,
   sql`select id,amount,status,payout_date,receipt_url,created_at from commission_payouts where affiliate_id=${actor.id} order by created_at desc limit 100`,
   sql`select p.id,p.slug,p.type,p.name,p.retail_price_vnd,p.promo_price_vnd,p.data->>'cover' as cover,p.data->>'gallery' as gallery,p.data->>'place' as place,p.data->>'sourceImageFolder' as source_image_folder from products p where ((p.partner_id is null and p.status='published') or (p.partner_id is not null and p.status='approved' and exists(select 1 from partners x where x.id=p.partner_id and x.status='active'))) order by p.updated_at desc,p.name limit 300`,
   sql`select u.product_id,u.data->>'images' as images from product_units u join products p on p.id=u.product_id where u.status<>'hidden' and ((p.partner_id is null and p.status='published') or (p.partner_id is not null and p.status='approved' and exists(select 1 from partners x where x.id=p.partner_id and x.status='active'))) order by u.name,u.id`
  ]);
  const profile=profileRows[0]||{};
  const base=publicBaseUrl(req);
  const productItems=catalogProducts.map((p:any)=>{
   const media:string[]=[];
   for(const src of [p.cover,...mediaLines(p.gallery),...catalogUnits.filter((u:any)=>String(u.product_id)===String(p.id)).flatMap((u:any)=>mediaLines(u.images))]){
    const value=String(src||'').trim();
    if(value&&!media.includes(value))media.push(value);
   }
   const folderId=String(p.source_image_folder||'').trim();
   return{
    id:String(p.id),slug:String(p.slug),type:String(p.type||''),name:String(p.name),place:String(p.place||''),cover:String(p.cover||''),publicPrice:Number(p.promo_price_vnd||p.retail_price_vnd||0),media,
    albumUrl:folderId?`https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}`:'',
    affiliateLink:`${base}/product?slug=${encodeURIComponent(String(p.slug))}&ref=${encodeURIComponent(actor.referralCode)}&villa_id=${encodeURIComponent(String(p.id))}`
   };
  });
  const villaItems=productItems.filter((item:any)=>item.type==='Villa & Resort');
  return NextResponse.json({
   ok:true,
   affiliate:{id:actor.id,name:actor.name,email:actor.email,referralCode:actor.referralCode,phone:String(profile.phone||''),zalo:String(profile.zalo||''),bankAccount:String(profile.bank_account||''),bankName:String(profile.bank_name||''),accountHolder:String(profile.account_holder||''),totalCommission:Number(profile.total_commission||0),balance:Number(profile.balance||0),commissionRate:Number(profile.commission_rate||0),status:String(profile.status||actor.status)},
   stats:{clicks:Number(clickRows[0]?.total||0),closedOrders:Number(orderRows[0]?.total||0)},
   products:productItems,
   villas:villaItems,
   referrals:referrals.map((r:any)=>({id:String(r.id),bookingCode:String(r.booking_code),bookingStatus:String(r.booking_status),villaName:String(r.villa_name||'Sản phẩm'),customerPhone:maskPhone(r.customer_phone),commissionAmount:Number(r.commission_amount||0),status:String(r.status),createdAt:String(r.created_at),creditedAt:r.credited_at?String(r.credited_at):''})),
   payouts:payouts.map((p:any)=>({id:String(p.id),amount:Number(p.amount||0),status:String(p.status),payoutDate:p.payout_date?String(p.payout_date):'',receiptUrl:String(p.receipt_url||''),createdAt:String(p.created_at)}))
  },{headers:{'Cache-Control':'no-store, max-age=0'}});
 }catch(error){
  console.error('affiliate_dashboard_failed',error);
  return NextResponse.json({error:'Không đọc được dashboard CTV.'},{status:500});
 }
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 try{
  const actor=await affiliateActor(req);
  if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await req.json().catch(()=>({}));
  const action=String(body.action||'');
  const sql=db();

  if(action==='update_profile'){
   const phone=clean(body.phone,30),zalo=clean(body.zalo,80),bankName=clean(body.bankName,120),bankAccount=clean(body.bankAccount,64).replace(/\s+/g,''),accountHolder=clean(body.accountHolder,120).toUpperCase();
   if(bankAccount&&(!/^[0-9A-Za-z.-]+$/.test(bankAccount)||bankAccount.length<4))return NextResponse.json({error:'Số tài khoản chưa hợp lệ.'},{status:400});
   if(accountHolder&&accountHolder.length<2)return NextResponse.json({error:'Tên chủ tài khoản chưa hợp lệ.'},{status:400});
   await sql`with changed as (update affiliates set phone=${phone||null},zalo=${zalo||null},bank_name=${bankName||null},bank_account=${bankAccount||null},account_holder=${accountHolder||null},updated_at=now() where id=${actor.id} returning user_id) update staff set phone=${phone||null},updated_at=now() where id=(select user_id from changed)`;
   await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.userId},'affiliate.profile.update','affiliate',${actor.id},${JSON.stringify({phone,zalo,bankName,bankAccount:bankAccount?`***${bankAccount.slice(-4)}`:'',accountHolder})}::jsonb)`;
   return NextResponse.json({ok:true});
  }

  if(action==='request_payout'){
   const amount=Math.max(0,Math.round(Number(body.amount)||0));
   if(amount<=0)return NextResponse.json({error:'Số tiền yêu cầu chưa hợp lệ.'},{status:400});
   const profile=(await sql`select balance,bank_account,bank_name,account_holder from affiliates where id=${actor.id} and status='active' limit 1`)[0];
   if(!profile)return NextResponse.json({error:'Tài khoản CTV chưa sẵn sàng.'},{status:400});
   if(!profile.bank_account||!profile.bank_name||!profile.account_holder)return NextResponse.json({error:'Vui lòng cập nhật đủ ngân hàng, số tài khoản và chủ tài khoản trước khi rút tiền.'},{status:400});
   if(amount>Number(profile.balance||0))return NextResponse.json({error:'Số tiền yêu cầu vượt quá số dư hiện có.'},{status:400});
   const existing=(await sql`select id from commission_payouts where affiliate_id=${actor.id} and status='pending' order by created_at desc limit 1`)[0];
   if(existing)return NextResponse.json({error:'Bạn đang có một yêu cầu rút tiền chờ HappyGo xử lý.'},{status:409});
   const rows=await sql`insert into commission_payouts(affiliate_id,amount,status) select ${actor.id},${amount},'pending' where exists(select 1 from affiliates where id=${actor.id} and status='active' and balance>=${amount}) and not exists(select 1 from commission_payouts where affiliate_id=${actor.id} and status='pending') returning id`;
   if(!rows[0])return NextResponse.json({error:'Không thể tạo yêu cầu. Vui lòng tải lại số dư và thử lại.'},{status:409});
   await sql`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.userId},'affiliate.payout.request','affiliate',${actor.id},${JSON.stringify({payoutId:String(rows[0].id),amount})}::jsonb)`;
   return NextResponse.json({ok:true,payoutId:String(rows[0].id)});
  }

  return NextResponse.json({error:'Hành động không hỗ trợ.'},{status:400});
 }catch(error){
  console.error('affiliate_dashboard_post_failed',error);
  return NextResponse.json({error:'Không thể cập nhật tài khoản CTV.'},{status:500});
 }
}
