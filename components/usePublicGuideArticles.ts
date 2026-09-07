'use client';

import {useEffect,useState} from 'react';

export type PublicGuideArticle={id:string;title:string;slug:string;category:string;excerpt:string;cover:string;content?:string;seoTitle?:string;seoDescription?:string;status:string;publishAt?:string;date:string;readTime?:string;keywords?:string};
const visible=(value:unknown)=>{const now=Date.now();return Array.isArray(value)?(value as PublicGuideArticle[]).filter(item=>{const published=item.status==='published'||(item.status==='scheduled'&&item.publishAt&&+new Date(item.publishAt)<=now);return published&&!!item.title&&!!item.slug&&!!item.cover}):[]};

export function usePublicGuideArticles(initialItems:PublicGuideArticle[]=[]){const[items,setItems]=useState<PublicGuideArticle[]>(visible(initialItems));useEffect(()=>setItems(visible(initialItems)),[initialItems]);useEffect(()=>{let alive=true;const loadRemote=async()=>{try{const response=await fetch('/api/catalog/site-state',{cache:'no-store'});if(!response.ok)return;const data=await response.json() as{state?:Record<string,unknown>};if(alive)setItems(visible(data.state?.tn_cms_articles_v3))}catch{}};void loadRemote();const refresh=()=>void loadRemote();window.addEventListener('tn-articles-updated',refresh);return()=>{alive=false;window.removeEventListener('tn-articles-updated',refresh)}},[]);return items}
