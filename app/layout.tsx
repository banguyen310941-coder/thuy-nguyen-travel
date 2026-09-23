import type {Metadata,Viewport} from 'next';
import Script from 'next/script';
import './globals.css';
import './home.css';
import './mockup.css';
import './mobile-v2.css';
import './subpages.css';
import './booking-live.css';
import './checkout.css';
import './tour-rich.css';
import './product-detail-v2.css';
import './product-location.css';
import './product-gallery-calendar.css';
import './public-product-sync.css';
import './units-public.css';
import './fixes.css';
import './rate-public.css';
import './cms-public.css';
import './cms-fixes.css';
import './cms-home-fixes.css';
import './guide-portal.css';
import './guide-seo-v2.css';
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
import './public-ui-unified.css';
import './contact-actions-fix.css';
import './source-gallery-visible.css';
import './service-stars.css';
import './desktop-booking-cta.css';
import './home-premium.css';
import './home-premium-addon.css';
import './public-polish.css';
import './public-screenshot-fixes.css';
import './mobile-public-polish.css';
import './mobile-public-audit-fixes.css';
import './tour-booking-access.css';
import './mobile-cart-guide-fix.css';
import {SiteChrome} from '@/components/SiteChrome';
import {PwaRegister} from '@/components/PwaRegister';
import {MarketingAttributionCapture} from '@/components/MarketingAttributionCapture';
import {PublicPriceNormalizer} from '@/components/PublicPriceNormalizer';
import {db,hasDatabase} from '@/lib/db';
import {getSiteUrl} from '@/lib/site-url';

export const viewport:Viewport={width:'device-width',initialScale:1,maximumScale:5,viewportFit:'cover',themeColor:'#0d47a1',colorScheme:'light'};

const DEFAULT_DESCRIPTION='Đặt tour, khách sạn, villa, resort và du thuyền toàn quốc cùng HappyGo Travel. Giá minh bạch, tư vấn nhanh, hành trình hạnh phúc.';

type SeoConfig={siteTitle?:string;description?:string;keywords?:string;ogImage?:string;organizationName?:string;canonicalBase?:string};
type SiteConfig={brand?:string;hotline?:string;email?:string;zalo?:string;facebookUrl?:string;youtubeUrl?:string;tiktokUrl?:string};
function configValue(raw:unknown){const value=raw as any;return value?.value&&typeof value.value==='object'?value.value:value}
async function productionConfig(){
 if(!hasDatabase())return{seo:null as SeoConfig|null,site:null as SiteConfig|null};
 try{const rows=await db()`select distinct on (entity_id) entity_id,after_data from audit_logs where entity_type='site_config' order by entity_id,created_at desc,id desc`;let seo:SeoConfig|null=null,site:SiteConfig|null=null;for(const row of rows){if(String(row.entity_id)==='seo')seo=configValue(row.after_data) as SeoConfig;if(String(row.entity_id)==='site')site=configValue(row.after_data) as SiteConfig}return{seo,site}}catch{return{seo:null,site:null}}
}

export async function generateMetadata():Promise<Metadata>{
 const {seo,site}=await productionConfig();
 // Canonical host is controlled only by deployment environment. This prevents CMS data from pointing search engines to a domain before it is attached.
 const base=getSiteUrl();
 const brand=String(site?.brand||seo?.organizationName||'HappyGo Travel');
 const title=String(seo?.siteTitle||`${brand} | Tour, khách sạn, villa & du thuyền`);
 const description=String(seo?.description||DEFAULT_DESCRIPTION);
 const keywords=String(seo?.keywords||'HappyGo Travel, du lịch Việt Nam, tour du lịch, đặt khách sạn, villa nghỉ dưỡng, resort, du thuyền').split(',').map(x=>x.trim()).filter(Boolean);
 const image=String(seo?.ogImage||'');
 return {
  metadataBase:new URL(base),title:{default:title,template:`%s | ${brand}`},description,applicationName:brand,
  authors:[{name:brand,url:base}],creator:brand,publisher:brand,category:'travel',keywords,alternates:{canonical:'/'},icons:{icon:'/icon.svg',apple:'/icon.svg'},appleWebApp:{capable:true,statusBarStyle:'default',title:brand.slice(0,20)},formatDetection:{email:false,address:false,telephone:false},robots:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1}},
  openGraph:{title,description,type:'website',locale:'vi_VN',siteName:brand,url:base,...(image?{images:[{url:image}]}:{})},
  twitter:{card:'summary_large_image',title,description,...(image?{images:[image]}:{})},other:{'mobile-web-app-capable':'yes','x-ui-version':'happygo-public-sanitized-20260906-prod'}
 };
}

export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>){
 const {seo,site}=await productionConfig();const brand=String(site?.brand||seo?.organizationName||'HappyGo Travel');const siteUrl=getSiteUrl();const email=String(site?.email||'info@happygo.vn');const hotline=String(site?.hotline||'0969973949').replace(/\D/g,'');const international=hotline.startsWith('0')?`+84${hotline.slice(1)}`:hotline;
 const logoUrl=new URL('/icon.svg',siteUrl).toString();
 const organization={'@context':'https://schema.org','@type':['TravelAgency','Organization'],'@id':`${siteUrl}/#organization`,name:brand,url:siteUrl,logo:{'@type':'ImageObject',url:logoUrl},image:logoUrl,email,telephone:international,areaServed:{'@type':'Country',name:'Vietnam'},contactPoint:{'@type':'ContactPoint',telephone:international,contactType:'customer service',areaServed:'VN',availableLanguage:'Vietnamese'}};
 return <html lang="vi"><body id="top" data-ui-version="happygo-public-sanitized-20260906-prod"><script dangerouslySetInnerHTML={{__html:"(function(){try{var ios=/iphone|ipad|ipod/i.test(navigator.userAgent);var standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;var legacy=/happygo-travel\\.vercel\\.app$/i.test(location.hostname);if(!ios||!standalone||!legacy)return;var key='happygo_ios_pwa_repair_20260916';if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');var jobs=[];if('caches'in window)jobs.push(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return /^happygo-shell-v/.test(k)}).map(function(k){return caches.delete(k)}))}));if('serviceWorker'in navigator)jobs.push(navigator.serviceWorker.getRegistrations().then(function(rs){return Promise.all(rs.map(function(r){return r.update().catch(function(){})}))}));Promise.all(jobs).finally(function(){location.reload()})}catch(e){}})();"}}/><script type="application/ld+json">{JSON.stringify(organization)}</script><Script src="https://www.googletagmanager.com/gtag/js?id=AW-17595657212" strategy="afterInteractive"/><Script id="google-ads-aw-17595657212" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'AW-17595657212');`}</Script><MarketingAttributionCapture/><PwaRegister/><PublicPriceNormalizer/><SiteChrome initialSettings={site}>{children}</SiteChrome></body></html>;
}
