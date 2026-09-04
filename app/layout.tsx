import type {Metadata,Viewport} from 'next';
import './globals.css';
import './home.css';
import './mockup.css';
import './mobile-v2.css';
import './subpages.css';
import './booking-live.css';
import './checkout.css';
import './tour-rich.css';
import './product-detail-v2.css';
import './public-product-sync.css';
import './units-public.css';
import './fixes.css';
import './rate-public.css';
import './cms-public.css';
import './cms-fixes.css';
import './cms-home-fixes.css';
import './guide-portal.css';
import './happygo-brand.css';
import './happygo-footer.css';
import './partner.css';
import './partner-enhancements.css';
import './partner-product-editor.css';
import './product-flow-editor.css';
import './unified-product-units.css';
import './customer-account.css';
import './happygo-info.css';
import './partner-refresh.css';
import './partner-detail-pro.css';
import './support-center.css';
import './crm-pipeline.css';
import './booking-operations.css';
import './payment-approval.css';
import './financial-ledger.css';
import './customer-receipts.css';
import './service-operations.css';
import './accounting-workspace.css';
import './attendance-workspace.css';
import './sales-availability.css';
import './marketing-sales-funnel.css';
import './today-work.css';
import './admin-shared-data.css';
import './portal-production.css';
import './partner-login-v2.css';
import {SiteChrome} from '@/components/SiteChrome';
import {PwaRegister} from '@/components/PwaRegister';
import {MarketingAttributionCapture} from '@/components/MarketingAttributionCapture';
import {db,hasDatabase} from '@/lib/db';

export const viewport:Viewport={width:'device-width',initialScale:1,maximumScale:5,viewportFit:'cover',themeColor:'#0d47a1',colorScheme:'light'};

const VERCEL_PRODUCTION_SITE=process.env.VERCEL_PROJECT_PRODUCTION_URL?`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`:'';
const VERCEL_DEPLOYMENT_SITE=process.env.VERCEL_URL?`https://${process.env.VERCEL_URL}`:'';
const DEFAULT_SITE=process.env.NEXT_PUBLIC_SITE_URL||VERCEL_PRODUCTION_SITE||VERCEL_DEPLOYMENT_SITE||'https://happygo.vn';
const DEFAULT_DESCRIPTION='Đặt tour, khách sạn, villa, resort và du thuyền toàn quốc cùng HappyGo Travel. Giá minh bạch, tư vấn nhanh, hành trình hạnh phúc.';

type SeoConfig={siteTitle?:string;description?:string;keywords?:string;ogImage?:string;organizationName?:string;canonicalBase?:string};
type SiteConfig={brand?:string;hotline?:string;email?:string;zalo?:string};
function configValue(raw:unknown){const value=raw as any;return value?.value&&typeof value.value==='object'?value.value:value}
async function productionConfig(){
 if(!hasDatabase())return{seo:null as SeoConfig|null,site:null as SiteConfig|null};
 try{const rows=await db()`select distinct on (entity_id) entity_id,after_data from audit_logs where entity_type='site_config' order by entity_id,created_at desc,id desc`;let seo:SeoConfig|null=null,site:SiteConfig|null=null;for(const row of rows){if(String(row.entity_id)==='seo')seo=configValue(row.after_data) as SeoConfig;if(String(row.entity_id)==='site')site=configValue(row.after_data) as SiteConfig}return{seo,site}}catch{return{seo:null,site:null}}
}
function safeUrl(value:string,fallback:string){try{return new URL(value).toString().replace(/\/$/,'')}catch{return fallback}}

export async function generateMetadata():Promise<Metadata>{
 const {seo,site}=await productionConfig();
 const base=safeUrl(String(seo?.canonicalBase||DEFAULT_SITE),DEFAULT_SITE);
 const brand=String(site?.brand||seo?.organizationName||'HappyGo Travel');
 const title=String(seo?.siteTitle||`${brand} | Tour, khách sạn, villa & du thuyền`);
 const description=String(seo?.description||DEFAULT_DESCRIPTION);
 const keywords=String(seo?.keywords||'HappyGo Travel, du lịch Việt Nam, tour du lịch, đặt khách sạn, villa nghỉ dưỡng, resort, du thuyền').split(',').map(x=>x.trim()).filter(Boolean);
 const image=String(seo?.ogImage||'');
 return {
  metadataBase:new URL(base),title:{default:title,template:`%s | ${brand}`},description,applicationName:brand,
  authors:[{name:brand,url:base}],creator:brand,publisher:brand,category:'travel',keywords,alternates:{canonical:'/'},manifest:'/manifest.webmanifest',icons:{icon:'/icon.svg',apple:'/icon.svg'},appleWebApp:{capable:true,statusBarStyle:'default',title:brand.slice(0,20)},formatDetection:{email:false,address:false,telephone:false},robots:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1}},
  openGraph:{title,description,type:'website',locale:'vi_VN',siteName:brand,url:base,...(image?{images:[{url:image}]}:{})},
  twitter:{card:'summary_large_image',title,description,...(image?{images:[image]}:{})},other:{'mobile-web-app-capable':'yes','x-ui-version':'happygo-public-products-20260904'}
 };
}

export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>){
 const {seo,site}=await productionConfig();const brand=String(site?.brand||seo?.organizationName||'HappyGo Travel');const siteUrl=safeUrl(String(seo?.canonicalBase||DEFAULT_SITE),DEFAULT_SITE);const email=String(site?.email||'info@happygo.vn');const hotline=String(site?.hotline||'0969973949').replace(/\D/g,'');const international=hotline.startsWith('0')?`+84${hotline.slice(1)}`:hotline;
 const organization={'@context':'https://schema.org','@type':['TravelAgency','Organization'],'@id':`${siteUrl}/#organization`,name:brand,url:siteUrl,email,telephone:international,areaServed:{'@type':'Country',name:'Vietnam'},contactPoint:{'@type':'ContactPoint',telephone:international,contactType:'customer service',areaServed:'VN',availableLanguage:'Vietnamese'}};
 return <html lang="vi"><body id="top" data-ui-version="happygo-public-products-20260904"><script type="application/ld+json">{JSON.stringify(organization)}</script><MarketingAttributionCapture/><PwaRegister/><SiteChrome>{children}</SiteChrome></body></html>;
}
