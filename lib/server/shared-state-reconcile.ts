import {db} from '@/lib/db';
import type {AdminActor} from '@/lib/server/admin-access';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const bookingStatuses=new Set(['new','contacting','confirmed','completed','cancelled']);
const SHARED_ENTITY='admin_shared_state';

function elevated(actor:AdminActor){return actor.role==='owner'||actor.role==='admin'||actor.permissions.includes('*')}
function operator(actor:AdminActor){return elevated(actor)||actor.role==='operations'}
function finance(actor:AdminActor){return elevated(actor)||actor.role==='accounting'||actor.permissions.includes('ledger')}
function attendanceManager(actor:AdminActor){return elevated(actor)||actor.role==='accounting'}
function canSeeAllBookings(actor:AdminActor){return elevated(actor)||actor.role==='operations'||actor.role==='accounting'}
function number(value:unknown){const n=Number(value);return Number.isFinite(n)?Math.round(n):0}
function array(value:unknown):any[]{return Array.isArray(value)?value:[]}
function object(value:unknown):Record<string,any>{return value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,any>:{}}
function unwrap(raw:unknown){const value=raw as any;return value&&typeof value==='object'&&'value' in value?value.value:value}
function envelope(value:unknown,by='Hệ thống HappyGo'){return{value,updatedAt:new Date().toISOString(),updatedBy:by}}

async function latestSharedValue(key:string){
 const rows=await db()`select after_data from audit_logs where entity_type=${SHARED_ENTITY} and entity_id=${key} order by created_at desc,id desc limit 1`;
 return rows[0]?unwrap(rows[0].after_data):undefined;
}

function roomAllowed(actor:AdminActor,room:string){return elevated(actor)||room==='all'||room===actor.department}
function groupVisible(actor:AdminActor,group:any){return String(group?.ownerId||'')===actor.id||array(group?.memberIds).map(String).includes(actor.id)}
async function chatGroups(){return array(await latestSharedValue('happygo_admin_chat_groups_v4'))}
function messageVisible(actor:AdminActor,message:any,groups:any[]){
 const scope=String(message?.scope||'room');
 if(scope==='direct')return String(message?.senderId||'')===actor.id||String(message?.targetId||'')===actor.id;
 if(scope==='room')return roomAllowed(actor,String(message?.room||'all'));
 if(scope==='group'){const group=groups.find(item=>String(item?.id||'')===String(message?.groupId||''));return Boolean(group&&groupVisible(actor,group))}
 return false;
}

export async function prepareSharedRecordValue(actor:AdminActor,key:string,incoming:unknown){
 if(key==='happygo_admin_team_chat_v4'){
  const existing=array(await latestSharedValue(key)),groups=await chatGroups(),map=new Map(existing.map(item=>[String(item?.id||''),item]));
  for(const message of array(incoming)){
   const id=String(message?.id||'');if(!id)continue;const old=map.get(id);
   if(!old){if(String(message?.senderId||'')===actor.id&&messageVisible(actor,message,groups))map.set(id,message);continue}
   if(!messageVisible(actor,old,groups))continue;
   if(String(old?.senderId||'')===actor.id)map.set(id,{...old,...message,senderId:actor.id});
   else if(message?.reactions&&typeof message.reactions==='object')map.set(id,{...old,reactions:message.reactions});
  }
  return [...map.values()].slice(-5000);
 }
 if(key==='happygo_admin_chat_reads_v4'){
  const existing=object(await latestSharedValue(key)),next={...existing};for(const [id,value] of Object.entries(object(incoming)))if(id.startsWith(`${actor.id}:`))next[id]=value;return next;
 }
 if(key==='happygo_admin_chat_pins_v4'){
  const existing=object(await latestSharedValue(key)),byUser=object(existing.__byUser);return{__byUser:{...byUser,[actor.id]:object(incoming)}};
 }
 if(key==='happygo_admin_chat_groups_v4'){
  const existing=array(await latestSharedValue(key)),map=new Map(existing.map(item=>[String(item?.id||''),item]));for(const group of array(incoming)){const id=String(group?.id||'');if(!id)continue;const old=map.get(id);if(!old){if(String(group?.ownerId||'')===actor.id&&array(group?.memberIds).map(String).includes(actor.id))map.set(id,group)}else if(String(old?.ownerId||'')===actor.id)map.set(id,{...old,...group,ownerId:actor.id})}return [...map.values()];
 }
 if(key==='happygo_attendance_config_v1'){
  if(attendanceManager(actor))return incoming;return (await latestSharedValue(key))??incoming;
 }
 if(key==='happygo_attendance_records_v1'){
  const existing=array(await latestSharedValue(key)),map=new Map(existing.map(item=>[String(item?.id||''),item]));for(const record of array(incoming)){const id=String(record?.id||'');if(!id)continue;if(attendanceManager(actor)||String(record?.staffId||'')===actor.id)map.set(id,record)}return [...map.values()].slice(-10000);
 }
 if(key==='happygo_attendance_notifications_v1'){
  const existing=array(await latestSharedValue(key)),map=new Map(existing.map(item=>[String(item?.id||''),item]));for(const notice of array(incoming)){const id=String(notice?.id||'');if(id&&String(notice?.targetStaffId||'')===actor.id)map.set(id,notice)}return [...map.values()].slice(-5000);
 }
 if(key==='tn_local_bookings_v1'){
  const existing=array(await latestSharedValue(key)),map=new Map(existing.map(item=>[String(item?.code||item?.id||''),item]));for(const item of array(incoming)){const id=String(item?.code||item?.id||'');if(id)map.set(id,{...(map.get(id)||{}),...item})}return [...map.values()].slice(0,2000);
 }
 return incoming;
}

export async function reconcileSharedRecord(actor:AdminActor,key:string,value:unknown){
 if(key==='tn_local_bookings_v1')await reconcileBookings(actor,value);
 if(key==='happygo_payment_requests_v1')await reconcilePaymentRequests(actor,value);
}

async function reconcileBookings(actor:AdminActor,value:unknown){
 if(!Array.isArray(value)||!value.length)return;
 const sql=db();
 for(const raw of value.slice(0,1000) as any[]){
  const code=String(raw?.code||'').trim();if(!code)continue;
  const rows=await sql`select id,status,sales_staff_id,selling_total_vnd,cost_total_vnd,customer_name_snapshot,start_date from bookings where code=${code} limit 1`;
  const current=rows[0];if(!current)continue;
  const own=String(current.sales_staff_id||'')===actor.id;
  if(actor.role==='sales'&&!own)continue;
  const currentStatus=String(current.status||'new');const requestedStatus=String(raw?.status||currentStatus);
  if(bookingStatuses.has(requestedStatus)&&requestedStatus!==currentStatus){
   let allowed=false;
   if(operator(actor))allowed=true;
   else if(actor.role==='sales'&&own)allowed=(currentStatus==='new'&&requestedStatus==='contacting')||(currentStatus==='contacting'&&(requestedStatus==='new'||requestedStatus==='contacting'));
   if(allowed){
    const validConfirm=requestedStatus!=='confirmed'||(number(raw?.revenue??raw?.sellingTotal??current.selling_total_vnd)>0&&Boolean(raw?.start_date||current.start_date)&&Boolean(String(raw?.customer_name||current.customer_name_snapshot||'').trim()));
    if(validConfirm)await sql`update bookings set status=${requestedStatus},confirmed_at=case when ${requestedStatus}='confirmed' and confirmed_at is null then now() else confirmed_at end,completed_at=case when ${requestedStatus}='completed' and completed_at is null then now() else completed_at end,updated_at=now() where id=${String(current.id)}`;
   }
  }
  if(raw?.revenue!==undefined||raw?.sellingTotal!==undefined){
   const selling=Math.max(0,number(raw?.revenue??raw?.sellingTotal));
   if(!['confirmed','completed'].includes(currentStatus)||elevated(actor))await sql`update bookings set selling_total_vnd=${selling},updated_at=now() where id=${String(current.id)}`;
  }
  if((raw?.costPrice!==undefined||raw?.costTotal!==undefined)&&finance(actor)){
   const cost=Math.max(0,number(raw?.costPrice??raw?.costTotal));await sql`update bookings set cost_total_vnd=${cost},updated_at=now() where id=${String(current.id)}`;
  }
  if(raw?.admin_note!==undefined||raw?.adminNote!==undefined){
   if(!['confirmed','completed'].includes(currentStatus)||elevated(actor))await sql`update bookings set admin_note=${String(raw?.admin_note??raw?.adminNote??'').slice(0,12000)},updated_at=now() where id=${String(current.id)}`;
  }
  if(operator(actor)&&raw?.salesStaffId!==undefined){
   const staffId=String(raw.salesStaffId||'');
   if(!staffId)await sql`update bookings set sales_staff_id=null,sales_staff_name_snapshot=null,sales_assigned_at=null,updated_at=now() where id=${String(current.id)}`;
   else if(uuid.test(staffId)){const staff=await sql`select id,name from staff where id=${staffId} and status='active' limit 1`;if(staff[0])await sql`update bookings set sales_staff_id=${staffId},sales_staff_name_snapshot=${String(staff[0].name)},sales_assigned_at=coalesce(sales_assigned_at,now()),updated_at=now() where id=${String(current.id)}`}
  }
 }
}

async function reconcilePaymentRequests(actor:AdminActor,value:unknown){
 if(!Array.isArray(value)||actor.role==='accounting')return;
 const sql=db();
 for(const item of value.slice(0,1000) as any[]){
  const localId=String(item?.id||'');if(uuid.test(localId)||String(item?.status||'')!=='pending_director')continue;
  const bookingId=String(item?.bookingId||'');const amount=Math.max(0,number(item?.amount));const supplierName=String(item?.supplierName||'').trim();const purpose=String(item?.purpose||'').trim();
  if(!uuid.test(bookingId)||amount<=0||!supplierName||!purpose)continue;
  const bookingRows=await sql`select id,sales_staff_id from bookings where id=${bookingId} limit 1`;const booking=bookingRows[0];if(!booking)continue;
  if(actor.role==='sales'&&String(booking.sales_staff_id||'')!==actor.id)continue;
  if(!canSeeAllBookings(actor)&&actor.role!=='sales')continue;
  const serviceOrderId=String(item?.serviceOrderId||'').trim();
  if(serviceOrderId){const existing=await sql`select id from payment_requests where booking_id=${bookingId} and note like ${`%LEGACY_SERVICE_ORDER:${serviceOrderId}%`} limit 1`;if(existing.length)continue}
  else {const existing=await sql`select id from payment_requests where booking_id=${bookingId} and supplier_name_snapshot=${supplierName} and amount_vnd=${amount} and purpose=${purpose} and created_by_staff_id=${actor.id} limit 1`;if(existing.length)continue}
  const supplierId=uuid.test(String(item?.supplierId||''))?String(item.supplierId):null;
  const customerPaid=Math.max(0,number(item?.customerPaidAmount));const note=[String(item?.note||'').trim(),serviceOrderId?`LEGACY_SERVICE_ORDER:${serviceOrderId}`:''].filter(Boolean).join(' · ').slice(0,4000);
  const inserted=await sql`insert into payment_requests(booking_id,supplier_id,supplier_name_snapshot,bank_name_snapshot,account_number_snapshot,account_name_snapshot,customer_paid_amount_vnd,amount_vnd,purpose,due_date,note,status,created_by_staff_id,submitted_at,updated_at) values(${bookingId},${supplierId},${supplierName},${String(item?.bankName||'')||null},${String(item?.accountNumber||'')||null},${String(item?.accountName||'')||null},${customerPaid},${amount},${purpose},${String(item?.dueDate||'')||null},${note||null},'pending_director',${actor.id},now(),now()) returning id`;
  if(inserted[0])await sql`insert into payment_request_events(request_id,actor_staff_id,action,to_status,detail,snapshot) values(${String(inserted[0].id)},${actor.id},'created','pending_director','Đồng bộ từ đơn dịch vụ NCC',${JSON.stringify({amount,supplierName,serviceOrderId,source:'shared_state'})}::jsonb)`;
 }
}

async function bookingMirror(actor:AdminActor){
 const sql=db();const all=canSeeAllBookings(actor);
 const rows=all?await sql`select b.id,b.code,b.status,b.source,b.start_date,b.end_date,b.adults,b.children,b.rooms,b.customer_name_snapshot,b.phone_snapshot,b.email_snapshot,b.note,b.admin_note,b.selling_total_vnd,b.cost_total_vnd,b.sales_staff_id,b.sales_staff_name_snapshot,b.sales_assigned_at,b.created_at,item.product_name_snapshot,item.unit_name_snapshot,item.data_snapshot from bookings b left join lateral(select product_name_snapshot,unit_name_snapshot,data_snapshot from booking_items where booking_id=b.id order by id limit 1)item on true order by b.created_at desc limit 1000`:await sql`select b.id,b.code,b.status,b.source,b.start_date,b.end_date,b.adults,b.children,b.rooms,b.customer_name_snapshot,b.phone_snapshot,b.email_snapshot,b.note,b.admin_note,b.selling_total_vnd,b.cost_total_vnd,b.sales_staff_id,b.sales_staff_name_snapshot,b.sales_assigned_at,b.created_at,item.product_name_snapshot,item.unit_name_snapshot,item.data_snapshot from bookings b left join lateral(select product_name_snapshot,unit_name_snapshot,data_snapshot from booking_items where booking_id=b.id order by id limit 1)item on true where b.sales_staff_id=${actor.id} order by b.created_at desc limit 1000`;
 return rows.map((r:any)=>({id:String(r.id),code:String(r.code),kind:String(r.data_snapshot?.kind||'Dịch vụ'),product:String(r.product_name_snapshot||'Dịch vụ HappyGo')+(r.unit_name_snapshot?` · ${r.unit_name_snapshot}`:''),customer_name:String(r.customer_name_snapshot||''),phone:String(r.phone_snapshot||''),email:String(r.email_snapshot||''),start_date:r.start_date?String(r.start_date).slice(0,10):null,end_date:r.end_date?String(r.end_date).slice(0,10):null,adults:Number(r.adults||1),children:Number(r.children||0),rooms:Number(r.rooms||1),note:String(r.note||''),status:String(r.status),admin_note:String(r.admin_note||''),created_at:String(r.created_at),source:String(r.source||'website'),salesStaffId:r.sales_staff_id?String(r.sales_staff_id):undefined,salesStaffName:String(r.sales_staff_name_snapshot||''),salesAssignedAt:r.sales_assigned_at?String(r.sales_assigned_at):undefined,revenue:Number(r.selling_total_vnd||0),costPrice:finance(actor)&&r.cost_total_vnd!==null?Number(r.cost_total_vnd):undefined}));
}

export async function productionSharedOverrides(actor:AdminActor,requested:Set<string>){
 const sql=db();const records:Record<string,{value:unknown;updatedAt:string;updatedBy?:string}>={};const all=canSeeAllBookings(actor);
 if(requested.has('tn_local_bookings_v1'))records.tn_local_bookings_v1=envelope(await bookingMirror(actor));
 if(requested.has('happygo_customer_receipts_v1')){
  const rows=all?await sql`select p.id,p.booking_id,p.type,p.amount_vnd,p.provider,p.provider_reference,p.note,p.paid_at,p.created_at,b.code,b.customer_name_snapshot,b.sales_staff_id from payments p join bookings b on b.id=p.booking_id where p.status='paid' order by coalesce(p.paid_at,p.created_at) desc limit 2000`:await sql`select p.id,p.booking_id,p.type,p.amount_vnd,p.provider,p.provider_reference,p.note,p.paid_at,p.created_at,b.code,b.customer_name_snapshot,b.sales_staff_id from payments p join bookings b on b.id=p.booking_id where p.status='paid' and b.sales_staff_id=${actor.id} order by coalesce(p.paid_at,p.created_at) desc limit 2000`;
  records.happygo_customer_receipts_v1=envelope(rows.map((r:any)=>({id:String(r.id),bookingId:String(r.booking_id),bookingCode:String(r.code),customerName:String(r.customer_name_snapshot||''),type:String(r.type||'deposit'),amount:Number(r.amount_vnd||0),method:String(r.provider||''),transactionRef:String(r.provider_reference||''),note:String(r.note||''),paidAt:String(r.paid_at||r.created_at)})));
 }
 if(requested.has('happygo_payment_requests_v1')){
  const rows=all?await sql`select pr.*,b.code,b.customer_name_snapshot,b.sales_staff_id,coalesce((select string_agg(bi.product_name_snapshot,', ' order by bi.id) from booking_items bi where bi.booking_id=b.id),'') product_name,cb.name created_by_name from payment_requests pr join bookings b on b.id=pr.booking_id left join staff cb on cb.id=pr.created_by_staff_id order by pr.created_at desc limit 2000`:await sql`select pr.*,b.code,b.customer_name_snapshot,b.sales_staff_id,coalesce((select string_agg(bi.product_name_snapshot,', ' order by bi.id) from booking_items bi where bi.booking_id=b.id),'') product_name,cb.name created_by_name from payment_requests pr join bookings b on b.id=pr.booking_id left join staff cb on cb.id=pr.created_by_staff_id where b.sales_staff_id=${actor.id} order by pr.created_at desc limit 2000`;
  records.happygo_payment_requests_v1=envelope(rows.map((r:any)=>{const note=String(r.note||'');const match=note.match(/LEGACY_SERVICE_ORDER:([^ ·]+)/);return{id:String(r.id),bookingId:String(r.booking_id),bookingCode:String(r.code||''),customerName:String(r.customer_name_snapshot||''),product:String(r.product_name||''),customerPaidAmount:Number(r.customer_paid_amount_vnd||0),supplierId:r.supplier_id?String(r.supplier_id):'',supplierName:String(r.supplier_name_snapshot||''),bankName:String(r.bank_name_snapshot||''),accountNumber:String(r.account_number_snapshot||''),accountName:String(r.account_name_snapshot||''),amount:Number(r.amount_vnd||0),purpose:String(r.purpose||''),dueDate:r.due_date?String(r.due_date).slice(0,10):'',note,status:String(r.status),createdById:String(r.created_by_staff_id),createdByName:String(r.created_by_name||''),submittedAt:String(r.submitted_at||r.created_at),paidAmount:r.paid_amount_vnd===null?undefined:Number(r.paid_amount_vnd),paidAt:r.paid_at?String(r.paid_at):undefined,paymentMethod:String(r.payment_method||''),transactionRef:String(r.transaction_ref||''),serviceOrderId:match?.[1]||''}}));
 }
 if(requested.has('happygo_payment_suppliers_v1')){
  const rows=await sql`select id,name,bank_name,account_number,account_name,phone from suppliers order by updated_at desc,name limit 1000`;
  records.happygo_payment_suppliers_v1=envelope(rows.map((r:any)=>({id:String(r.id),name:String(r.name||''),bankName:String(r.bank_name||''),accountNumber:String(r.account_number||''),accountName:String(r.account_name||''),phone:String(r.phone||'')})));
 }
 if(requested.has('happygo_attendance_records_v1')){const value=array(await latestSharedValue('happygo_attendance_records_v1'));records.happygo_attendance_records_v1=envelope(attendanceManager(actor)?value:value.filter(item=>String(item?.staffId||'')===actor.id))}
 if(requested.has('happygo_attendance_notifications_v1')){const value=array(await latestSharedValue('happygo_attendance_notifications_v1'));records.happygo_attendance_notifications_v1=envelope(value.filter(item=>String(item?.targetStaffId||'')===actor.id))}
 if(requested.has('happygo_admin_chat_groups_v4')){const groups=await chatGroups();records.happygo_admin_chat_groups_v4=envelope(groups.filter(group=>groupVisible(actor,group)))}
 if(requested.has('happygo_admin_team_chat_v4')){const groups=await chatGroups(),messages=array(await latestSharedValue('happygo_admin_team_chat_v4'));records.happygo_admin_team_chat_v4=envelope(messages.filter(message=>messageVisible(actor,message,groups)))}
 if(requested.has('happygo_admin_chat_reads_v4')){const reads=object(await latestSharedValue('happygo_admin_chat_reads_v4')),mine:Record<string,unknown>=Object.fromEntries(Object.entries(reads).filter(([key])=>key.startsWith(`${actor.id}:`)));records.happygo_admin_chat_reads_v4=envelope(mine)}
 if(requested.has('happygo_admin_chat_pins_v4')){const value=object(await latestSharedValue('happygo_admin_chat_pins_v4')),byUser=object(value.__byUser);records.happygo_admin_chat_pins_v4=envelope(object(byUser[actor.id]))}
 return records;
}
