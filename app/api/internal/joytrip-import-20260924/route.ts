import {NextRequest,NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {db,hasDatabase} from '@/lib/db';
import p1 from './payload-1';
import p2 from './payload-2';
import p3 from './payload-3';
import p4 from './payload-4';
import p5 from './payload-5';
import p6 from './payload-6';
import p7 from './payload-7';
import p8 from './payload-8';

export const dynamic='force-dynamic';
export const runtime='nodejs';

const TOKEN='joytrip-20260924-e3f4b2c7a1d99814f0b79d6e3c7f2a4d';
const PAYLOAD=p1+p2+p3+p4+p5+p6+p7+p8;
type Item={matchSlug:string|null;slug:string;name:string;route:string;duration:string;departure:string;airline:string;category:string;price:number;departures:string;sourceSheet:string;sourceRow:number};
const money=(n:number)=>`${new Intl.NumberFormat('vi-VN').format(n)}đ`;

export async function GET(req:NextRequest){
 if(req.nextUrl.searchParams.get('token')!==TOKEN)return NextResponse.json({error:'Not found'},{status:404});
 if(!hasDatabase())return NextResponse.json({error:'Database unavailable'},{status:503});
 const items=JSON.parse(gunzipSync(Buffer.from(PAYLOAD,'base64')).toString('utf8')) as Item[];
 const sql=db();let updated=0,inserted=0,collisions=0;const results:any[]=[];
 for(const item of items){
  const slug=item.matchSlug||item.slug;
  const rows=await sql`select id,type,data from products where slug=${slug} limit 1`;
  const existing=rows[0] as any;
  if(existing){
   if(String(existing.type)!=='Tour'){collisions++;results.push({action:'collision',slug,type:String(existing.type)});continue}
   const data=existing.data&&typeof existing.data==='object'?existing.data:{};
   if(item.matchSlug){
    const next={...data,price:money(item.price),salePrice:money(item.price),departures:item.departures,joytripSource:{sheet:item.sourceSheet,row:item.sourceRow,importedAt:'2026-09-24'}};
    await sql`update products set retail_price_vnd=${item.price},data=${JSON.stringify(next)}::jsonb,updated_at=now() where id=${String(existing.id)}`;
   }else{
    const summary=String(data.summary||`${item.name}. Khởi hành từ ${item.departure}; giá từ ${money(item.price)}.`);
    const next={...data,category:item.category,duration:item.duration,departure:item.departure,route:item.route,airline:item.airline,transport:item.airline?`Máy bay ${item.airline} + ô tô du lịch`:'Theo chương trình',summary,price:money(item.price),salePrice:money(item.price),departures:item.departures,content:String(data.content||`Hành trình ${item.route}. Vui lòng liên hệ HappyGo Travel để xác nhận chỗ, lịch bay, visa và điều kiện áp dụng trước khi đặt.`),seoTitle:String(data.seoTitle||`${item.name} | HappyGo`),seoDescription:String(data.seoDescription||`${item.name}, khởi hành từ ${item.departure}. Giá từ ${money(item.price)}.`),joytripSource:{sheet:item.sourceSheet,row:item.sourceRow,importedAt:'2026-09-24'}};
    await sql`update products set name=${item.name},status='published',description=${summary},retail_price_vnd=${item.price},data=${JSON.stringify(next)}::jsonb,updated_at=now() where id=${String(existing.id)}`;
   }
   updated++;results.push({action:'updated',slug,name:item.name});continue;
  }
  if(item.matchSlug){results.push({action:'missing-match',slug,name:item.name});continue}
  const id=randomUUID();const summary=`${item.name}. Khởi hành từ ${item.departure}; giá từ ${money(item.price)}. Lịch khởi hành được cập nhật từ JOYTRIP.`;
  const data={category:item.category,duration:item.duration,departure:item.departure,route:item.route,airline:item.airline,transport:item.airline?`Máy bay ${item.airline} + ô tô du lịch`:'Theo chương trình',summary,price:money(item.price),salePrice:money(item.price),departures:item.departures,content:`Hành trình ${item.route}. Vui lòng liên hệ HappyGo Travel để kiểm tra chỗ, lịch bay, visa và các điều kiện áp dụng trước khi đặt.`,policies:'Lịch khởi hành và giá có thể thay đổi theo tình trạng chỗ. HappyGo Travel xác nhận lại trước khi nhận đặt dịch vụ.',seoTitle:`${item.name} | HappyGo`,seoDescription:`${item.name}, khởi hành từ ${item.departure}. Giá từ ${money(item.price)}.`,joytripSource:{sheet:item.sourceSheet,row:item.sourceRow,importedAt:'2026-09-24'}};
  await sql`insert into products(id,partner_id,slug,type,name,status,description,retail_price_vnd,net_price_vnd,promo_price_vnd,data,created_at,updated_at) values(${id},null,${item.slug},'Tour',${item.name},'published',${summary},${item.price},null,null,${JSON.stringify(data)}::jsonb,now(),now())`;
  inserted++;results.push({action:'inserted',slug:item.slug,name:item.name});
 }
 return NextResponse.json({ok:true,total:items.length,updated,inserted,collisions,results});
}
