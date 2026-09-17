import type {Metadata} from 'next';
import Link from 'next/link';
import {getPublicSiteState} from '@/lib/server/public-site-state';
import {productProvinces,provinceMatchesText} from '@/data/product-provinces';
import styles from './ProvinceProducts.module.css';

export const revalidate=60;
export const metadata:Metadata={
 title:'Sản phẩm du lịch theo tỉnh thành | HappyGo Travel',
 description:'Tìm villa, resort, khách sạn, du thuyền và tour của HappyGo Travel theo từng tỉnh thành đang có sản phẩm.',
 alternates:{canonical:'/san-pham/tinh-thanh'},
};

type Product={name?:string;place?:string;status?:string;type?:string};

export default async function ProductProvinceIndex(){
 const state=await getPublicSiteState();
 const products=(Array.isArray(state.tn_cms_products_v3_units)?state.tn_cms_products_v3_units:[]) as Product[];
 const published=products.filter(item=>item.status==='published');
 const provinces=productProvinces.map(province=>({province,count:published.filter(item=>provinceMatchesText(province,`${item.place||''} ${item.name||''}`)).length})).filter(item=>item.count>0);
 return <main className={styles.page}>
  <section className={styles.hero}><div className={styles.inner}><div className={styles.crumb}><Link href="/">Trang chủ</Link> / Sản phẩm theo tỉnh thành</div><h1>Sản phẩm du lịch theo tỉnh thành</h1><p>Chọn tỉnh/thành để xem toàn bộ villa, resort, khách sạn, du thuyền và dịch vụ HappyGo Travel đang có tại khu vực đó.</p></div></section>
  <section className={styles.section}><div className={styles.inner}><div className={styles.provinceGrid}>{provinces.map(({province,count})=><Link key={province.slug} href={`/san-pham/tinh-thanh/${province.slug}`} className={styles.provinceCard}><h2>{province.name}</h2><strong>{province.menuMeta} · {count} sản phẩm</strong><p>{province.description}</p><span>Xem sản phẩm tại {province.name} →</span></Link>)}</div></div></section>
 </main>
}
