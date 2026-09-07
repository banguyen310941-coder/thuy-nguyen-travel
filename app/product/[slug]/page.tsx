import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {CmsProductDetail,type PublicProduct} from '@/components/CmsProductDetail';
import {getPublishedProductSeo} from '@/lib/public-product-seo';
import type {PublicRateRange} from '@/lib/public-rate-utils';
import {getPublicSiteState} from '@/lib/server/public-site-state';
import {getSiteUrl} from '@/lib/site-url';

type Props={params:Promise<{slug:string}>};
const clean=(value:string)=>value.replace(/\s+/g,' ').trim();
const jsonLd=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c');
function categoryFor(type:string,base:string){if(type==='Du thuyền')return{name:'Du thuyền',url:`${base}/du-thuyen`};if(type.includes('Tour'))return{name:'Tour du lịch',url:`${base}/tour-du-lich`};if(type==='Villa & Resort')return{name:'Villa & Resort',url:`${base}/villa-resort`};if(type==='Khách sạn')return{name:'Khách sạn',url:`${base}/khach-san`};return{name:'Lưu trú',url:`${base}/luu-tru`}}

export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params;const product=await getPublishedProductSeo(slug);const base=getSiteUrl();const canonical=product?.type==='Du thuyền'?`${base}/du-thuyen/${encodeURIComponent(slug)}`:`${base}/san-pham/${encodeURIComponent(slug)}`;
 if(!product)return{title:{absolute:'Sản phẩm không tồn tại | HappyGo Travel'},robots:{index:false,follow:true},alternates:{canonical}};
 const description=clean(product.seoDescription||product.summary||`${product.name} tại ${product.place}. Xem hình ảnh, hạng phòng/dịch vụ, lịch giá theo ngày và gửi yêu cầu đặt dịch vụ tại HappyGo Travel.`).slice(0,160);
 const title=clean(product.seoTitle||`${product.name}${product.place?` - ${product.place}`:''} | HappyGo Travel`).slice(0,70);
 const images=product.cover?[{url:product.cover,alt:product.name}]:undefined;
 return {title:{absolute:title},description,keywords:[product.name,product.type,product.category,product.place,'HappyGo Travel'].filter(Boolean),alternates:{canonical},robots:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1},openGraph:{type:'website',url:canonical,title,description,siteName:'HappyGo Travel',locale:'vi_VN',images},twitter:{card:'summary_large_image',title,description,images:product.cover?[product.cover]:undefined}};
}

export default async function CanonicalProductPage({params}:Props){
 const {slug}=await params;const[product,state]=await Promise.all([getPublishedProductSeo(slug),getPublicSiteState()]);const base=getSiteUrl();
 const publicProducts=Array.isArray(state.tn_cms_products_v3_units)?state.tn_cms_products_v3_units as PublicProduct[]:[];
 const initialProduct=publicProducts.find(item=>item.slug===slug&&item.status==='published')||null;
 if(product?.type==='Du thuyền'||initialProduct?.type==='Du thuyền')redirect(`/du-thuyen/${encodeURIComponent(slug)}`);
 const url=`${base}/san-pham/${encodeURIComponent(slug)}`;
 const unitIds=new Set((initialProduct?.units||[]).map(unit=>unit.id));
 const allRates=Array.isArray(state.tn_cms_daily_rates_v1)?state.tn_cms_daily_rates_v1 as PublicRateRange[]:[];
 const initialRates=unitIds.size?allRates.filter(rate=>unitIds.has(rate.unitId)):[];
 const schemas:unknown[]=[];
 if(product){
  const images=[product.cover,...product.gallery].filter(Boolean).slice(0,20);const category=categoryFor(product.type,base);
  const offer=product.price>0?{'@type':'Offer',priceCurrency:'VND',price:product.price,availability:'https://schema.org/InStock',url}:undefined;
  if(product.type==='Khách sạn'||product.type==='Villa & Resort')schemas.push({'@context':'https://schema.org','@type':product.type==='Khách sạn'?'Hotel':'LodgingBusiness','@id':`${url}#lodging`,name:product.name,description:product.summary,url,image:images,address:{'@type':'PostalAddress',streetAddress:product.address||undefined,addressLocality:product.place||undefined,addressCountry:'VN'},...(product.serviceStars?{starRating:{'@type':'Rating',ratingValue:product.serviceStars,bestRating:5}}:{}),...(offer?{makesOffer:offer}:{})});
  else schemas.push({'@context':'https://schema.org','@type':'Product','@id':`${url}#product`,name:product.name,description:product.summary,url,image:images,category:product.category||product.type,brand:{'@type':'Brand',name:'HappyGo Travel'},...(offer?{offers:offer}:{})});
  schemas.push({'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem',position:1,name:'Trang chủ',item:base},{'@type':'ListItem',position:2,name:category.name,item:category.url},{'@type':'ListItem',position:3,name:product.name,item:url}]});
 }
 return <>{product&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(schemas)}}/>}<CmsProductDetail slug={slug} initialProduct={initialProduct} initialRates={initialRates}/></>;
}
