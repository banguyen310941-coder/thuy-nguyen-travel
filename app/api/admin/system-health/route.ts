import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {adminActor} from '@/lib/server/admin-access';
import {isGoogleDriveConfigured} from '@/lib/server/google-drive';

export const dynamic='force-dynamic';

export async function GET(req:NextRequest){
 const actor=await adminActor(req);if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 if(!hasDatabase())return NextResponse.json({ok:false,database:false,modules:[]},{status:503});
 try{
  const sql=db();
  const [ping,counts,shared]=await Promise.all([
   sql`select now() as now`,
   sql`select
    (select count(*) from staff where status='active')::int staff,
    (select count(*) from customers)::int customers,
    (select count(*) from bookings)::int bookings,
    (select count(*) from partners)::int partners,
    (select count(*) from products where partner_id is null)::int internal_products,
    (select count(*) from products where partner_id is not null)::int partner_products,
    (select count(*) from product_units u join products p on p.id=u.product_id where p.partner_id is null)::int internal_units,
    (select count(*) from rate_rules r join products p on p.id=r.product_id where p.partner_id is null)::int internal_rates,
    (select count(*) from payments where status='paid')::int receipts,
    (select count(*) from payment_requests)::int payment_requests,
    (select count(*) from accounting_entries where voided_at is null)::int accounting_entries,
    (select count(*) from customer_accounts where status='active')::int customer_accounts`,
   sql`select entity_id,max(created_at) updated_at from audit_logs where entity_type='admin_shared_state' group by entity_id`
  ]);
  const c=counts[0] as any,sharedKeys=new Set(shared.map((row:any)=>String(row.entity_id))),sharedCount=sharedKeys.size;
  const hasContent=sharedKeys.has('tn_cms_articles_v3')||sharedKeys.has('tn_cms_tours_v3')||sharedKeys.has('tn_cms_homepage');
  const hasMedia=sharedKeys.has('tn_cms_media_images_v2');
  const hasAttendance=sharedKeys.has('happygo_attendance_config_v1')||sharedKeys.has('happygo_attendance_records_v1');
  const hasChat=sharedKeys.has('happygo_admin_team_chat_v4')||sharedKeys.has('happygo_admin_chat_groups_v4');
  const drive=isGoogleDriveConfigured(),email=Boolean(process.env.RESEND_API_KEY&&process.env.EMAIL_FROM);
  const modules=[
   {id:'database',label:'Neon PostgreSQL',state:'ok',detail:'Kết nối đọc/ghi production',count:null},
   {id:'auth',label:'Tài khoản & phân quyền',state:Number(c.staff)>0?'ok':'warning',detail:`${Number(c.staff||0)} tài khoản nhân viên đang hoạt động`,count:Number(c.staff||0)},
   {id:'crm',label:'CRM & khách hàng',state:'ok',detail:'Dữ liệu chuẩn lưu trên Neon',count:Number(c.customers||0)},
   {id:'bookings',label:'Booking & Điều hành',state:'ok',detail:'Booking chuẩn trên Neon + trạng thái vận hành dùng chung',count:Number(c.bookings||0)},
   {id:'finance',label:'Phiếu thu · Đề xuất chi · Kế toán',state:'ok',detail:`${Number(c.receipts||0)} phiếu thu · ${Number(c.payment_requests||0)} đề xuất · ${Number(c.accounting_entries||0)} bút toán`,count:Number(c.accounting_entries||0)},
   {id:'partners',label:'Đối tác & sản phẩm đối tác',state:'ok',detail:`Tài khoản, duyệt, giá và hỗ trợ trên Neon · ${Number(c.partner_products||0)} sản phẩm đối tác`,count:Number(c.partners||0)},
   {id:'customer_accounts',label:'Tài khoản khách hàng',state:'ok',detail:'Đăng nhập và lịch sử booking theo session server',count:Number(c.customer_accounts||0)},
   {id:'catalog',label:'Sản phẩm nội bộ',state:'ok',detail:`Neon products/product_units · ${Number(c.internal_products||0)} sản phẩm · ${Number(c.internal_units||0)} đơn vị bán`,count:Number(c.internal_products||0)},
   {id:'rates',label:'Lịch giá & tồn',state:'ok',detail:`Neon rate_rules · ${Number(c.internal_rates||0)} khoảng giá đang lưu`,count:Number(c.internal_rates||0)},
   {id:'content',label:'Trang chủ · Tour CMS · Bài viết',state:'ok',detail:hasContent?'API production riêng đã có dữ liệu; public site-state đang phục vụ website':'API production riêng sẵn sàng; chưa phát sinh nội dung CMS mới',count:null},
   {id:'attendance',label:'Chấm công',state:'ok',detail:hasAttendance?'Shared-state production; server giới hạn nhân viên sửa công của chính mình và quản lý chỉnh theo vai trò':'Server reconciliation và phân quyền đã sẵn sàng; chưa phát sinh dữ liệu chấm công',count:null},
   {id:'chat',label:'Chat nội bộ',state:'ok',detail:hasChat?'Shared-state production; server kiểm phạm vi phòng, tin nhắn trực tiếp và nhóm':'Server kiểm phạm vi phòng/direct/group đã sẵn sàng; chưa phát sinh dữ liệu chat',count:null},
   {id:'operations',label:'Điều hành · NCC · Voucher · CRM Pipeline',state:'ok',detail:`${sharedCount} vùng trạng thái server đã phát sinh; vùng chưa dùng sẽ tạo khi thao tác`,count:sharedCount},
   {id:'media',label:'Media',state:'optional',detail:hasMedia?'Danh mục ảnh/URL HTTPS đang đồng bộ production; upload file cloud riêng chưa nối':'Có thể dùng URL HTTPS/CDN dùng chung; upload file cloud riêng là tích hợp tùy chọn',count:null},
   {id:'email',label:'Email Resend',state:email?'ok':'warning',detail:email?'Server đã có cấu hình gửi mail':'Chưa đủ biến môi trường gửi mail',count:null},
   {id:'drive',label:'Google Drive',state:drive?'ok':'optional',detail:drive?'OAuth/Service Account đã cấu hình cho luồng đọc Drive':'Tích hợp đọc file tùy chọn; chưa hoàn tất OAuth',count:null},
  ];
  return NextResponse.json({ok:true,database:true,serverTime:String(ping[0]?.now||''),modules});
 }catch(error){console.error('system_health_failed',error);return NextResponse.json({ok:false,error:'Không kiểm tra được trạng thái production.'},{status:500})}
}
