import {NextRequest,NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {db,hasDatabase} from '@/lib/db';
import {adminActor,type AdminActor} from '@/lib/server/admin-access';

export const dynamic='force-dynamic';
export const runtime='nodejs';

const ENTITY='admin_shared_state';
const VOUCHERS_KEY='happygo_customer_vouchers_v1';
const FORMS_KEY='happygo_booking_confirm_v1';
const OPS_KEY='happygo_booking_ops_checklist_v1';
const ORDERS_KEY='happygo_supplier_service_orders_v1';

function elevated(actor:AdminActor){return actor.role==='owner'||actor.role==='admin'||actor.permissions.includes('*')}
function operations(actor:AdminActor){return elevated(actor)||actor.role==='operations'}
function canReadAll(actor:AdminActor){return operations(actor)||actor.role==='accounting'||actor.permissions.includes('ledger')}
function array(value:unknown):any[]{return Array.isArray(value)?value:[]}
function object(value:unknown):Record<string,any>{return value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,any>: {}}
function unwrap(raw:unknown){const value=raw as any;return value&&typeof value==='object'&&'value' in value?value.value:value}
function validUuid(value:string){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)}
async function latest(key:string){const rows=await db()`select after_data from audit_logs where entity_type=${ENTITY} and entity_id=${key} order by created_at desc,id desc limit 1`;return rows[0]?unwrap(rows[0].after_data):undefined}
async function save(actor:AdminActor,key:string,value:unknown,action:string){const now=new Date().toISOString();await db()`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},${action},${ENTITY},${key},${JSON.stringify({value,updatedAt:now,updatedBy:actor.name})}::jsonb)`}

async function bookingRows(actor:AdminActor){
 const sql=db();
 const base=canReadAll(actor)?await sql`
  select b.id,b.code,b.status,b.customer_name_snapshot,b.phone_snapshot,b.email_snapshot,b.start_date,b.end_date,b.adults,b.children,b.rooms,b.selling_total_vnd,b.admin_note,b.sales_staff_id,b.sales_staff_name_snapshot,b.created_at,
   coalesce((select string_agg(bi.product_name_snapshot,', ' order by bi.id) from booking_items bi where bi.booking_id=b.id),'') product_name,
   coalesce((select string_agg(coalesce(bi.data_snapshot->>'kind','Dịch vụ'),', ' order by bi.id) from booking_items bi where bi.booking_id=b.id),'Dịch vụ') kind
  from bookings b where b.status in ('confirmed','completed') order by b.created_at desc limit 1000`
 :await sql`
  select b.id,b.code,b.status,b.customer_name_snapshot,b.phone_snapshot,b.email_snapshot,b.start_date,b.end_date,b.adults,b.children,b.rooms,b.selling_total_vnd,b.admin_note,b.sales_staff_id,b.sales_staff_name_snapshot,b.created_at,
   coalesce((select string_agg(bi.product_name_snapshot,', ' order by bi.id) from booking_items bi where bi.booking_id=b.id),'') product_name,
   coalesce((select string_agg(coalesce(bi.data_snapshot->>'kind','Dịch vụ'),', ' order by bi.id) from booking_items bi where bi.booking_id=b.id),'Dịch vụ') kind
  from bookings b where b.status in ('confirmed','completed') and b.sales_staff_id=${actor.id} order by b.created_at desc limit 1000`;
 return base.map((r:any)=>({id:String(r.id),code:String(r.code),status:String(r.status),customerName:String(r.customer_name_snapshot||''),phone:String(r.phone_snapshot||''),email:String(r.email_snapshot||''),startDate:r.start_date?String(r.start_date).slice(0,10):'',endDate:r.end_date?String(r.end_date).slice(0,10):'',adults:Number(r.adults||0),children:Number(r.children||0),rooms:Number(r.rooms||0),sellingPrice:Number(r.selling_total_vnd||0),adminNote:String(r.admin_note||''),salesStaffId:String(r.sales_staff_id||''),salesStaffName:String(r.sales_staff_name_snapshot||''),product:String(r.product_name||'Dịch vụ HappyGo'),kind:String(r.kind||'Dịch vụ'),createdAt:String(r.created_at)}))
}

function voucherReady(bookingId:string,ops:Record<string,any>,orders:any[]){const related=orders.filter(order=>String(order?.bookingId||'')===bookingId&&String(order?.status||'')!=='cancelled');return Boolean(ops[bookingId]?.voucherReady||(related.length>0&&related.every(order=>Boolean(order?.voucherReady))))}

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});const actor=await adminActor(req,'bookings');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{const [bookings,vouchersRaw,formsRaw,opsRaw,ordersRaw]=await Promise.all([bookingRows(actor),latest(VOUCHERS_KEY),latest(FORMS_KEY),latest(OPS_KEY),latest(ORDERS_KEY)]);const vouchers=array(vouchersRaw),forms=object(formsRaw),ops=object(opsRaw),orders=array(ordersRaw),allowedIds=new Set(bookings.map((booking:any)=>booking.id));const scoped=vouchers.filter(voucher=>allowedIds.has(String(voucher?.bookingId||'')));const readyIds=bookings.filter((booking:any)=>voucherReady(booking.id,ops,orders)).map((booking:any)=>booking.id);return NextResponse.json({ok:true,bookings,vouchers:scoped,forms,ops,orders,readyIds,capabilities:{edit:operations(actor),viewAll:canReadAll(actor)}} ,{headers:{'Cache-Control':'no-store, max-age=0'}})
 }catch(error){console.error('customer_vouchers_get_failed',error);return NextResponse.json({error:'Không đọc được Voucher production.'},{status:500})}
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});const actor=await adminActor(req,'bookings');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});if(!operations(actor))return NextResponse.json({error:'Chỉ Điều hành/Quản trị được cập nhật voucher.'},{status:403});const body=await req.json().catch(()=>({}));const action=String(body.action||'');
 try{const vouchers=array(await latest(VOUCHERS_KEY));
  if(action==='create'){
   const bookingId=String(body.bookingId||'');if(!validUuid(bookingId))return NextResponse.json({error:'Booking không hợp lệ.'},{status:400});const booking=(await db()`select b.id,b.code,b.status,b.customer_name_snapshot,b.phone_snapshot,b.email_snapshot,b.start_date,b.end_date,b.adults,b.children,b.rooms,b.selling_total_vnd,b.admin_note,coalesce((select string_agg(bi.product_name_snapshot,', ' order by bi.id) from booking_items bi where bi.booking_id=b.id),'') product_name,coalesce((select string_agg(coalesce(bi.data_snapshot->>'kind','Dịch vụ'),', ' order by bi.id) from booking_items bi where bi.booking_id=b.id),'Dịch vụ') kind from bookings b where b.id=${bookingId} limit 1`)[0];if(!booking)return NextResponse.json({error:'Không tìm thấy booking.'},{status:404});if(!['confirmed','completed'].includes(String(booking.status)))return NextResponse.json({error:'Booking chưa ở trạng thái xác nhận/hoàn tất.'},{status:409});const [opsRaw,ordersRaw,formsRaw]=await Promise.all([latest(OPS_KEY),latest(ORDERS_KEY),latest(FORMS_KEY)]),ops=object(opsRaw),orders=array(ordersRaw),forms=object(formsRaw);if(!voucherReady(bookingId,ops,orders))return NextResponse.json({error:'Voucher NCC chưa sẵn sàng.'},{status:409});const previous=vouchers.filter(v=>String(v?.bookingId||'')===bookingId).sort((a,b)=>Number(b?.version||0)-Number(a?.version||0))[0],version=Number(previous?.version||0)+1,related=orders.filter(order=>String(order?.bookingId||'')===bookingId&&String(order?.status||'')!=='cancelled'&&Boolean(order?.voucherReady));const now=new Date().toISOString(),voucher={id:randomUUID(),bookingId,bookingCode:String(booking.code),version,status:'draft',customerName:String(booking.customer_name_snapshot||''),phone:String(booking.phone_snapshot||''),email:String(booking.email_snapshot||''),kind:String(booking.kind||'Dịch vụ'),product:String(booking.product_name||'Dịch vụ HappyGo'),startDate:booking.start_date?String(booking.start_date).slice(0,10):'',endDate:booking.end_date?String(booking.end_date).slice(0,10):'',adults:Number(booking.adults||0),children:Number(booking.children||0),rooms:Number(booking.rooms||0),sellingPrice:Number(booking.selling_total_vnd||0),confirmation:object(forms[bookingId]),note:String(booking.admin_note||''),supplierLines:related.map(order=>({serviceType:String(order?.serviceType||'Dịch vụ'),serviceDate:String(order?.serviceDate||''),supplierName:String(order?.supplierName||''),reference:String(order?.voucherRef||order?.supplierRef||'Đã xác nhận')})),createdAt:now,createdById:actor.id,createdByName:actor.name};await save(actor,VOUCHERS_KEY,[voucher,...vouchers].slice(0,5000),'customer_voucher.create');const nextOps={...ops,[bookingId]:{...(ops[bookingId]||{}),customerConfirmationSent:false,customerConfirmationSentAt:'',customerConfirmationSentBy:'',customerConfirmationChannel:''}};await save(actor,OPS_KEY,nextOps,'booking_ops.voucher_reset');await db()`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'customer_voucher.create','booking',${bookingId},${JSON.stringify({voucherId:voucher.id,version})}::jsonb)`;return NextResponse.json({ok:true,id:voucher.id,version})
  }
  if(action==='sent'){
   const id=String(body.id||''),channel=String(body.channel||'').trim().slice(0,100);if(!id||!channel)return NextResponse.json({error:'Thiếu voucher hoặc kênh gửi.'},{status:400});const current=vouchers.find(item=>String(item?.id||'')===id);if(!current)return NextResponse.json({error:'Không tìm thấy voucher.'},{status:404});const bookingId=String(current.bookingId||''),latestVoucher=vouchers.filter(v=>String(v?.bookingId||'')===bookingId).sort((a,b)=>Number(b?.version||0)-Number(a?.version||0))[0];if(String(latestVoucher?.id||'')!==id)return NextResponse.json({error:'Chỉ phiên bản voucher mới nhất được phép gửi khách.'},{status:409});const now=new Date().toISOString(),next=vouchers.map(item=>String(item?.id||'')===id?{...item,status:'sent',sentAt:now,sentById:actor.id,sentByName:actor.name,sentChannel:channel}:item);await save(actor,VOUCHERS_KEY,next,'customer_voucher.sent');const ops=object(await latest(OPS_KEY)),nextOps={...ops,[bookingId]:{...(ops[bookingId]||{}),customerConfirmationSent:true,customerConfirmationSentAt:now,customerConfirmationSentBy:actor.name,customerConfirmationChannel:channel}};await save(actor,OPS_KEY,nextOps,'booking_ops.voucher_sent');await db()`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,after_data) values(${actor.id},'customer_voucher.sent','booking',${bookingId},${JSON.stringify({voucherId:id,version:Number(current.version||0),channel})}::jsonb)`;return NextResponse.json({ok:true})
  }
  return NextResponse.json({error:'Hành động không hỗ trợ.'},{status:400})
 }catch(error){console.error('customer_vouchers_post_failed',error);return NextResponse.json({error:'Không thể cập nhật Voucher production.'},{status:500})}
}
