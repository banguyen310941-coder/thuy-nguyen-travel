import type {Metadata} from 'next';
import {HomeCmsHero,type HomeCmsData} from '@/components/HomeCmsHero';
import {HomeCmsSections,type HomeCmsProduct,type HomeCmsTour} from '@/components/HomeCmsSections';
import type {PublicGuideArticle} from '@/components/usePublicGuideArticles';
import {getSiteUrl} from '@/lib/site-url';
import {getPublicSiteState} from '@/lib/server/public-site-state';
import './home.css';

export function generateMetadata():Metadata{const site=getSiteUrl();return{title:'Du lịch Việt Nam | Tour, khách sạn, villa & du thuyền',description:'Khám phá tour, khách sạn, villa, resort và du thuyền toàn quốc cùng HappyGo Travel. Tư vấn nhanh, lựa chọn đa dạng và giá minh bạch.',alternates:{canonical:site},openGraph:{title:'HappyGo Travel - Du lịch Việt Nam',description:'Tour, khách sạn, villa, resort và du thuyền toàn quốc.',url:site}}}

export default async function HomePage(){
 const site=getSiteUrl(),state=await getPublicSiteState();
 const home=state.tn_cms_homepage&&typeof state.tn_cms_homepage==='object'&&!Array.isArray(state.tn_cms_homepage)?state.tn_cms_homepage as Partial<HomeCmsData>:null;
 const products=Array.isArray(state.tn_cms_products_v3_units)?state.tn_cms_products_v3_units as HomeCmsProduct[]:[];
 const cmsTours=Array.isArray(state.tn_cms_tours_v3)?state.tn_cms_tours_v3 as HomeCmsTour[]:[];
 const articles=Array.isArray(state.tn_cms_articles_v3)?state.tn_cms_articles_v3 as PublicGuideArticle[]:[];
 const website={"@context":"https://schema.org","@type":"WebSite","name":"HappyGo Travel","url":site,"inLanguage":"vi-VN","potentialAction":{"@type":"SearchAction","target":`${site}/tim-kiem?q={search_term_string}`,"query-input":"required name=search_term_string"}};
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(website)}}/><HomeCmsHero initialCms={home}/><HomeCmsSections initialHome={home} initialProducts={products} initialTours={cmsTours} initialArticles={articles}/></>
}
