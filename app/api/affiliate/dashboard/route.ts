import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {affiliateActor,maskPhone,publicBaseUrl} from '@/lib/server/affiliate';

const clean=(value:unknown,max:number)=>String(value??'').trim().slice(0,max);
const priceMoney=(value:unknown)=>{if(typeof value==='number')return Number.isFinite(value)?Math.max(0,Math.round(value)):0;const digits=String(value??'').replace(/[^0-9]/g,'');return digits?Math.max(0,Number(digits)):0};
function mediaValues(value:unknown):string[]{
 if(Array.isArray(value))return value.flatMap(mediaValues);
 const raw=String(value??'').trim();
 if(!raw)return[];
 if(raw.startsWith('['))try{const parsed=JSON.parse(raw);if(Array.isArray(parsed))return parsed.flatMap(mediaValues)}catch{}
 return raw.split(/\n+/).map(x=>x.trim()).filter(Boolean);
}
function driveFolderUrl(value:unknown){
 const raw=String(value??'').trim();
 if(!raw)return'';
 const id=raw.match(/\/folders\/([^/?#]+)/)?.[1]||raw.match(/[?&]id=([^&#]+)/)?.[1]||'';
 if(id)return`https://drive.google.com/drive/folders/${encodeURIComponent(decodeURIComponent(id))}`;
 if(/^https?:\/\//i.test(raw))return raw;
 return`https://drive.google.com/drive/folders/${encodeURIComponent(raw)}`;
}
function unitPriceCandidates(unit:any){
 const data=unit?.data&&typeof unit.data==='object'?unit.data:{};
 return [data.lowWeekdayPrice,data.lowWeekendPrice,data.weekdayPrice||unit.retail_price_vnd,data.weekendPrice,data.highWeekdayPrice,data.highWeekendPrice,data.holidayPrice].map(priceMoney).filter(Boolean);
}
function rateIsAvailable(rate:any){
 if(Number(rate?.inventory||0)<=0)return false;
 try{const extra=JSON.parse(String(rate?.label||''));return String(extra?.status||'available')==='available'}catch{return true}
}
function publishPrice(product:any,units:any[],rates:any[]){
 const fallback=priceMoney(product.promo_price_vnd)||priceMoney(product.retail_price_vnd);
 const usesUnitPricing=['Villa & Resort','Khách sạn','Du thuyền'].includes(String(product.type||''));
 if(!usesUnitPricing)return fallback;
 const activeUnits=units.filter((unit:any)=>String(unit.product_id)===String(product.id)&&!['hidden','soldout'].includes(String(unit.status||'available')));
 const candidates=activeUnits.flatMap(unitPriceCandidates);
 for(const rate of rates){
  if(String(rate.product_id)!==String(product.id)||!rateIsAvailable(rate))continue;
  const unit=activeUnits.find((item:any)=>String(item.id)===String(rate.unit_id));
  if(unit){const value=priceMoney(rate.retail_price_vnd);if(value)candidates.push(value)}
 }
 return candidates.length?Math.min(...candidates):fallback;
}

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 try{
  const actor=await affiliateActor(req);
  if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
  const sql=db();
  const [profileRows,clickRows,orderRows,referrals,payouts,catalogProducts,catalogUnits,catalogRates]=await Promise.all([
   sql`select a.phone,a.zalo,a.bank_account,a.bank_name,a.account_holder,a.total_commission,a.balance,a.commission_rate,a.status from affiliates a where a.id=${actor.id} limit 1`,
   sql`select count(*)::bigint as total from affiliate_clicks where affiliate_id=${actor.id}`,
   sql`select count(*)::bigint as total from affiliate_referrals where affiliate_id=${actor.id} and status in ('approved','paid')`,
   sql`select ar.id,ar.customer_phone,ar.commission_amount,ar.status,ar.created_at,ar.credited_at,b.code as booking_code,b.status as booking_status,p.name as villa_name from affiliate_referrals ar join bookings b on b.id=ar.booking_id left join products p on p.id=ar.villa_id where ar.affiliate_id=${actor.id} order by ar.created_at desc limit 200`,
   sql`select id,amount,status,payout_date,receipt_url,created_at from commission_payouts where affiliate_id=${actor.id} order by created_at desc limit 100`,
   sql`select p.id,p.slug,p.type,p.name,p.retail_price_vnd,p.promo_price_vnd,p.data->>'cover' as cover,p.data->'gallery' as gallery,p.data->>'place' as place,p.data->>'sourceImageFolder' as source_image_folder from products p where ((p.partner_id is null and p.status='published') or (p.partner_id is not null and p.status='approved' and exists(select 1 from partners x where x.id=p.partner_id and x.status='active'))) order by p.updated_at desc,p.name limit 300`,
   sql`select u.id,u.product_id,u.retail_price_vnd,u.data,u.status from product_units u join products p on p.id=u.product_id where u.status<>'hidden' and ((p.partner_id is null and p.status='published') or (p.partner_id is not null and p.status='approved' and exists(select 1 from partners x where x.id=p.partner_id and x.status='active'))) order by u.name,u.id`,
   sql`select r.product_id,r.unit_id,r.retail_price_vnd,r.inventory,r.label,r.start_date,r.end_date from rate_rules r join products p on p.id=r.product_id where r.end_date>=current_date and ((p.partner_id is null and p.status='published') or (p.partner_id is not null and p.status='approved' and exists(select 1 from partners x where x.id=p.partner_id and x.status='active'))) order by r.start_date,r.id`
  ]);
  const profile=profileRows[0]||{};
  const base=publicBaseUrl(req);
  const productItems=catalogProducts.map((p:any)=>{
   const media:string[]=[];
   const productUnits=catalogUnits.filter((u:any)=>String(u.product_id)===String(p.id));
   for(const src of [p.cover,...mediaValues(p.gallery),...productUnits.flatMap((u:any)=>mediaValues(u.data?.images))]){
    const value=String(src||'').trim();
    if(value&&!media.includes(value))media.push(value);
   }
   return{
    id:String(p.id),slug:String(p.slug),type:String(p.type||''),name:String(p.name),place:String(p.place||''),cover:String(p.cover||''),publicPrice:publishPrice(p,productUnits,catalogRates),media,
    albumUrl:driveFolderUrl(p.source_image_folder),
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
