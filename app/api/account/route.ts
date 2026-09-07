import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {clearSessionCookie,hashPassword,readSession,setSessionCookie,verifyPassword} from '@/lib/server/portal-auth';
import {authAttemptKey,loginTemporarilyBlocked,recordLoginAttempt} from '@/lib/server/auth-attempts';
import {consumePublicRateLimit,publicRateKey,readBoundedJson,requestBodyTooLarge} from '@/lib/server/public-abuse';

const COOKIE='happygo_customer_auth';
function normalizePhone(raw:string){const digits=String(raw||'').replace(/\D/g,'');return digits.startsWith('84')&&digits.length===11?`0${digits.slice(2)}`:digits}
function emailOk(v:string){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
function shapeBooking(r:any){return{id:String(r.id),code:String(r.code),status:String(r.status),source:String(r.source||''),startDate:r.start_date?String(r.start_date).slice(0,10):'',endDate:r.end_date?String(r.end_date).slice(0,10):'',sellingTotal:Number(r.selling_total_vnd||0),paidTotal:Number(r.paid_total||0),salesStaffName:String(r.sales_staff_name_snapshot||''),createdAt:String(r.created_at),products:Array.isArray(r.products)?r.products:[]}}

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const session=readSession(req,COOKIE,'customer');if(!session)return NextResponse.json({ok:true,authenticated:false,account:null,bookings:[]});
 const sql=db();
 try{
  const rows=await sql`select ca.id as account_id,ca.status,ca.last_login_at,ca.created_at as account_created_at,c.id as customer_id,c.name,c.phone,c.email from customer_accounts ca join customers c on c.id=ca.customer_id where ca.id=${session.id} limit 1`;
  const me=rows[0];if(!me||String(me.status)!=='active')return NextResponse.json({ok:true,authenticated:false,account:null,bookings:[]});
  const bookings=await sql`
   select b.*,
    coalesce((select sum(p.amount_vnd) from payments p where p.booking_id=b.id and p.status='paid'),0)::bigint as paid_total,
    coalesce((select jsonb_agg(jsonb_build_object('name',bi.product_name_snapshot,'unit',coalesce(bi.unit_name_snapshot,''),'quantity',bi.quantity,'sellingPrice',bi.selling_price_vnd) order by bi.id) from booking_items bi where bi.booking_id=b.id),'[]'::jsonb) as products
   from bookings b
   where b.customer_id=${String(me.customer_id)}
    and not exists(
      select 1 from audit_logs al
      where al.entity_type='booking_account'
       and al.entity_id=b.id::text
       and al.action='booking.account.unverified'
    )
   order by b.created_at desc limit 200`;
  return NextResponse.json({ok:true,authenticated:true,account:{id:String(me.account_id),customerId:String(me.customer_id),name:String(me.name||''),phone:String(me.phone||''),email:String(me.email||''),status:String(me.status),createdAt:String(me.account_created_at),lastLoginAt:me.last_login_at?String(me.last_login_at):''},bookings:bookings.map(shapeBooking)});
 }catch(error){console.error('customer_account_get_failed',error);return NextResponse.json({error:'Không đọc được tài khoản khách hàng.'},{status:500})}
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 if(requestBodyTooLarge(req,8192))return NextResponse.json({error:'Dữ liệu tài khoản quá lớn.'},{status:413});
 const parsed=await readBoundedJson(req,8192);if(parsed.tooLarge)return NextResponse.json({error:'Dữ liệu tài khoản quá lớn.'},{status:413});
 const body=parsed.body;const action=String(body.action||'');const sql=db();
 try{
  if(action==='register'){
   const name=String(body.name||'').trim().slice(0,120),phone=normalizePhone(String(body.phone||'')),email=String(body.email||'').trim().toLowerCase().slice(0,254),password=String(body.password||'');
   if(name.length<2||!/^0\d{9}$/.test(phone)||!emailOk(email)||password.length<8)return NextResponse.json({error:'Vui lòng nhập họ tên, SĐT hợp lệ, email và mật khẩu từ 8 ký tự.'},{status:400});
   const ipAllowed=await consumePublicRateLimit(sql,{key:publicRateKey(req,'customer-register'),action:'customer.register.submit',scope:'customer-register-ip',maxHits:12,windowMinutes:60});
   if(!ipAllowed)return NextResponse.json({error:'Có quá nhiều yêu cầu tạo tài khoản từ mạng này. Vui lòng thử lại sau.'},{status:429,headers:{'Retry-After':'3600'}});
   const emailAllowed=await consumePublicRateLimit(sql,{key:publicRateKey(req,'customer-register-email',email),action:'customer.register.submit',scope:'customer-register-email',maxHits:3,windowMinutes:60});
   if(!emailAllowed)return NextResponse.json({error:'Email này đang được gửi đăng ký quá nhanh. Vui lòng thử lại sau.'},{status:429,headers:{'Retry-After':'3600'}});
   const passwordHash=hashPassword(password);
   const result=(await sql`
    with existing_customer as (
      select c.id from customers c where c.phone=${phone} or lower(coalesce(c.email,''))=${email} limit 1
    ), existing_account as (
      select ca.id from customer_accounts ca where lower(ca.email)=${email} limit 1
    ), new_customer as (
      insert into customers(name,phone,email,status,source)
      select ${name},${phone},${email},'lead','customer_account'
      where not exists(select 1 from existing_customer) and not exists(select 1 from existing_account)
      returning id
    ), new_account as (
      insert into customer_accounts(customer_id,email,password_hash,status,last_login_at,updated_at)
      select id,${email},${passwordHash},'active',now(),now() from new_customer
      returning id,customer_id
    )
    select (select id from existing_customer limit 1) as existing_customer_id,
      (select id from existing_account limit 1) as existing_account_id,
      (select id from new_account limit 1) as account_id,
      (select customer_id from new_account limit 1) as customer_id`)[0];
   if(result?.existing_customer_id||result?.existing_account_id)return NextResponse.json({error:'Hồ sơ khách hàng với SĐT hoặc email này đã tồn tại. Vui lòng đăng nhập hoặc liên hệ HappyGo để xác minh và liên kết tài khoản.'},{status:409});
   if(!result?.account_id||!result?.customer_id)throw new Error('CUSTOMER_ACCOUNT_ATOMIC_REGISTER_FAILED');
   const response=NextResponse.json({ok:true,authenticated:true});setSessionCookie(response,COOKIE,'customer',String(result.account_id));return response;
  }
  if(action==='login'){
   const email=String(body.email||'').trim().toLowerCase(),password=String(body.password||'');if(!emailOk(email)||!password)return NextResponse.json({error:'Email hoặc mật khẩu không hợp lệ.'},{status:400});const attemptKey=authAttemptKey(req,'customer',email);
   const burstAllowed=await consumePublicRateLimit(sql,{key:publicRateKey(req,'customer-login'),action:'customer.login.submit',scope:'customer-login-ip',maxHits:40,windowMinutes:15});
   if(!burstAllowed)return NextResponse.json({error:'Có quá nhiều yêu cầu đăng nhập từ mạng này. Vui lòng thử lại sau.'},{status:429,headers:{'Retry-After':'900'}});
   if(await loginTemporarilyBlocked(sql,attemptKey))return NextResponse.json({error:'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau khoảng 15 phút.'},{status:429,headers:{'Retry-After':'900'}});
   const rows=await sql`select id,password_hash,status from customer_accounts where lower(email)=${email} limit 1`;const account=rows[0];if(!account||!verifyPassword(password,String(account.password_hash||''))){await recordLoginAttempt(sql,attemptKey,'customer',false);return NextResponse.json({error:'Email hoặc mật khẩu không đúng.'},{status:401})}await recordLoginAttempt(sql,attemptKey,'customer',true);if(String(account.status)!=='active')return NextResponse.json({error:'Tài khoản đang bị khóa.'},{status:403});await sql`update customer_accounts set last_login_at=now(),updated_at=now() where id=${String(account.id)}`;
   const response=NextResponse.json({ok:true,authenticated:true});setSessionCookie(response,COOKIE,'customer',String(account.id));return response;
  }
  if(action==='logout'){
   const response=NextResponse.json({ok:true,authenticated:false});clearSessionCookie(response,COOKIE);return response;
  }
  return NextResponse.json({error:'Hành động không hỗ trợ.'},{status:400});
 }catch(error){
  console.error('customer_account_post_failed',error);const text=error instanceof Error?error.message:String(error);
  if(text.includes('customers_phone_unique')||text.includes('customer_accounts_email_key')||text.includes('customer_accounts_customer_id_key'))return NextResponse.json({error:'Hồ sơ hoặc email này vừa được đăng ký. Vui lòng đăng nhập hoặc liên hệ HappyGo nếu cần liên kết hồ sơ cũ.'},{status:409});
  return NextResponse.json({error:'Không thể xử lý tài khoản khách hàng.'},{status:500})
 }
}
