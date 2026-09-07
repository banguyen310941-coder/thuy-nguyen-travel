import type {Metadata} from 'next';
import {HomeCmsHero,type HomeCmsData} from '@/components/HomeCmsHero';
import {HomeCmsSections,type HomeCmsProduct,type HomeCmsTour} from '@/components/HomeCmsSections';
import {LegacyAdminPwaRedirect} from '@/components/LegacyAdminPwaRedirect';
import type {PublicGuideArticle} from '@/components/usePublicGuideArticles';
import {getSiteUrl} from '@/lib/site-url';
import {getPublicSiteState} from '@/lib/server/public-site-state';
import './home.css';

const DEFAULT_HERO='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1900&q=88';

export function generateMetadata():Metadata{const site=getSiteUrl();return{title:'HappyGo Travel | Tour, khách sạn, villa & du thuyền Việt Nam',description:'Khám phá tour, khách sạn, villa, resort và du thuyền toàn quốc cùng HappyGo Travel. Tìm kiếm nhanh, giá minh bạch và tư vấn tận tâm.',manifest:'/manifest.webmanifest',alternates:{canonical:site},openGraph:{title:'HappyGo Travel - Khám phá Việt Nam theo cách của bạn',description:'Tour, khách sạn, villa, resort và du thuyền toàn quốc.',url:site}}}

export default async function HomePage(){
 const site=getSiteUrl(),state=await getPublicSiteState();
 const home=state.tn_cms_homepage&&typeof state.tn_cms_homepage==='object'&&!Array.isArray(state.tn_cms_homepage)?state.tn_cms_homepage as Partial<HomeCmsData>:null;
 const products=Array.isArray(state.tn_cms_products_v3_units)?state.tn_cms_products_v3_units as HomeCmsProduct[]:[];
 const cmsTours=Array.isArray(state.tn_cms_tours_v3)?state.tn_cms_tours_v3 as HomeCmsTour[]:[];
 const articles=Array.isArray(state.tn_cms_articles_v3)?state.tn_cms_articles_v3 as PublicGuideArticle[]:[];
 const heroImage=String(home?.heroImage||DEFAULT_HERO).trim()||DEFAULT_HERO;
 const website={"@context":"https://schema.org","@type":"WebSite","name":"HappyGo Travel","url":site,"inLanguage":"vi-VN","potentialAction":{"@type":"SearchAction","target":`${site}/tim-kiem?q={search_term_string}`,"query-input":"required name=search_term_string"}};
 return <><link rel="preload" as="image" href={heroImage} fetchPriority="high"/><LegacyAdminPwaRedirect/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(website)}}/><div className="home-premium"><HomeCmsHero initialCms={home}/><HomeCmsSections initialHome={home} initialProducts={products} initialTours={cmsTours} initialArticles={articles}/></div></>
}
