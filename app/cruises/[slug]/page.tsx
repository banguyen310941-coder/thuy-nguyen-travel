import type {Metadata} from 'next';
import {CmsProductDetail,type PublicProduct} from '@/components/CmsProductDetail';
import {getPublishedProductSeo} from '@/lib/public-product-seo';
import type {PublicRateRange} from '@/lib/public-rate-utils';
import {getPublicSiteState} from '@/lib/server/public-site-state';
import {getSiteUrl} from '@/lib/site-url';

const amount=(v?:string|number)=>{const n=String(v||'').replace(/\D/g,'');return n?Number(n):undefined};
const canonicalUrl=(slug:string)=>`${getSiteUrl()}/du-thuyen/${encodeURIComponent(slug)}`;

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const canonical=canonicalUrl(slug);const cms=await getPublishedProductSeo(slug);
 if(cms?.type==='Du thuyền'){
  const title=cms.seoTitle||`${cms.name}${cms.place?` - ${cms.place}`:''}`;const description=cms.seoDescription||cms.summary;return{title,description,alternates:{canonical},robots:{index:true,follow:true},openGraph:{title:cms.name,description,url:canonical,type:'website',images:cms.cover?[{url:cms.cover,alt:cms.name}]:undefined},twitter:{card:'summary_large_image',title:cms.name,description,images:cms.cover?[cms.cover]:undefined}};
 }
 return{title:'Du thuyền | HappyGo Travel',description:'Thông tin du thuyền, cabin, lịch giá và tình trạng chỗ tại HappyGo Travel.',alternates:{canonical}};
}

export default async function CruiseDetailPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const base=getSiteUrl(),url=canonicalUrl(slug),state=await getPublicSiteState();
 const products=Array.isArray(state.tn_cms_products_v3_units)?state.tn_cms_products_v3_units as PublicProduct[]:[];
 const initialProduct=products.find(item=>item.slug===slug&&item.status==='published'&&item.type==='Du thuyền')||null;
 if(initialProduct){
  const unitIds=new Set((initialProduct.units||[]).map(unit=>unit.id));
  const allRates=Array.isArray(state.tn_cms_daily_rates_v1)?state.tn_cms_daily_rates_v1 as PublicRateRange[]:[];
  const initialRates=unitIds.size?allRates.filter(rate=>unitIds.has(rate.unitId)):[];
  const price=amount(initialProduct.price);const images=[initialProduct.cover,...String(initialProduct.gallery||'').split(/\n+/)].filter(Boolean);
  const trip:any={"@context":"https://schema.org","@type":"TouristTrip","name":initialProduct.name,"description":initialProduct.summary,"image":images,"url":url,"itinerary":{"@type":"Place","name":initialProduct.place||initialProduct.route||'Du thuyền'},"provider":{"@type":"TravelAgency","name":"HappyGo Travel","url":base,"telephone":"+84969973949"}};
  if(price)trip.offers={"@type":"Offer","priceCurrency":"VND","price":price,"url":url,"availability":"https://schema.org/InStock"};
  const schema=[trip,{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Trang chủ","item":base},{"@type":"ListItem","position":2,"name":"Du thuyền","item":`${base}/du-thuyen`},{"@type":"ListItem","position":3,"name":initialProduct.name,"item":url}]}];
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><CmsProductDetail slug={slug} initialProduct={initialProduct} initialRates={initialRates}/></>;
 }
 return <CmsProductDetail slug={slug}/>;
}
