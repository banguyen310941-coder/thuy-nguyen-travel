import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {readSession} from '@/lib/server/portal-auth';

const COOKIE='happygo_customer_auth';

type Sql=ReturnType<typeof db>;

function text(v:unknown){return String(v||'').trim()}
function missingTable(error:unknown){return Boolean(error&&typeof error==='object'&&'code' in error&&(error as {code?:string}).code==='42P01')}

async function customerActor(sql:Sql,req:NextRequest){
 const session=readSession(req,COOKIE,'customer');
 if(!session)return null;
 const rows=await sql`select ca.id as account_id,ca.status,c.id as customer_id,c.name from customer_accounts ca join customers c on c.id=ca.customer_id where ca.id=${session.id} limit 1`;
 const row=rows[0];
 if(!row||String(row.status)!=='active')return null;
 return {accountId:String(row.account_id),customerId:String(row.customer_id),name:String(row.name||'Khách hàng')};
}

async function completedBooking(sql:Sql,customerId:string,slug:string,productName:string){
 const rows=await sql`
  select b.id,b.code
  from bookings b
  join booking_items bi on bi.booking_id=b.id
  left join products p on p.id=bi.product_id
  where b.customer_id=${customerId}
    and b.status='completed'
    and (
      lower(coalesce(p.slug,''))=lower(${slug})
      or lower(coalesce(bi.data_snapshot->>'slug',''))=lower(${slug})
      or lower(coalesce(bi.data_snapshot->>'productSlug',''))=lower(${slug})
      or lower(coalesce(bi.product_name_snapshot,''))=lower(${productName})
    )
  order by coalesce(b.completed_at,b.updated_at,b.created_at) desc
  limit 1`;
 return rows[0]?{id:String(rows[0].id),code:String(rows[0].code||'')}:null;
}

export async function GET(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const slug=text(req.nextUrl.searchParams.get('slug'));
 const productName=text(req.nextUrl.searchParams.get('name'));
 if(!slug)return NextResponse.json({error:'Thiếu mã sản phẩm.'},{status:400});
 const sql=db();
 try{
  const actor=await customerActor(sql,req);
  const rows=await sql`
   select cr.id,cr.rating,cr.comment,cr.verified,cr.created_at,c.name as customer_name,b.code as booking_code
   from customer_reviews cr
   join customers c on c.id=cr.customer_id
   left join bookings b on b.id=cr.booking_id
   where cr.product_slug=${slug} and cr.status='published'
   order by cr.created_at desc
   limit 200`;
  const reviews=rows.map(r=>({id:String(r.id),customerName:String(r.customer_name||'Khách hàng'),rating:Number(r.rating||0),comment:String(r.comment||''),verified:Boolean(r.verified),bookingCode:String(r.booking_code||''),createdAt:String(r.created_at)}));
  const average=reviews.length?reviews.reduce((sum,r)=>sum+r.rating,0)/reviews.length:null;
  const booking=actor?await completedBooking(sql,actor.customerId,slug,productName):null;
  const myRows=actor?await sql`select id,rating,comment from customer_reviews where product_slug=${slug} and customer_id=${actor.customerId} limit 1`:[];
  const my=myRows[0]?{id:String(myRows[0].id),rating:Number(myRows[0].rating),comment:String(myRows[0].comment||'')}:null;
  return NextResponse.json({ok:true,reviews,average,count:reviews.length,authenticated:Boolean(actor),accountName:actor?.name||'',eligible:Boolean(booking),bookingCode:booking?.code||'',mine:my});
 }catch(error){
  if(missingTable(error))return NextResponse.json({ok:true,reviews:[],average:null,count:0,authenticated:false,eligible:false,mine:null,setupRequired:true});
  console.error('customer_reviews_get_failed',error);
  return NextResponse.json({error:'Không đọc được đánh giá khách hàng.'},{status:500});
 }
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const origin=req.headers.get('origin');
 if(origin&&origin!==req.nextUrl.origin)return NextResponse.json({error:'Yêu cầu không hợp lệ.'},{status:403});
 const body=await req.json().catch(()=>({}));
 const slug=text(body.slug),productName=text(body.productName),comment=text(body.comment),rating=Number(body.rating);
 if(!slug||!productName)return NextResponse.json({error:'Thiếu thông tin sản phẩm.'},{status:400});
 if(!Number.isInteger(rating)||rating<1||rating>10)return NextResponse.json({error:'Vui lòng chọn điểm đánh giá từ 1 đến 10.'},{status:400});
 if(comment.length<10||comment.length>2000)return NextResponse.json({error:'Nhận xét cần từ 10 đến 2.000 ký tự.'},{status:400});
 const sql=db();
 try{
  const actor=await customerActor(sql,req);
  if(!actor)return NextResponse.json({error:'Vui lòng đăng nhập tài khoản khách hàng để đánh giá.'},{status:401});
  const booking=await completedBooking(sql,actor.customerId,slug,productName);
  if(!booking)return NextResponse.json({error:'Chỉ khách đã hoàn thành booking sản phẩm này mới được đánh giá.'},{status:403});
  const products=await sql`select id,name from products where lower(slug)=lower(${slug}) limit 1`;
  const product=products[0];
  const productId=product?String(product.id):null;
  const canonicalName=product?String(product.name||productName):productName;
  const saved=await sql`
   insert into customer_reviews(product_id,product_slug,product_name_snapshot,customer_id,customer_account_id,booking_id,rating,comment,status,verified,updated_at)
   values(${productId},${slug},${canonicalName},${actor.customerId},${actor.accountId},${booking.id},${rating},${comment},'published',true,now())
   on conflict(product_slug,customer_id) do update set
    product_id=excluded.product_id,
    product_name_snapshot=excluded.product_name_snapshot,
    customer_account_id=excluded.customer_account_id,
    booking_id=excluded.booking_id,
    rating=excluded.rating,
    comment=excluded.comment,
    status='published',verified=true,updated_at=now()
   returning id`;
  return NextResponse.json({ok:true,id:String(saved[0].id)});
 }catch(error){
  if(missingTable(error))return NextResponse.json({error:'Hệ thống đánh giá đang được kích hoạt.'},{status:503});
  console.error('customer_reviews_post_failed',error);
  return NextResponse.json({error:'Không lưu được đánh giá.'},{status:500});
 }
}
