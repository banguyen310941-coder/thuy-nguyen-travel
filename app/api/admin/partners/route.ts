import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';

function authorized(req:NextRequest){const expected=process.env.ADMIN_API_KEY?.trim()||'';return Boolean(expected)&&(req.headers.get('x-admin-key')||'')===expected}
function productShape(row:any){const data=row.data&&typeof row.data==='object'?row.data:{};return {...data,id:String(row.id),partnerId:String(row.partner_id),partnerName:row.partner_name||'',slug:row.slug,type:row.type,name:row.name,status:row.status,summary:row.description||data.summary||'',retailPriceVnd:Number(row.retail_price_vnd||0),netPriceVnd:row.net_price_vnd==null?null:Number(row.net_price_vnd),promoPriceVnd:row.promo_price_vnd==null?null:Number(row.promo_price_vnd),updatedAt:row.updated_at,partnerPricing:Array.isArray(data.partnerPricing)?data.partnerPricing:[]}}

export async function GET(req:NextRequest){
  if(!authorized(req))return NextResponse.json({error:'Unauthorized'},{status:401});
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const sql=db();
  try{
    const partners=await sql`select p.id,p.name,p.email,p.phone,p.status,p.commission_percent,p.created_at,p.updated_at,a.contact_name,a.website,a.tax_code,a.address,a.last_login_at from partners p left join partner_accounts a on a.partner_id=p.id order by p.created_at desc`;
    const products=await sql`select pr.*,p.name as partner_name from products pr left join partners p on p.id=pr.partner_id where pr.partner_id is not null order by pr.updated_at desc`;
    return NextResponse.json({ok:true,partners:partners.map((p:any)=>({id:String(p.id),name:p.name,email:p.email||'',phone:p.phone||'',status:p.status,commissionPercent:Number(p.commission_percent||0),contact:p.contact_name||'',website:p.website||'',taxCode:p.tax_code||'',address:p.address||'',lastLoginAt:p.last_login_at,createdAt:p.created_at,updatedAt:p.updated_at})),products:products.map(productShape)});
  }catch(error){console.error('admin_partners_get_failed',error);return NextResponse.json({error:'Không đọc được dữ liệu đối tác.'},{status:500})}
}

export async function PATCH(req:NextRequest){
  if(!authorized(req))return NextResponse.json({error:'Unauthorized'},{status:401});
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const body=await req.json().catch(()=>({}));const entity=String(body.entity||''),id=String(body.id||''),status=String(body.status||'');
  const sql=db();
  try{
    if(entity==='partner'){
      if(!['pending','active','rejected','blocked'].includes(status))return NextResponse.json({error:'Trạng thái đối tác không hợp lệ.'},{status:400});
      const rows=await sql`update partners set status=${status},updated_at=now() where id=${id} returning id,status`;if(!rows.length)return NextResponse.json({error:'Không tìm thấy đối tác.'},{status:404});return NextResponse.json({ok:true,id,status});
    }
    if(entity==='product'){
      if(!['draft','review','approved','rejected'].includes(status))return NextResponse.json({error:'Trạng thái sản phẩm không hợp lệ.'},{status:400});
      const rows=await sql`update products set status=${status},updated_at=now() where id=${id} returning id,status`;if(!rows.length)return NextResponse.json({error:'Không tìm thấy sản phẩm.'},{status:404});return NextResponse.json({ok:true,id,status});
    }
    return NextResponse.json({error:'Entity không hợp lệ.'},{status:400});
  }catch(error){console.error('admin_partner_patch_failed',error);return NextResponse.json({error:'Không cập nhật được dữ liệu đối tác.'},{status:500})}
}
