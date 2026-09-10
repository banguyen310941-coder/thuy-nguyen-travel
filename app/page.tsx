import type {Metadata} from 'next';
import {HomeCmsHero,type HomeCmsData} from '@/components/HomeCmsHero';
import {HomeCmsSections,type HomeCmsProduct,type HomeCmsTour} from '@/components/HomeCmsSections';
import {LegacyAdminPwaRedirect} from '@/components/LegacyAdminPwaRedirect';
import type {PublicGuideArticle} from '@/components/usePublicGuideArticles';
import {getSiteUrl} from '@/lib/site-url';
import {getPublicSiteState} from '@/lib/server/public-site-state';
import './home.css';

const DEFAULT_HERO='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1900&q=88';
export const revalidate=60;

type UnknownRecord=Record<string,unknown>;
const object=(value:unknown):UnknownRecord=>value&&typeof value==='object'&&!Array.isArray(value)?value as UnknownRecord:{};
const text=(value:unknown)=>String(value??'');
const optionalText=(value:unknown)=>value==null||value===''?undefined:String(value);

function compactHomeProduct(value:unknown):HomeCmsProduct{
 const item=object(value),rawUnits=Array.isArray(item.units)?item.units:[];
 const serviceStars=Number(item.serviceStars||0);
 return{
  id:text(item.id),type:text(item.type),name:text(item.name),slug:text(item.slug),place:text(item.place),price:text(item.price),status:text(item.status),summary:text(item.summary),cover:text(item.cover),rating:item.rating as string|number|undefined,duration:optionalText(item.duration),
  ...(serviceStars>0?{serviceStars}:{}),
  units:rawUnits.map(value=>{const unit=object(value);return{weekdayPrice:optionalText(unit.weekdayPrice),weekendPrice:optionalText(unit.weekendPrice),holidayPrice:optionalText(unit.holidayPrice),lowWeekdayPrice:optionalText(unit.lowWeekdayPrice),lowWeekendPrice:optionalText(unit.lowWeekendPrice),highWeekdayPrice:optionalText(unit.highWeekdayPrice),highWeekendPrice:optionalText(unit.highWeekendPrice),status:optionalText(unit.status)}})
 };
}
function compactHomeTour(value:unknown):HomeCmsTour{const item=object(value);return{id:text(item.id),name:text(item.name),slug:text(item.slug),cover:optionalText(item.cover),category:text(item.category),duration:text(item.duration),route:text(item.route),summary:text(item.summary),status:text(item.status),salePrice:optionalText(item.salePrice),gallery:optionalText(item.gallery)}}
function compactHomeArticle(value:unknown):PublicGuideArticle{const item=object(value);return{id:text(item.id),title:text(item.title),slug:text(item.slug),category:text(item.category),excerpt:text(item.excerpt),cover:text(item.cover),status:text(item.status),publishAt:optionalText(item.publishAt),date:text(item.date),readTime:optionalText(item.readTime)}}

export function generateMetadata():Metadata{const site=getSiteUrl();const title='Tour du lịch, khách sạn, villa & du thuyền | HappyGo Travel';const description='Đặt tour du lịch, khách sạn, villa, resort và du thuyền toàn quốc cùng HappyGo Travel. Giá rõ ràng, tư vấn nhanh và hỗ trợ tận tâm.';return{title,description,manifest:'/manifest.webmanifest',alternates:{canonical:site},openGraph:{title,description,url:site},twitter:{card:'summary_large_image',title,description}}}

export default async function HomePage(){
 const site=getSiteUrl(),state=await getPublicSiteState({includeRates:false});
 const home=state.tn_cms_homepage&&typeof state.tn_cms_homepage==='object'&&!Array.isArray(state.tn_cms_homepage)?state.tn_cms_homepage as Partial<HomeCmsData>:null;
 const products=(Array.isArray(state.tn_cms_products_v3_units)?state.tn_cms_products_v3_units:[]).map(compactHomeProduct);
 const cmsTours=(Array.isArray(state.tn_cms_tours_v3)?state.tn_cms_tours_v3:[]).map(compactHomeTour);
 const articles=(Array.isArray(state.tn_cms_articles_v3)?state.tn_cms_articles_v3:[]).slice(0,3).map(compactHomeArticle);
 const heroImage=String(home?.heroImage||DEFAULT_HERO).trim()||DEFAULT_HERO;
 const website={"@context":"https://schema.org","@type":"WebSite","name":"HappyGo Travel","url":site,"inLanguage":"vi-VN","potentialAction":{"@type":"SearchAction","target":`${site}/tim-kiem?q={search_term_string}`,"query-input":"required name=search_term_string"}};
 return <><link rel="preload" as="image" href={heroImage} fetchPriority="high"/><LegacyAdminPwaRedirect/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(website)}}/><div className="home-premium"><HomeCmsHero initialCms={home} refreshOnMount={false}/><HomeCmsSections initialHome={home} initialProducts={products} initialTours={cmsTours} initialArticles={articles} refreshOnMount={false}/></div></>
}
