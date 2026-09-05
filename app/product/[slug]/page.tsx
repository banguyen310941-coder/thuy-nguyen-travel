import type {Metadata} from 'next';
import {CmsProductDetail} from '@/components/CmsProductDetail';
import {getPublishedProductSeo} from '@/lib/public-product-seo';
import {getSiteUrl} from '@/lib/site-url';

type Props={params:Promise<{slug:string}>};
const clean=(value:string)=>value.replace(/\s+/g,' ').trim();
const jsonLd=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c');

export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params;const product=await getPublishedProductSeo(slug);const base=getSiteUrl();const canonical=`${base}/san-pham/${encodeURIComponent(slug)}`;
 if(!product)return{title:{absolute:'Sản phẩm không tồn tại | HappyGo Travel'},robots:{index:false,follow:true},alternates:{canonical}};
 const description=clean(product.seoDescription||product.summary||`${product.name} tại ${product.place}. Xem hình ảnh, hạng phòng/dịch vụ, lịch giá theo ngày và gửi yêu cầu đặt dịch vụ tại HappyGo Travel.`).slice(0,160);
 const title=clean(product.seoTitle||`${product.name}${product.place?` - ${product.place}`:''} | HappyGo Travel`).slice(0,70);
 const images=product.cover?[{url:product.cover,alt:product.name}]:undefined;
 return {title:{absolute:title},description,keywords:[product.name,product.type,product.category,product.place,'HappyGo Travel'].filter(Boolean),alternates:{canonical},robots:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1},openGraph:{type:'website',url:canonical,title,description,siteName:'HappyGo Travel',locale:'vi_VN',images},twitter:{card:'summary_large_image',title,description,images:product.cover?[product.cover]:undefined}};
}

export default async function CanonicalProductPage({params}:Props){
 const {slug}=await params;const product=await getPublishedProductSeo(slug);const base=getSiteUrl();const url=`${base}/san-pham/${encodeURIComponent(slug)}`;
 const schemas:unknown[]=[];
 if(product){
  const images=[product.cover,...product.gallery].filter(Boolean).slice(0,20);
  const offer=product.price>0?{'@type':'Offer',priceCurrency:'VND',price:product.price,availability:'https://schema.org/InStock',url}:undefined;
  if(product.type==='Khách sạn'||product.type==='Villa & Resort')schemas.push({'@context':'https://schema.org','@type':product.type==='Khách sạn'?'Hotel':'LodgingBusiness','@id':`${url}#lodging`,name:product.name,description:product.summary,url,image:images,address:{'@type':'PostalAddress',streetAddress:product.address||undefined,addressLocality:product.place||undefined,addressCountry:'VN'},...(product.serviceStars?{starRating:{'@type':'Rating',ratingValue:product.serviceStars,bestRating:5}}:{}),...(offer?{makesOffer:offer}:{})});
  else schemas.push({'@context':'https://schema.org','@type':'Product','@id':`${url}#product`,name:product.name,description:product.summary,url,image:images,category:product.category||product.type,brand:{'@type':'Brand',name:'HappyGo Travel'},...(offer?{offers:offer}:{})});
  schemas.push({'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem',position:1,name:'Trang chủ',item:base},{'@type':'ListItem',position:2,name:product.type==='Du thuyền'?'Du thuyền':product.type.includes('Tour')?'Tour du lịch':'Lưu trú',item:product.type==='Du thuyền'?`${base}/du-thuyen`:product.type.includes('Tour')?`${base}/tour-du-lich`:`${base}/luu-tru`},{'@type':'ListItem',position:3,name:product.name,item:url}]});
 }
 return <>{product&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(schemas)}}/>}<CmsProductDetail slug={slug}/></>;
}
