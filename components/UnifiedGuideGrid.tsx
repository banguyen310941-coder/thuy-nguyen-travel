'use client';

import Link from 'next/link';
import {useMemo} from 'react';
import {usePublicGuideArticles,type PublicGuideArticle} from '@/components/usePublicGuideArticles';
import {guideReadTime} from '@/lib/guide-publishing-standard';

export type GuideFeedItem={slug:string;title:string;category:string;excerpt:string;cover:string;date:string;readTime:string;keywords?:string};

function matches(item:GuideFeedItem,terms?:string[]){if(!terms?.length)return true;const hay=`${item.category} ${item.title} ${item.excerpt} ${item.keywords||''}`.toLowerCase();return terms.some(term=>hay.includes(term.toLowerCase()))}
function fromCms(article:PublicGuideArticle):GuideFeedItem{return{slug:article.slug,title:article.title,category:article.category||'Cẩm nang du lịch',excerpt:article.excerpt||'',cover:article.cover,date:article.date||'',readTime:article.readTime||guideReadTime(article.content||''),keywords:article.keywords||''}}

export function mergeGuideFeed(staticItems:GuideFeedItem[],cmsItems:PublicGuideArticle[],terms?:string[]){
 const cms=cmsItems.filter(item=>item.slug&&item.title&&item.cover).map(fromCms).filter(item=>matches(item,terms));
 const seen=new Set(cms.map(item=>item.slug));
 const base=staticItems.filter(item=>!seen.has(item.slug)&&matches(item,terms));
 return [...cms,...base];
}

export function UnifiedGuideGrid({staticItems,initialArticles=[],terms}:{staticItems:GuideFeedItem[];initialArticles?:PublicGuideArticle[];terms?:string[]}){
 const articles=usePublicGuideArticles(initialArticles);
 const items=useMemo(()=>mergeGuideFeed(staticItems,articles,terms),[staticItems,articles,terms]);
 if(!items.length)return null;
 return <div className="guide-card-grid">{items.map(item=>{const href=`/cam-nang/${encodeURIComponent(item.slug)}`;return <article className="guide-pro-card" key={item.slug}><Link href={href} className="guide-pro-image" style={{backgroundImage:`url(${item.cover})`}} aria-label={item.title}><span>{item.category||'Cẩm nang du lịch'}</span></Link><div className="guide-pro-meta"><small>HappyGo Travel</small><small>{item.date||'Bài mới'}</small><small>{item.readTime||'Cẩm nang'}</small></div><div className="guide-pro-body"><h3><Link href={href}>{item.title}</Link></h3><p>{item.excerpt||'Xem kinh nghiệm và thông tin chi tiết trong bài viết.'}</p><Link className="guide-read" href={href}>Đọc bài viết →</Link></div></article>})}</div>;
}
