'use client';

import Link from 'next/link';
import {useMemo} from 'react';
import {usePublicGuideArticles,type PublicGuideArticle} from '@/components/usePublicGuideArticles';

export type GuideCountItem={
 slug:string;
 category:string;
 title:string;
 excerpt:string;
 keywords?:string;
};

export type GuideCountCategory={
 slug:string;
 name:string;
 terms:string[];
};

function hay(item:{category?:string;title?:string;excerpt?:string;keywords?:string|string[]}){
 return `${item.category||''} ${item.title||''} ${item.excerpt||''} ${Array.isArray(item.keywords)?item.keywords.join(' '):item.keywords||''}`.toLowerCase();
}
function matches(item:{category?:string;title?:string;excerpt?:string;keywords?:string|string[]},terms?:string[]){
 if(!terms?.length)return true;
 const text=hay(item);
 return terms.some(term=>text.includes(term.toLowerCase()));
}
function countMerged(cms:PublicGuideArticle[],staticItems:GuideCountItem[],terms?:string[]){
 const validCms=cms.filter(item=>item.slug&&item.title&&item.cover);
 const cmsSlugs=new Set(validCms.map(item=>item.slug));
 const cmsCount=validCms.filter(item=>matches(item,terms)).length;
 const staticCount=staticItems.filter(item=>!cmsSlugs.has(item.slug)&&matches(item,terms)).length;
 return cmsCount+staticCount;
}

export function GuideSidebarCounts({
 initialArticles,
 staticItems,
 categories,
 activeSlug,
}:{
 initialArticles:PublicGuideArticle[];
 staticItems:GuideCountItem[];
 categories:GuideCountCategory[];
 activeSlug?:string;
}){
 const articles=usePublicGuideArticles(initialArticles);
 const counts=useMemo(()=>({
  total:countMerged(articles,staticItems),
  byCategory:Object.fromEntries(categories.map(category=>[category.slug,countMerged(articles,staticItems,category.terms)])) as Record<string,number>,
 }),[articles,staticItems,categories]);

 return <>
  <Link className={!activeSlug?'active':undefined} href="/cam-nang"><span>Tất cả bài viết</span><b>{counts.total}</b></Link>
  {categories.map(category=><Link className={activeSlug===category.slug?'active':undefined} href={`/cam-nang/danh-muc/${category.slug}`} key={category.slug}><span>{category.name}</span><b>{counts.byCategory[category.slug]||0}</b></Link>)}
 </>;
}

export function GuideLiveResultCount({
 initialArticles,
 staticItems,
 terms,
}:{
 initialArticles:PublicGuideArticle[];
 staticItems:GuideCountItem[];
 terms?:string[];
}){
 const articles=usePublicGuideArticles(initialArticles);
 const total=useMemo(()=>countMerged(articles,staticItems,terms),[articles,staticItems,terms]);
 return <span>{total} bài viết</span>;
}
