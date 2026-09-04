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
    (select count(*) from products)::int partner_products,
    (select count(*) from payments where status='paid')::int receipts,
    (select count(*) from payment_requests)::int payment_requests,
    (select count(*) from accounting_entries where voided_at is null)::int accounting_entries,
    (select count(*) from customer_accounts where status='active')::int customer_accounts`,
   sql`select count(distinct entity_id)::int keys from audit_logs where entity_type='admin_shared_state'`
  ]);
  const c=counts[0] as any;
  const modules=[
   {id:'database',label:'Neon PostgreSQL',state:'ok',detail:'Kết nối đọc/ghi production',count:null},
   {id:'auth',label:'Tài khoản & phân quyền',state:Number(c.staff)>0?'ok':'warning',detail:`${Number(c.staff||0)} tài khoản nhân viên đang hoạt động`,count:Number(c.staff||0)},
   {id:'crm',label:'CRM & khách hàng',state:'ok',detail:'Dữ liệu chuẩn lưu trên Neon',count:Number(c.customers||0)},
   {id:'bookings',label:'Booking & Điều hành',state:'ok',detail:'Booking chuẩn trên Neon + trạng thái vận hành dùng chung',count:Number(c.bookings||0)},
   {id:'finance',label:'Phiếu thu · Đề xuất chi · Kế toán',state:'ok',detail:`${Number(c.receipts||0)} phiếu thu · ${Number(c.payment_requests||0)} đề xuất · ${Number(c.accounting_entries||0)} bút toán`,count:Number(c.accounting_entries||0)},
   {id:'partners',label:'Đối tác & sản phẩm đối tác',state:'ok',detail:'Tài khoản, duyệt sản phẩm, giá và hỗ trợ trên Neon',count:Number(c.partners||0)},
   {id:'customer_accounts',label:'Tài khoản khách hàng',state:'ok',detail:'Đăng nhập và lịch sử booking theo session server',count:Number(c.customer_accounts||0)},
   {id:'operations',label:'Điều hành · NCC · Voucher · CRM Pipeline',state:'ok',detail:`${Number(shared[0]?.keys||0)} vùng trạng thái đã có snapshot production; vùng chưa phát sinh sẽ tạo khi sử dụng`,count:Number(shared[0]?.keys||0)},
   {id:'cms',label:'CMS · Sản phẩm · Lịch giá · Media',state:'ok',detail:'Đồng bộ production và public catalog/site state',count:null},
   {id:'email',label:'Email Resend',state:process.env.RESEND_API_KEY&&process.env.EMAIL_FROM?'ok':'warning',detail:process.env.RESEND_API_KEY&&process.env.EMAIL_FROM?'Server đã có cấu hình gửi mail':'Chưa đủ biến môi trường gửi mail',count:null},
   {id:'drive',label:'Google Drive',state:isGoogleDriveConfigured()?'ok':'optional',detail:isGoogleDriveConfigured()?'OAuth/Service Account đã cấu hình':'Tích hợp tùy chọn; không ảnh hưởng vận hành lõi',count:null},
  ];
  return NextResponse.json({ok:true,database:true,serverTime:String(ping[0]?.now||''),modules});
 }catch(error){console.error('system_health_failed',error);return NextResponse.json({ok:false,error:'Không kiểm tra được trạng thái production.'},{status:500})}
}
