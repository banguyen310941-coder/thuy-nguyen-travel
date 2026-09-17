import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {SafeImage} from '@/components/SafeImage';
import {getPublicSiteState} from '@/lib/server/public-site-state';
import {getSiteUrl} from '@/lib/site-url';
import {getProductProvince,productProvinces,provinceMatchesText,provinceProductHref,provinceServiceHref} from '@/data/product-provinces';
import styles from '../ProvinceProducts.module.css';

export const revalidate=60;

type Product={id?:string;name?:string;slug?:string;place?:string;status?:string;type?:string;summary?:string;cover?:string;price?:string;rating?:string};
type Props={params:Promise<{slug:string}>};
const order=['Villa & Resort','Khách sạn','Du thuyền','Tour'];

export function generateStaticParams(){return productProvinces.map(item=>({slug:item.slug}))}

export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params,province=getProductProvince(slug);if(!province)return{};
 const title=`Sản phẩm du lịch ${province.name}: Villa, khách sạn & dịch vụ`;
 const description=`Xem sản phẩm HappyGo Travel tại ${province.name}: ${province.description} Chọn đúng dịch vụ và xem chi tiết trước khi đặt.`;
 return{title,description,alternates:{canonical:`/san-pham/tinh-thanh/${province.slug}`},openGraph:{title:`${title} | HappyGo Travel`,description,url:`${getSiteUrl()}/san-pham/tinh-thanh/${province.slug}`,type:'website'}};
}

export default async function ProductProvincePage({params}:Props){
 const {slug}=await params,province=getProductProvince(slug);if(!province)notFound();
 const state=await getPublicSiteState();
 const products=((Array.isArray(state.tn_cms_products_v3_units)?state.tn_cms_products_v3_units:[]) as Product[])
  .filter(item=>item.status==='published'&&item.slug&&provinceMatchesText(province,`${item.place||''} ${item.name||''}`))
  .sort((a,b)=>order.indexOf(String(a.type||''))-order.indexOf(String(b.type||''))||String(a.name||'').localeCompare(String(b.name||''),'vi'));
 const groups=order.map(type=>({type,items:products.filter(item=>item.type===type)})).filter(group=>group.items.length);
 const base=getSiteUrl(),canonical=`${base}/san-pham/tinh-thanh/${province.slug}`;
 const schema=[
  {'@context':'https://schema.org','@type':'CollectionPage',name:`Sản phẩm du lịch tại ${province.name}`,url:canonical,description:province.description},
  {'@context':'https://schema.org','@type':'ItemList',itemListElement:products.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,url:`${base}${provinceProductHref(item)}`}))},
 ];
 return <main className={styles.page}>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
  <section className={styles.hero}><div className={styles.inner}><div className={styles.crumb}><Link href="/">Trang chủ</Link> / <Link href="/san-pham/tinh-thanh">Sản phẩm theo tỉnh thành</Link> / {province.name}</div><h1>Sản phẩm du lịch tại {province.name}</h1><p>{province.description} Hiện HappyGo đang có {products.length} sản phẩm được xuất bản tại khu vực này.</p></div></section>
  <section className={styles.section}><div className={styles.inner}>
   {groups.length?<div className={styles.serviceNav}>{groups.map(group=><a key={group.type} href={`#${encodeURIComponent(group.type)}`}>{group.type} ({group.items.length})</a>)}</div>:null}
   {groups.map(group=><section key={group.type} id={group.type} className={styles.sectionBlock}><div className={styles.sectionHead}><h2>{group.type} tại {province.name}</h2><Link href={provinceServiceHref(province,group.type)}>Xem theo bộ lọc {group.type} →</Link></div><div className={styles.grid}>{group.items.map(item=><article className={styles.card} key={item.id||item.slug}><SafeImage src={item.cover} alt={`${item.name||group.type} tại ${province.name}`}/><div className={styles.cardBody}><span className={styles.type}>{item.type}</span><h3>{item.name}</h3><div className={styles.place}>📍 {item.place||province.name}</div>{item.summary?<p className={styles.summary}>{item.summary}</p>:null}<div className={styles.cardFooter}><span className={styles.price}>{item.price||'Liên hệ giá tốt'}</span><Link className={styles.view} href={provinceProductHref(item)}>Xem chi tiết →</Link></div></div></article>)}</div></section>)}
   {!products.length?<div className={styles.empty}>Hiện chưa có sản phẩm đang xuất bản tại {province.name}. HappyGo sẽ tự bổ sung trang này khi có sản phẩm mới.</div>:null}
   <div className={styles.allLink}><Link href="/san-pham/tinh-thanh">← Xem các tỉnh/thành khác</Link></div>
  </div></section>
 </main>
}
