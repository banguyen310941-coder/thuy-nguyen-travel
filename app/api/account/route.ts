import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {clearSessionCookie,hashPassword,readSession,setSessionCookie,verifyPassword} from '@/lib/server/portal-auth';
import {authAttemptKey,loginTemporarilyBlocked,recordLoginAttempt} from '@/lib/server/auth-attempts';

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
   from bookings b where b.customer_id=${String(me.customer_id)} order by b.created_at desc limit 200`;
  return NextResponse.json({ok:true,authenticated:true,account:{id:String(me.account_id),customerId:String(me.customer_id),name:String(me.name||''),phone:String(me.phone||''),email:String(me.email||''),status:String(me.status),createdAt:String(me.account_created_at),lastLoginAt:me.last_login_at?String(me.last_login_at):''},bookings:bookings.map(shapeBooking)});
 }catch(error){console.error('customer_account_get_failed',error);return NextResponse.json({error:'Không đọc được tài khoản khách hàng.'},{status:500})}
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const body=await req.json().catch(()=>({}));const action=String(body.action||'');const sql=db();
 try{
  if(action==='register'){
   const name=String(body.name||'').trim(),phone=normalizePhone(String(body.phone||'')),email=String(body.email||'').trim().toLowerCase(),password=String(body.password||'');
   if(name.length<2||!/^0\d{9}$/.test(phone)||!emailOk(email)||password.length<8)return NextResponse.json({error:'Vui lòng nhập họ tên, SĐT hợp lệ, email và mật khẩu từ 8 ký tự.'},{status:400});
   const accountExists=await sql`select id from customer_accounts where lower(email)=${email} limit 1`;if(accountExists.length)return NextResponse.json({error:'Email này đã có tài khoản HappyGo.'},{status:409});
   const customerRows=await sql`select c.id,(select ca.id from customer_accounts ca where ca.customer_id=c.id limit 1) as account_id from customers c where c.phone=${phone} or lower(coalesce(c.email,''))=${email} order by case when c.phone=${phone} then 0 else 1 end limit 1`;
   let customerId='';
   if(customerRows[0]){
    if(customerRows[0].account_id)return NextResponse.json({error:'Hồ sơ khách hàng này đã có tài khoản đăng nhập.'},{status:409});customerId=String(customerRows[0].id);await sql`update customers set name=${name},phone=${phone},email=${email},updated_at=now() where id=${customerId}`;
   }else{const inserted=await sql`insert into customers(name,phone,email,status,source) values(${name},${phone},${email},'lead','customer_account') returning id`;customerId=String(inserted[0].id)}
   const passwordHash=hashPassword(password);const accounts=await sql`insert into customer_accounts(customer_id,email,password_hash,status,last_login_at,updated_at) values(${customerId},${email},${passwordHash},'active',now(),now()) returning id`;const accountId=String(accounts[0].id);
   const response=NextResponse.json({ok:true,authenticated:true});setSessionCookie(response,COOKIE,'customer',accountId);return response;
  }
  if(action==='login'){
   const email=String(body.email||'').trim().toLowerCase(),password=String(body.password||'');if(!emailOk(email)||!password)return NextResponse.json({error:'Email hoặc mật khẩu không hợp lệ.'},{status:400});const attemptKey=authAttemptKey(req,'customer',email);if(await loginTemporarilyBlocked(sql,attemptKey))return NextResponse.json({error:'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau khoảng 15 phút.'},{status:429});
   const rows=await sql`select id,password_hash,status from customer_accounts where lower(email)=${email} limit 1`;const account=rows[0];if(!account||!verifyPassword(password,String(account.password_hash||''))){await recordLoginAttempt(sql,attemptKey,'customer',false);return NextResponse.json({error:'Email hoặc mật khẩu không đúng.'},{status:401})}await recordLoginAttempt(sql,attemptKey,'customer',true);if(String(account.status)!=='active')return NextResponse.json({error:'Tài khoản đang bị khóa.'},{status:403});await sql`update customer_accounts set last_login_at=now(),updated_at=now() where id=${String(account.id)}`;
   const response=NextResponse.json({ok:true,authenticated:true});setSessionCookie(response,COOKIE,'customer',String(account.id));return response;
  }
  if(action==='logout'){
   const response=NextResponse.json({ok:true,authenticated:false});clearSessionCookie(response,COOKIE);return response;
  }
  return NextResponse.json({error:'Hành động không hỗ trợ.'},{status:400});
 }catch(error){console.error('customer_account_post_failed',error);return NextResponse.json({error:'Không thể xử lý tài khoản khách hàng.'},{status:500})}
}
