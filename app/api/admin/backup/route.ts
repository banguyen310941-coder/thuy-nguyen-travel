import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';

export const dynamic='force-dynamic';
export const runtime='nodejs';

type Section=Record<string,unknown[]>;
function owner(actor:{role:string;permissions:string[]}){return actor.role==='owner'||actor.permissions.includes('*')}
function data(row:any){return Array.isArray(row?.data)?row.data:[]}
function stamp(){return new Date().toISOString().replace(/[:.]/g,'-')}

async function buildBackup(){
 const sql=db();
 const [staff,customers,assignments,rotation,partners,partnerAccounts,products,units,rates,bookings,bookingItems,payments,activities,supportTickets,supportMessages,suppliers,paymentRequests,paymentEvents,accountingEntries,accountingBalances,customerAccounts,sharedRows,availabilityRows]=await Promise.all([
  sql`select coalesce(jsonb_agg(to_jsonb(t)-'password_hash'-'password'-'password_salt'),'[]'::jsonb) data from staff t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from customers t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from customer_assignments t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from sales_rotation t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from partners t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)-'password_hash'-'password'-'password_salt'),'[]'::jsonb) data from partner_accounts t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from products t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from product_units t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from rate_rules t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from bookings t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from booking_items t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from payments t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from crm_activities t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from partner_support_tickets t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from partner_support_messages t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from suppliers t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from payment_requests t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from payment_request_events t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from accounting_entries t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) data from accounting_balances t`,
  sql`select coalesce(jsonb_agg(to_jsonb(t)-'password_hash'-'password'-'password_salt'),'[]'::jsonb) data from customer_accounts t`,
  sql`select distinct on(entity_id) entity_id,after_data,created_at from audit_logs where entity_type='admin_shared_state' order by entity_id,created_at desc,id desc`,
  sql`select distinct on(entity_id) entity_id,after_data,created_at from audit_logs where entity_type='sales_availability' order by entity_id,created_at desc,id desc`,
 ]);
 const relational:Section={staff:data(staff[0]),customers:data(customers[0]),customer_assignments:data(assignments[0]),sales_rotation:data(rotation[0]),partners:data(partners[0]),partner_accounts:data(partnerAccounts[0]),products:data(products[0]),product_units:data(units[0]),rate_rules:data(rates[0]),bookings:data(bookings[0]),booking_items:data(bookingItems[0]),payments:data(payments[0]),crm_activities:data(activities[0]),partner_support_tickets:data(supportTickets[0]),partner_support_messages:data(supportMessages[0]),suppliers:data(suppliers[0]),payment_requests:data(paymentRequests[0]),payment_request_events:data(paymentEvents[0]),accounting_entries:data(accountingEntries[0]),accounting_balances:data(accountingBalances[0]),customer_accounts:data(customerAccounts[0])};
 const sharedState=Object.fromEntries(sharedRows.map((row:any)=>[String(row.entity_id),{afterData:row.after_data,createdAt:String(row.created_at)}]));
 const salesAvailability=Object.fromEntries(availabilityRows.map((row:any)=>[String(row.entity_id),{afterData:row.after_data,createdAt:String(row.created_at)}]));
 const records=Object.values(relational).reduce((sum,items)=>sum+items.length,0)+sharedRows.length+availabilityRows.length;
 return{kind:'happygo-production-backup',schemaVersion:2,app:'HappyGo Travel',createdAt:new Date().toISOString(),source:'Neon production + server shared state',summary:{sections:Object.keys(relational).length+2,records},relational,sharedState,salesAvailability};
}

export async function GET(req:NextRequest){if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});const actor=await adminActor(req);if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});if(!owner(actor))return NextResponse.json({error:'Chỉ Chủ tài khoản được xuất bản sao lưu production.'},{status:403});try{const backup=await buildBackup();if(req.nextUrl.searchParams.get('meta')==='1')return NextResponse.json({ok:true,createdAt:backup.createdAt,summary:backup.summary,source:backup.source},{headers:{'Cache-Control':'no-store, max-age=0'}});const body=JSON.stringify(backup,null,2);return new NextResponse(body,{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':`attachment; filename="happygo-production-backup_${stamp()}.json"`,'Cache-Control':'no-store, max-age=0'}})}catch(error){console.error('production_backup_failed',error);return NextResponse.json({error:'Không thể tạo bản sao lưu production.'},{status:500})}}
