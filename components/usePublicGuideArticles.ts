'use client';

import {useEffect,useState} from 'react';

export type PublicGuideArticle={id:string;title:string;slug:string;category:string;excerpt:string;cover:string;content?:string;seoTitle?:string;seoDescription?:string;status:string;date:string;readTime?:string;keywords?:string};
const PRIMARY_KEY='tn_cms_articles_v3';
const LEGACY_KEY='tn_cms_articles_v4';
const visible=(value:unknown)=>Array.isArray(value)?(value as PublicGuideArticle[]).filter(item=>item.status==='published'&&item.title&&item.slug&&!item.id.startsWith('seo_')):[];
function cached(){try{const primary=visible(JSON.parse(localStorage.getItem(PRIMARY_KEY)||'[]'));if(primary.length)return primary;return visible(JSON.parse(localStorage.getItem(LEGACY_KEY)||'[]'))}catch{return[]}}

export function usePublicGuideArticles(){const[items,setItems]=useState<PublicGuideArticle[]>([]);useEffect(()=>{let alive=true;const apply=(value:PublicGuideArticle[])=>{if(alive)setItems(value)};const loadCache=()=>apply(cached());const loadRemote=async()=>{try{const response=await fetch('/api/catalog/site-state',{cache:'no-store'});if(!response.ok)return;const data=await response.json() as {state?:Record<string,unknown>};const value=visible(data.state?.tn_cms_articles_v3);if(value.length||Array.isArray(data.state?.tn_cms_articles_v3)){try{localStorage.setItem(PRIMARY_KEY,JSON.stringify(value))}catch{}apply(value)}}catch{}};loadCache();void loadRemote();const refresh=()=>{loadCache();void loadRemote()};window.addEventListener('tn-articles-updated',refresh);window.addEventListener('storage',refresh);return()=>{alive=false;window.removeEventListener('tn-articles-updated',refresh);window.removeEventListener('storage',refresh)}},[]);return items}
