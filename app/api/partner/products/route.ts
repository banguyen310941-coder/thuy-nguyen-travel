import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {readSession} from '@/lib/server/portal-auth';

const COOKIE='happygo_partner_auth';
const allowedStatus=new Set(['draft','review']);
const toMoney=(v:unknown)=>{const n=Number(String(v??'').replace(/\D/g,''));return Number.isFinite(n)?Math.max(0,n):0};
const productType=(v:unknown)=>{const s=String(v||'Villa & Resort');return s==='Tour du lịch'?'Tour du lịch':['Villa & Resort','Khách sạn','Du thuyền'].includes(s)?s:'Villa & Resort'};
function shape(row:any){const data=row.data&&typeof row.data==='object'?row.data:{};return {...data,id:String(row.id),partnerId:String(row.partner_id),partnerName:row.partner_name||data.partnerName||'',slug:row.slug,type:row.type,name:row.name,status:row.status,summary:row.description||data.summary||'',price:data.price||String(row.promo_price_vnd||row.retail_price_vnd||''),updatedAt:row.updated_at,source:data.source||'manual'}}

export async function GET(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const session=readSession(req,COOKIE,'partner');if(!session)return NextResponse.json({error:'Unauthorized'},{status:401});
  const sql=db();
  try{const rows=await sql`select pr.*,p.name as partner_name from products pr join partners p on p.id=pr.partner_id where pr.partner_id=${session.id} order by pr.updated_at desc`;return NextResponse.json({ok:true,products:rows.map(shape)})}catch(error){console.error('partner_products_get_failed',error);return NextResponse.json({error:'Không đọc được sản phẩm.'},{status:500})}
}

export async function POST(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const session=readSession(req,COOKIE,'partner');if(!session)return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await req.json().catch(()=>({}));const product=body.product||body;
  const name=String(product.name||'').trim();if(name.length<2)return NextResponse.json({error:'Vui lòng nhập tên sản phẩm.'},{status:400});
  const status=allowedStatus.has(String(product.status))?String(product.status):'draft';
  const type=productType(product.type);const slug=String(product.slug||'').trim()||name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const retail=toMoney(product.salePrice||product.retailPrice||product.price),net=toMoney(product.agencyPrice||product.netPrice),promo=toMoney(product.promoPrice);
  const data={...product,id:undefined,partnerId:undefined,status:undefined,partnerName:undefined,source:product.source||'manual'};
  const sql=db();
  try{
    let rows:any[]=[];
    const id=String(product.id||'');
    if(/^[0-9a-f-]{36}$/i.test(id)){
      rows=await sql`update products set slug=${slug},type=${type},name=${name},status=${status},description=${String(product.summary||'')||null},retail_price_vnd=${retail},net_price_vnd=${net||null},promo_price_vnd=${promo||null},data=${JSON.stringify(data)}::jsonb,updated_at=now() where id=${id} and partner_id=${session.id} returning *`;
      if(!rows.length)return NextResponse.json({error:'Không tìm thấy sản phẩm.'},{status:404});
    }else{
      rows=await sql`insert into products(partner_id,slug,type,name,status,description,retail_price_vnd,net_price_vnd,promo_price_vnd,data) values(${session.id},${slug},${type},${name},${status},${String(product.summary||'')||null},${retail},${net||null},${promo||null},${JSON.stringify(data)}::jsonb) returning *`;
    }
    const partner=await sql`select name from partners where id=${session.id}`;
    return NextResponse.json({ok:true,product:shape({...rows[0],partner_name:partner[0]?.name||''})});
  }catch(error:any){
    console.error('partner_product_save_failed',error);
    const duplicate=String(error?.message||'').includes('products_slug_key');
    return NextResponse.json({error:duplicate?'Đường dẫn sản phẩm đã tồn tại. Hãy đổi slug.':'Không thể lưu sản phẩm.'},{status:duplicate?409:500});
  }
}

export async function DELETE(req:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
  const session=readSession(req,COOKIE,'partner');if(!session)return NextResponse.json({error:'Unauthorized'},{status:401});
  const id=req.nextUrl.searchParams.get('id')||'';if(!id)return NextResponse.json({error:'Missing product id'},{status:400});
  const sql=db();
  try{const rows=await sql`delete from products where id=${id} and partner_id=${session.id} and status<>'approved' returning id`;if(!rows.length)return NextResponse.json({error:'Sản phẩm đã duyệt không thể xóa trực tiếp hoặc không tồn tại.'},{status:409});return NextResponse.json({ok:true})}catch(error){console.error('partner_product_delete_failed',error);return NextResponse.json({error:'Không thể xóa sản phẩm.'},{status:500})}
}
